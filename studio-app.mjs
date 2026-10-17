import {createStudio,studioAction,shirtSvg,SHIRT_COLOURS} from './project-models.mjs';
import {$,$$,esc,syncValue,pressed,renderPipeline,renderEvents,errorMessage,downloadFile,delay,scrollToPanel} from './project-ui.mjs';
let state=createStudio();let run=0;let feedbackOpen=false;
const labels={idea:'Start with an idea',building:'Building the preview',review:'A design ready for your decision',revision:'A revision, with a reason',approved:'Approved. Ready for product setup.',creating:'Connecting the sample workflow',draft:'Your sample draft is ready'};
const stage={idea:0,building:1,review:2,revision:2,approved:3,creating:3,draft:4};
function commit(action){state=studioAction(state,action);errorMessage();render();}
function attempt(action){try{commit(action);}catch(error){errorMessage(error.message);}}
function render(){
 const busy=['building','creating'].includes(state.phase);
 $('#studio-phase-label').textContent=labels[state.phase];renderPipeline('#studio-pipeline',stage[state.phase]);
 $('#studio-inputs').disabled=busy;syncValue('#shirt-text',state.input.text);$('#text-count').textContent=`${state.input.text.length} / 48`;
 pressed('[data-style]',state.input.style,'style');pressed('[data-colour]',state.input.colour,'colour');
 $('#shirt-colour-name').textContent=SHIRT_COLOURS[state.input.colour].name;
 $('#build-design').disabled=!['idea','revision'].includes(state.phase);
 $('#build-design').innerHTML=state.phase==='revision'?'Build a new version <span aria-hidden="true">↗</span>':state.phase==='building'?'Building preview…':'Build preview <span aria-hidden="true">↗</span>';
 $('#shirt-preview').innerHTML=shirtSvg(state.input,'canvas');
 $('#canvas-caption').textContent=SHIRT_COLOURS[state.input.colour].name+' / '+state.input.style[0].toUpperCase()+state.input.style.slice(1);
 $('#canvas-version').textContent=state.design?`Version ${String(state.revision).padStart(2,'0')}`:'Live concept';
 $('#canvas-stage').textContent={idea:'Live sketch',building:'Preparing',review:'Awaiting review',revision:'Revision requested',approved:'Approved',creating:'Preparing draft',draft:'Draft saved'}[state.phase];
 $('#studio-processing').hidden=!busy;
 const review=$('#studio-review');let html='';
 if(state.phase==='idea')html='<div class="empty-flow"><span class="flow-symbol" aria-hidden="true">↗</span><h3>It starts with<br>a few words.</h3><p>Shape the design on the left, then build a preview to open the review step.</p></div>';
 if(state.phase==='building')html='<div class="flow-message"><span class="flow-stamp">Design in progress</span><h3>Making room<br>for the idea.</h3><p>The concept is being prepared as a version you can review.</p></div>';
 if(state.phase==='review')html=`<div class="flow-message phase-arrival"><span class="flow-stamp">Version ${state.revision} / review</span><h3>Would you<br>wear it?</h3><p>Approve the direction, or keep the feedback attached to a revision.</p><div class="button-pair"><button class="app-primary" data-command="approve">Approve ✓</button><button class="app-secondary" data-command="feedback">Revise ↺</button></div>${feedbackOpen?'<div class="feedback-input"><p class="feedback-prompt">What should change?</p><div class="feedback-reasons"><button data-reason="Try a different type style.">Type</button><button data-reason="Change the garment colour.">Colour</button><button data-reason="Simplify the words and layout.">Layout</button></div><label class="field-label" for="revision-reason">Revision note</label><textarea id="revision-reason" maxlength="180" placeholder="A shorter line? A different colour?"></textarea><button class="app-secondary full" data-command="reject">Save revision request</button></div>':''}</div>`;
 if(state.phase==='revision')html=`<div class="flow-message phase-arrival"><span class="flow-stamp revision">Revision requested</span><h3>Keep the idea.<br>Refine the detail.</h3><p>${esc(state.feedback.at(-1)?.reason)}</p><button class="app-primary full" data-command="revise">Back to the design <span aria-hidden="true">↺</span></button><p class="review-meta">The feedback stays linked to version ${state.revision}.</p></div>`;
 if(state.phase==='approved')html='<div class="flow-message phase-arrival"><span class="flow-stamp">Design approved ✓</span><h3>Ready for<br>the next step.</h3><p>Choose a title, a sample price and the available sizes. The approved design travels with the product.</p></div>';
 if(state.phase==='creating')html='<div class="flow-message"><span class="flow-stamp">Workflow running</span><h3>From design<br>to draft.</h3><p>The demonstration is preparing product data and a draft listing. The review decision stays attached.</p></div>';
 if(state.phase==='draft')html='<div class="flow-message phase-arrival"><div class="success-mark" aria-hidden="true">✓</div><h3>A little idea.<br>Ready to review.</h3><p>Your sample listing is a draft. Change the design to try another route, or take a copy of this workflow record.</p></div>';
 review.innerHTML=html;
 const listingVisible=['approved','creating'].includes(state.phase);$('#listing-settings').hidden=!listingVisible;$('#listing-inputs').disabled=state.phase!=='approved';
 syncValue('#listing-title',state.listing.title);syncValue('#listing-price',state.listing.price);
 $$('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(state.listing.sizes.includes(b.dataset.size))));
 $('#create-draft').disabled=state.phase!=='approved';
 $('#studio-draft').hidden=state.phase!=='draft';
 if(state.draft)$('#studio-draft').innerHTML=`<div class="draft-card phase-arrival"><div class="draft-thumb">${shirtSvg(state.design,'draft')}</div><div class="draft-card-body"><span>Sample listing / draft</span><h4>${esc(state.draft.title)}</h4><p class="draft-price">£${state.draft.price.toFixed(2)}</p><p>${esc(state.draft.sizes.join(' · '))}<br>${esc(state.draft.id)}</p></div></div><div class="export-actions"><button class="app-primary" data-command="export">Download workflow record ↓</button><button class="app-secondary" data-command="export-svg">Download sample design ↓</button></div>`;
 $('#studio-feedback').innerHTML=state.feedback.length?[...state.feedback].reverse().map(f=>`<div class="feedback-entry"><span>V${f.version}</span><div><strong>${esc(f.decision)}</strong><p>${esc(f.reason||'Design approved for the product stage.')}</p></div></div>`).join(''):'<p>Your approvals and revision notes will appear here as you use the studio.</p>';
 renderEvents('#studio-events','#studio-event-count',state.events);
}
async function process(start,steps,finish){
 const token=++run;
 try{commit({type:start});for(const message of steps){$('#studio-processing-label').textContent=message;await delay(520);if(token!==run)return;}commit({type:finish});scrollToPanel('.flow-panel');}catch(error){errorMessage(error.message);}
}
$('#studio-form').addEventListener('submit',e=>{e.preventDefault();feedbackOpen=false;process('BUILD',['Capturing the idea','Composing the preview','Opening the review'],'DESIGN_READY');});
$('#shirt-text').addEventListener('input',e=>attempt({type:'EDIT',patch:{text:e.target.value}}));
$$('[data-style]').forEach(b=>b.addEventListener('click',()=>attempt({type:'EDIT',patch:{style:b.dataset.style}})));
$$('[data-colour]').forEach(b=>b.addEventListener('click',()=>attempt({type:'EDIT',patch:{colour:b.dataset.colour}})));
const presets={off:{text:'OFF DUTY.',style:'editorial',colour:'cream'},creative:{text:'CREATIVE DEPT.',style:'varsity',colour:'ink'},slow:{text:'TAKE IT EASY',style:'minimal',colour:'rose'}};
$$('[data-preset]').forEach(b=>b.addEventListener('click',()=>attempt({type:'EDIT',patch:presets[b.dataset.preset]})));
$('#listing-title').addEventListener('input',e=>attempt({type:'LISTING',patch:{title:e.target.value}}));
$('#listing-price').addEventListener('input',e=>attempt({type:'LISTING',patch:{price:e.target.value}}));
$$('[data-size]').forEach(b=>b.addEventListener('click',()=>{const sizes=state.listing.sizes.includes(b.dataset.size)?state.listing.sizes.filter(s=>s!==b.dataset.size):[...state.listing.sizes,b.dataset.size];attempt({type:'LISTING',patch:{sizes}});}));
$('#create-draft').addEventListener('click',()=>process('CREATE_DRAFT',['Preparing the approved design','Mapping the sample product','Saving a draft listing'],'DRAFT_READY'));
$('#reset-project').addEventListener('click',()=>{run++;feedbackOpen=false;commit({type:'RESET'});});
document.addEventListener('click',e=>{
 const reason=e.target.closest('[data-reason]');if(reason){$('#revision-reason').value=reason.dataset.reason;$('#revision-reason').focus();return;}
 const command=e.target.closest('[data-command]')?.dataset.command;if(!command)return;
 if(command==='approve'){feedbackOpen=false;attempt({type:'APPROVE'});}
 if(command==='feedback'){feedbackOpen=!feedbackOpen;render();$('#revision-reason')?.focus();}
 if(command==='reject'){const reason=$('#revision-reason')?.value;attempt({type:'REJECT',reason});}
 if(command==='revise'){feedbackOpen=false;attempt({type:'REVISE'});$('#shirt-text').focus();}
 if(command==='export'&&state.phase==='draft')downloadFile('shirt-studio-demo-record.json',JSON.stringify({demonstration:true,liveServicesCalled:false,design:state.design,reviewHistory:state.feedback,listing:state.draft,events:state.events},null,2),'application/json');
 if(command==='export-svg'&&state.phase==='draft')downloadFile('shirt-studio-demo-design.svg',shirtSvg(state.design,'export'),'image/svg+xml');
});
render();
