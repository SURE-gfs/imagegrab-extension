(() => {
  if (globalThis.__imageGrabInstalled) return;
  globalThis.__imageGrabInstalled = true;
  function isProduct() {
    const {hostname:h, pathname:p,search:s}=location;
    return ((/(^|\.)(taobao|tmall)\.com$/.test(h)) && /item\.htm|detail|\/item\//i.test(p)) ||
      (/(^|\.)jd\.com$/.test(h) && (/\/\d+\.html$/.test(p)||/product|ware\/view/i.test(p))) ||
      (/(^|\.)(pinduoduo|yangkeduo)\.com$/.test(h) && /goods|detail|product/i.test(p+s));
  }
  function collect() {
    const urls=new Map();
    function add(raw,source) {
      if(!raw || urls.size>=500) return;
      try {const u=new URL(raw,location.href);if(!['https:','http:','data:'].includes(u.protocol))return;if(u.protocol==='data:'&&!u.href.startsWith('data:image/'))return;u.hash='';if(/(?:^|[\/_.-])(favicon|spacer|placeholder|transparent|sprite)(?:[\/_.-]|$)/i.test(u.pathname))return;if(!urls.has(u.href))urls.set(u.href,{url:u.href,source});}catch{}
    }
    // 先收集懒加载原图，再收集已加载图，保留实际地址而不猜测 CDN 参数。
    document.querySelectorAll('img').forEach(img=>{
      if(/\b(logo|icon|avatar)\b/i.test(img.className+' '+img.alt))return;
      for(const a of ['data-original','data-src','data-lazy-src','data-ks-lazyload','data-lazyload'])add(img.getAttribute(a),'懒加载');
      for(const a of ['srcset','data-srcset']) {const set=img.getAttribute(a);if(set&&!set.startsWith('data:'))set.split(',').forEach(x=>add(x.trim().split(/\s+/)[0],'响应式图片'));}
      if(!(img.complete&&img.naturalWidth>0&&(img.naturalWidth<100||img.naturalHeight<100))){add(img.currentSrc,'商品图片');add(img.getAttribute('src'),'商品图片');}
    });
    document.querySelectorAll('picture source').forEach(s=>(s.srcset||'').split(',').forEach(x=>add(x.trim().split(/\s+/)[0],'响应式图片')));
    // 控制遍历上限，避免超长详情页阻塞浏览器。
    for(const e of [...document.querySelectorAll('body *')].slice(0,12000)) {if(e.id==='imagegrab-float')continue;const bg=getComputedStyle(e).backgroundImage;for(const m of bg.matchAll(/url\(["']?(.*?)["']?\)/g))add(m[1],'背景图片');}
    return {images:[...urls.values()],pageUrl:location.href,title:document.title};
  }
  chrome.runtime.onMessage.addListener((message,_sender,reply)=>{if(message.type==='SCAN_PAGE'){reply(collect());}return false;});
  function mount() {
    const existing=document.getElementById('imagegrab-float');if(!isProduct()){existing?.remove();return;}if(existing)return;
    const host=document.createElement('div');host.id='imagegrab-float';host.style.cssText='position:fixed;bottom:28px;right:28px;z-index:2147483646';
    const root=host.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent='button{border:0;border-radius:14px;padding:15px 22px;background:#4f46e5;color:white;box-shadow:0 6px 24px #312e8150;font:600 15px system-ui;cursor:pointer;transition:transform .2s}button:hover{transform:translateY(-3px)}button:disabled{opacity:.6}';const b=document.createElement('button');b.textContent='▧ 获取图片';
    b.onclick=async()=>{b.disabled=true;b.textContent='正在提取…';try{const res=await chrome.runtime.sendMessage({type:'OPEN_GALLERY',...collect()});if(!res?.ok)throw new Error(res?.error||'扩展未响应');b.textContent='✓ 已打开画廊';}catch{b.textContent='提取失败，点击重试';}finally{b.disabled=false;setTimeout(()=>b.textContent='▧ 获取图片',2200);}};
    root.append(style,b);document.documentElement.append(host);
  }
  mount();let previous=location.href;setInterval(()=>{if(previous!==location.href){previous=location.href;mount();}},1000);
})();
