import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
export default {
  input: './src/index.js',
  output: [
    {
      file: 'dist/vue.js',
      // 常见的打包格式 IIFE ESM CJS UMD AMD umd兼容CJS、AMD、CMD规范
      format: 'umd',
      name: 'Vue', // umd需要配置name，会将导出的模块放到window上，node中使用费是CJS ，webpack ESM， 前端里script iife umd
      sourcemap: true
    }
    // ... 多种打包格式的配置项
  ],
  // 插件
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**', // 排除文件

    })
  ]
}