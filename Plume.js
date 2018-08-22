import DeepProxy from "./DeepProxy.js"
import { text, div, style } from "./JML.js"

export class PlumeElement {
  constructor(type, p, c) {
    this.type = type
    this.prop = p
    this.childs = c
  }
}

/**
 * virual DOM element
 * @param {!string} type
 * @param {?Object} p
 * @param {?Array} c
 */
export const el = (type, p = {}, c = []) => {
  return new PlumeElement(type, p, c)
}

/**
 * actual working part
 * @param {!Function} view
 * @param {?Object} model
 * @param {?Node} $root
 */
export const Plume = (view, model = {}, $root = undefined) => {
  let oldView

  /**
   * converts an element to actual HTMLNode
   * @param {PlumeElement} node
   */
  const create = (node) => {
    const doSpecialCreate = (_node) => {
      switch (node.type) {
        case "_TEXT":
          return document.createTextNode(node.prop.content)
        case "_SHADOW":
          let _shadowRoot = create(el("plume-component"))
          let _shadow = _shadowRoot.attachShadow(node.prop.shadow)
          _shadow.appendChild(create(node.prop.template))
          _shadow.appendChild(create(style({}, node.prop.css)))
          return _shadowRoot
      }
      return false
    }

    let $el
    if (($el = doSpecialCreate(node)) !== false) { return $el }

    $el = document.createElement(node.type)
    createProps($el, node.prop)

    node.childs
      .map(create)
      .forEach($el.appendChild.bind($el))
    return $el
  }

  /**
   * set or updates the element props
   * @param {!Node} $el
   * @param {!string} name
   * @param {!Function} value
   */
  const setProp = ($el, name, value) => {
    /**
     * @param {!Node} $$el
     * @param {!string} n
     * @param {!Function} v
     */
    const setAttr = ($$el, n, v) => {
      $$el.setAttribute(n, v)
      $$el[n] = v
    }

    /**
     * handles special props
     * @param {!Node} $$el
     * @param {!string} n
     * @param {!Function} v
     */
    const specialProp = ($$el, n, v) => {
      switch (n) {
        case "style":
          Object.keys(v)
            .forEach(p =>
              $$el.style[p] = v[p]
            )
          return true
      }
      return false
    }

    name = name.toLowerCase()

    if (specialProp($el, name, value) !== false) { return }
    else if (RegExp("^on").test(name))
      $el.addEventListener(
        name.slice(2),
        e => value($el, e)
      )
    else
      if (typeof value === "boolean") {
        if (value) setAttr($el, name, value)
      }
      else
        setAttr($el, name, value)
  }

  /**
   * creates the props for the given element.
   * @param {!Element} $el
   * @param {!Object} props
   */
  const createProps = ($el, props) =>
    Object.keys(props).forEach(name =>
      setProp($el, name, props[name]))

  /**
   * updates the props for the given item,
   * actual prop diffing part.
   * @param {!Node} $el
   * @param {!Object<string,Function>} newProps
   * @param {!Object<string,Function>} oldProps
   */
  const updateProps = ($el, newProps, oldProps = {}) => {
    /**
     * @param {!Node} $$el
     * @param {!string} name
     * @param {Function} newProp
     * @param {Function} oldProp
     */
    const updateProp = ($$el, name, newProp, oldProp) => {
      if (!newProp)
        $$el.removeAttribute(name)
      else if (!oldProp || newProp !== oldProp) {
        setProp($$el, name, newProp)
      }
    }

    if ($el instanceof Text) {
      if (newProps.content !== oldProps.content)
        $el.textContent = newProps.content
    } else
      Object.keys(Object.assign({}, newProps, oldProps))
        .forEach(name =>
          updateProp($el, name, newProps[name], oldProps[name])
        )
  }

  /**
   * virtual dom diffing part
   * @param {?Node|undefined} $parent
   * @param {?PlumeElement} newNode
   * @param {?PlumeElement} oldNode
   * @param {number} index
   */
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
      newNode.type !== oldNode.type ||
      newNode.childs.length !== oldNode.childs.length
    )
      $parent.replaceChild(
        create(newNode),
        $parent.childNodes[index]
      )
    else if (newNode.type) {
      updateProps(
        $parent.childNodes[index],
        newNode.prop,
        oldNode.prop
      )
      for (let i = 0; i < Math.max(newNode.childs.length, oldNode.childs.length); i++)
        update(
          $parent.childNodes[index],
          newNode.childs[i],
          oldNode.childs[i],
          i
        )
    }
  }

  /**
   * converts the [[view]] function to a real working view
   * @param {!Object} model
   */
  const _VIEW = model => {
    model.doCallback = false
    let newView = view(model.data)
    model.doCallback = true

    update($root, newView, oldView)
    oldView = newView
  }

  // if root is not defined, initialize base Plume stuff.
  if (!$root)
    return new Promise(res => {
      window.onload = () => res(Plume(view, model, document.body))
    })

  model.__PLUME__ = {
    routerData: {
      hash: location.hash,
      data: {}
    }
  }

  let app = new DeepProxy(_VIEW, model)
  window.onhashchange = _ =>
    app.data.__PLUME__.lastRouteChange = new Date().getTime()

  app.data.__PLUME__.initialized = true

  return app.data
}

export default Plume