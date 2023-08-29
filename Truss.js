const beforeAnimationStart = new Event('beforeAnimationStart')
const afterAnimationEnd = new Event('afterAnimationEnd')

class Truss {
	constructor(state) {
		this._init(state)
	}

	/**
	 * Initializes the Truss library with the given state
	 * and binds all elements with the `truss-bind` attribute for two-way binding.
	 * and truss-bind elements for one-way binding.
	 *
	 * @param {object} state - The Kinet compatible state object.
	 * @returns {void}
	 */
	_init(state) {
		this.state = state
		var matchedElements = document.querySelectorAll('[truss-bind]')
		matchedElements.forEach((element) => this.watchElement(element))
		//get elelents with the tag name truss-bind for one way binding
		var oneWayBindElements = document.querySelectorAll('truss-bind')
		oneWayBindElements.forEach((element) => this.oneWayBind(element))
	}

	/**
	 * Binds an HTML element to a state property in a one-way binding: state -> element.
	 *
	 * @param {HTMLElement} element - The HTML element to bind.
	 * @returns {void}
	 */
	oneWayBind(element) {
		const path = element.getAttribute('to')

		//get decimalPlaces from the element
		const decimalPlaces = element.getAttribute('decimal-places')
		//if decimalPlaces is not specified, then we can just set it to 2
		const dp = decimalPlaces ? decimalPlaces : 2

		//set animate to true if the element has the attribute animate
		const animate = element.hasAttribute('animate')

		//get the animation duration if the element has the attribute animation-duration
		const animationDuration = element.getAttribute('animation-duration')
		//if the duration isn't specified, then we can just set it to 200
		const duration = animationDuration ? animationDuration : 200
		

		//if we don't have a path, then we can't bind the element
		if (!path) {
			throw new Error('No path specified for one-way binding.')
		}

		this.state.subscribe(path, (value) => {
			//if the animate attribute is present, then we need to animate the value
			if (animate) {
				//emit the beforeAnimationStart event
				element.dispatchEvent(beforeAnimationStart)

				//if the element has an interval, then we need to clear it
				//this prevents the animation from running multiple times at once
				let currentRunningInterval = element.interval
				if (currentRunningInterval) {
					clearInterval(currentRunningInterval)
				}

				this.animate(
					element.innerHTML,
					value,
					duration,
					(current, interval, done) => {
						//set the interval on the element so we can clear it as noted above
						element.interval = interval

						//set the innerHTML of the element to the current value
						//toFixed(2) rounds the number to 2 decimal places
						element.innerHTML = current.toFixed(dp)

						//if the animation is done, then emit the afterAnimationEnd event
						if (done) {
							element.dispatchEvent(afterAnimationEnd)
						}
					}
				)
			} else {
				//if the animate attribute is not present, then we can just set the value
				element.innerHTML = value.toFixed(dp)
			}
		})

		//initially set the value of the element to the value in the state
		element.innerHTML = this.state.getByPath(path).value
	}

	/**
	 * "Animates" between two numbers.
	 *
	 * @param {string|number} start - The starting number.
	 * @param {string|number} end - The ending number.
	 * @param {number} duration - The duration of the animation in milliseconds.
	 * @param {function} callback - A function to be called on each animation frame with the current value of the animation, the interval ID, and a boolean indicating whether the animation has finished.
	 * @returns {void}
	 */
	animate(start, end, duration, callback) {
		//convert the start and end values to numbers
		const startNumber = parseFloat(start)
		const endNumber = parseFloat(end)

		//check if the start and end values are numbers
		if (isNaN(startNumber) || isNaN(endNumber)) {
			callback(end)
			return
		}

		let current = startNumber
		const increment = (endNumber - startNumber) / duration
		const interval = setInterval(() => {
			if (increment > 0) {
				current += increment
				if (current >= end) {
					clearInterval(interval)
					current = end
				}
			} else {
				current += increment
				if (current <= end) {
					clearInterval(interval)
					current = end
				}
			}
			callback(current, interval, current == end)
		}, 10)
	}
	/**
	 * Watches an HTML element for changes and updates the state accordingly.
	 *
	 * @param {HTMLElement} element - The HTML element to watch.
	 * @returns {void}
	 */
	watchElement(element) {
		const path = element.getAttribute('truss-bind')

		let eventTarget
		//if the element is a checkbox or radio, then we need to listen for the change event
		//otherwise, we can listen for the input event
		const altBehaviour = element.type == 'checkbox' || element.type == 'radio'
		if (altBehaviour) {
			eventTarget = 'change'
		} else {
			eventTarget = 'input'
		}

		//grab a reference to the state
		const state = this.state

		//listen for the event on the element
		element.addEventListener(eventTarget, (event) => {
			if (altBehaviour) {
				this._setValue(path, event.target.value, event.target.checked)
			} else {
				state.setByPath(path, element.value)
			}
		})

		//set the value in the element to the value in the state
		if (!altBehaviour) {
			element.value = state.getByPath(path).value
		} 
		if (altBehaviour) {
			// if it's a checkbox or a radio, let's check if the value is true
			element.checked = state.getByPath(path).value === true
		}

		state.subscribe(element.getAttribute('truss-bind'), (value) => {
			if (!altBehaviour) {
				element.value = value
			} else {
				// if the value is an array (eg[Red, Blue, Black]), then we need to loop
				// through the array and check if the value is in the array
				// if it is, then we can check the checkbox
				if (Array.isArray(value)) {
					if (value.includes(element.value)) {
						element.checked = true
						return
					}
					element.checked = false
					return
				}
				if (state.getByPath(path).value == element.value) {
					element.checked = true
				}
			}
		})
	}

	/**
	 * Sets the value of the state property at the given path.
	 *
	 * @param {string} path - The path of the state property to set.
	 * @param {*} value - The value to set the state property to.
	 * @param {boolean} status - A boolean indicating whether to add or remove the value from an array, if the state property is an array.
	 * @returns {void}
	 */
	_setValue(path, value, status) {
		//discover if the value is an array
		const type = Array.isArray(this.state.getByPath(path).value)
			? 'array'
			: typeof this.state.getByPath(path).value
		// console.log('type', type)
		switch (type) {
			case 'array':
				// console.log('working in array mode', path, value, status)

				// if the status is true, add the value to the array
				// if the status is false, remove the value from the array
				if (status) {
					this.state.getByPath(path).value.push(value)
				} else {
					//find the index of the value in the array
					let v = this.state.getByPath(path).value
					const index = v.indexOf(value)
					if (index > -1) {
						v.splice(index, 1)
					}
				}

				// console.log(this.state.getByPath(path).value)

				//if the value is an array, then we need to find the index of the value
				//and then set the value at that index
				// const index = this.state.getByPath(path).value.indexOf(value)
				// this.state.getByPath(path).value[index] = value
				break
			case 'object':
				// console.log('working in object mode')
				//if the value is an object, then we need to find the key of the value
				//and then set the value at that key
				const key = Object.keys(this.state.getByPath(path).value).find(
					(key) => this.state.getByPath(path).value[key] == value
				)
				this.state.getByPath(path).value[key] = value
				break
			default:
				// console.log('working in normal mode')
				//if the value is neither an array or an object, then we can just set the value
				this.state.getByPath(path).value = value
				break
		}
	}
}

export default Truss
