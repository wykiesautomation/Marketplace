(function(){
  "use strict";
  function bad(s){return /[\u00c2\u00c3\u00e2\ufffd]/.test(s||"");}
  function repair(){
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    var nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(n){
      var t=n.nodeValue||""; if(!bad(t)) return;
      var p=n.parentElement; if(!p) return;
      var short=t.trim().length<=12;
      var search=p.closest(".catalog-search,.search-box,.hero-search,[class*=search]");
      var action=p.closest("a,button,[class*=arrow],[class*=link]");
      if(search && short){n.nodeValue=String.fromCodePoint(0x1f50d);return;}
      if(action && short){n.nodeValue=String.fromCodePoint(0x2192);return;}
      t=t.replace(/\u00e2\u2020\u2019/g,String.fromCodePoint(0x2192));
      t=t.replace(/\u00e2\u0152\u2022/g,String.fromCodePoint(0x1f50d));
      t=t.replace(/\u00c2\u00a9/g,String.fromCodePoint(0x00a9));
      n.nodeValue=t;
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",repair);
  else repair();
  setTimeout(repair,250);
  setTimeout(repair,1000);
})();
