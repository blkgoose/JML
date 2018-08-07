'use strict'

let oldView

/**
 * deep compares two objects and returns wheter they differ or not
 *
 * @param {first object} obj1
 * @param {object to compare with} obj2
 */
const compare = (obj1, obj2) => {
  // objects are not the same type
  if (typeof (obj1) !== typeof (obj2)) return false
  // objects are the exact same
  if (Object.is(obj1, obj2)) return true

  // true if both objects are empty
  if (Object.keys(obj1).length === 0 && Object.keys(obj2).length === 0)
    return true

  for (let p in obj1) {
    if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false
    if (obj1[p] instanceof Object && obj2[p] instanceof Object)
      return compare(obj1[p], obj2[p])
    else
      return Object.is(obj1[p], obj2[p])
  }
}

/**
 * actual working part
 *
 * @param {view function} view
 * @param {starting model} model
 * @param {root to apply the program to} $root
 */
const program = (view, model = {}, $root = document.getElementById("app")) => {
  /**
   * converts an element to actual HTMLNode
   *
   * @param {node to create} node
   */
  const create = (node) => {
    if (!node) return
    if (node.type.indexOf("_") == 0)
      switch (node.type) {
        case "_TEXT":
          return document.createTextNode(node.prop.content)
      }

    const $el = document.createElement(node.type)
    for (let name in node.prop) {
      if (/^on/.test(name))
        $el.addEventListener(
          name.replace(/^on/, "").toLowerCase(),
          node.prop[name]
        )
      else $el.setAttribute(name, node.prop[name])
    }

    if (!(node.childs instanceof Array))
      throw Error("node childs should be in an array...")

    node.childs
      .map(create)
      .forEach($el.appendChild.bind($el))
    return $el
  }

  const changed = (node1, node2) =>
    node1.type != node2.type
    || !compare(node1.prop, node2.prop)
    || node1.childs.length != node2.childs.length

  /**
   * virtual dom diffing part
   *
   * @param {parent being checked} $parent
   * @param {node on new view} newNode
   * @param {node on old view} oldNode
   * @param {current deepness index} index
   */
  // TODO: prop diffing
  const update = ($parent, newNode, oldNode, index = 0) => {
    if (!oldNode)
      $parent.appendChild(
        create(newNode)
      )
    else if (!newNode)
      $parent.removeChild(
        $parent.childNodes[index]
      )
    else if (changed(newNode, oldNode))
      $parent.replaceChild(
        create(newNode),
        $parent.childNodes[index]
      )
    else if (newNode.type)
      for (let i = 0; i < newNode.childs.length || i < oldNode.childs.length; i++)
        update(
          $parent.childNodes[index],
          newNode.childs[i],
          oldNode.childs[i],
          i
        )
  }

  /**
   * converts the [[view]] function to a real working view
   *
   * @param {model to generate the view from} model
   */
  const _VIEW = model => {
    let newView = view(model)

    update($root, newView, oldView)
    oldView = newView
  }

  let app = new DeepProxy(_VIEW, model)
  window.onhashchange = _ => app.currentRoute = new Date()
  app.initialized = true

  return app
}