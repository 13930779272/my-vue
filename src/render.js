import { isObject } from "./utils";
import { createElement, createText } from "./vnode";

export function renderMixin(Vue) {
  Vue.prototype._c = function() { // 创建元素节点
    console.log(arguments);
    const vm = this;
    return createElement(vm, ...arguments)
  }
  Vue.prototype._v = function(text) { // 创建文本节点
    console.log(arguments);
    const vm = this;
    return createText(vm, text)
  }
  Vue.prototype._s = function(val) { // JSON.stringify
    // 不论是普通类型还是对象一律都给转成字符串
    if (isObject(val)) return JSON.stringify(val);
    return val;
  }
  Vue.prototype._render = function() {
    const vm = this;
    const { render } = vm.$options;
    console.log(render.toString());
    const vnode = render.call(vm);
    console.log(vnode);
    return vnode;
  }
}