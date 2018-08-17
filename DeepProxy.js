class DeepProxy {
  constructor(f, initialModel = {}, UDhandler = undefined) {
    this.proxify = (obj, handler) => {
      for (let p in obj)
        if (obj[p] instanceof Object)
          obj[p] = new Proxy(this.proxify(obj[p], handler), handler)

      return obj
    }

    this.handler = {
      set: (target, key, value) => {
        if (!compare(target[key], value)) {
          target[key] =
            this.proxify(value, this.handler)

          f(this.model)
        }
        return true
      }
    }

    this.model =
      new Proxy(
        this.proxify(initialModel, this.handler),
        UDhandler || this.handler
      )

    return this.model
  }
}
