import DeepProxy from "./DeepProxy.js"
import { style } from "./JML.js"

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
 * Plume main function
 * @param {!Function} view
 * @param {?Object} model
 * @param {?Node} $root
 */
export const Plume = (view, model = {}, options = {}, $root = undefined) => {
  let oldView

  let plumeOptions = Object.assign({
    specialTypes: {
      "_TEXT": element => document.createTextNode(element.prop.content),
      "_SHADOW": element => {
        let _shadowRoot = create(el("plume-component"))
        let _shadow = _shadowRoot.attachShadow(element.prop.shadow)
        _shadow.appendChild(create(element.prop.template))
        _shadow.appendChild(create(style({}, element.prop.css)))
        return _shadowRoot
      }
    },
    specialProps: {
      "class": (element, classes) => {
        if (!(classes instanceof Array))
          throw new Error("Classes should be in array")

        classes
          .filter(_ => _)
          .forEach(c =>
            element.classList.add(c)
          )
      },
      "style": (element, style) =>
        Object.keys(style)
          .forEach(p => {
            let attr = p.replace(/([A-Z])/g, "-$1").toLowerCase()
            let hasImportant = style[p] instanceof Array
            let prop = hasImportant ? style[p][0] : style[p]
            let important = hasImportant ? style[p][1] : ""

            element.style.setProperty(attr, prop, important)
          })
    }
  }, options)

  /**
   * converts an element to actual HTMLNode
   * @param {PlumeElement} node
   */
  const create = (node) => {
    if (node.type in plumeOptions.specialTypes)
      return plumeOptions.specialTypes[node.type](node)

    let $el = document.createElement(node.type)
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

    name = name.toLowerCase()

    if (name in plumeOptions.specialProps)
      return plumeOptions.specialProps[name]($el, value)
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
      window.onload = () => res(Plume(view, model, options, document.body))
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