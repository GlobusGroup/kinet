import Dep from './Dep'

// WrappedValue is a class that wraps a value and makes it reactive.
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

	// The `overrideSetters` method sets up overrides for methods on arrays such as `push`, `pop`, `splice`, `shift`, and `unshift`.
	// These overrides call the original method, then call `this.dep.notify` with `value` as the parameter.
	overrideSetters() {
		var value = this.value
		var self = this

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

	// The `get` method simply returns `this.value`.
	get() {
		return this.value
	}
	// The `set` method sets `this.value` to the newValue parameter, then calls `this.dep.notify` with `newValue` as the parameter.
	set(newValue) {
		this.value = newValue
		this.dep.notify(newValue)
	}
}

export default WrappedValue
