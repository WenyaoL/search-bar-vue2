export function isElementVisibleByDisplay(element:Element) {
    let style = window.getComputedStyle(element);
    if (style.display == 'none') 
    	return false;
    else
    	return true;
}

export function isElementVisibleByClientRects(element:HTMLElement) {
    if (element.offsetWidth || 
        element.offsetHeight || 
        element.getClientRects().length)
    	return true;
    else
    	return false;
}

export function arrayToMap<K,V>(arr:any[],keyName:string){
    
    let map = new Map<K,V|Array<V>>()
    
    arr.forEach(obj=>{
        let key = obj[keyName]
        if(map.has(key)){
            let value = map.get(key)
            value instanceof Array? value.push(obj):map.set(key,[value,obj])
        }else{
            map.set(key,obj)
        }
    })

    return map
}