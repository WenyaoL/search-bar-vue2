import {
  isElementVisibleByDisplay,
  isElementVisibleByClientRects,
  arrayToMap,
} from "./util";

class SearchResult {
  start: number;
  end: number;
  node: Node | null;
  matchVal?: RegExpMatchArray;
}

class HighlightResult {
  node: Element;
  highlightClass: string;
  constructor(node: Element, highlightClass: string) {
    this.node = node;
    this.highlightClass = highlightClass;
  }
}

export function strSearch(
  val: string,
  root: Element,
  result: SearchResult[],
  isCaseSensitive: boolean
) {
  if (!result) return;

  for (let index = 0; index < root.childNodes.length; index++) {
    const node = root.childNodes[index];

    //text node
    if (node.nodeType == 3) {
      // let text = node.textContent?.trim()
      let text = node.textContent;
      if (!text || text.length == 0) continue;
      if (!isCaseSensitive) text = text.toLocaleLowerCase();
      let start = 0;
      while ((start = text.indexOf(val, start)) !== -1) {
        let matchResult: SearchResult = new SearchResult(),
          end = start + val.length;
        matchResult.start = start;
        matchResult.end = end;
        matchResult.node = node;
        result.push(matchResult);
        start = end;
      }
      continue;
    }

    //element node
    if (node.nodeType == 1) {
      let element = node as HTMLElement;
      //判断元素可视性
      if (
        !isElementVisibleByDisplay(element) ||
        !isElementVisibleByClientRects(element)
      ) {
        continue;
      }
      strSearch(val, element, result, isCaseSensitive);
    }
  }

  return result;
}

export function regexpSearch(
  regex: RegExp,
  root: Element,
  result: SearchResult[]
) {
  if (!result) return;

  for (let index = 0; index < root.childNodes.length; index++) {
    const node = root.childNodes[index];

    //重置lastIndex
    regex.lastIndex = 0;

    //text node
    if (node.nodeType == 3) {
      let text = node.textContent?.trim();
      let regResult: RegExpExecArray | null = null;

      if (!text || text.length == 0) continue;

      while ((regResult = regex.exec(text)) !== null) {
        let matchResult: SearchResult = new SearchResult();
        matchResult.start = regResult.index;
        matchResult.end = regResult.index + regResult[0].length;
        matchResult.node = node;
        matchResult.matchVal = regResult;
        result.push(matchResult);
      }
      continue;
    }

    //element node
    if (node.nodeType == 1) {
      let element = node as HTMLElement;
      //判断元素可视性
      if (
        !isElementVisibleByDisplay(element) ||
        !isElementVisibleByClientRects(element)
      ) {
        continue;
      }
      let text = element.innerText;
      //测试正则(剪枝)
      if (!regex.test(text)) {
        continue;
      }
      //重置lastIndex
      regex.lastIndex = 0;
      regexpSearch(regex, element, result);
    }
  }

  return result;
}

/**
 *
 * @param val 查找值
 * @param root 根节点
 * @param options 选项
 * @returns
 */
export function search(
  val: string,
  root: Element,
  options?: {
    isCaseSensitive: boolean;
    isWholeWord: boolean;
    isRegexp: boolean;
  }
) {
  if (!root.childNodes || !val || val == "*") return;

  let result: SearchResult[] = [];
  options = options
    ? options
    : { isCaseSensitive: false, isWholeWord: false, isRegexp: false };

  //是否正则匹配
  if (options.isRegexp || options.isWholeWord) {
    let flag = options.isCaseSensitive ? "g" : "gi";
    val = options.isWholeWord ? "\\b" + val + "\\b" : val;
    let regex = new RegExp(val, flag);
    result = regexpSearch(regex, root, result);
  } else {
    val = options.isCaseSensitive ? val : val.toLocaleLowerCase();
    result = strSearch(val, root, result, options.isCaseSensitive);
  }

  return result;
}

export function removeHighlightKey(highlightClass: string) {
  let keys = findHighlightKey(highlightClass);

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    let parent = key.parentElement;
    key.replaceWith(key.textContent);

    parent.normalize();
  }
}

