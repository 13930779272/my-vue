const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // 匹配{{ xxx }}
// 
export default function generate(ast) {
  // console.log(ast)
  let children = genChildren(ast);
  let code = `_c('${ast.tag}', ${
    ast.attrs.length ? genProps(ast.attrs) : 'undefined'
  }, ${children ? `${children}` : ''})`;
  return code;
}
// 生成属性
function genProps(attrs) {
  // console.log();
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
};
function gen(el) {
  if(el.type === 1) {
    return generate(el)
  } else {
    let text = el.text;
    // 匹配{{}} 的如果匹配到了说明有表达式的情况，如果没有匹配到，说明是纯文本
    if(!defaultTagRE.test(text)) return `_v('${text}')`;
    // 有 <div>qqqq {{name}} 3333 {{age}}</div> 这种情况 要做一个普通值和表达式的拼接 要做成_v('qqqq' + _s(name) + '3333')
    // 此处注意正则加 g 之一lastIndex的问题
    let lastIndex = defaultTagRE.lastIndex = 0;
    let tokens = [];
    let match;
    // 此处不能乱打印会影响 正则的lastIndex
    // console.log(defaultTagRE.exec(text));
    // console.log(defaultTagRE.exec(text));
    while(match = defaultTagRE.exec(text)) {
      // 匹配到表达式的索引
      let index = match.index
      // 如果索引比初始索引要大证明表达式前面还有普通文本
      if (lastIndex < index) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      // 把匹配到的内容用 _s() 包裹去掉前后空格
      tokens.push(`_s(${match[1].trim()})`);
      // console.log(tokens);
      // 修改指针放到表达式后边，开始的索引 index加上匹配到的字符串的长度正好是表达式结束的索引位置
      lastIndex = index + match[0].length
      // 如果此时的索引还是没有到达字符串的长度的话证明还有普通文本也得放到tokens数组里面
    }
    if (lastIndex < text.length) {
      // 一直到text最后
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    // console.log(tokens);
    return `_v(${tokens.join('+')})`
  }
};