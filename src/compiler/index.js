import parserHTML from "./parser";
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // 匹配{{ xxx }}
// 
function generate(ast) {
  console.log(ast)
  let children = genChildren(ast);
  let code = `_c('${ast.tag}', ${
    ast.attrs.length ? genProps(ast.attrs) : undefined
  }, ${children ? `${children}` : ''})`;
  return code;
}
// 生成属性
function genProps(attrs) {
  console.log();
  let str = [];
  for(let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // 样式单独处理成一个对象
    if(attr.name === 'style') {
      let styles = {}
      attr.value.replace(/([^:;]+):([^;:]+)/g, function() {
        styles[arguments[1]] = arguments[2]
      });
      attr.value = styles;
    }
    str.push(`${attr.name}:${JSON.stringify(attr.value)}`);
  }
  return `{${str.join()}}`
  // console.log()
}
function genChildren(ast) {
  let children = ast.children;
  if(children) {
    return children.map(item => gen(item)).join(',')
  }
  // console.log(ast);
  return false
}
function gen(el) {
  if(el.type === 1) {
    return generate(el)
  } else {
    let text = el.text;
    if(!defaultTagRE.test(text)) return `_v('${text}')`;
    // 有{{}} 这种情况 要做一个普通值和表达式的拼接
    let tokens = [];



    return `_v(${tokens.join('+')})`
    
  }
}
export function compilerToFunction(template) {
  // 第一步将模板变成ast语法树
  let ast = parserHTML(template);
  // 第二步代码优化 标记静态节点 不是核心暂时略过，直接下一步

  // 第三步代码生成，生成rneder函数
  // _c => createElement
  // _v => vnode
  // _s => stringify
  let code = generate(ast)
  console.log(code);
  
}