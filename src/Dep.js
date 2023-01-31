// Dep is a class that represents a Dependency for reactive data
class Dep {
	// Constructor creates an array of subscribers to hold the list of dependent functions
	constructor() {
		this.subscribers = []
	}

	// Depend method adds a target (i.e., a dependent function) to the list of subscribers
	depend(target) {
		if (target && !this.subscribers.includes(target)) {
			this.subscribers.push(target)
		}
	}

	// Notify method invokes each subscriber (i.e., dependent function) in the subscribers array
	notify(value) {
		this.subscribers.forEach((sub) => sub(value))
	}
}

export default Dep;