/**
 * virual DOM element
 *
 * @param {type of the element (i.e. "div")} type
 * @param {props} p
 * @param {childs} c
 */
const el = (type, p = {}, c = []) => {
  return { type: type, prop: p, childs: c }
}

// basic HTML elements
const div = (p, c) => el('div', p, c)
const span = (p, c) => el('span', p, c)
const br = (p = {}) => el('br', p)
const button = (p, c) => el('button', p, c)
const header = (p, c) => el('header', p, c)
const navbar = (p, c) => el('nav', p, c)
const footer = (p, c) => el('footer', p, c)
const article = (p, c) => el('article', p, c)
const input = (p) => el('input', p, [])
const p = (p, c) => el('p', p, c)
const b = (string) => el('b', p, [text(string)])
const h = (string, size = 3, p) => el('h' + clamp(size, 1, 6), p, [text(string)])
const a = (link, name) => el('a', { href: link }, [text(name || link)])


// special types
const router = (routes) => {
  let parsedRoute
  let hash = window.location.hash.substr(1)
  for (let route in routes)
    if (parsedRoute = parseRoute(hash, route))
      try {
        return routes[route](...Object.values(parsedRoute))
      } catch (error) {
        if (error.name == "RouteNotValid")
          continue
        else
          throw error
      }
  return text()
}

const route = (init, c = []) => div({ oncreate: init }, c)
const root = (c = []) => div({}, c)
const text = (string = "") => el('_TEXT', { content: string }, [])

// functions
const routeAssert = cond => {
  const RouteNotValidError = (message = "") => {
    return { name: "RouteNotValid", message: message }
  }

  if (!cond) throw RouteNotValidError()
}

/**
 * re-routes to a new route
 *
 * @param {route to go to} route
 */
const goto = (route) =>
  window.location =
  window.location.href.replace(window.location.hash, "").replace(RegExp("#$"), '')
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
 * @param {hash to check (window.location.hash)} hash
 * @param {route to be checked with} route
 */
const parseRoute = (hash, route) => {
  if (route.indexOf("?") == -1) {
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

      if (x.indexOf("?") == 0)
        data[x.substr(1)] = hash[i]
      else
        if (x != hash[i])
          return false
    }
    return data
  }
}
