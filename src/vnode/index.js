export function createElement(vm, tag, data = {}, ...children) { // 创建虚拟元素节点
  // key 是循环的key标识就在属性里, tag: 标签名 data: 属性 children: 子节点， _c的参数
  return vnode(vm, tag, data, children, data.key, undefined)
}

export function createText(vm, text) { // 创建虚拟文本节点
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}
// 因为节点元素跟文本元素返回的东西是不一样的，
// 写起来麻烦所以就抽成vnode函数统一返回，不管是元素或者节点控制传参就可以了
function vnode(vm, tag, data, children, key, text) {
  return {
    vm,
    tag,
    data,
    children,
    key,
    text
  }
}

/**
 * 返回的vnode跟ast很想像
 * ast：只是描述语法的根据语法解析出来的,没有用户自己的逻辑
 * vnode：描述dom结构的，可以自己去扩展属性
 */