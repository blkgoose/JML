const el = (type, p = {}, c = []) => {
  return { type: type, prop: p, childs: c }
}

// ELMET
const div = (p, c) => el('div', p, c)
const span = (p, c) => el('span', p, c)
const br = (p = {}) => el('br', p)
const button = (p, c) => el('button', p, c)
const header = (p, c) => el('header', p, c)
const footer = (p, c) => el('footer', p, c)
const article = (p, c) => el('article', p, c)

// special types
const root = (c = []) => div({}, c)
const route = (route, c) => el('ROUTE', { when: route }, c)
const text = (string) => el('_TEXT', { content: string }, [])