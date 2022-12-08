<template>
  <div>
    <search-bar :root="'#app'" :highlightClass="'myHighLight'" :selectedClass="'selected-highlight'" :hiden.sync="showSearchBar"/>
    <button @click="searchClick()">搜索按钮</button>
    <div id="app">
      <document/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Document from './Document.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Document
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
.myHighLight{
  background-color: yellow;
}
.selected-highlight{
  background-color: yellowgreen;
}
</style>
