// basic HTML elements
const div = (p, c) => el('div', p, c)
const span = (p, c) => el('span', p, c)
const br = (p = {}) => el('br', p)
const hr = (p = {}) => el('hr', p)
const button = (p, c) => el('button', p, c)
const header = (p, c) => el('header', p, c)
const navbar = (p, c) => el('nav', p, c)
const footer = (p, c) => el('footer', p, c)
const article = (p, c) => el('article', p, c)
const input = (p) => el('input', p, [])
const textarea = (p) => el('textarea', p, [])
const table = (p, c) => el('table', p, c)
const tr = (p, c) => el('tr', p, c)
const td = (p, c) => el('td', p, c)
const th = (p, c) => el('th', p, c)
const p = (p, c) => el('p', p, c)

const b = (string) => el('b', p, [text(string)])
const h = (string, size = 3, p) => el(`h${clamp(size, 1, 6)}`, p, [text(string)])
const a = (link, name) => el('a', { href: link }, [text(name || link)])


// special types
const router = (model, routes) => {
  // TODO2: update performance
  let parsedRoute
  let hash = location.hash.substr(1)
  for (let route in routes)
    if (parsedRoute = parseRoute(hash, route))
      try {
        if (model.__PLUME__.routerData.hash != hash)
          model.__PLUME__.routerData = {
            data: parsedRoute,
            hash: hash
          }
        setTimeout(() => {
          try {
            window.scrollTo(0, 0)
            document.querySelector("[autofocus]").focus()
          } catch (_) { }
        })
        return routes[route](model.__PLUME__.routerData.data)
      } catch (error) {
        if (error.name == "RouteNotValid")
          continue
        else
          throw error
      }
  return text()
}
const root = (c) => div({}, c)
const text = (string = "") => el('_TEXT', { content: string }, [])

// functions

/**
 * use this to skip the route if data is not correct
 * 
 * @param {assert} condition 
 * @param {optional message to show} message 
 */
const rAssert = (condition, message = "") => {
  const RouteNotValidError = m => {
    return { name: "RouteNotValid", message: m }
  }

  if (!condition) throw RouteNotValidError(message)
}

/**
 * re-routes to a new route
 *
 * @param {route to go to} route
 */
const goto = (route) =>
  window.location =
  location.href.replace(location.hash, "").replace(RegExp("#$"), '')
  + "#/"
  + route.replace(RegExp("^/"), '')

/**
 * generates an array containing numbers based on this algorithm
 *
 * @param {starting point} from
 * @param {ending point} to
 * @param {skip n each iteration} skip
 */
const range = (from, to, skip = 1) =>
  [...Array(to || from).keys()]
    .map(x => x * skip)
    .map(x => x + (to ? from : 0))
    .filter(x => x <= (to ? to : Infinity))

/**
 * clamp the number between two values
 *
 * @param {number to clamp} num
 * @param {left limit} min
 * @param {right limit} max
 */
const clamp = (num, min, max) =>
  num > max ? max : num < min ? min : num

/**
 * compares the hash with the route,
 * returns an object containing variables found in route
 *
 * @param {hash to check (location.hash)} hash
 * @param {route to be checked with} route
 */
const parseRoute = (hash, route) => {
  if (route.indexOf(":") == -1) {
    if (route == hash || route == "*")
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

      if (x.indexOf(":") == 0)
        data[x.substr(1)] = hash[i]
      else
        if (x != hash[i])
          return false
    }
    return data
  }
}
