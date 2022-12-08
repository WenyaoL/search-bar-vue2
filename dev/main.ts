/**
 * search-bar-vue2
 * @author liangwy
 */

import Vue from 'vue'
import App from './App.vue'
import SearchBar from '../src/index'
//import SearchBar from 'search-bar-vue2'
Vue.config.productionTip = false

Vue.use(SearchBar)

new Vue({
  render: h => h(App),
}).$mount('#app')
