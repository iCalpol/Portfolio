import {escapeXml} from './project-models.mjs';
export const $=selector=>document.querySelector(selector);
export const $$=selector=>[...document.querySelectorAll(selector)];
export const esc=escapeXml;
export function errorMessage(message=''){const box=$('#project-error');box.textContent=message;box.hidden=!message;}
export function syncValue(id,value){const input=$(id);const next=String(value??'');if(input.value!==next)input.value=next;}
export function pressed(selector,key,attribute){$$(selector).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attribute]===key)));}
export function renderPipeline(selector,index){$$(`${selector} li`).forEach((li,i)=>{li.classList.toggle('current',i===index);li.classList.toggle('done',i<index);if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});}
export function renderEvents(selector,countSelector,events){$(selector).innerHTML=[...events].slice(-7).reverse().map(e=>`<li><time>${esc(e.time)}</time><span>${esc(e.message)}</span></li>`).join('');$(countSelector).textContent=String(events.length).padStart(2,'0')+(events.length===1?' event':' events');}
export function downloadFile(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export const delay=ms=>new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?70:ms));
export function scrollToPanel(selector){if(window.matchMedia('(max-width: 1180px)').matches)$(selector).scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
