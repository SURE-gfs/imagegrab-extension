const SESSION_PREFIX='imagegrab-session-';
function safeUrl(raw) {try{const u=new URL(raw);return ['https:','http:'].includes(u.protocol)||(u.protocol==='data:'&&raw.startsWith('data:image/'))||(u.protocol==='chrome-extension:'&&u.host===chrome.runtime.id);}catch{return false;}}
async function openGallery(message) {
  const images=[...new Map((message.images||[]).filter(x=>x&&typeof x.url==='string'&&safeUrl(x.url)).slice(0,500).map(x=>[x.url,{url:x.url,source:String(x.source||'图片')}])).values()];
  const id=crypto.randomUUID();const all=await chrome.storage.local.get(null);const old=Object.entries(all).filter(([k])=>k.startsWith(SESSION_PREFIX)).sort((a,b)=>(a[1].created||0)-(b[1].created||0));
  if(old.length>=20)await chrome.storage.local.remove(old.slice(0,old.length-19).map(([k])=>k));
  await chrome.storage.local.set({[SESSION_PREFIX+id]:{images,title:String(message.title||'图片提取'),pageUrl:String(message.pageUrl||''),created:Date.now()}});
  const tab=await chrome.tabs.create({url:chrome.runtime.getURL('gallery.html?session='+id)});return {ok:true,id,tabId:tab.id};
}
function completion(id) {return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>finish(new Error('下载等待超时，请在浏览器下载列表中检查')),60000);
  function finish(error){clearTimeout(timer);chrome.downloads.onChanged.removeListener(changed);error?reject(error):resolve();}
  function changed(delta){if(delta.id!==id)return;if(delta.state?.current==='complete')finish();if(delta.state?.current==='interrupted')finish(new Error('下载中断：'+(delta.error?.current||'请检查浏览器下载设置')));}
  chrome.downloads.onChanged.addListener(changed);chrome.downloads.search({id}).then(items=>{if(items[0]?.state==='complete')finish();else if(items[0]?.state==='interrupted')finish(new Error('下载已中断'));}).catch(finish);
});}
async function downloadPng(message,sender) {
  // 只有扩展画廊可发起下载，网页内容脚本不能任意调用下载代理。
  if(!sender.url?.startsWith(chrome.runtime.getURL('gallery.html')))throw new Error('仅允许从图片画廊下载');
  const stored=(await chrome.storage.local.get(SESSION_PREFIX+message.session))[SESSION_PREFIX+message.session];
  if(!stored?.images.some(x=>x.url===message.url))throw new Error('图片不属于当前提取结果');
  if(!safeUrl(message.url))throw new Error('不支持的图片地址');
  const response=await fetch(message.url,{credentials:'omit',signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw new Error('图片请求失败 HTTP '+response.status);
  if(Number(response.headers.get('content-length'))>30*1024*1024)throw new Error('图片超过 30 MB');
  const blob=await response.blob();if(blob.size>30*1024*1024)throw new Error('图片超过 30 MB');
  const bitmap=await createImageBitmap(blob);if(bitmap.width*bitmap.height>40000000){bitmap.close();throw new Error('图片像素过大，超过 4000 万像素');}
  const canvas=new OffscreenCanvas(bitmap.width,bitmap.height);canvas.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
  const png=await canvas.convertToBlob({type:'image/png'});const bytes=new Uint8Array(await png.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
  const index=Number.isInteger(message.index)&&message.index>0?message.index:1;
  const id=await chrome.downloads.download({url:'data:image/png;base64,'+btoa(binary),filename:'ImageGrab/商品图_'+String(index).padStart(3,'0')+'.png',saveAs:false,conflictAction:'uniquify'});
  await completion(id);return {ok:true,id};
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(!['OPEN_GALLERY','DOWNLOAD_PNG'].includes(message.type))return false;
  (message.type==='OPEN_GALLERY'?openGallery(message):downloadPng(message,sender)).then(reply).catch(e=>reply({ok:false,error:e.message}));return true;
});
