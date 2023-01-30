class Dep {
	constructor() {
		this.subscribers = []
	}

	depend(target) {
		if (target && !this.subscribers.includes(target)) {
			this.subscribers.push(target)
		}
	}

	notify(value) {
		this.subscribers.forEach((sub) => sub(value))
	}
}

export default Dep;