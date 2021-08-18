
let oldArrayProperty = Array.prototype // 获取数组的老的方法
export let arrayMethods = Object.create(oldArrayProperty); // 让arrayMethods可以通过__proto__ 找到Array的prototype
// create(property) {
//   let fn = function() {}
//   fn.property = property;
//   return new fn
// }
let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

methods.forEach(method => {
  // 这个操作会把需要重写的方法重写，并且能找到数组上没有重写的方法，原来的方法有，又把特殊的给重写了
  arrayMethods[method] = function (...args) {
    console.log('数组');
    // 数组新增的属性要看一下是不是对象，如果是对象继续进行劫持,可以新增数组属性的方法有splice push unshift
    // 需要调用数组的原生的逻辑,arr.push
    oldArrayProperty[method].call(this, ...args);
    // 调用的原有的方法，还可以添加自己的逻辑，（函数劫持、切片编程）
    // splice 从第三个参数起就是新增的属性，unshift push 所有的参数都是新增的属性
    // inserted是新增属性的数组，遍历数组看一下是否需要二次观测
    let inserted = [];
    let ob = this.__ob__
    switch(method) {
      case 'splice':
        inserted = args.slice(2);
        break
      case 'push':
        inserted = args;
        break
      case 'unshift':
        inserted = args;
        break
    };
    // inserted[] 遍历数组 看一下它是否需要进行劫持
    if(inserted.length) ob.observeArray(inserted);
  }
})