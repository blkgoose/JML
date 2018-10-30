var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.getGlobal = function(maybeGlobal) {
  return typeof window != "undefined" && window === maybeGlobal ? maybeGlobal : typeof global != "undefined" && global != null ? global : maybeGlobal;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.checkEs6ConformanceViaProxy = function() {
  try {
    var proxied = {};
    var proxy = Object.create(new $jscomp.global["Proxy"](proxied, {"get":function(target, key, receiver) {
      return target == proxied && key == "q" && receiver == proxy;
    }}));
    return proxy["q"] === true;
  } catch (err) {
    return false;
  }
};
$jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = false;
$jscomp.ES6_CONFORMANCE = $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS && $jscomp.checkEs6ConformanceViaProxy();
$jscomp.ASSUME_ES5 = false;
$jscomp.ASSUME_NO_NATIVE_MAP = false;
$jscomp.ASSUME_NO_NATIVE_SET = false;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties == "function" ? Object.defineProperty : function(target, property, descriptor) {
  descriptor = descriptor;
  if (target == Array.prototype || target == Object.prototype) {
    return;
  }
  target[property] = descriptor.value;
};
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function() {
  $jscomp.initSymbol = function() {
  };
  if (!$jscomp.global["Symbol"]) {
    $jscomp.global["Symbol"] = $jscomp.Symbol;
  }
};
$jscomp.Symbol = function() {
  var counter = 0;
  function Symbol(opt_description) {
    return $jscomp.SYMBOL_PREFIX + (opt_description || "") + counter++;
  }
  return Symbol;
}();
$jscomp.initSymbolIterator = function() {
  $jscomp.initSymbol();
  var symbolIterator = $jscomp.global["Symbol"].iterator;
  if (!symbolIterator) {
    symbolIterator = $jscomp.global["Symbol"].iterator = $jscomp.global["Symbol"]("iterator");
  }
  if (typeof Array.prototype[symbolIterator] != "function") {
    $jscomp.defineProperty(Array.prototype, symbolIterator, {configurable:true, writable:true, value:function() {
      return $jscomp.arrayIterator(this);
    }});
  }
  $jscomp.initSymbolIterator = function() {
  };
};
$jscomp.arrayIterator = function(array) {
  var index = 0;
  return $jscomp.iteratorPrototype(function() {
    if (index < array.length) {
      return {done:false, value:array[index++]};
    } else {
      return {done:true};
    }
  });
};
$jscomp.iteratorPrototype = function(next) {
  $jscomp.initSymbolIterator();
  var iterator = {next:next};
  iterator[$jscomp.global["Symbol"].iterator] = function() {
    return this;
  };
  return iterator;
};
$jscomp.makeIterator = function(iterable) {
  $jscomp.initSymbolIterator();
  var iteratorFunction = iterable[Symbol.iterator];
  return iteratorFunction ? iteratorFunction.call(iterable) : $jscomp.arrayIterator(iterable);
};
$jscomp.owns = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
$jscomp.polyfill = function(target, polyfill, fromLang, toLang) {
  if (!polyfill) {
    return;
  }
  var obj = $jscomp.global;
  var split = target.split(".");
  for (var i = 0; i < split.length - 1; i++) {
    var key = split[i];
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  var property = split[split.length - 1];
  var orig = obj[property];
  var impl = polyfill(orig);
  if (impl == orig || impl == null) {
    return;
  }
  $jscomp.defineProperty(obj, property, {configurable:true, writable:true, value:impl});
};
$jscomp.polyfill("WeakMap", function(NativeWeakMap) {
  function isConformant() {
    if (!NativeWeakMap || !Object.seal) {
      return false;
    }
    try {
      var x = Object.seal({});
      var y = Object.seal({});
      var map = new NativeWeakMap([[x, 2], [y, 3]]);
      if (map.get(x) != 2 || map.get(y) != 3) {
        return false;
      }
      map["delete"](x);
      map.set(y, 4);
      return !map.has(x) && map.get(y) == 4;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeWeakMap && $jscomp.ES6_CONFORMANCE) {
      return NativeWeakMap;
    }
  } else {
    if (isConformant()) {
      return NativeWeakMap;
    }
  }
  var prop = "$jscomp_hidden_" + Math.random();
  function insert(target) {
    if (!$jscomp.owns(target, prop)) {
      var obj = {};
      $jscomp.defineProperty(target, prop, {value:obj});
    }
  }
  function patch(name) {
    var prev = Object[name];
    if (prev) {
      Object[name] = function(target) {
        insert(target);
        return prev(target);
      };
    }
  }
  patch("freeze");
  patch("preventExtensions");
  patch("seal");
  var index = 0;
  var PolyfillWeakMap = function(opt_iterable) {
    this.id_ = (index += Math.random() + 1).toString();
    if (opt_iterable) {
      $jscomp.initSymbol();
      $jscomp.initSymbolIterator();
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillWeakMap.prototype.set = function(key, value) {
    insert(key);
    if (!$jscomp.owns(key, prop)) {
      throw new Error("WeakMap key fail: " + key);
    }
    key[prop][this.id_] = value;
    return this;
  };
  PolyfillWeakMap.prototype.get = function(key) {
    return $jscomp.owns(key, prop) ? key[prop][this.id_] : undefined;
  };
  PolyfillWeakMap.prototype.has = function(key) {
    return $jscomp.owns(key, prop) && $jscomp.owns(key[prop], this.id_);
  };
  PolyfillWeakMap.prototype["delete"] = function(key) {
    if (!$jscomp.owns(key, prop) || !$jscomp.owns(key[prop], this.id_)) {
      return false;
    }
    return delete key[prop][this.id_];
  };
  return PolyfillWeakMap;
}, "es6", "es3");
$jscomp.MapEntry = function() {
  this.previous;
  this.next;
  this.head;
  this.key;
  this.value;
};
$jscomp.polyfill("Map", function(NativeMap) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_MAP || !NativeMap || typeof NativeMap != "function" || !NativeMap.prototype.entries || typeof Object.seal != "function") {
      return false;
    }
    try {
      NativeMap = NativeMap;
      var key = Object.seal({x:4});
      var map = new NativeMap($jscomp.makeIterator([[key, "s"]]));
      if (map.get(key) != "s" || map.size != 1 || map.get({x:4}) || map.set({x:4}, "t") != map || map.size != 2) {
        return false;
      }
      var iter = map.entries();
      var item = iter.next();
      if (item.done || item.value[0] != key || item.value[1] != "s") {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0].x != 4 || item.value[1] != "t" || !iter.next().done) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeMap && $jscomp.ES6_CONFORMANCE) {
      return NativeMap;
    }
  } else {
    if (isConformant()) {
      return NativeMap;
    }
  }
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  var idMap = new WeakMap;
  var PolyfillMap = function(opt_iterable) {
    this.data_ = {};
    this.head_ = createHead();
    this.size = 0;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillMap.prototype.set = function(key, value) {
    var r = maybeGetEntry(this, key);
    if (!r.list) {
      r.list = this.data_[r.id] = [];
    }
    if (!r.entry) {
      r.entry = {next:this.head_, previous:this.head_.previous, head:this.head_, key:key, value:value};
      r.list.push(r.entry);
      this.head_.previous.next = r.entry;
      this.head_.previous = r.entry;
      this.size++;
    } else {
      r.entry.value = value;
    }
    return this;
  };
  PolyfillMap.prototype["delete"] = function(key) {
    var r = maybeGetEntry(this, key);
    if (r.entry && r.list) {
      r.list.splice(r.index, 1);
      if (!r.list.length) {
        delete this.data_[r.id];
      }
      r.entry.previous.next = r.entry.next;
      r.entry.next.previous = r.entry.previous;
      r.entry.head = null;
      this.size--;
      return true;
    }
    return false;
  };
  PolyfillMap.prototype.clear = function() {
    this.data_ = {};
    this.head_ = this.head_.previous = createHead();
    this.size = 0;
  };
  PolyfillMap.prototype.has = function(key) {
    return !!maybeGetEntry(this, key).entry;
  };
  PolyfillMap.prototype.get = function(key) {
    var entry = maybeGetEntry(this, key).entry;
    return entry && entry.value;
  };
  PolyfillMap.prototype.entries = function() {
    return makeIterator(this, function(entry) {
      return [entry.key, entry.value];
    });
  };
  PolyfillMap.prototype.keys = function() {
    return makeIterator(this, function(entry) {
      return entry.key;
    });
  };
  PolyfillMap.prototype.values = function() {
    return makeIterator(this, function(entry) {
      return entry.value;
    });
  };
  PolyfillMap.prototype.forEach = function(callback, opt_thisArg) {
    var iter = this.entries();
    var item;
    while (!(item = iter.next()).done) {
      var entry = item.value;
      callback.call(opt_thisArg, entry[1], entry[0], this);
    }
  };
  PolyfillMap.prototype[Symbol.iterator] = PolyfillMap.prototype.entries;
  var maybeGetEntry = function(map, key) {
    var id = getId(key);
    var list = map.data_[id];
    if (list && $jscomp.owns(map.data_, id)) {
      for (var index = 0; index < list.length; index++) {
        var entry = list[index];
        if (key !== key && entry.key !== entry.key || key === entry.key) {
          return {id:id, list:list, index:index, entry:entry};
        }
      }
    }
    return {id:id, list:list, index:-1, entry:undefined};
  };
  var makeIterator = function(map, func) {
    var entry = map.head_;
    return $jscomp.iteratorPrototype(function() {
      if (entry) {
        while (entry.head != map.head_) {
          entry = entry.previous;
        }
        while (entry.next != entry.head) {
          entry = entry.next;
          return {done:false, value:func(entry)};
        }
        entry = null;
      }
      return {done:true, value:void 0};
    });
  };
  var createHead = function() {
    var head = {};
    head.previous = head.next = head.head = head;
    return head;
  };
  var mapIndex = 0;
  var getId = function(obj) {
    var type = obj && typeof obj;
    if (type == "object" || type == "function") {
      obj = obj;
      if (!idMap.has(obj)) {
        var id = "" + ++mapIndex;
        idMap.set(obj, id);
        return id;
      }
      return idMap.get(obj);
    }
    return "p_" + obj;
  };
  return PolyfillMap;
}, "es6", "es3");
$jscomp.polyfill("Set", function(NativeSet) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_SET || !NativeSet || typeof NativeSet != "function" || !NativeSet.prototype.entries || typeof Object.seal != "function") {
      return false;
    }
    try {
      NativeSet = NativeSet;
      var value = Object.seal({x:4});
      var set = new NativeSet($jscomp.makeIterator([value]));
      if (!set.has(value) || set.size != 1 || set.add(value) != set || set.size != 1 || set.add({x:4}) != set || set.size != 2) {
        return false;
      }
      var iter = set.entries();
      var item = iter.next();
      if (item.done || item.value[0] != value || item.value[1] != value) {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0] == value || item.value[0].x != 4 || item.value[1] != item.value[0]) {
        return false;
      }
      return iter.next().done;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeSet && $jscomp.ES6_CONFORMANCE) {
      return NativeSet;
    }
  } else {
    if (isConformant()) {
      return NativeSet;
    }
  }
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  var PolyfillSet = function(opt_iterable) {
    this.map_ = new Map;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.add(item);
      }
    }
    this.size = this.map_.size;
  };
  PolyfillSet.prototype.add = function(value) {
    this.map_.set(value, value);
    this.size = this.map_.size;
    return this;
  };
  PolyfillSet.prototype["delete"] = function(value) {
    var result = this.map_["delete"](value);
    this.size = this.map_.size;
    return result;
  };
  PolyfillSet.prototype.clear = function() {
    this.map_.clear();
    this.size = 0;
  };
  PolyfillSet.prototype.has = function(value) {
    return this.map_.has(value);
  };
  PolyfillSet.prototype.entries = function() {
    return this.map_.entries();
  };
  PolyfillSet.prototype.values = function() {
    return this.map_.values();
  };
  PolyfillSet.prototype.keys = PolyfillSet.prototype.values;
  PolyfillSet.prototype[Symbol.iterator] = PolyfillSet.prototype.values;
  PolyfillSet.prototype.forEach = function(callback, opt_thisArg) {
    var set = this;
    this.map_.forEach(function(value) {
      return callback.call(opt_thisArg, value, value, set);
    });
  };
  return PolyfillSet;
}, "es6", "es3");
(function() {
  var Module = function(id, opt_exports) {
    this.id = id;
    this.exports = opt_exports || {};
  };
  var CacheEntry = function(def, module, path) {
    this.def = def;
    this.module = module;
    this.path = path;
    this.blockingDeps = new Set;
  };
  CacheEntry.prototype.load = function() {
    if (this.def) {
      var def = this.def;
      this.def = null;
      callRequireCallback(def, this.module);
    }
    return this.module.exports;
  };
  function callRequireCallback(callback, opt_module) {
    var oldPath = currentModulePath;
    try {
      if (opt_module) {
        currentModulePath = opt_module.id;
        callback.call(opt_module, createRequire(opt_module), opt_module.exports, opt_module);
      } else {
        callback($jscomp.require);
      }
    } finally {
      currentModulePath = oldPath;
    }
  }
  var moduleCache = new Map;
  var currentModulePath = "";
  function normalizePath(path) {
    var components = path.split("/");
    var i = 0;
    while (i < components.length) {
      if (components[i] == ".") {
        components.splice(i, 1);
      } else {
        if (i && components[i] == ".." && components[i - 1] && components[i - 1] != "..") {
          components.splice(--i, 2);
        } else {
          i++;
        }
      }
    }
    return components.join("/");
  }
  $jscomp.getCurrentModulePath = function() {
    return currentModulePath;
  };
  function getCacheEntry(id) {
    var cacheEntry = moduleCache.get(id);
    if (cacheEntry === undefined) {
      throw new Error("Module " + id + " does not exist.");
    }
    return cacheEntry;
  }
  var ensureMap = new Map;
  var CallbackEntry = function(requireSet, callback) {
    this.requireSet = requireSet;
    this.callback = callback;
  };
  function maybeNormalizePath(root, absOrRelativePath) {
    if (absOrRelativePath.startsWith("./") || absOrRelativePath.startsWith("../")) {
      return normalizePath(root + "/../" + absOrRelativePath);
    } else {
      return absOrRelativePath;
    }
  }
  function createRequire(opt_module) {
    function require(absOrRelativePath) {
      var absPath = absOrRelativePath;
      if (opt_module) {
        absPath = maybeNormalizePath(opt_module.id, absPath);
      }
      return getCacheEntry(absPath).load();
    }
    function requireEnsure(requires, callback) {
      if (currentModulePath) {
        for (var i = 0; i < requires.length; i++) {
          requires[i] = maybeNormalizePath(currentModulePath, requires[i]);
        }
      }
      var blockingRequires = [];
      for (var i = 0; i < requires.length; i++) {
        var required = moduleCache.get(requires[i]);
        if (!required || required.blockingDeps.size) {
          blockingRequires.push(requires[i]);
        }
      }
      if (blockingRequires.length) {
        var requireSet = new Set(blockingRequires);
        var callbackEntry = new CallbackEntry(requireSet, callback);
        requireSet.forEach(function(require) {
          var arr = ensureMap.get(require);
          if (!arr) {
            arr = [];
            ensureMap.set(require, arr);
          }
          arr.push(callbackEntry);
        });
      } else {
        callback(require);
      }
    }
    require.ensure = requireEnsure;
    return require;
  }
  $jscomp.require = createRequire();
  function markAvailable(absModulePath) {
    var ensures = ensureMap.get(absModulePath);
    if (ensures) {
      for (var i = 0; i < ensures.length; i++) {
        var entry = ensures[i];
        entry.requireSet["delete"](absModulePath);
        if (!entry.requireSet.size) {
          ensures.splice(i--, 1);
          callRequireCallback(entry.callback);
        }
      }
      if (!ensures.length) {
        ensureMap["delete"](absModulePath);
      }
    }
  }
  $jscomp.registerModule = function(moduleDef, absModulePath, opt_shallowDeps) {
    if (moduleCache.has(absModulePath)) {
      throw new Error("Module " + absModulePath + " has already been registered.");
    }
    if (currentModulePath) {
      throw new Error("Cannot nest modules.");
    }
    var shallowDeps = opt_shallowDeps || [];
    for (var i = 0; i < shallowDeps.length; i++) {
      shallowDeps[i] = maybeNormalizePath(absModulePath, shallowDeps[i]);
    }
    var blockingDeps = new Set;
    for (var i = 0; i < shallowDeps.length; i++) {
      getTransitiveBlockingDepsOf(shallowDeps[i]).forEach(function(transitive) {
        blockingDeps.add(transitive);
      });
    }
    blockingDeps["delete"](absModulePath);
    var cacheEntry = new CacheEntry(moduleDef, new Module(absModulePath), absModulePath);
    moduleCache.set(absModulePath, cacheEntry);
    blockingDeps.forEach(function(blocker) {
      addAsBlocking(cacheEntry, blocker);
    });
    if (!blockingDeps.size) {
      markAvailable(cacheEntry.module.id);
    }
    removeAsBlocking(cacheEntry);
  };
  function getTransitiveBlockingDepsOf(moduleId) {
    var cacheEntry = moduleCache.get(moduleId);
    var blocking = new Set;
    if (cacheEntry) {
      cacheEntry.blockingDeps.forEach(function(dep) {
        getTransitiveBlockingDepsOf(dep).forEach(function(transitive) {
          blocking.add(transitive);
        });
      });
    } else {
      blocking.add(moduleId);
    }
    return blocking;
  }
  var blockingModulePathToBlockedModules = new Map;
  function addAsBlocking(blocked, blocker) {
    if (blocked.module.id != blocker) {
      var blockedModules = blockingModulePathToBlockedModules.get(blocker);
      if (!blockedModules) {
        blockedModules = new Set;
        blockingModulePathToBlockedModules.set(blocker, blockedModules);
      }
      blockedModules.add(blocked);
      blocked.blockingDeps.add(blocker);
    }
  }
  function removeAsBlocking(cacheEntry) {
    var blocked = blockingModulePathToBlockedModules.get(cacheEntry.module.id);
    if (blocked) {
      blockingModulePathToBlockedModules["delete"](cacheEntry.module.id);
      blocked.forEach(function(blockedCacheEntry) {
        blockedCacheEntry.blockingDeps["delete"](cacheEntry.module.id);
        cacheEntry.blockingDeps.forEach(function(blocker) {
          addAsBlocking(blockedCacheEntry, blocker);
        });
        if (!blockedCacheEntry.blockingDeps.size) {
          removeAsBlocking(blockedCacheEntry);
          markAvailable(blockedCacheEntry.module.id);
        }
      });
    }
  }
  $jscomp.registerAndLoadModule = function(moduleDef, absModulePath, shallowDeps) {
    $jscomp.require.ensure([absModulePath], function(require) {
      require(absModulePath);
    });
    $jscomp.registerModule(moduleDef, absModulePath, shallowDeps);
  };
  $jscomp.registerEs6ModuleExports = function(absModulePath, exports) {
    if (moduleCache.has(absModulePath)) {
      throw new Error("Module at path " + absModulePath + " is already registered.");
    }
    var entry = new CacheEntry(null, new Module(absModulePath, exports), absModulePath);
    moduleCache.set(absModulePath, entry);
    markAvailable(absModulePath);
  };
  $jscomp.clearModules = function() {
    moduleCache.clear();
  };
})();
//DeepProxy.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {default:{enumerable:true, get:function() {
    return DeepProxy;
  }}});
  class DeepProxy {
    compare(obj1, obj2) {
      if (typeof obj1 !== typeof obj2) {
        return false;
      }
      if (obj1 instanceof Function && obj2 instanceof Function) {
        return obj1.toString() === obj2.toString();
      }
      if (!(obj1 instanceof Object) && !(obj2 instanceof Object)) {
        return Object.is(obj1, obj2);
      }
      if (obj1 instanceof Object && obj2 instanceof Object) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
          return false;
        }
        if (Object.keys(obj1).length === 0) {
          return true;
        }
        for (let p in obj1) {
          if (!this.compare(obj1[p], obj2[p])) {
            return false;
          }
        }
        return true;
      }
    }
    proxify(obj, handler) {
      for (let p in obj) {
        if (obj[p] instanceof Object && Object.getOwnPropertyDescriptor(obj, p).writable) {
          obj[p] = new Proxy(this.proxify(obj[p], handler), handler);
        }
      }
      return obj;
    }
    constructor(onUpdateCallBack, initialModel = {}, UDhandler = undefined) {
      this.doCallback = true;
      this.handler = {set:(target, key, value) => {
        if (!this.compare(target[key], value)) {
          target[key] = this.proxify(value, handler);
          if (doCallback) {
            onUpdateCallBack(this);
          }
        }
        return true;
      }};
      this.data = new Proxy(this.proxify(initialModel, UDhandler || handler), UDhandler || handler);
    }
  }
}, "unknown_source", []);

