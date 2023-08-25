import Dep from './Dep'

class WrappedValue {
	constructor(value, kinetInsance, path) {
		this.dep = new Dep()
		this.kinet = kinetInsance
		if (typeof value === 'object' || Array.isArray(value)) {
			this.value = this.kinet.makeReactive(value, path)
			this.overrideSetters()
		} else {
			this.value = value
		}
		Object.defineProperty(this, 'forceUpdate', {
			value: function () {
				if (typeof this.value == 'function') {
					this.dep.notify(this.value(this.kinet.data))
				} else {
					this.dep.notify(this.value)
				}
			},
		})
		if (typeof value == 'function') {
			//look into the function and find all the paths that it uses
			const used = this.findUsedPaths(value)
			//for each path that it uses, subscribe to it and force an update
			used.forEach((path) => {
				const value = this.kinet.values[path]

				if (value) {
					value.dep.depend(() => {
						this.forceUpdate()
					})
				}
			})
		}
	}

	findUsedPaths(fn) {
		const functionString = fn.toString()

		// Extract the argument name
		const argRegex = /\(([^)]+)\)/
		const argMatch = argRegex.exec(functionString)
		if (!argMatch) {
			return [] // No argument found
		}
		const argName = argMatch[1]

		// Extract the properties accessed on the argument
		const regex = new RegExp(`(?:${argName}\.)+([a-zA-Z_$][0-9a-zA-Z_$]*)`, 'g')
		const properties = new Set()

		let match
		while ((match = regex.exec(functionString)) !== null) {
			properties.add(match[1])
		}

		return Array.from(properties)
	}

	overrideSetters() {
		var value = this.value
		var self = this

		//override the various methods on the object so that we can notify the dependents
		if (typeof value === 'object' || Array.isArray(value)) {
			const arrayMethods = ['push', 'pop', 'splice', 'shift', 'unshift']
			arrayMethods.forEach((method) => {
				Object.defineProperty(value, method, {
					value: function () {
						const returnValue = Array.prototype[method].apply(value, arguments)
						self.dep.notify(value)
						return returnValue
					},
				})
			})
		}
	}

	get() {
		if (typeof this.value == 'function') {
			return this.value(this.kinet.data)
		}

		return this.value
	}

	// The `set` method sets `this.value` to the newValue parameter, then calls `this.dep.notify` with `newValue` as the parameter.
	set(newValue, setBy) {
		//update the value and notify the dependents
		let oldValue = this.value
		if (typeof newValue === 'object' || Array.isArray(newValue)) {
			let subscribers = this.dep.subscribers
			this.value = this.kinet.makeReactive(newValue, this.path)
			//re-attach the subscribers to the new object
			subscribers.forEach((sub) => {
				console.log('sub', sub)
				if (sub.deep) {
					this.kinet.data.subscribe(this.path, sub, true)
				} else {
					// this.kinet.data.subscribe(this.path, sub, false)
				}
			})
		} else {
			this.value = newValue
		}
		this.dep.notify(newValue, oldValue, setBy)
	}
}

export default WrappedValue
