<template>
  <div class="search-bar" v-show="!hiden">
    <div class="left-arrow">
      <svg class="icon" aria-hidden="true">
        <use :xlink:href="'#'+ArrowRightIcon.id"></use>
      </svg>
    </div>
    <div class="right-controls">
      <section class="search">
        <div class="input-wrapper">
          <input
            type="text"
            v-model="searchValue"
            ref="search"
            @input="input($event)"
            @keyup="keyup($event)"
            placeholder="Search"
          >
          <div class="controls">
            <span
              id="__is-case-sensitive"
              title="Case Sensitive"
              class="is-case-sensitive"
              @click="checkoutCaseSensitive($event)"
            >
              <svg :viewBox="FindCaseIcon.viewBox" aria-hidden="true">
                <use :xlink:href="'#'+FindCaseIcon.id" />
              </svg>
            </span>
            <span
              id="__is-whole-word"
              title="Select whole word"
              class="is-whole-word"
              @click="checkoutWholeWord($event)"
            >
              <svg :viewBox="FindWordIcon.viewBox" aria-hidden="true">
                <use :xlink:href="'#'+FindWordIcon.id" />
              </svg>
            </span>
            <span
              id="__is-regex"
              title="Use query as RegEx"
              class="is-regex"
              @click="checkoutRegex($event)"
            >
              <svg :viewBox="FindRegexIcon.viewBox" aria-hidden="true">
                <use :xlink:href="'#'+FindRegexIcon.id" />
              </svg>
            </span>
          </div>
          </div>
        <div class="result-match">
          <span class="search-result">{{`${highlightIndex + 1} / ${highlightCount}`}}</span>

          <span class="pre-match" title="Previous Match" @click="previous()">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="'#'+ArrowUpIcon.id"></use>
            </svg>
          </span>
          <span class="next-match" title="Next Match" @click="next()">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="'#'+ArrowDownIcon.id"></use>
            </svg>
          </span>

          <span class="close-search" title="Close" @click="close()">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="'#'+Close.id"></use>
            </svg>
          </span>
        </div>
      </section>

    </div>
  </div>
</template>

<script lang="ts">
import {highlight,selectMatch,removeHighlightKey} from './search';
import FindCaseIcon from '@/assets/icons/searchIcons/iconCase.svg';
import FindWordIcon from '@/assets/icons/searchIcons/iconWord.svg';
import FindRegexIcon from '@/assets/icons/searchIcons/iconRegex.svg';
import ArrowRightIcon from '@/assets/icons/element-ui-icon/arrowRightBold.svg'
import ArrowUpIcon from '@/assets/icons/element-ui-icon/arrowUp.svg'
import ArrowDownIcon from '@/assets/icons/element-ui-icon/arrowDown.svg'
import Close from '@/assets/icons/element-ui-icon/close.svg'

