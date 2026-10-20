const dialog=document.querySelector('#menu-dialog');let opener;const layouts=[...document.querySelectorAll('.layout')];
function activeLayout(){return layouts.find(e=>getComputedStyle(e).display!=='none');}
function size(){const w=document.documentElement.clientWidth;for(const el of layouts){const base=+el.style.getPropertyValue('--design-width');el.style.setProperty('--scale',w/base);}for(const el of document.querySelectorAll('.layout [id]'))el.removeAttribute('id');for(const el of activeLayout().querySelectorAll('[data-section]'))el.id=el.dataset.section;}
size();window.addEventListener('resize',size);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');
 if(b){const action=b.dataset.action;
 if(action==='menu'){opener=b;dialog.showModal();b.setAttribute('aria-expanded','true');dialog.querySelector('a').focus();}
 if(action==='close-menu'){dialog.close();}
 if(action==='hero'){const wrap=b.closest('.section-hero');wrap.querySelectorAll('[data-action=hero]').forEach(t=>{const selected=t===b;t.classList.toggle('selected',selected);t.setAttribute('aria-pressed',String(selected));});const mode=b.getAttribute('aria-label');const layers=[...wrap.querySelectorAll('[data-name^="swiper-slide"]')];layers.forEach((l,i)=>l.style.opacity=(mode==='SCENERY'?i===1:i===0)?'1':'0');for(const el of wrap.querySelectorAll('[data-name]')){const n=el.dataset.name;if(n==='ひと、まち、くらしの未来をかえる。')el.style.opacity=mode==='FUTURE'?'1':'0';if(n==='ひと、まち、くらしの風景をかえる。')el.style.opacity=mode==='SCENERY'?'1':'0';}}
 if(action==='filter'){b.closest('.section-news').querySelectorAll('[data-action=filter]').forEach(t=>{t.classList.toggle('news-filter-active',t===b);t.setAttribute('aria-pressed',String(t===b));});}
 if(action==='next'||action==='prev'){const section=b.closest('.section-news');const slider=[...section.querySelectorAll('[data-name="swiper-wrapper"]')][0];if(slider){const previous=+(slider.dataset.step||0);const step=Math.max(0,Math.min(1,previous+(action==='next'?1:-1)));slider.dataset.step=step;slider.style.transform='translateX('+(-step*(activeLayout().dataset.layout==='pc'?365:310))+'px)';}}
 }
 const a=e.target.closest('a[href^="#"]');if(a){const id=a.getAttribute('href').slice(1);const target=id==='top'?document.body:activeLayout().querySelector('[data-section="'+id+'"]');if(target){e.preventDefault();dialog.close();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});history.replaceState(null,'','#'+id);}}
});
dialog.addEventListener('close',()=>{if(opener){opener.setAttribute('aria-expanded','false');opener.focus();}});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
for(const b of document.querySelectorAll('[data-action=menu]')){b.setAttribute('aria-controls','menu-dialog');b.setAttribute('aria-expanded','false');}
for(const b of document.querySelectorAll('[data-action=hero]')){b.classList.toggle('selected',b.getAttribute('aria-label')==='SCENERY');b.setAttribute('aria-pressed',String(b.getAttribute('aria-label')==='SCENERY'));}
