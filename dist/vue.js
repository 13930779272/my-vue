(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{ xxx }}
  // 

  function generate(ast) {
    // console.log(ast)
    let children = genChildren(ast);
    let code = `_c('${ast.tag}', ${ast.attrs.length ? genProps(ast.attrs) : 'undefined'}, ${children ? `${children}` : ''})`;
    return code;
  } // 生成属性

  function genProps(attrs) {
    // console.log();
    let str = [];

    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i]; // 样式单独处理成一个对象

      if (attr.name === 'style') {
        let styles = {};
        attr.value.replace(/([^:;]+):([^;:]+)/g, function () {
          styles[arguments[1]] = arguments[2];
        });
        attr.value = styles;
      }

      str.push(`${attr.name}:${JSON.stringify(attr.value)}`);
    }

    return `{${str.join()}}`; // console.log()
  }

  function genChildren(ast) {
    let children = ast.children;

    if (children) {
      return children.map(item => gen(item)).join(',');
    } // console.log(ast);


    return false;
  }

  function gen(el) {
    if (el.type === 1) {
      return generate(el);
    } else {
      let text = el.text; // 匹配{{}} 的如果匹配到了说明有表达式的情况，如果没有匹配到，说明是纯文本

      if (!defaultTagRE.test(text)) return `_v('${text}')`; // 有 <div>qqqq {{name}} 3333 {{age}}</div> 这种情况 要做一个普通值和表达式的拼接 要做成_v('qqqq' + _s(name) + '3333')
      // 此处注意正则加 g 之一lastIndex的问题

      let lastIndex = defaultTagRE.lastIndex = 0;
      let tokens = [];
      let match; // 此处不能乱打印会影响 正则的lastIndex
      // console.log(defaultTagRE.exec(text));
      // console.log(defaultTagRE.exec(text));

      while (match = defaultTagRE.exec(text)) {
        // 匹配到表达式的索引
        let index = match.index; // 如果索引比初始索引要大证明表达式前面还有普通文本

        if (lastIndex < index) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        } // 把匹配到的内容用 _s() 包裹去掉前后空格


        tokens.push(`_s(${match[1].trim()})`); // console.log(tokens);
        // 修改指针放到表达式后边，开始的索引 index加上匹配到的字符串的长度正好是表达式结束的索引位置

        lastIndex = index + match[0].length; // 如果此时的索引还是没有到达字符串的长度的话证明还有普通文本也得放到tokens数组里面
      }

      if (lastIndex < text.length) {
        // 一直到text最后
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      } // console.log(tokens);


      return `_v(${tokens.join('+')})`;
    }
  }

  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 匹配标签名的 aa-xxx

  const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 命名空间标签 aa:aa-xxx

  const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名 索引第一个 [1]

  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div> 索引第一个 [1]

  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的 a=xxx a="xxx" a='xxx'

  const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  > />
  // 解析html,会编译成一个对象非常像虚拟DOM但是不是虚拟DOM

  function parserHTML(html) {
    // 构建一个栈，当解析到一个标签的时候就放进去一个，再有下一个标签就是栈里边最后一个的儿子，当解析到结束标签的时候就从栈里边删掉，自闭和标签同理
    let stack = []; // 树根

    let root = null;

    function createAstElement(tag, attrs, parent = null) {
      return {
        tag,
        type: 1,
        children: [],
        parent,
        attrs
      };
    } // 如何构建一棵树，构建父子关系


    function start(tag, attrs) {
      console.log(tag, attrs); // 遇到开始标签 就取栈中最后一个作为父节点

      let parent = stack[stack.length - 1];
      let element = createAstElement(tag, attrs, parent); // root等于null证明 当前解析的就是根节点

      if (root === null) {
        root = element;
      }

      if (parent) {
        // 如果有父级就更新当前的标签的parent 指向 parent
        element.parent = parent; // parent 的children 里放上 element

        parent.children.push(element);
      }

      stack.push(element);
    }

    function end(tagName) {
      console.log(tagName);
      let endTag = stack.pop();

      if (endTag.tag != tagName) {
        console.log('标签出错');
      }
    }

    function text(chars) {
      let parent = stack[stack.length - 1]; // 替换空格

      chars = chars.replace(/\s/g, "");
      console.log(chars);

      if (chars) {
        parent.children.push({
          type: 2,
          text: chars
        });
      }
    } // 删除匹配到（已经解析完成的）的字符


    function advance(len) {
      html = html.substring(len);
    }

    function parseStartTag() {
      // 匹配开始标签，我们要的是开始标签的名字
      const start = html.match(startTagOpen);

      if (start) {
        const match = {
          // 标签的名字是[1]
          tagName: start[1],
          attrs: [] // 标签的属性

        }; // debugger;
        // 标签一旦解析完成就得删掉

        advance(start[0].length);
        let end;
        let arr; // debugger
        // 有属性并且没有匹配到开始标签的结束（> />）就继续循环直到匹配到开始标签的结束（> />）为止

        while (!(end = html.match(startTagClose)) && (arr = html.match(attribute))) {
          // 在match里面添加属性
          match.attrs.push({
            name: arr[1],
            value: arr[3] || arr[4] || arr[5]
          });
          advance(arr[0].length);
        } // 最终会匹配到开始标签的关闭，也需要截取掉


        if (end) {
          advance(end[0].length);
        }

        return match; // console.log(match, html)
      } else {
        return false;
      }
    }

    while (html) {
      // 解析开始标签<, 当 < 在字符串中的索引为零时证明是开始标签的 < 
      let index = html.indexOf('<'); // debugger

      if (index === 0) {
        // 解析开始标签并且把属性也解析出来
        const startTagMatch = parseStartTag();
        console.log(startTagMatch); // 开始标签

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        let endTagMatch; // < 也有可能是结束标签

        if (endTagMatch = html.match(endTag)) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }

        break;
      } // 处理文本 当index大于零的时候证明 是文本了


      if (index > 0) {
        // 直接拿到文本
        let chars = html.substring(0, index);
        text(chars);
        advance(chars.length);
      }
    }

    return root;
  }

  function compilerToFunction(template) {
    // 第一步将模板变成ast语法树
    let ast = parserHTML(template); // 第二步代码优化 标记静态节点 不是核心暂时略过，直接下一步
    // 第三步代码生成，生成render函数
    // _c => createElement
    // _v => vnode
    // _s => stringify

    let code = generate(ast); // 包装成render函数

    new Function(`with(this){ return ${code}}`);
  }

  function isFunction(data) {
    return typeof data == 'function';
  }
  function isObject(data) {
    return typeof data == 'object' && data !== null;
  }
  let isArray = Array.isArray;

  let oldArrayProperty = Array.prototype; // 获取数组的老的方法

  let arrayMethods = Object.create(oldArrayProperty); // 让arrayMethods可以通过__proto__ 找到Array的prototype
  // create(property) {
  //   let fn = function() {}
  //   fn.property = property;
  //   return new fn
  // }

  let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
  methods.forEach(method => {
    // 这个操作会把需要重写的方法重写，并且能找到数组上没有重写的方法，原来的方法有，又把特殊的给重写了
    arrayMethods[method] = function (...args) {
      console.log('数组'); // 数组新增的属性要看一下是不是对象，如果是对象继续进行劫持,可以新增数组属性的方法有splice push unshift
      // 需要调用数组的原生的逻辑,arr.push

      oldArrayProperty[method].call(this, ...args); // 调用的原有的方法，还可以添加自己的逻辑，（函数劫持、切片编程）
      // splice 从第三个参数起就是新增的属性，unshift push 所有的参数都是新增的属性
      // inserted是新增属性的数组，遍历数组看一下是否需要二次观测

      let inserted = [];
      let ob = this.__ob__;

      switch (method) {
        case 'splice':
          inserted = args.slice(2);
          break;

        case 'push':
          inserted = args;
          break;

        case 'unshift':
          inserted = args;
          break;
      }

      if (inserted.length) ob.observeArray(inserted);
    };
  });

  class Observer {
    // 对象可以递归，数组里面的数组也得递归
    constructor(data) {
      // 我给对象和数组添加一个自定义属性，这种情况会有死循环了，对象会一直遍历自己身上的属性，__ob__有__ob__,死循环
      // data.__ob__ = this;
      // 不让__ob__ 被遍历到
      // 这样就不会有死循环了，我们打印vue的数据都会看到__ob__这样一个属性就是这加的
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false // 标识这个属性不能被列举出来，不能被循环到

      }); // 判断,根数据必须是一个对象所以第一次一定会走到walk里去

      if (isArray(data)) {
        // 如果是数组就进去
        // 更改数组的原型方法,
        data.__proto__ = arrayMethods; // 假如数组里面有对象或者数组的话，就需要再把数组的每一项递归一遍

        this.observeArray(data);
      } else {
        this.walk(data); // 核心就是循环对象
      }
    }

    observeArray(data) {
      // 递归遍历数组，把数组里面的[{}] [[]] 再次重写
      data.forEach(item => observe(item));
    }

    walk(data) {
      Object.keys(data).forEach(key => {
        // 使用Object.defineProperty重写数据
        defineReactive(data, key, data[key]);
      });
    }

  } // vue2应用了defineProperty需要一加载时就进行递归操作，所以耗费性能，层次过深更严重
  // 1.性能优化的原则
  // 1) 不要把所有的数据都放到data中，因为所有的数据都会增加get和set
  // 2) 数据不要层次过深，尽量扁平化使用
  // 3) 不要频繁的获取数据
  // 4) 如果数据不需要响应式，可以使用Object.freeze冻结属性


  function defineReactive(obj, key, value) {
    // 此处会产生闭包（闭包不会太耗费性能，也不会泄露），value会向上层的value查找
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
        console.log('设置新值');
        if (newValue === value) return; // 继续观测新值，否则如果新值是对象或者数组的话就不是响应式的了

        observe(newValue);
        value = newValue;
      }

    });
  }

  function observe(data) {
    // console.log(data)
    // 如果data不是对象，就不用观测了
    // 此处如果是数组也会走到Observer,里面会判断是否是数组
    if (!isObject(data)) {
      return;
    }

    if (data.__ob__) {
      return;
    } // 需要观测data,最外层必须是一个{}，不能是数组，
    // 如果一个数据已经被观测过了，就不要再观测了，用类来实现，观测之后就增加一个标识，再观测是去检测，做出判断


    return new Observer(data);
  }

  function initState(vm) {
    const options = vm.$options;

    if (options.data) {
      // 如果有data属性
      initData(vm);
    }
  }

  function proxy(vm, key, source) {
    // 此处也会有闭包
    Object.defineProperty(vm, key, {
      get() {
        return vm[source][key];
      },

      set(newValue) {
        vm[source][key] = newValue;
      }

    });
  }

  function initData(vm) {
    console.log(vm); // data是函数或者对象

    let data = vm.$options.data; // 只有根实例可以传一个对象，组件必须传函数  data和vm_data引用的是同一个空间，data被劫持了，vm._data也被劫持了

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

    observe(data); // 把data代理到vue实例上，取值的时候再去做代理(懒代理，只有取值的时候才代理)，不是暴力的去赋值，（暴力的去赋值会有命名冲突问题）

    for (let key in data) {
      //vm.xxx => vm._data.xxx
      proxy(vm, key, '_data');
    } // console.log(data);
    // data.list.push('23123');
    // data.list.pop(1)

  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // console.log(options)
      // 初始化的流程
      const vm = this; // 把用户选项放到vm上,后续有其他的扩展的方法想要拿到用户选项就可以通过vm去拿，$：VUE内部的

      vm.$options = options; // 初始化状态

      initState(vm); // options中有el、data

      if (vm.$options.el) {
        // 走到这的时候，数据已经被劫持了,数据的变化需要更新视图， diff算法更新需要更新的部分
        // 如果有el要将数据挂载到页面上
        console.log('页面要挂载'); // ast语法树 将template编译成一个树结构 描述为一个树结构 将代码重组成js语法
        // 模板编译原理 把template模板编译成render函数 render函数返回虚拟dom 然后生成真实dom 如果数据更新了再执行render 通过diff算法比对
        // 挂载dom的地方有 el、$mount方法， 模板的方式直接写 render template 无论用哪种方式最终都是调用的一个方法: $mount

        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      const vm = this; // 获取真实的DOM

      el = document.querySelector(el);
      vm.$el = el; // 看看配置项里面有没有render函数，因为render函数的优先级最高，如果没有看看有没有template模板，如果template模板也没有就用el里面的内容

      if (!vm.$options.render) {
        let template = vm.$options.template;

        if (!template) {
          // outerHTML指的是当前元素的整个内容（包含这个元素），innerHTML指的是元素里面的东西（不包含当前元素）
          template = el.outerHTML;
        }
        let render = compilerToFunction(template);
        vm.$options.render = render;
      } // console.log(vm.$options.render)

    };
  }
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

  // vue的构造函数导出vue给别人使用, vue的实现方式：原型模式，所有的功能都通过原型扩展的方式来添加

  function Vue(options) {
    // 实现vue的初始化
    this._init(options);
  } // 把Vue当作参数传进去


  initMixin(Vue);
  /**
   * 1.
   */

  return Vue;

})));
//# sourceMappingURL=vue.js.map
