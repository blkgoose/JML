let oldView

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
const Plume = (view, model = {}, $root) => {
  /**
   * converts an element to actual HTMLNode
   *
   * @param {node to create} node
   */
  const create = (node) => {
    if (node.type.indexOf("_") == 0)
      switch (node.type) {
        case "_TEXT":
          return document.createTextNode(node.prop.content)
      }
    const $el = document.createElement(node.type)
    createProps($el, node.prop)

    if (!(node.childs instanceof Array))
      throw Error("node childs should be in array...")

    node.childs
      .map(create)
      .forEach($el.appendChild.bind($el))
    return $el
  }

  /**
   * set or updates the element props
   *
   * @param {element to set the prop for} $el
   * @param {name of the prop} name
   * @param {value of the prop} value
   * @param {defines if is update or creation time} isBeingCreated
   */
  const setProp = ($el, name, value, isBeingCreated = false) => {
    const setAttr = ($$el, n, v) => {
      $$el.setAttribute(n, v)
      $$el[n] = v
    }
    name = name.toLowerCase()

    if (RegExp("^on").test(name))
      switch (name) {
        case "oncreate": if (isBeingCreated) value($el)
          break
        default:
          $el.addEventListener(
            name.slice(2),
            e => value($el, e)
          )
      }
    else
      if (typeof value === "boolean") {
        if (value) setAttr($el, name, value)
      }
      else
        setAttr($el, name, value)
  }

  /**
   * creates the props for the given element.
   *
   * @param {element to crete props for} $el
   * @param {props object with name and value} props
   */
  const createProps = ($el, props) =>
    Object.keys(props).forEach(name =>
      setProp($el, name, props[name], true))

  /**
   * updates the props for the given item,
   * actual prop diffing part.
   *
   * @param {element to update} $el
   * @param {set of new props} newProps
   * @param {set of old props} oldProps
   */
  const updateProps = ($el, newProps, oldProps = {}) => {
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
   *
   * @param {parent being checked} $parent
   * @param {node on new view} newNode
   * @param {node on old view} oldNode
   * @param {current deepness index} index
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
      newNode.type !== oldNode.type
      || newNode.childs.length !== oldNode.childs.length
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
      range(Math.max(newNode.childs.length, oldNode.childs.length))
        .forEach(i =>
          update(
            $parent.childNodes[index],
            newNode.childs[i],
            oldNode.childs[i],
            i
          )
        )
    }
  }

  /**
   * converts the [[view]] function to a real working view
   *
   * @param {model to generate the view from} model
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
      onload = () => res(Plume(view, model, document.body))
    })

  model.__PLUME__ = {
    routerData: {
      hash: location.hash,
      data: {}
    }
  }

  let app = new DeepProxy(_VIEW, model)
  onhashchange = _ =>
    app.data.__PLUME__.lastRouteChange = new Date().getTime()

  app.data.__PLUME__.initialized = true

  return app.data
}