export default{
    props:{
        root:String,
        highlightClass:String,
        selectedClass:String,
        hiden:Boolean,
    },
    data(){
        this.FindCaseIcon = FindCaseIcon
        this.FindWordIcon = FindWordIcon
        this.FindRegexIcon = FindRegexIcon
        this.ArrowRightIcon = ArrowRightIcon
        this.ArrowUpIcon = ArrowUpIcon
        this.ArrowDownIcon = ArrowDownIcon
        this.Close = Close
        return{
            searchNode:null,
            searchValue:'',
            replaceValue: '',
            isCaseSensitive: false,
            isWholeWord: false,
            isRegexp: false,
            searchMatches:{
              index:-1,
              result:[]
            },
            isHighlight:true, //是否高亮
        }
    },
    computed:{
        highlightIndex () {
            if (this.searchMatches) {
                return this.searchMatches.index
            } else {
                return -1
            }
        },
        highlightCount () {
            if (this.searchMatches) {
                return this.searchMatches.result.length
            } else {
                return 0
            }
        }
    },
    watch:{
      hiden(val){
        if(val == true){
          removeHighlightKey(this.highlightClass)
          this.searchMatches = {index:-1,result:[]}
          this.searchValue = ''
        }
      }
    },
    methods:{
      next(){
        if(this.searchMatches.result.length <= 0){
          return
        }
        this.searchMatches.index = (this.searchMatches.index+1)%this.searchMatches.result.length
        selectMatch(this.searchMatches.result,this.searchMatches.index)
      },
      previous(){
        if(this.searchMatches.result.length <= 0){
          return
        }

        if(this.searchMatches.index <= 0){
          this.searchMatches.index = this.searchMatches.result.length -1
          selectMatch(this.searchMatches.result,this.searchMatches.index)
          return 
        }

        this.searchMatches.index = (this.searchMatches.index-1)%this.searchMatches.result.length
        selectMatch(this.searchMatches.result,this.searchMatches.index)
      },
      close(){
        this.$emit('update:hiden',true)
        removeHighlightKey(this.highlightClass)
        this.searchMatches = {index:-1,result:[]}
        this.searchValue = ''
      },
      keyup(event:KeyboardEvent){
        if(event.isComposing) return
        if (event && (event.key === 'Enter' || event.key === "ArrowDown")) {
          return this.next()
        }else if(event && event.key === "ArrowUp"){
          return this.previous()
        }
      },
      input(event:InputEvent){
        if(event.isComposing) return
        const {searchValue} = this
        this.search(searchValue)
      },
      checkoutCaseSensitive(event:MouseEvent){
        let element = event.currentTarget as HTMLElement
        this.isCaseSensitive = !this.isCaseSensitive
        if(this.isCaseSensitive) element.classList.add("checked")
        else element.classList.remove("checked")
        this.search(this.searchValue)

      },
      checkoutWholeWord(event:MouseEvent){
        let element = event.currentTarget as HTMLElement
        this.isWholeWord = !this.isWholeWord
        if(this.isWholeWord) element.classList.add("checked")
        else element.classList.remove("checked")
        this.search(this.searchValue)
      },
      checkoutRegex(event:MouseEvent){
        let element = event.currentTarget as HTMLElement
        this.isRegexp = !this.isRegexp
        if(this.isRegexp) element.classList.add("checked")
        else element.classList.remove("checked")
        this.search(this.searchValue)
      },
      search(text:string){
        let node = document.querySelector(this.root)
        //高亮标记
        if(this.isHighlight){
          const {isCaseSensitive,isWholeWord,isRegexp,highlightClass} = this
          this.searchMatches.result = highlight(
            node,
            text,
            {isCaseSensitive,isWholeWord,isRegexp,highlightClass}
          )
          this.searchMatches.index = 0
          selectMatch(
            this.searchMatches.result,
            this.searchMatches.index,
            {selectedClass:this.selectedClass}
            )
        }
      }
    },

}
</script>

<style scoped>

  .search-bar {
    position: fixed;
    width: 400px;
    padding: 0;
    top: 10px;
    right: 66px;
    border-radius: 3px;
    box-shadow: rgba(15, 15, 15, 0.03) 0px 0px 0px 1px, rgba(15, 15, 15, 0.04) 0px 3px 6px, rgba(15, 15, 15, 0.05) 0px 9px 24px;
    background: #fff;
    display: flex;
    flex-direction: row;
    z-index: 999;
  }
  .search-bar .left-arrow {
    width: 20px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .search-bar .left-arrow:hover {
    
  }
  .search-bar .left-arrow svg {
    height: 12px;
    width: 12px;
  }
  .search-bar .left-arrow svg.arrow-right {
    transform: rotate(-90deg);
  }

  .search-bar .right-controls {
    flex: 1;
    width: 380px;
  }
  
  .search{
    height: 28px;
    display: flex;
    padding: 4px 10px 0 4px;
    margin-bottom: 5px;
  }

  .input-wrapper{
    width: 208px;
    display: flex;
    position: relative;
    border-radius: 3px;
    border:1px solid rgba(0, 0, 0, .06);
    background-color: rgba(0, 0, 0, .06);
  }
  
  .input-wrapper input{
    width: 128px;
    border: none;
    outline: none;
    background: transparent;
  }

  .input-wrapper .controls {
    cursor: pointer;
    position: absolute;
    top: 1px;
    right: 0px;
    height: 20px;
    margin: 3px 0;
    display: flex;
    user-select: none;
  }
  .input-wrapper .controls span{
    height: 20px;
    width: 20px;
    margin: 0 1px;
    border-radius: 5px;
    fill: #6B737B;
  }
  .is-case-sensitive:hover,.is-whole-word:hover,.is-regex:hover{
    background-color: #dcdfe6;
  }
  .is-case-sensitive.checked,.is-whole-word.checked,.is-regex.checked{
    background-color: #c0c2c8;
  }
  .result-match{
    display: flex;
    user-select: none;
    padding-left: 5px;
    
  }

  .result-match .search-result{
    width: 70px;
    padding: 4px;
  }
  .result-match span > svg{
    width: 20px;
    height: 20px;
  }
  .pre-match{
    border-radius: 5px;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
  .next-match{
    border-radius: 0px;
  }
  .close-search{
    border-radius: 5px;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }

  .pre-match,.next-match,.close-search{
    cursor: pointer;
    border: 1px solid #dcdfe6;
  }

  .pre-match > svg,.next-match > svg,.close-search > svg{
    padding: 4px;
  }

</style>