import { observe } from "./observe";
import { isFunction } from "./utils";

export function initState(vm) {
  const options = vm.$options;
  if(options.data) { // 如果有data属性
    initData(vm)
  }
};

function proxy(vm, key, source) { // 此处也会有闭包
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    }
  })
};

function initData(vm) {
  console.log(vm);
  // data是函数或者对象
  let data = vm.$options.data;
  // 只有根实例可以传一个对象，组件必须传函数  data和vm_data引用的是同一个空间，data被劫持了，vm._data也被劫持了
  data = vm._data = isFunction(data) ? data.call(vm) : data;
  /**
   * 我们把数据挂载到vm上因为我们需要让用户通过vm.xxx 的方式拿到xxx数据，
   * 此时我们思考通过vm.$options.data() 是否可以呢，当然不可以因为我们在执行一次拿到的数并不是响应式的数据
   * 我们把_data放到vm上看起来不是用户写的
   * 此时vm._data.xxx也不是我们想要的结果
   * 想要达到我们想要的结果我们就接着用 Object.defineProperty + for in 的方式把data代理就可以了
   */
  // 需要将data变成响应式的，重写data中的所有属性
  // console.log(data);
  // console.log(observe)
  observe(data);
  // 把data代理到vue实例上，取值的时候再去做代理(懒代理，只有取值的时候才代理)，不是暴力的去赋值，（暴力的去赋值会有命名冲突问题）
  for(let key in data) { //vm.xxx => vm._data.xxx
    proxy(vm, key, '_data')
  }
  // console.log(data);
  // data.list.push('23123');
  // data.list.pop(1)
}