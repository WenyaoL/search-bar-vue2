const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false,
  chainWebpack: config=>{

    const dir = path.resolve(__dirname,'src/assets/icons')
    config.module
      .rule('svg-sprite')
      .test(/\.svg$/)
      .include.add(dir)
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        //extract:true
      })
      .end()

    config.plugin('svg-sprite').use(require('svg-sprite-loader/plugin'))
    config.module.rule('svg').exclude.add(dir)
  },
  configureWebpack:{
    entry:{
      app:"./dev/main.ts"
    }
  }
})
