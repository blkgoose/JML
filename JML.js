const el = (type, p = {}, c = []) => {
  return { type: type, prop: p, childs: c }
}

const div = (p, c) => el('div', p, c)
const span = (p, c) => el('span', p, c)
const br = (p = {}) => el('br', p)
const button = (p, c) => el('button', p, c)
const header = (p, c) => el('header', p, c)
const navbar = (p, c) => el('navbar', p, c)
const footer = (p, c) => el('footer', p, c)
const article = (p, c) => el('article', p, c)
const a = (link, name) => el('a', { href: link }, [text(name || link)])

// special types

// to be implemented
const sroute = (route, fn) => el('ROUTE', { when: route, }, fn)

const root = (c = []) => div({}, c)
const route = (route, c) => el('ROUTE', { when: route, }, c)
const text = (string) => el('_TEXT', { content: string }, [])
const goto = (route, name) =>
  window.location =
  window.location.href.replace(window.location.hash, "").replace(/#$/, '')
  + "#/"
  + route.replace(/^\//, '')