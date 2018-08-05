class DeepProxy {
  constructor(f, initialModel = {}) {
    this.handler = {
      set: (target, key, value) => {
        if (target && target[key] != value) {
          target[key] =
            value instanceof Object ?
              new Proxy(value, this.handler) :
              value

          f(this.model)
        }
        return true
      }
    }
    this.model = new Proxy(initialModel, this.handler)
    return this.model
  }
}