export function findHighlightKey(highlightClass: string) {
  return Array.from(document.getElementsByClassName(highlightClass));
}

export function highlightSearchResult(
  searchResult: SearchResult[],
  highlightClass: string
) {
  let searchResultMap = arrayToMap<Node, SearchResult>(searchResult, "node");
  let highlightResult: Array<HighlightResult> = new Array<HighlightResult>();
  searchResultMap.forEach((searchResult, key) => {
    let node = key as Text;
    if (searchResult instanceof Array) {
      let replace = [];
      let next = 0; //一个记录当前处理到的end的位置
      searchResult.forEach(({ start, end }) => {
        //前置字符串
        let preText = node.textContent
          ? node.textContent.substring(next, start)
          : "";
        //高亮节点
        let highLightNode = document.createElement("span");
        highLightNode.classList.add(highlightClass);
        highLightNode.innerText = node.textContent
          ? node.textContent.substring(start, end)
          : "";
        replace.push(preText, highLightNode);
        //添加高亮结果
        highlightResult.push(
          new HighlightResult(highLightNode, highlightClass)
        );
        //跟新next
        next = end;
      });
      //添加最后的字符串
      replace.push(node.textContent ? node.textContent.substring(next) : "");
      node.replaceWith(...replace);
    } else {
      let { start, end } = searchResult;
      let preText = node.textContent
        ? node.textContent.substring(0, start)
        : "";
      let endText = node.textContent ? node.textContent.substring(end) : "";
      let highLightNode = document.createElement("span");
      highLightNode.classList.add(highlightClass);
      highLightNode.innerText = node.textContent
        ? node.textContent.substring(start, end)
        : "";
      node.replaceWith(preText, highLightNode, endText);
      //添加高亮结果
      highlightResult.push(new HighlightResult(highLightNode, highlightClass));
    }
  });
  return highlightResult;
}

export function highlight(
  root: Element | string,
  text: string,
  options: {
    highlightClass?: string;
    isCaseSensitive: boolean;
    isWholeWord: boolean;
    isRegexp: boolean;
  }
) {
  let { highlightClass, isCaseSensitive, isWholeWord, isRegexp } = options;
  if (!highlightClass) {
    highlightClass = "__highLight";
  }

  if (root instanceof String) {
    root = document.querySelector(this.root) as Element;
    if (!root) return;
  }
  root = root as Element;

  //移除原有高亮
  removeHighlightKey(highlightClass);

  //空文本不需要搜索,单纯执行上面移除高亮即可
  if (!text) return [];

  //搜索
  let searchResult = search(text, root, {
    isCaseSensitive,
    isWholeWord,
    isRegexp,
  });
  //高亮
  return highlightSearchResult(searchResult, highlightClass);
}

export function removeSelectMatchKey() {
  let key = document.querySelector("span.selected-highlight");
  if (!key) return;
  if (key.classList.length > 1) {
    key.classList.remove("selected-highlight");
    return;
  } else if (key.classList.length == 1) {
    let parent = key.parentElement;
    key.replaceWith(key.textContent);
    parent.normalize();
    return;
  }
}

export function selectMatch(
  result: SearchResult[] | HighlightResult[],
  index: number,
  options?: { selectedClass: string }
) {
  if (!result || index < 0 || index >= result.length) return;

  let data = result[index];
  let { selectedClass } = options
    ? options
    : { selectedClass: "selected-highlight" };
  selectedClass = selectedClass ? selectedClass : "selected-highlight";

  if (data instanceof SearchResult) {
    const { node, start, end } = data;
    if (!node) return;
    node.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });

    let sel = window.getSelection();
    let r = document.createRange();
    r.setStart(node, start);
    r.setEnd(node, end);
    sel.addRange(r);
    /*if(sel?.rangeCount == 0){
            
        }else{
            let r = sel?.getRangeAt(0)
            r?.setStart(node,start)
            r?.setEnd(node,end)
        }*/
  }

  if (data instanceof HighlightResult) {
    removeSelectMatchKey();
    const { node, highlightClass } = data;
    if (node.tagName == "SPAN" && node.classList.contains(highlightClass)) {
      node.classList.add(selectedClass);
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return node;
  }
}
