import { PlumeElement } from "./Plume.js"

/**
 * virual DOM element
 * @param {!string} type
 * @param {?Object} p
 * @param {?Array} c
 */
export const el = (type, p = {}, c = []) => {
  return new PlumeElement(type, p, c)
}
export default el

// basic HTML elements
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const div = (p = {}, c = []) => el('div', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const span = (p = {}, c = []) => el('span', p, c)
/**
 * @param {Object<string,*>} p
 */
export const br = (p = {}) => el('br', p)
/**
 * @param {Object<string,*>} p
 */
export const hr = (p = {}) => el('hr', p)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const button = (p = {}, c = []) => el('button', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const header = (p = {}, c = []) => el('header', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const navbar = (p = {}, c = []) => el('nav', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const footer = (p = {}, c = []) => el('footer', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const article = (p = {}, c = []) => el('article', p, c)
/**
 * @param {Object<string,*>} p
 */
export const input = (p = {}) =>
  el('input',
    Object.assign({
      placeholder: " ",
      oninvalid: (el, e) => e.preventDefault()
    }, p),
    []
  )
/**
 * @param {Object<string,*>} p
 */
export const textarea = (p = {}) => el('textarea', p, [])
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const table = (p = {}, c = []) => el('table', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const tr = (p = {}, c = []) => el('tr', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const td = (p = {}, c = []) => el('td', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const th = (p = {}, c = []) => el('th', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const p = (p = {}, c = []) => el('p', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const b = (p = {}, c = []) => el('b', p, c)
/**
 * @param {Object<string,*>} p
 * @param {string} string
 * @param {number} size
 */
export const h = (p = {}, string = "", size = 3) => el(`h${clamp(size, 1, 6)}`, p, [text(string)])
/**
 * @param {Object<string,*>} p
 * @param {!string} link
 * @param {?string} name
 */
export const a = (p, link, name) => {
  p.href = link
  return el('a', p, [text(name || link)])
}
/**
 * @param {Object<string,*>} p
 * @param {!Object<string,!Object>} style
 */
export const style = (p = {}, style = {}) => {
  let _style = Object.keys(style)
    .map(_el => {
      let _body =
        Object.keys(style[_el])
          .map(_a => `${_a}:${style[_el][_a]}`)
      return `${_el} {${_body}}`
    }).join("\n")

  return el("style", p, [text(_style)])
}
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const iframe = (p = {}, c = []) => el('iframe', p, c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const form = (p = {}, c = []) => el('form',
  Object.assign({
    method: ""
  }, p), c)
/**
 * @param {Object<string,*>} p
 * @param {Array<PlumeElement>} c
 */
export const img = (p = {}, c = []) => el('img', p, c)

// special types
/**
 * @param {string} content
 */
export const text = (content = "") => el('_TEXT', { content: content }, [])
export const empty = () => text("")

/**
 * @param {Object} model
 * @param {Object<string,Function>} routes
 */
export const router = (model, routes) => {
  // TODO2: update performance

  let parsedRoute
  let hash = location.hash.substr(1)
  for (let route in routes)
    if (parsedRoute = parseRoute(hash, route)) {
      if (model.__PLUME__.routerData.hash != hash) {
        model.__PLUME__.routerData = {
          data: Object.assign({ _errors: [] }, parsedRoute),
          hash: hash
        }
        setTimeout(() => {
          try {
            window.scrollTo(0, 0)
            document.querySelector("[autofocus]").focus()
          } catch (_) { }
        })
      }
      return routes[route](model.__PLUME__.routerData.data)
    }
  return text()
}
/**
 * shorthand for div with no props
 * @param {Array<PlumeElement>} c
 */
export const root = (c) => div({}, c)
/**
 * a complex table made from a json table
 * @param {!Array<!Object<string,*>>} data
 */
export const jsonTable = (data) => {
  let headers = Object.keys(data[0])
  return table({}, [
    tr({}, headers.map(x => th({}, [text(x.replace("_", " "))]))),
    ...data.map(row =>
      tr({}, [
        ...headers.map(h => td({}, [text(row[h].toString())]))
      ])
    )
  ])
}
/**
 * a scoped component for complex elements
 * @param {!Object<string,Function>} o
 */
export const component = (o) =>
  el("_SHADOW",
    Object.assign({
      css: "",
      shadow: { mode: "closed" },
      template: null
    }, o)
  )
/**
 * switch case for elements
 * @param {string} cond condition to switch on
 * @param {!Object<string, Function>} cases
 */
export const when = (cond, cases) => {
  try {
    return cases[cond]()
  } catch (e) {
    try {
      return cases["_default"]()
    } catch (e2) {
      throw new Error("default case not found, implement [_default] case")
    }
  }
}









// functions
/**
 * re-routes to a new route
 * @param {!string} route
 */
//TODO: fix back button
export const goto = (route) => {
  location.hash = `#${route.startsWith("/") ? "" : "/"}${route}`
  // history.pushState({}, "", location)
}

/**
 * generates an array containing numbers based on this algorithm
 * @param {!number} from
 * @param {?number} to
 * @param {?number} skip
 * @returns {Array<number>}
 */
export const range = (from, to, skip = 1) =>
  [...Array(to || from).keys()]
    .map(x => x * skip)
    .map(x => x + (to ? from : 0))
    .filter(x => x <= (to ? to : Infinity))

/**
 * clamp the number between two values
 * @param {!number} num
 * @param {!number} min
 * @param {!number} max
 */
export const clamp = (num, min, max) =>
  num > max ? max : num < min ? min : num

/**
 * compares the hash with the route,
 * returns an Object containing variables found in route
 * @param {!string} hash
 * @param {!string} route
 */
const parseRoute = (hash, route) => {
  if (route.indexOf(":") == -1) {
    if (route == hash || route == "*")
      return {}
  }
  else {
    let _hash = hash.split("/")
    let _route = route.split("/")

    if (_hash.length != _route.length)
      return false

    let data = {}

    for (let i = 0; i < _route.length; i++) {
      let x = _route[i]

      if (x.indexOf(":") == 0)
        data[x.substr(1)] = _hash[i]
      else
        if (x != _hash[i])
          return false
    }
    return data
  }
}