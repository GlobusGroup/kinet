import WrappedValue from './src/WrappedValue'

class Kinet {
	constructor(data) {
		//values is a map of all the values in the object that enables
		//us to call the depend method on the WrappedValue
		this.values = {}

		//define the subscribe method on the top level of the object
		//it is passed a dot-notated path to the value one wants to subscribe to
		Object.defineProperty(data, 'subscribe', {
			value: (observable, func, deep) => {
				if (deep) {
					//if deep is true we will walk down the object and subscribe to all the values we find
					Object.keys(this.values[observable].value).forEach((key) => {
						var path = ('path', observable + '.' + key)
						if (
							typeof this.values[path].value === 'object' ||
							Array.isArray(this.values[path].value)
						) {
							data.subscribe(path, func, true)
						} else {
							this.values[path].dep.depend(func)
						}
					})
				}
				this.values[observable].dep.depend(func)
				//return the original callback function so that it can be called right away if required
				return func
			},
		})

		Object.defineProperty(data, 'getByPath', {
			value: (path) => {
				return this.values[path]
			},
		})

		Object.defineProperty(data, 'setByPath', {
			value: (path, value) => {
				return this.values[path].set(value)
			},
		})

		//return the reactive object
		return this.makeReactive(data)
	}

	//makeReactive is a recursive function that walks down the data object and creates WrappedValues
	//for each value it finds
	//WrappedValues are reactive versions of the original value and possess a depend method via the Dep class
	makeReactive = (data, vpath) => {
		let path = vpath
		Object.keys(data).forEach((key) => {
			let currentPath = path ? path + '.' + key : key
			let underlyingValue
			if (data[key] !== null) {
				underlyingValue = new WrappedValue(data[key], this, currentPath)
			} else {
				underlyingValue = new WrappedValue({}, this, currentPath)
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

		return data
	}
}

module.exports = Kinet
