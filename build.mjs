import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DOMParser,parseHTML} from 'linkedom';
const require=createRequire(import.meta.url);
const pc=[
['hero','38-955',0,0,1440,1133.328125],
['about','38-1083',0,1133.328125,1440,1445.15625],
['anniversary','38-1487',0,2578.484375,1440,253.625],
['business','38-1674',0,2832.109375,1440,1094.34375],
['project','38-1492',0,3926.453125,1440,916.671875],
['news','38-1772',0,4803.125,1440,1069.546875],
['company','38-1922',0,5832.671875,1440,2061.140625],
['recruit','38-1593',20,8098,1400,546.171875],
['footer','38-2073',20,8876.078125,1400,933.453125],
['header','38-2110',0,0,1440,180.125]];
const sp=[
['hero','38-2194',0,0,375,812],
['about','38-2313',0,812,375,1470.453125],
['anniversary','38-2592',0,2282.453125,375,254.46875],
['business','38-2729',0,2536.921875,375,1045.265625],
['project','38-2597',0,3582.1875,375,841.6875],
['news','38-2817',0,4383.875,375,961.703125],
['company','38-2929',0,5305.578125,375,2266.109375],
['recruit','38-2649',0,7670.6875,375,806.34375],
['footer','38-3081',20,8588.515625,334.984375,1174.21875],
['header','38-3143',0,0,375,127.9375]];
const manifest={pc,sp};
const base={absolute:'position:absolute',relative:'position:relative',block:'display:block',contents:'display:contents','size-full':'width:100%;height:100%','max-w-none':'max-width:none','overflow-clip':'overflow:clip','object-cover':'object-fit:cover','pointer-events-none':'pointer-events:none','whitespace-nowrap':'white-space:nowrap','font-bold':'font-weight:700','font-medium':'font-weight:500','font-normal':'font-weight:400','not-italic':'font-style:normal','mask-alpha':'mask-mode:alpha','mask-intersect':'mask-composite:intersect','mask-no-clip':'mask-clip:no-clip','mask-no-repeat':'mask-repeat:no-repeat','border-solid':'border-style:solid','border-white':'border-color:#fff','text-white':'color:#fff','bg-white':'background-color:#fff','border':'border-width:1px'};
const classes=new Map();const unknown=new Set();
function decl(c){
 if(base[c])return base[c];
 if(/^opacity-\d+$/.test(c))return 'opacity:'+Number(c.slice(8))/100;
 if(/^border-\d+$/.test(c))return 'border-width:'+c.slice(7)+'px';
 if(c.startsWith('['))return c.slice(1,-1).replaceAll('_',' ');
 let m=c.match(/^(.+?)-\[(.*)\]$/);let k,v;
 if(m){k=m[1];v=m[2].replaceAll('_',' ');}
 else {m=c.match(/^(left|top|inset|h|w)-(0|px)$/);if(m){k=m[1];v=m[2]==='px'?'1px':'0';}}
 if(k){
 const props={h:'height',w:'width',left:'left',top:'top',inset:'inset',leading:'line-height',bg:'background-color',border:'border-color','mask-position':'mask-position','mask-size':'mask-size',rounded:'border-radius','rounded-bl':'border-bottom-left-radius','rounded-br':'border-bottom-right-radius','rounded-tl':'border-top-left-radius','rounded-tr':'border-top-right-radius'};
 if(props[k])return props[k]+':'+v;
 if(k==='size')return 'width:'+v+';height:'+v;
 if(k==='text')return (/^(#|rgb)/.test(v)?'color:':'font-size:')+v;
 if(k==='font'){let name=v.replaceAll("'","").split(':')[0];return 'font-family:"'+name+'",sans-serif'+(v.includes('SemiBold')?';font-weight:600':'');}
 }
 unknown.add(c);return '';
}
function normalizeHTML(html){
 const {document}=parseHTML('<html><body>'+html+'</body></html>');
 for(const el of document.querySelectorAll('[class]')){
   const newClasses=el.getAttribute('class').split(/\s+/).map(c=>{if(!classes.has(c))classes.set(c,{name:'f'+classes.size,css:decl(c)});return classes.get(c).name;});
   el.setAttribute('class',newClasses.join(' '));
 }
 for(const img of document.querySelectorAll('img')){img.setAttribute('decoding','async');}
 return document.body.innerHTML;
}
const rendered=new Map();
for(const f of await fs.readdir('source')){
 if(!f.endsWith('.tsx'))continue;
 await build({entryPoints:['source/'+f],bundle:true,platform:'node',format:'cjs',jsx:'automatic',outfile:'.build/'+f+'.cjs',external:['react','react-dom'],logLevel:'silent'});
 const c=require('./.build/'+f+'.cjs').default;
 rendered.set(f.replace('.tsx',''),normalizeHTML(renderToStaticMarkup(React.createElement(c))));
}
const xml=new DOMParser().parseFromString(await fs.readFile('design/metadata.xml','utf8'),'text/xml');
const findMeta=id=>[...xml.querySelectorAll('[id]')].find(e=>e.getAttribute('id')===id.replace('-',':'));
function attrs(e){return {x:+e.getAttribute('x')||0,y:+e.getAttribute('y')||0,w:+e.getAttribute('width')||0,h:+e.getAttribute('height')||0};}
const cssMap=new Map([...classes.values()].map(o=>[o.name,o.css]));
function computed(el){const out={};for(const c of (el?.getAttribute('class')||'').split(' ')){for(const d of (cssMap.get(c)||'').split(';')){let i=d.indexOf(':');if(i>0)out[d.slice(0,i)]=d.slice(i+1);}}for(const d of (el?.getAttribute('style')||'').split(';')){let i=d.indexOf(':');if(i>0)out[d.slice(0,i)]=d.slice(i+1);}return out;}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const style=s=>Object.entries(s).map(([k,v])=>k+':'+v).join(';');
function mobileFallback(section,pcSection){
 const meta=findMeta(section[1]);const pcMeta=findMeta(pcSection[1]);
 const {document}=parseHTML('<html><body>'+rendered.get(pcSection[1])+'</body></html>');
 const candidates=[...document.querySelectorAll('[data-node-id]')];
 function score(n,c){
   const name=n.getAttribute('name');let s=0;
   if(c.getAttribute('data-name')?.trim()===name.trim().replaceAll('&amp;','&'))s+=10;
   if(n.tagName==='text'){const t=c.textContent.replace(/\s/g,'');const nt=name.replace(/\s/g,'');if(t===nt)s+=40;else if((c.tagName==='P'||c.tagName==='SPAN')&&t.includes(nt)&&nt.length>1)s+=25;}
   if(s===0)return -1;let np=n.parentElement,cp=c.parentElement;
   for(let i=0;i<6&&np&&cp;i++,np=np.parentElement,cp=cp.parentElement){if(np.getAttribute('name')===cp.getAttribute('data-name'))s+=6-i;}
   return s;
 }
 function render(n){
   if(n.getAttribute('hidden')==='true')return '';
   const name=n.getAttribute('name')||'',box=attrs(n); if(n===meta){box.x=0;box.y=0;}
   const matching=candidates.map(c=>({c,s:score(n,c)})).filter(o=>o.s>=10).sort((a,b)=>b.s-a.s);
   let source=matching[0]?.c;const direct={'38:2705':'38:1649','38:2714':'38:1658','38:2723':'38:1667'};if(direct[n.id])source=candidates.find(c=>c.getAttribute('data-node-id')===direct[n.id]); if(n.tagName==='instance'&&!source&&name.includes('c-button'))source=candidates.find(c=>c.getAttribute('data-name')?.startsWith('Button /')); let st=computed(source); if(n.tagName==='text'){let p=source?.parentElement;while(p){const ps=computed(p);for(const key of ['font-family','font-size','font-weight','color','line-height'])if(!st[key]&&ps[key])st[key]=ps[key];p=p.parentElement;}}
   for(const key of ['inset','top','left','right','bottom','width','height','margin','transform'])delete st[key];
   st.position='absolute';st.left=box.x+'px';st.top=box.y+'px';st.width=box.w+'px';st.height=box.h+'px';
   let content='';
   if(n.tagName==='text'){
     st['white-space']='nowrap';st['word-break']='normal';
     const fs=Number.parseFloat(st['font-size']||'14');
     let mobileSize=box.h>=39?28:box.h>=28?20:box.h>=21?15:box.h>=20?14:box.h>=19?13:fs;
     if(name==='About'||name==='News'||name==='Company'||name==='Recruit'||name==='Project')mobileSize=13;
     if(!st['font-family'])st['font-family']='Noto Sans JP,sans-serif';st['font-size']=mobileSize+'px';st['line-height']=box.h+'px';content=esc(name);
   }else if(n.tagName==='rounded-rectangle'){
     let img=source?.querySelector('img');if(name.trim()==='wp-post-image'){const idx=n.id==='38:2920'?1:0;img=candidates.filter(c=>c.getAttribute('data-name')==='wp-post-image')[idx]?.querySelector('img');}
     if(img){const cloned=img.cloneNode(true);cloned.removeAttribute('class');cloned.setAttribute('style','position:absolute;width:100%;height:100%;inset:0;object-fit:cover');content=cloned.outerHTML;}
   }else if(n.tagName==='instance'){
     if(source){
       const cb=computed(source);const width=parseFloat(cb.width)||box.w,height=parseFloat(cb.height)||box.h;delete st['background-color'];
       const clone=source.cloneNode(true);clone.setAttribute('style','position:absolute;left:0;top:0;width:'+width+'px;height:'+height+'px;transform:scale('+box.w/width+','+box.h/height+');transform-origin:0 0');
       content=clone.outerHTML;
     }
   }else content=[...n.children].map(render).join('');
   return '<'+(n.tagName==='text'?'p':'div')+' data-node-id="'+n.id+'" data-name="'+esc(name)+'" style="'+esc(style(st))+'">'+content+'</'+(n.tagName==='text'?'p':'div')+'>';
 }
 return render(meta);
}
for(const s of sp){if(!rendered.has(s[1]))rendered.set(s[1],mobileFallback(s,pc.find(p=>p[0]===s[0])));}
function interactive(html,variant){
 const {document}=parseHTML('<html><body>'+html+'</body></html>');
 function link(el,href,label){if(!el)return;if(el.tagName==='A'){el.setAttribute('href',href);if(label)el.setAttribute('aria-label',label);return;}if(el.closest('a'))return;const a=document.createElement('a');for(const att of el.attributes)a.setAttribute(att.name,att.value);a.setAttribute('href',href);if(label)a.setAttribute('aria-label',label);a.innerHTML=el.innerHTML;el.replaceWith(a);}
 function button(el,label,action){if(!el)return;const b=document.createElement('button');for(const att of el.attributes)b.setAttribute(att.name,att.value);b.setAttribute('type','button');b.setAttribute('aria-label',label);b.setAttribute('data-action',action);b.innerHTML=el.innerHTML;el.replaceWith(b);}
 const named=n=>[...document.querySelectorAll('[data-name]')].filter(e=>e.getAttribute('data-name')===n);
 if(variant==='sp'){
 const socials=[['38:3092','facebook','https://www.facebook.com/people/ユーミーらいふグループ/100063664147486/'],['38:3101','instagram','https://www.instagram.com/you.me.life.group/']];
 for(const [id,name,href] of socials){const el=document.querySelector('[data-node-id="'+id+'"]');el.innerHTML='<img src="./assets/'+name+'.svg" alt="'+name+'" style="position:absolute;left:16px;top:16px;width:24px;height:24px">';el.style.background='#fff';el.style.borderRadius='50%';link(el,href,name);}
 }
 const ids=variant==='pc'?{logo:'38:2112',scroll:'38:989'}:{logo:'38:3145',scroll:'38:2219'};
 link(document.querySelector('[data-node-id="'+ids.logo+'"]'),'#top','ユーミーらいふ ホーム');
 link(document.querySelector('[data-node-id="'+ids.scroll+'"]'),'#about','私たちについてへスクロール');
 for(const el of named('l-header__menu-item')){
 const t=el.textContent.replace(/\s/g,'');const href=t.includes('事業')?'#business':t.includes('会社')?'#company':t.includes('お知らせ')?'#news':'#project';link(el,href,t);
 }
 for(const el of named('l-header-button -recruit'))link(el,'#recruit','採用情報');
 for(const el of named('l-header-button -contact'))link(el,'#footer','お問い合わせ');
 for(const el of named('l-header-hamburger js-drawer-button'))button(el,'メニューを開く','menu');
 const mappings=[
 ['事業紹介を見る','https://you-me-life.co.jp/business/'],['湘南活性化プロジェクト','https://you-me-life.co.jp/project/'],
 ['採用情報を見る','https://you-me-life.co.jp/recruit/'],['お知らせを見る','https://you-me-life.co.jp/news/'],
 ['お知らせ一覧を見る','https://you-me-life.co.jp/news/'],['会社案内を見る','https://you-me-life.co.jp/outline/'],
 ['お問い合わせ','https://you-me-life.co.jp/contact/']
 ];
 for(const el of document.querySelectorAll('[data-name*="Button /"],[data-name="c-hover-text"],[data-name="l-footer-contact c-hover-text"]')){
 const t=el.textContent.replace(/\s/g,'');const m=mappings.find(([k])=>t.includes(k));if(m)link(el,m[1],t);
 }
 const panels=[...document.querySelectorAll('[data-name^="p-index_company-panel -"]')];
 panels.forEach((el,i)=>{for(const e of el.querySelectorAll('[data-name*="Button /"]'))link(e,'https://you-me-life.co.jp/'+['outline/','history/','vision/'][i],'詳しく見る');});
 for(const el of document.querySelectorAll('[data-name^="c-bnr-rich"]')){const about=!!el.closest('.section-business');link(el,'https://you-me-life.co.jp/'+(about?'about/':'anniversary/'),about?'3分でわかるユーミーらいふ':'50周年特設ページ');}
 for(const el of document.querySelectorAll('[data-name^="c-bnr-about"]'))link(el,'https://you-me-life.co.jp/about/','3分でわかるユーミーらいふ');
 for(const el of document.querySelectorAll('[data-name^="js-kv-slider-trigger"]')){if(el.textContent.includes('SUPPORT'))link(el,'#business','SUPPORT');else button(el,el.textContent.replace(/\s|&/g,''),'hero');}
 for(const el of document.querySelectorAll('[data-name*="js-post-filter-trigger"]')){button(el,el.textContent.trim(),'filter');}
 for(const el of document.querySelectorAll('[data-name^="c-slider-button"][data-name*="-next"]'))button(el,'次のお知らせ','next');
 for(const el of document.querySelectorAll('[data-name^="c-slider-button"][data-name*="-prev"]'))button(el,'前のお知らせ','prev');

 for(const el of document.querySelectorAll('.section-news [data-name^="Button /"]'))link(el,'https://you-me-life.co.jp/news/','お知らせ一覧');
 for(const el of document.querySelectorAll('[data-name^="c-news-cats"] > [data-name^="u-set-news-color"]')){const cat=el.getAttribute('data-name').split(' -')[1]?.split(' ')[0];link(el,cat==='all'?'https://you-me-life.co.jp/news/':'https://you-me-life.co.jp/news_cat/'+cat+'/',el.textContent.trim());}
 const articles={'2026.10.20':'3228','2026.10.03':'3156','2026.10.01':'3222','2026.09.19':'3149'};
 for(const el of document.querySelectorAll('[data-name^="c-news-link-card u-set"]')){const id=Object.entries(articles).find(([date])=>el.textContent.includes(date))?.[1];if(id)link(el,'https://you-me-life.co.jp/news/'+id+'/',el.textContent.trim());}
 for(const el of document.querySelectorAll('.section-footer p')){if(el.textContent.includes('プライバシーポリシー'))link(el,'https://you-me-life.co.jp/privacy/');if(el.textContent.includes('カスタマーハラスメント'))link(el,'https://you-me-life.co.jp/customer-harassment/');}
 for(const img of document.querySelectorAll('img')){
 let name=img.parentElement?.getAttribute('data-name')||'';
 if(/ユーミーらいふ|50th|湘南活性化|ひと、|AdobeStock/.test(name))img.setAttribute('alt',name==='AdobeStock_5800932 1'?'工場で溶接作業に取り組む人':name);
 }
 return document.body.innerHTML;
}
function layout(sections,v,total){
 let prior=0;
 let html='<div class="layout '+v+'" data-layout="'+v+'" style="--design-width:'+(v==='pc'?1440:375)+';--design-height:'+total+'">';
 for(const [id,file,x,y,w,h] of sections){
 const overlay=id==='header';const margin=y-prior;
 html+='<'+(id==='header'?'header':id==='footer'?'footer':'section')+' class="section section-'+id+'" data-section="'+id+'" style="'+(overlay?'position:absolute;top:0;left:0;z-index:50;':'position:relative;margin-top:'+margin+'px;margin-left:'+x+'px;')+'width:'+w+'px;height:'+h+'px">'+rendered.get(file)+'</'+(id==='header'?'header':id==='footer'?'footer':'section')+'>';
 if(!overlay)prior=y+h;
 }html+='</div>';return interactive(html,v);
}
let css='*{box-sizing:border-box;border-width:0;border-style:solid}html{scroll-behavior:smooth}body{margin:0;background:#f8f8f8;color:#2e322e;font-family:"Noto Sans JP",sans-serif}p{margin:0}img{display:block;max-width:100%}button,a{-webkit-tap-highlight-color:transparent}a{color:inherit;text-decoration:none}button{font:inherit;color:inherit;cursor:pointer;padding:0;background:none}a:focus-visible,button:focus-visible{outline:3px solid #d93f21;outline-offset:5px}';
for(const c of classes.values())css+='.'+c.name+'{'+c.css+'}\n';
css+=await fs.readFile('custom.css','utf8');
await fs.writeFile('styles.css',css);
const html='<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="YOU & ME LIFE — 指定Figmaデザインの実装プレビュー"><title>YOU & ME LIFE｜Figma Design Preview</title><link rel="icon" href="./assets/bc510900-7b13-4d27-8891-43af6dd640a8.png"><link rel="stylesheet" href="./assets/fonts.css"><link rel="stylesheet" href="./styles.css"></head><body id="top"><a class="skip-link" href="#about">本文へ移動</a><main>'+layout(pc,'pc',9810)+layout(sp,'sp',9763)+'</main><dialog id="menu-dialog" aria-label="サイトメニュー"><button class="menu-close" data-action="close-menu" aria-label="メニューを閉じる">×</button><nav aria-label="メインナビゲーション"><a href="#about">私たちについて</a><a href="#business">事業紹介</a><a href="#project">湘南活性化プロジェクト</a><a href="#news">お知らせ</a><a href="#company">会社案内</a><a href="#recruit">採用情報</a><a href="#footer">お問い合わせ</a></nav></dialog><script src="./app.js" defer></script></body></html>';
await fs.writeFile('index.html',html);await fs.writeFile('layout-manifest.json',JSON.stringify(manifest,null,2));await fs.writeFile('.nojekyll','');
console.log(JSON.stringify({sections:pc.length+sp.length,classes:classes.size,unknown:[...unknown],mobileAdapted:sp.filter(s=>!['38-2194','38-2592','38-2729','38-3143'].includes(s[1])).map(s=>s[0])}));
