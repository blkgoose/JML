class DeepProxy {
  constructor(f, initialModel = {}, UDhandler) {
    this.handler = {
      set: (target, key, value) => {
        if (!compare(target[key], value)) {
          target[key] =
            this.proxify(value, this.handler)

          if (this.doCallback)
            f(this)
        }
        return true
      }
    }

    this.doCallback = true

    this.proxify = (obj, handler) => {
      for (let p in obj)
        if (obj[p] instanceof Object)
          obj[p] = new Proxy(this.proxify(obj[p], handler), handler)

      return obj
    }

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
