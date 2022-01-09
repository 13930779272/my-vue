import { patch } from "./vnode/patch";

export function mountComponent(vm) {
  vm._update(vm._render())
}

export function lifeCycleMixin(Vue) {
  // vue的渲染流程都是通过_update完成的
  Vue.prototype._update = function(vnode) {
    console.log(vnode);
    const vm =  this;
    vm.el = patch(vm.$el, vnode)
  }
}