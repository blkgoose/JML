/**
 * use <route> elements to route the app.
 *
 * @param {reference model} model
 */
const router = (model) => {
  /**
   * renames 'querySelectorAll' in 'q' and makes
   * it easier to use with 'forEach'
   * @param {css selector (querySelectorAll)} selector
   */
  Node.prototype.q = function (selector) {
    try {
      return Array.prototype.slice.call(
        this.querySelectorAll(selector)
      )
    } catch (_) { return [] }
  }

  const parseRoute = (hash, route) => {
    if (route.indexOf("?") == -1) {
      if (hash == route)
        return {}
    }
    else {
      hash = hash.split("/")
      route = route.split("/")

      if (hash.length != route.length)
        return false
      let data = {}

      for (let i in route) {
        let x = route[i]

        if (x.indexOf("?") == 0)
          data[x.substr(1)] = hash[i]
        else
          if (x != hash[i])
            return false
      }
      return data
    }
  }

  /**
   * function that gets called when the page load or
   * when the url hash changes,
   * it handles the whole routing part
   */
  window.onhashchange = _ => {
    document.q("route").forEach(x => x.style.display = "none")

    let routes = document.q("route[when]")

    for (let i in routes) {
      let e = routes[i]

      let hash = window.location.hash.substr(1)
      let route = e.getAttribute("when")
      let parsedRoute

      if (parsedRoute = parseRoute(hash, route) || route == "*") {
        model.route = parsedRoute
        e.style.display = "block"
        return
      }
    }
  }

  window.onhashchange()
}