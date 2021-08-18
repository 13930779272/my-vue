@babel/core: babel把es6的语法转义成es5的语法
rollup: 打包模块常用的工具，如果是工程化项目需要用webpack， 还有新出的vite
rollup-plugin-babel:在rollup中使用babel
@babel/preset-env: @babel/core是转义的但是本身没有转义功能，需要靠这个来转义
rollup-plugin-node-resolve: 解析文件夹下的index文件