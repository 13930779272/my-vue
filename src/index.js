// vue的构造函数导出vue给别人使用, vue的实现方式：原型模式，所有的功能都通过原型扩展的方式来添加

import { initMixin } from "./init";
import { lifeCycleMixin } from "./lifecycle";
import { renderMixin } from "./render";

function Vue(options) {
  // 实现vue的初始化
  this._init(options)
}
// 把Vue当作参数传进去
initMixin(Vue)
renderMixin(Vue)
lifeCycleMixin(Vue)
export default Vue;

/**
 * 1.
 */