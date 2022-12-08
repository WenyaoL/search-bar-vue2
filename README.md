# search-bar-vue2


- [search-bar-vue2](#search-bar-vue2)
  - [Install](#install)
  - [Use](#use)
    - [Global component](#global-component)
    - [Local component](#local-component)
    - [props options](#props-options)
  - [License](#license)




## Install

```shell
npm install search-bar-vue2 --save
```



## Use

### Global component

```js
import SearchBar from 'search-bar-vue2'
Vue.use(SearchBar)
```



### Local component

```html
<template>
  <div>
    <search-bar :root="'#app'" 
                :highlightClass="'myHighLight'" 
                :selectedClass="'selected-highlight'" 
                :hiden.sync="showSearchBar"/>
    <button @click="searchClick()">搜索按钮</button>
    <div id="app">
        <!--文档-->
      <document/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Document from './components/Document.vue';
import {searchBar} from 'search-bar-vue2'
export default Vue.extend({
  name: 'App',
  components: {
    Document,
    searchBar
  },
  data(){
    return{
      showSearchBar:false
    }
  },
  methods:{
    searchClick(){
      
      this.showSearchBar = !this.showSearchBar
      console.log("切换showSearchBar",this.showSearchBar);
    }
  }
});
</script>

<style>
.myHighLight{/*自定义高亮背景*/
  background-color: yellow;
}
.selected-highlight{/*自定义选中高亮背景*/
  background-color: yellowgreen;
}
</style>
```



### props options

| prop           | description                                                  | type    | default              |
| -------------- | ------------------------------------------------------------ | ------- | -------------------- |
| root           | Selector for element(will be put into docment.querySelector(root)) | string  | Must provide         |
| hiden.sync     | A bidirectional binding attribute to control the display and disappearance of the search bar | boolean | true                 |
| highlightClass | The className assigned by the highlighted block              | string  | "__highLight"        |
| selectedClass  | The className assigned by the selected block                 | string  | "selected-highlight" |

## License

MIT license
