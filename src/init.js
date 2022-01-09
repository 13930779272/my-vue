import { compilerToFunction } from "./compiler";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // console.log(options)
    // 初始化的流程
    const vm = this;
    // 把用户选项放到vm上,后续有其他的扩展的方法想要拿到用户选项就可以通过vm去拿，$：VUE内部的
    vm.$options = options;
    // 初始化状态
    initState(vm);
    // options中有el、data
    if(vm.$options.el) {
      // 走到这的时候，数据已经被劫持了,数据的变化需要更新视图， diff算法更新需要更新的部分
      // 如果有el要将数据挂载到页面上
      console.log('页面要挂载');
      // ast语法树 将template编译成一个树结构 描述为一个树结构 将代码重组成js语法
      // 模板编译原理 把template模板编译成render函数 render函数返回虚拟dom 然后生成真实dom 如果数据更新了再执行render 通过diff算法比对
      // 挂载dom的地方有 el、$mount方法， 模板的方式直接写 render template 无论用哪种方式最终都是调用的一个方法: $mount
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function(el) {
    const vm = this;
    // 获取真实的DOM
    el = document.querySelector(el);
    vm.$el = el
    // 看看配置项里面有没有render函数，因为render函数的优先级最高，如果没有看看有没有template模板，如果template模板也没有就用el里面的内容
    if(!vm.$options.render) {
      let template = vm.$options.template;
      if(!template) {
        // outerHTML指的是当前元素的整个内容（包含这个元素），innerHTML指的是元素里面的东西（不包含当前元素）
        template = el.outerHTML
      };
      let render = compilerToFunction(template);
      vm.$options.render = render;
    }
    // debugger
    mountComponent(vm)
    // console.log(vm.$options.render)
  }
};
   
// 1.new Vue 会调用_init方法进行初始化操作
// 2.会将用户的选项放到 vm.$options上
// 3.会对当前属性上搜素有没有data 数据   initState
// 4.有data 判断data是不是一个函数 ，如果是函数取返回值 initData
// 5.observe 去观测data中的数据 和 vm没关系，说明data已经变成了响应式
// 6.vm上像取值也能取到data中的数据 vm._data = data 这样用户能取到data了  vm._data
// 7.用户觉得有点麻烦 vm.xxx => vm._data
// 8.如果更新对象不存在的属性，会导致视图不更新， 如果是数组更新索引和长度不会触发更新
// 9.如果是替换成一个新对象，新对象会被进行劫持，如果是数组存放新内容 push unshift() 新增的内容也会被劫持
// 通过__ob__ 进行标识这个对象被监控过  （在vue中被监控的对象身上都有一个__ob__ 这个属性）
// 10如果你就想改索引 可以使用$set方法 内部就是splice()



// vue技术点
// 1.编译原理
// 2.响应式原理 依赖收集
// 3.组件化开发 （贯穿了vue的流程）
// 4.diff算法


// 如果有el 需要挂载到页面上
