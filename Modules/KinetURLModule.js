class KinetURLModule {
  constructor(options, kinet) {
    this.kinet = kinet
    this.options = options
    this.active = true

    window.addEventListener('popstate', (event) => {
      this.handlePopState(event)
    })

    this.kinet.data.subscribe(
      options.scope.path,
      (value, setBy) => {
        this.handleStateChange(setBy)
      },
      options.scope.deep,
    )

    this.kinet.registerCallable(() => {
      this.active = false
    }, 'KinetURLModule.disableURLUpdate')

    this.kinet.registerCallable(() => {
      this.active = true
    }, 'KinetURLModule.enableURLUpdate')


  }

  readyEvent() {
    var urlData = this.parseURL()
    if (Object.keys(urlData).length > 0) {
      setTimeout(() => {
        this.options.returnMethod(urlData)
      }, 10)
    }
  }

  parseURL() {
    var urlData = {}
    var url = window.location.href
    var urlParts = url.split('?')
    if (urlParts.length > 1) {
      var query = urlParts[1]
      var queryParts = query.split('&')
      queryParts.forEach((part) => {
        var keyValue = part.split('=')
        urlData[keyValue[0]] = keyValue[1]
      })
    }
    return urlData
  }

  handlePopState(event) {
    this.options.returnMethod(event.state)
  }

  handleStateChange(setBy) {
    //if the state change was triggered by the URL module, don't do anything
    //to prevent an infinite loop
    if (setBy == 'KinetURLModule') return
    if (!this.active) return

    let url
    let queryString = ''
    let queryStringElements = []
    const convertedData = this.options.queryMatchMethod()

    Object.keys(convertedData).forEach((key) => {
      queryStringElements.push(`${key}=${convertedData[key]}`)
    })
    queryString = queryStringElements.join('&')

    //only add the query string if it's not empty
    if (queryString.length > 0) {
      if (window.location.search.length > 0) {
        url = window.location.href.replace(
          window.location.search,
          `?${queryString}`,
        )
      } else {
        url = window.location.href + `?${queryString}`
      }
      if (url !== window.location.href) {
        window.history.pushState(convertedData, '', url)
      }
    } else {
      url = window.location.href.replace(window.location.search, '')
      window.history.pushState(convertedData, '', url)
    }
  }
}

export default KinetURLModule
