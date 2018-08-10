'use strict'

let oldView

/**
 * deep compares two objects and returns wheter they differ or not
 *
 * @param {first object} obj1
 * @param {object to compare with} obj2
 */
const compare = (obj1, obj2) => {
  if (typeof (obj1) !== typeof (obj2))
    return false

  if (obj1 instanceof Function && obj2 instanceof Function)
    return obj1.toString() === obj2.toString()

  if (!(obj1 instanceof Object) && !(obj2 instanceof Object))
    return Object.is(obj1, obj2)

  if (Object.keys(obj1).length !== Object.keys(obj2).length)
    return false

  if (Object.keys(obj1).length === 0)
    return true

  for (let p in obj1)
    if (!compare(obj1[p], obj2[p]))
      return false
  return true
}

/**
 * actual working part
 *
 * @param {view function} view
 * @param {starting model} model
 * @param {root to apply the program to} $root
 */
const Plume = (view, model = {}, $root = document.getElementById("app")) => {
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
      if (RegExp("^on").test(name))
        if (name.toLowerCase() == "oncreate")
          node.prop[name]($el)
        else
          $el.addEventListener(
            name.replace(RegExp("^on"), "").toLowerCase(),
            e => node.prop[name]($el, e)
          )
      else $el.setAttribute(name, node.prop[name])
    }

    if (!(node.childs instanceof Array))
      throw Error("node childs should be in array...")

    node.childs
      .map(create)
      .forEach($el.appendChild.bind($el))
    return $el
  }

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
    else if (
      newNode.type !== oldNode.type
      || !compare(newNode.prop, oldNode.prop)
      || newNode.childs.length !== oldNode.childs.length
    )
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
  window.onhashchange = _ => app.currentRoute = new Date().getTime()
  app.initialized = true

  return app
}