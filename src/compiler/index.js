import generate from "./generate";
import parserHTML from "./parser";

export function compilerToFunction(template) {
  // 第一步将模板变成ast语法树
  let ast = parserHTML(template);
  // 第二步代码优化 标记静态节点 不是核心暂时略过，直接下一步

  // 第三步代码生成，生成render函数
  // _c => createElement
  // _v => vnode
  // _s => stringify
  let code = generate(ast);
  // 包装成render函数
  let render = new Function(`with(this){ return ${code}}`)
  return render;
}
