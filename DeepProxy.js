export default class DeepProxy {
  /**
   * @param {Function} onUpdateCallBack
   * @param {?Object} initialModel
   * @param {?ProxyHandler<?>} UDhandler
   */
  constructor(onUpdateCallBack, initialModel = {}, UDhandler = undefined) {
    /**
     * deep compares two Objects and returns wheter they differ or not
     *
     * @param {!Object} obj1
     * @param {!Object} obj2
     */
    this.compare = (obj1, obj2) => {
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
        if (!this.compare(obj1[p], obj2[p]))
          return false
      return true
    }

    /**
     * turns a nested object in a nested proxy
     *
     * @param {Object} obj
     * @param {!ProxyHandler<?>} handler
     */
    this.proxify = (obj, handler) => {
      for (let p in obj)
        if (obj[p] instanceof Object)
          obj[p] = new Proxy(this.proxify(obj[p], handler), handler)

      return obj
    }


    this.handler = {
      set: (target, key, value) => {
        if (!this.compare(target[key], value)) {
          target[key] =
            this.proxify(value, this.handler)

          if (this.doCallback)
            onUpdateCallBack(this)
        }
        return true
      }
    }

    this.doCallback = true

    let handler = UDhandler || this.handler

    this.data =
      new Proxy(
        this.proxify(
          initialModel,
          handler
        ),
        handler
      )
  }
}
