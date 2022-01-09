export function patch(el, vnode) {
  // 在这根据虚拟dom生成一个新的el替换掉原来的el(可以去看官网的生命周期图示)
  console.log(el, vnode);
  const elm = createElm(vnode);
  let parent = el.parentNode;
  // 把新的节点插入到老节点的下一个兄弟元素的前面，如果没有下一个兄弟元素就是null ，就是appendChild
  parent.insertBefore(elm, el.nextSibling);
  // 删除老的el,更新页面
  parent.removeChild(el)
  console.log(elm);
  return elm
}

function createElm(vnode) {
  const { tag, data, children, key, text, vm} = vnode
  // 在这我们是通过有没有tag来判定是元素还是文本的
  // 我们让虚拟节点和真实节点做一个映射关系, 后续某个虚拟节点更新了 我可以跟踪到真实节点，并且更新真实节点
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag);
    // 把属性插入到dom上
    updateProperties(vnode.el, data)
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child))
    })
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el
}

function updateProperties(el, props = {}) {
  for(let key in props) {
    el.setAttribute(key, props[key])
  }
}