//Plume.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {Plume:{enumerable:true, get:function() {
    return Plume;
  }}, PlumeElement:{enumerable:true, get:function() {
    return PlumeElement;
  }}, default:{enumerable:true, get:function() {
    return $$default;
  }}, doWithoutBind:{enumerable:true, get:function() {
    return doWithoutBind;
  }}, el:{enumerable:true, get:function() {
    return el;
  }}});
  var module$DeepProxy = $$require("./DeepProxy.js");
  var module$JML = $$require("./JML.js");
  class PlumeElement {
    constructor(type, p, c) {
      this.type = type;
      this.prop = p;
      this.childs = c;
    }
  }
  const doWithoutBind = (model, c) => {
    model.doCallback = false;
    c(model);
    model.doCallback = true;
  };
  const el = (type, p = {}, c = []) => {
    return new PlumeElement(type, p, c);
  };
  const Plume = (view, model = {}, options = {}, $root = undefined) => {
    let oldView;
    let plumeOptions = Object.assign({specialTypes:{"_TEXT":(element) => document.createTextNode(element.prop.content), "_SHADOW":(element) => {
      let _shadowRoot = create(el("plume-component"));
      let _shadow = _shadowRoot.attachShadow(element.prop.shadow);
      _shadow.appendChild(create(element.prop.template));
      _shadow.appendChild(create((0,module$JML.style)({}, element.prop.css)));
      return _shadowRoot;
    }}, specialProps:{"class":(element, classes) => {
      if (!(classes instanceof Array)) {
        throw new Error("Classes should be in array");
      }
      classes.filter((_) => _).forEach((c) => element.classList.add(c));
    }, "style":(element, style) => Object.keys(style).forEach((p) => {
      let attr = p.replace(/([A-Z])/g, "-$1").toLowerCase();
      let hasImportant = style[p] instanceof Array;
      let prop = hasImportant ? style[p][0] : style[p];
      let important = hasImportant ? style[p][1] : "";
      element.style.setProperty(attr, prop, important);
    })}}, options);
    const create = (node) => {
      if (node.type in plumeOptions.specialTypes) {
        return plumeOptions.specialTypes[node.type](node);
      }
      let $el = document.createElement(node.type);
      createProps($el, node.prop);
      if (!(node.childs instanceof Array)) {
        throw new Error("Elements should be in arrays");
      }
      node.childs.map(create).forEach($el.appendChild.bind($el));
      return $el;
    };
    const setProp = ($el, name, value) => {
      const setAttr = ($$el, n, v) => {
        $$el.setAttribute(n, v);
        $$el[n] = v;
      };
      name = name.toLowerCase();
      if (name in plumeOptions.specialProps) {
        return plumeOptions.specialProps[name]($el, value);
      } else {
        if (value instanceof Function) {
          $el[name] = (e) => value($el, e);
        } else {
          if (value instanceof Boolean) {
            if (value) {
              setAttr($el, name, value);
            }
          } else {
            setAttr($el, name, value);
          }
        }
      }
    };
    const createProps = ($el, props) => Object.keys(props).forEach((name) => setProp($el, name, props[name]));
    const updateProps = ($el, newProps, oldProps = {}) => {
      const updateProp = ($$el, name, newProp, oldProp) => {
        if (!newProp) {
          $$el.removeAttribute(name);
        } else {
          if (!oldProp || newProp !== oldProp) {
            setProp($$el, name, newProp);
          }
        }
      };
      if ($el instanceof Text) {
        if (newProps.content !== oldProps.content) {
          $el.textContent = newProps.content;
        }
      } else {
        Object.keys(Object.assign({}, newProps, oldProps)).forEach((name) => updateProp($el, name, newProps[name], oldProps[name]));
      }
    };
    const update = ($parent, newNode, oldNode, index = 0) => {
      if (!oldNode) {
        $parent.appendChild(create(newNode));
      } else {
        if (!newNode) {
          $parent.removeChild($parent.childNodes[index]);
        } else {
          if (newNode.type !== oldNode.type || newNode.childs.length !== oldNode.childs.length) {
            $parent.replaceChild(create(newNode), $parent.childNodes[index]);
          } else {
            if (newNode.type) {
              updateProps($parent.childNodes[index], newNode.prop, oldNode.prop);
              for (let i = 0; i < Math.max(newNode.childs.length, oldNode.childs.length); i++) {
                update($parent.childNodes[index], newNode.childs[i], oldNode.childs[i], i);
              }
            }
          }
        }
      }
    };
    const _VIEW = (model) => {
      let newView;
      doWithoutBind(model, () => newView = view(model.data));
      update($root, newView, oldView);
      oldView = newView;
    };
    if (!$root) {
      return new Promise((res) => {
        window.onload = () => res(Plume(view, model, options, document.body));
      });
    }
    model.__PLUME__ = {routerData:{hash:location.hash, data:{}}};
    let app = new module$DeepProxy.default(_VIEW, model);
    window.onhashchange = (_) => app.data.__PLUME__.lastRouteChange = (new Date).getTime();
    app.data.__PLUME__.initialized = true;
    return app.data;
  };
  const $$default = Plume;
}, "unknown_source", ["./DeepProxy.js", "./JML.js"]);

