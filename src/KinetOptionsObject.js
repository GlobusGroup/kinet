class KinetOptionsObject {
  constructor(options) {
    // Set defaults, any options passed in will override these
    // any options passed that don't exist in defaults will be ignored
    let defaultOptions = {
      modules: [],
    }

    // Merge defaults with options
    this.options = { ...defaultOptions, ...options }

    // Create getters for each option, options cannot be set after instantiation
    Object.keys(defaultOptions).forEach((key) => {
      Object.defineProperty(this, key, {
        get: function () {
          return this.options[key]
        },
      })
    })

    // Set this object to be immutable
    Object.seal(this)
  }
}

export default KinetOptionsObject