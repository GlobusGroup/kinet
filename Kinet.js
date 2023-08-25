import KinetOptionsObject from './src/KinetOptionsObject'
import WrappedValue from './src/WrappedValue'

class Kinet {
	constructor(data, options) {
		// The `values` property is a map of all the values in the object that enables
		// us to call the depend method on the WrappedValue
		if (data === undefined || data === null || typeof data !== 'object') {
			throw new Error(
				'Kinet requires an object to be passed to the constructor',
			)
		}
		this.data = data
		this.callables = {}
		this.state = {}

		this.options = new KinetOptionsObject(options)
		//values is a map of all the values in the object that enables
		//us to call the depend method on the WrappedValue
		this.values = {}
		this.modules = []

		// Define the subscribe method on the top level of the object
		// it is passed a dot-notated path to the value one wants to subscribe to
		this.defineProperties(data)

		//return the reactive object
		this.state = this.makeReactive(data)
		if (this.options.modules.length > 0) {
			this.loadModules()
		}
		return this
	}

	registerCallable(func, path) {
		this.callables[path] = func
	}

	_runCallable(path, args) {
		return this.callables[path](args)
	}

	//application can call this method to signal that it is ready to receive data updates
	_signalReady() {
		this.modules.forEach((module) => {
			if (typeof module.readyEvent === 'function') {
				module.readyEvent()
			}
		})
	}

	defineProperties(data) {
		//subscribe method
		Object.defineProperty(data, 'subscribe', {
			value: (observable, func, deep) => {
				if (deep) {
					//if deep is true we will walk down the object and subscribe to all the values we find
					func.deep = true

					Object.keys(this.values[observable].value).forEach((key) => {
						var path = ('path', observable + '.' + key)
						if (
							//if it's an object
							typeof this.values[path].value === 'object' ||
							//or an array
							Array.isArray(this.values[path].value)
						) {
							//recurse this function over it
							data.subscribe(path, func, true)
						} else {
							//otherwise attach the dependency
							this.values[path].dep.depend(func)
						}
					})
				}
				this.values[observable].dep.depend(func)
				// Return the original callback function so that it can be called right away if required.
				return func
			},
		})

		// Define the `getByPath` method on the data object.
		Object.defineProperty(data, 'getByPath', {
			value: (path) => {
				if(typeof this.values[path].value == 'function') {
					return {
						value: this.values[path].value(this.data),
					}
				}
				return this.values[path]
			},
		})

		// Define the `setByPath` method on the data object.
		Object.defineProperty(data, 'setByPath', {
			value: (path, value, setBy) => {
				return this.values[path].set(value, setBy)
			},
		})

		return this.makeReactive(data)
	}

	// `makeReactive` is a recursive function that walks down the data object and creates WrappedValues
	// for each value it finds. WrappedValues are reactive versions of the original value and possess a
	// `depend` method via the Dep class.
	makeReactive = (data, vpath) => {
		let path = vpath
		Object.keys(data).forEach((key) => {
			let currentPath = path ? path + '.' + key : key
			let underlyingValue

			if (data[key] !== null) {
				underlyingValue = new WrappedValue(data[key], this, currentPath)
			} else {
				underlyingValue = new WrappedValue('', this, currentPath)
			}
			this.values[currentPath] = underlyingValue

			Object.defineProperty(data, key, {
				get() {
					return underlyingValue.get()
				},
				set(newValue) {
					underlyingValue.set(newValue)
				},
			})
		})
		this.data = data

		return data
	}

	loadModules() {
		this.options.modules.forEach((module) => {
			this.modules.push(new module.module(module.options, this))
		})
	}

	amendState(givenState, path, setBy) {
		this.data.setByPath(path, givenState, setBy)
	}
}

export default Kinet
