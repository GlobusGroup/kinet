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
				this.dep.notify(this.value)
			}
		})
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
		return this.value
	}
	set(newValue) {
		//update the value and notify the dependents
		this.value = newValue
		this.dep.notify(newValue)
	}
}

export default WrappedValue
