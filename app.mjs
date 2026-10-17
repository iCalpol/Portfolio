import {STATUS,createState,getMetrics,visibleParcels,updateParcel} from './model.mjs';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=createState();
let lastDialogTrigger=null;

function renderMetrics(){
 const m=getMetrics(state.parcels);
 const cards=[['total','Total parcels','Fictional records'],['ready','Ready','For collection'],['collected','Collected','Recorded in demo'],['issue','Needs attention','Open issues']];
 $('#demo-metrics').innerHTML=cards.map(([key,title,sub])=>`<div class="metric ${key==='issue'?'attention':''}"><strong>${m[key]}</strong><span class="metric-label">${title}<span>${sub}</span></span></div>`).join('');
 $('#hero-collected').innerHTML=`${m.collected}<span>/${m.total}</span>`;
 $('#hero-progress').style.width=`${m.collected/m.total*100}%`;
}
function renderList(){
 const parcels=visibleParcels(state);
 if(!parcels.some(p=>p.id===state.selected))state.selected=parcels[0]?.id||null;
 $$('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===state.filter)));
 $('#parcel-list').innerHTML=parcels.length?parcels.map(p=>`<button class="parcel-row" data-parcel="${p.id}" aria-pressed="${p.id===state.selected}" aria-label="${escapeHtml(p.name)}, ${escapeHtml(p.location)}, ${STATUS[p.status]}"><span class="parcel-row-icon" aria-hidden="true">◇</span><span class="parcel-row-text"><strong>${escapeHtml(p.name)}</strong><small>${p.id} · ${escapeHtml(p.location)}</small></span><span class="status-badge ${p.status}">${STATUS[p.status]}</span><span class="row-arrow" aria-hidden="true">↗</span></button>`).join(''):'<div class="empty-state">No parcels match this view.<button id="clear-filters">Clear filters</button></div>';
}
function renderDetail(){
 const p=state.parcels.find(p=>p.id===state.selected);
 if(!p){$('#parcel-detail').innerHTML='<div class="empty-state">Choose a different filter or search to find a parcel.</div>';return;}
 const done=p.status==='collected';
 const arrived=p.status!=='transit' && !(p.status==='issue' && p.previousStatus==='transit');
 let main='';
 if(p.status==='ready')main='<button class="action-primary" data-action="collect">Mark collected <span aria-hidden="true">✓</span></button>';
 if(p.status==='issue')main='<button class="action-primary" data-action="resolve">Resolve issue</button>';
 if(done)main='<button class="action-primary" disabled>Collection recorded ✓</button>';
 if(p.status==='transit')main='<button class="action-primary" disabled>Awaiting arrival</button>';
 const issueButton=['ready','transit'].includes(p.status)?'<button class="action-secondary" data-action="issue">Flag an issue</button>':'';
 $('#parcel-detail').innerHTML=`<div class="detail-eyebrow"><span>Collection record / ${p.id}</span><span class="status-badge ${p.status}">${STATUS[p.status]}</span></div><h4 id="detail-title" tabindex="-1">${escapeHtml(p.name)}</h4><p class="detail-subtitle">Fictional sample record · ${p.items} items in this parcel</p><dl class="detail-properties"><div class="detail-property"><dt>Collection point</dt><dd>${escapeHtml(p.location)}</dd></div><div class="detail-property"><dt>Linked order</dt><dd>${p.order}</dd></div><div class="detail-property"><dt>Item quantity</dt><dd>${p.items} items</dd></div><div class="detail-property"><dt>Data source</dt><dd>Demo records only</dd></div></dl><ol class="detail-timeline" aria-label="Collection progress"><li class="done">Dispatched</li><li class="${arrived?'done':''}">At location</li><li class="${done?'done':''}">Collected</li></ol>${p.status==='issue'?`<div class="issue-note">${escapeHtml(p.note)}</div>`:''}<label class="detail-note-label" for="collection-note">Collection note <span class="quiet">· required when flagging an issue</span></label><textarea class="detail-note" id="collection-note" maxlength="500" placeholder="Anything the next person should know?">${escapeHtml(p.note)}</textarea><div id="detail-error" class="detail-error" role="alert"></div><div class="detail-actions">${main}${issueButton}<button class="action-secondary" data-action="note">Save note</button></div><p class="detail-hint">Latest event: ${escapeHtml(p.history.at(-1))}.<br>Changes stay in this demonstration and reset when the page reloads.</p>`;
}
function render(){renderMetrics();renderList();renderDetail();}
function announce(message){$('#activity-message').textContent=message;}

$('#parcel-list').addEventListener('click',e=>{
 const row=e.target.closest('[data-parcel]');
 if(row){state.selected=row.dataset.parcel;renderList();renderDetail();$(`[data-parcel="${state.selected}"]`)?.focus({preventScroll:true});}
 if(e.target.closest('#clear-filters')){state.filter='all';state.query='';$('#parcel-search').value='';render();}
});
$('.filters').addEventListener('click',e=>{const button=e.target.closest('[data-filter]');if(!button)return;state.filter=button.dataset.filter;render();announce(`Showing ${visibleParcels(state).length} ${state.filter==='all'?'sample':state.filter} parcels.`);});
$('#parcel-search').addEventListener('input',e=>{state.query=e.target.value;renderList();renderDetail();});
$('#parcel-detail').addEventListener('click',e=>{
 const button=e.target.closest('[data-action]');if(!button)return;
 try{
  const result=updateParcel(state,state.selected,button.dataset.action,$('#collection-note').value);
  state=result.state;state.filter='all';state.query='';$('#parcel-search').value='';
  render();announce(result.message);$('#detail-title')?.focus({preventScroll:true});
 }catch(error){$('#detail-error').textContent=error.message;$('#collection-note')?.focus({preventScroll:true});}
});
$('#reset-demo').addEventListener('click',()=>{state=createState();$('#parcel-search').value='';render();announce('Demo reset. There are 3 ready parcels, 1 collected parcel and 1 open issue.');});
$('#guide-demo').addEventListener('click',()=>{
 state=createState();state.filter='ready';$('#parcel-search').value='';render();
 announce('Your 60-second tour: add a note to Notebook collection, then choose Mark collected. Watch the collected total update above.');
 $('#collection-note').focus({preventScroll:true});$('#parcel-detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
});
const stories={
 parcel:{number:'01 / Operations',title:'A clearer handover.',lead:'When several people collect parcels from different places, the useful question is simple: what is here, and has someone collected it?',status:'Collector component complete; dashboard largely complete. Financial tracking and sales integrations are later development.',leftTitle:'What I built',left:`<ul><li>A mobile collection interface organised around locations, parcel details and collection updates.</li><li>A Dataverse structure linking orders, items, parcels, locations and collection records.</li><li>A dashboard to bring operational information into a shared view.</li></ul>`,rightTitle:'The decision that matters',right:'Collection is an event that needs context. Recording it against the right parcel is more useful than a disconnected checklist. An issue note gives the next person something actionable.',demo:`<h3>The data behind the interface</h3><p>A simplified view of the relationships used in the project.</p><div class="data-model"><div><strong>Order</strong>Groups the purchased items</div><div><strong>Item</strong>Describes what is expected</div><div><strong>Parcel</strong>Tracks the physical package</div><div><strong>Location</strong>Identifies the collection point</div><div><strong>Collection</strong>Records a collection update</div></div><div class="story-result"><strong>One update, a shared operational picture.</strong>The website demonstration recreates a small part of that interaction in the browser. It is not connected to the live Power App or its Dataverse environment.</div>`}
};
function openDialog(dialog,trigger){lastDialogTrigger=trigger;dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;}
$$('dialog').forEach(dialog=>{
 $('[data-close]',dialog).addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastDialogTrigger?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
});
$$('[data-story]').forEach(button=>button.addEventListener('click',()=>{
 const s=stories[button.dataset.story];
 $('#story-content').innerHTML=`<div class="story-body"><p class="project-number mono">${s.number}</p><h2>${s.title}</h2><p class="story-lead">${s.lead}</p><div class="story-status"><span class="status-dot"></span><span>${s.status}</span></div><div class="story-columns"><div><h3>${s.leftTitle}</h3>${s.left}</div><div><h3>${s.rightTitle}</h3><p>${s.right}</p></div></div><div class="story-demo">${s.demo}</div><p class="story-footer">Personal project · Demonstration interactions use fictional records. Screens shown on this site are portfolio recreations, not screenshots of a live application.</p></div>`;
 openDialog($('#story-dialog'),button);
}));
render();
