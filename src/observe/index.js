import { isArray, isObject } from "../utils"
import { arrayMethods } from "./array";
class Observer {
  // 对象可以递归，数组里面的数组也得递归
  constructor(data) {
    // 我给对象和数组添加一个自定义属性，这种情况会有死循环了，对象会一直遍历自己身上的属性，__ob__有__ob__,死循环
    // data.__ob__ = this;
    // 不让__ob__ 被遍历到
    // 这样就不会有死循环了，我们打印vue的数据都会看到__ob__这样一个属性就是这加的
    Object.defineProperty(data, '__ob__', {
      value:this,
      enumerable:false // 标识这个属性不能被列举出来，不能被循环到
    })
    // 判断,根数据必须是一个对象所以第一次一定会走到walk里去
    if(isArray(data)) { // 如果是数组就进去
      // 更改数组的原型方法,
      data.__proto__ = arrayMethods;
      // 假如数组里面有对象或者数组的话，就需要再把数组的每一项递归一遍
      this.observeArray(data)
    } else {
      this.walk(data); // 核心就是循环对象
    }
    
  }
  observeArray (data) { // 递归遍历数组，把数组里面的[{}] [[]] 再次重写
    data.forEach(item => observe(item))
  }
  walk(data) {
    Object.keys(data).forEach(key => { // 使用Object.defineProperty重写数据
      defineReactive(data, key, data[key]);
    })
  }
}
// vue2应用了defineProperty需要一加载时就进行递归操作，所以耗费性能，层次过深更严重
// 1.性能优化的原则
// 1) 不要把所有的数据都放到data中，因为所有的数据都会增加get和set
// 2) 数据不要层次过深，尽量扁平化使用
// 3) 不要频繁的获取数据
// 4) 如果数据不需要响应式，可以使用Object.freeze冻结属性
function defineReactive(obj, key, value) { // 此处会产生闭包（闭包不会太耗费性能，也不会泄露），value会向上层的value查找
  // 递归观测数据，不管有多少层我都要观测
  // 如果数据是一个数组那么数组的每一项也会增加get和set，假如说数组的数据多会很耗费性能，所以说数组就不要进行 defineProperty(数组也支持defineProperty)
  // vue3中为了兼容proxy内部对数组用的就是defineProperty
  // 按照常理来说用户修改数组无非采用数组的方法，只要把能改变数组的数组的方法重写就可以了（push pop shift unshift reverse sort splice）
  observe(value);
  Object.defineProperty(obj, key, {
    get() {
      return value; // 此处不能用obj[key]去取值，
    },
    set(newValue) {
      console.log('设置新值')
      if(newValue === value) return;
      // 继续观测新值，否则如果新值是对象或者数组的话就不是响应式的了
      observe(newValue)
      value = newValue
    }
  })
}
export function observe(data) {
  // console.log(data)
  // 如果data不是对象，就不用观测了
  // 此处如果是数组也会走到Observer,里面会判断是否是数组
  if(!isObject(data)) {
    return ;
  };
  // 如果一个对象被观测过了就会有这个__ob__,那么就不用再观测了
  if(data.__ob__) {
    return;
  }
  // 需要观测data,最外层必须是一个{}，不能是数组，
  // 如果一个数据已经被观测过了，就不要再观测了，用类来实现，观测之后就增加一个标识，再观测是去检测，做出判断
  return new Observer(data);
}