import Vue,{VueConstructor} from 'vue'
import searchBar from './components/searchBar.vue'

const install = (Vue:VueConstructor,options:any) => {
    Vue.component('searchBar',searchBar)
}

export default {install,searchBar}

export {install,searchBar}