//JML.js
$jscomp.registerAndLoadModule(function($$require, $$exports, $$module) {
  "use strict";
  Object.defineProperties($$exports, {a:{enumerable:true, get:function() {
    return a;
  }}, article:{enumerable:true, get:function() {
    return article;
  }}, b:{enumerable:true, get:function() {
    return b;
  }}, br:{enumerable:true, get:function() {
    return br;
  }}, button:{enumerable:true, get:function() {
    return button;
  }}, clamp:{enumerable:true, get:function() {
    return clamp;
  }}, component:{enumerable:true, get:function() {
    return component;
  }}, default:{enumerable:true, get:function() {
    return $$default;
  }}, div:{enumerable:true, get:function() {
    return div;
  }}, el:{enumerable:true, get:function() {
    return el;
  }}, empty:{enumerable:true, get:function() {
    return empty;
  }}, footer:{enumerable:true, get:function() {
    return footer;
  }}, form:{enumerable:true, get:function() {
    return form;
  }}, goto:{enumerable:true, get:function() {
    return goto;
  }}, h:{enumerable:true, get:function() {
    return h;
  }}, header:{enumerable:true, get:function() {
    return header;
  }}, hr:{enumerable:true, get:function() {
    return hr;
  }}, iframe:{enumerable:true, get:function() {
    return iframe;
  }}, img:{enumerable:true, get:function() {
    return img;
  }}, input:{enumerable:true, get:function() {
    return input;
  }}, jsonTable:{enumerable:true, get:function() {
    return jsonTable;
  }}, match:{enumerable:true, get:function() {
    return match;
  }}, navbar:{enumerable:true, get:function() {
    return navbar;
  }}, option:{enumerable:true, get:function() {
    return option;
  }}, p:{enumerable:true, get:function() {
    return p;
  }}, range:{enumerable:true, get:function() {
    return range;
  }}, root:{enumerable:true, get:function() {
    return root;
  }}, router:{enumerable:true, get:function() {
    return router;
  }}, select:{enumerable:true, get:function() {
    return select;
  }}, span:{enumerable:true, get:function() {
    return span;
  }}, style:{enumerable:true, get:function() {
    return style;
  }}, table:{enumerable:true, get:function() {
    return table;
  }}, td:{enumerable:true, get:function() {
    return td;
  }}, text:{enumerable:true, get:function() {
    return text;
  }}, textarea:{enumerable:true, get:function() {
    return textarea;
  }}, th:{enumerable:true, get:function() {
    return th;
  }}, tr:{enumerable:true, get:function() {
    return tr;
  }}});
  var module$Plume = $$require("./Plume.js");
  const el = (type, p = {}, c = []) => {
    return new module$Plume.PlumeElement(type, p, c);
  };
  const $$default = el;
  const div = (p = {}, c = []) => el("div", p, c);
  const span = (p = {}, c = []) => el("span", p, c);
  const br = (p = {}) => el("br", p);
  const hr = (p = {}) => el("hr", p);
  const button = (p = {}, c = []) => el("button", p, c);
  const header = (p = {}, c = []) => el("header", p, c);
  const navbar = (p = {}, c = []) => el("nav", p, c);
  const footer = (p = {}, c = []) => el("footer", p, c);
  const article = (p = {}, c = []) => el("article", p, c);
  const input = (p = {}) => el("input", Object.assign({placeholder:" ", oninvalid:(el, e) => e.preventDefault()}, p), []);
  const textarea = (p = {}) => el("textarea", p, []);
  const table = (p = {}, c = []) => el("table", p, c);
  const tr = (p = {}, c = []) => el("tr", p, c);
  const td = (p = {}, c = []) => el("td", p, c);
  const th = (p = {}, c = []) => el("th", p, c);
  const p = (p = {}, c = []) => el("p", p, c);
  const b = (p = {}, c = []) => el("b", p, c);
  const h = (p = {}, string = "", size = 3) => el(`h${clamp(size, 1, 6)}`, p, [text(string)]);
  const a = (p, link, name) => {
    p.href = link;
    return el("a", p, [text(name || link)]);
  };
  const style = (p = {}, style = {}) => {
    let _style = Object.keys(style).map((_el) => {
      let _body = Object.keys(style[_el]).map((_a) => `${_a}:${style[_el][_a]}`);
      return `${_el} {${_body}}`;
    }).join("\n");
    return el("style", p, [text(_style)]);
  };
  const iframe = (p = {}, c = []) => el("iframe", p, c);
  const form = (p = {}, c = []) => el("form", Object.assign({method:""}, p), c);
  const img = (p = {}, c = []) => el("img", p, c);
  const select = (p = {}, c = []) => el("select", p, c);
  const option = (p = {}, c = []) => el("option", p, c);
  const text = (content = "") => el("_TEXT", {content:content}, []);
  const empty = () => text("");
  const router = (model, routes) => {
    let parsedRoute;
    let hash = location.hash.substr(1);
    for (let route in routes) {
      if (parsedRoute = parseRoute(hash, route)) {
        if (model.__PLUME__.routerData.hash != hash) {
          model.__PLUME__.routerData = {data:Object.assign({_errors:[]}, parsedRoute), hash:hash};
          setTimeout(() => {
            try {
              window.scrollTo(0, 0);
              document.querySelector("[autofocus]").focus();
            } catch (_) {
            }
          });
        }
        return routes[route](model.__PLUME__.routerData.data);
      }
    }
    return text();
  };
  const root = (c) => div({}, c);
  const jsonTable = (p = {}, data = []) => {
    let headers = Object.keys(data[0]);
    return table(p, [tr({}, headers.map((x) => th({}, [text(x.replace("_", " "))]))), ...data.map((row) => tr({}, [...headers.map((h) => td({}, [text(row[h].toString())]))]))]);
  };
  const component = (o) => el("_SHADOW", Object.assign({css:"", shadow:{mode:"closed"}, template:null}, o));
  const match = (cond, cases) => {
    try {
      return cases[cond]();
    } catch (e) {
      try {
        return cases["_"]();
      } catch (e2) {
        console.error("default case not found, implement [_] case");
        throw e;
      }
    }
  };
  const goto = (route) => {
    location.hash = `#${route.startsWith("/") ? "" : "/"}${route}`;
  };
  const range = (from, to, skip = 1) => [...Array(to || from).keys()].map((x) => x * skip).map((x) => x + (to ? from : 0)).filter((x) => x <= (to ? to : Infinity));
  const clamp = (num, min, max) => num > max ? max : num < min ? min : num;
  const parseRoute = (hash, route) => {
    if (route.indexOf(":") == -1) {
      if (route == hash || route == "*") {
        return {};
      }
    } else {
      let _hash = hash.split("/");
      let _route = route.split("/");
      if (_hash.length != _route.length) {
        return false;
      }
      let data = {};
      for (let i = 0; i < _route.length; i++) {
        let x = _route[i];
        if (x.indexOf(":") == 0) {
          data[x.substr(1)] = _hash[i];
        } else {
          if (x != _hash[i]) {
            return false;
          }
        }
      }
      return data;
    }
  };
}, "unknown_source", ["./Plume.js"]);

