
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 匹配标签名的 aa-xxx
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 命名空间标签 aa:aa-xxx
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名 索引第一个 [1]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div> 索引第一个 [1]
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的 a=xxx a="xxx" a='xxx'
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  > />


// 解析html,会编译成一个对象非常像虚拟DOM但是不是虚拟DOM
function parserHTML(html) {
  // 构建一个栈，当解析到一个标签的时候就放进去一个，再有下一个标签就是栈里边最后一个的儿子，当解析到结束标签的时候就从栈里边删掉，自闭和标签同理
  let stack = [];
  // 树根
  let root = null;

  function createAstElement(tag, attrs, parent = null) {
    return {
      tag,
      type: 1,
      children: [],
      parent,
      attrs
    }
  }
  // 如何构建一棵树，构建父子关系
  function start(tag, attrs) {
    console.log(tag, attrs);
    // 遇到开始标签 就取栈中最后一个作为父节点
    let parent = stack[stack.length - 1];
    let element = createAstElement(tag, attrs, parent);
    // root等于null证明 当前解析的就是根节点
    if(root === null) {
      root = element
    };
    if(parent) {
      // 如果有父级就更新当前的标签的parent 指向 parent
      element.parent = parent;
      // parent 的children 里放上 element
      parent.children.push(element)
    }
    stack.push(element);

  }
  function end(tagName) {
    console.log(tagName);
    let endTag = stack.pop();
    if(endTag.tag != tagName) {
      console.log('标签出错')
    }
  }
  function text(chars) {
    let parent = stack[stack.length - 1];
    // 替换空格
    chars = chars.replace(/\s/g, "");
    console.log(chars);
    if (chars) {
      parent.children.push({
        type: 2,
        text: chars
      })
    }
  }
  // 删除匹配到（已经解析完成的）的字符
  function advance(len) {
    html = html.substring(len)
  };
  // 处理开始标签
  function parseStartTag() {
    // 匹配开始标签，我们要的是开始标签的名字
    const start = html.match(startTagOpen);
    if(start) {
      const match = {
        // 标签的名字是[1]
        tagName: start[1],
        attrs: [] // 标签的属性
      }
      // debugger;
      // 标签一旦解析完成就得删掉
      advance(start[0].length);
      let end;
      let arr;
      // debugger
      // 有属性并且没有匹配到开始标签的结束（> />）就继续循环直到匹配到开始标签的结束（> />）为止
      while(!(end = html.match(startTagClose)) && (arr = html.match(attribute))) {
        // 在match里面添加属性
        match.attrs.push({
          name: arr[1],
          value: arr[3] || arr[4] || arr[5]
        });
        advance(arr[0].length)
      }
      // 最终会匹配到开始标签的关闭，也需要截取掉
      if(end) {
        advance(end[0].length)
      }
      return match;
      // console.log(match, html)
    } else {
      return false
    }
    
  };
  // 处理模板，不停的截取模板，直到模板全部解析完毕
  while(html) {
    // 解析开始标签<, 当 < 在字符串中的索引为零时证明是开始标签的 < 
    let index = html.indexOf('<');
    // debugger
    if(index === 0) {
      // 解析开始标签并且把属性也解析出来
      const startTagMatch = parseStartTag();
      console.log(startTagMatch);
      // 开始标签
      if(startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue;
      }
      let endTagMatch;
      // < 也有可能是结束标签
      if(endTagMatch = html.match(endTag)) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length)
        continue;
      }
      break;
    }
    // 处理文本 当index大于零的时候证明 是文本了
    if(index > 0) {
      // 直接拿到文本
      let chars = html.substring(0, index);
      text(chars);
      advance(chars.length)
    }

  }
  return root;
};


export default parserHTML
