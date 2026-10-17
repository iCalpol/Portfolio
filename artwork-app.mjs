import {createArtwork,artworkAction,artworkSvg,printSpec,ART_PALETTES} from './project-models.mjs';
import {$,$$,esc,syncValue,pressed,renderPipeline,renderEvents,errorMessage,downloadFile,delay,scrollToPanel} from './project-ui.mjs';
let state=createArtwork();let run=0;
const phaseLabels={idea:'Shape an artwork idea',briefing:'Turning the idea into a brief',brief:'A brief ready for your decision',approved:'Approved. Ready for artwork.',rendering:'Creating the sample artwork',artwork:'Ready for the print checks',checking:'Checking the sample specifications',blocked:'One check needs attention',ready:'The output package is unlocked',packaging:'Preparing the sample files',complete:'Your sample output is ready'};
const stages={idea:0,briefing:1,brief:1,approved:2,rendering:2,artwork:3,checking:3,blocked:3,ready:3,packaging:4,complete:4};
const themeNames={coast:'Coast',mountains:'Mountains',abstract:'Abstract'};
function commit(action){state=artworkAction(state,action);errorMessage();render();}
function attempt(action){try{commit(action);}catch(error){errorMessage(error.message);}}
function render(){
 const busy=['briefing','rendering','checking','packaging'].includes(state.phase);
 $('#art-phase-label').textContent=phaseLabels[state.phase];renderPipeline('#art-pipeline',stages[state.phase]);
 $('#art-inputs').disabled=busy;$('#output-inputs').disabled=busy;
 syncValue('#art-title',state.input.title);syncValue('#art-theme',state.input.theme);syncValue('#source-quality',state.input.quality);
 pressed('[data-palette]',state.input.palette,'palette');pressed('[data-orientation]',state.input.orientation,'orientation');pressed('[data-format]',state.input.format,'format');
 $('#art-frame').dataset.orientation=state.input.orientation;$('#art-preview').innerHTML=artworkSvg(state.input,'canvas');
 $('#art-caption').textContent=ART_PALETTES[state.input.palette].name+' / '+themeNames[state.input.theme];
 $('#art-ratio').textContent=state.input.orientation==='portrait'?'1 : 1.414':'1.414 : 1';
 $('#art-canvas-status').textContent=state.phase==='complete'?'Sample output ready':state.artwork?'Artwork linked':state.brief?.approved?'Brief approved':'Live composition';
 $('#art-processing').hidden=!busy;
 $('#build-brief').disabled=state.phase!=='idea';$('#build-brief').innerHTML=state.phase==='briefing'?'Building the brief…':'Build the brief <span aria-hidden="true">↗</span>';
 const spec=printSpec(state.input);
 $('#print-spec').innerHTML=`<div><dt>Trim size</dt><dd>${spec.trimWidth} × ${spec.trimHeight} mm</dd></div><div><dt>Full size with bleed</dt><dd>${spec.fullWidth} × ${spec.fullHeight} mm</dd></div><div><dt>Required at 300 DPI</dt><dd>${spec.pixels.join(' × ')} px</dd></div><div><dt>Sample source</dt><dd>${spec.source.join(' × ')} px<small>Fictional file specification</small></dd></div>`;
 let html='';
 if(state.phase==='idea')html='<div class="empty-flow"><span class="flow-symbol" aria-hidden="true">↗</span><h3>A mood.<br>A direction.<br>A place to start.</h3><p>Choose the subject, palette and orientation. Build the brief when the idea feels right.</p></div>';
 if(state.phase==='briefing')html='<div class="flow-message"><span class="flow-stamp">Brief in progress</span><h3>Giving the idea<br>some structure.</h3><p>Creative choices are becoming a linked record for the next stage.</p></div>';
 if(state.phase==='brief')html=`<div class="brief-sheet phase-arrival"><span class="mono">${esc(state.brief.id)}</span><h3>${esc(state.brief.title)}</h3><dl><div><dt>Subject</dt><dd>${themeNames[state.brief.theme]}</dd></div><div><dt>Palette</dt><dd>${esc(state.brief.palette)}</dd></div><div><dt>Orientation</dt><dd>${esc(state.brief.orientation)}</dd></div><div><dt>Aspect ratio</dt><dd>${esc(state.brief.ratio)}</dd></div></dl><p>A calm ${esc(state.brief.orientation)} composition, using ${esc(state.brief.palette.toLowerCase())} tones. Keep the subject clear and leave the artwork free of text.</p></div><div class="button-pair"><button class="app-primary" data-command="approve">Approve brief ✓</button><button class="app-secondary" data-command="edit">Change it ↺</button></div>`;
 if(state.phase==='approved')html='<div class="flow-message phase-arrival"><span class="flow-stamp">Brief approved ✓</span><h3>A direction<br>to build from.</h3><p>The orientation and palette are attached to the brief. Create the illustrative artwork to continue.</p><button class="app-primary full" data-command="render">Create sample artwork <span aria-hidden="true">→</span></button></div>';
 if(state.phase==='rendering')html='<div class="flow-message"><span class="flow-stamp">Artwork in progress</span><h3>From direction<br>to composition.</h3><p>The local preview is being linked to the approved brief.</p></div>';
 if(state.phase==='artwork')html='<div class="flow-message phase-arrival"><span class="flow-stamp">Artwork linked ✓</span><h3>Ready for<br>a closer check.</h3><p>Choose the print format and source quality below, then check the sample specifications before creating the output.</p><button class="app-primary full" data-command="check">Run print checks <span aria-hidden="true">→</span></button></div>';
 if(state.phase==='checking')html='<div class="flow-message"><span class="flow-stamp">Checks running</span><h3>Measure first.<br>Move forward second.</h3><p>Comparing the sample source with the output requirements.</p></div>';
 if(['ready','blocked'].includes(state.phase)){
  html=`<div class="flow-message phase-arrival"><span class="flow-stamp ${state.phase==='blocked'?'revision':''}">${state.phase==='ready'?'All checks passed ✓':'Output held / action needed'}</span><h3>${state.phase==='ready'?'Ready to<br>take shape.':'One thing<br>to put right.'}</h3></div><ul class="check-list">${state.checks.map(c=>`<li class="${c.ok?'pass':'fail'}"><span aria-hidden="true">${c.ok?'✓':'!'}</span><div><strong>${esc(c.label)}</strong><p>${esc(c.detail)}</p></div></li>`).join('')}</ul>`;
  html+=state.phase==='blocked'?'<div class="resolution-hint">The draft sample is too small for this print. Switch to the print-resolution sample, then run the checks again.</div><button class="app-secondary full" data-command="fix-resolution">Use print-resolution sample ↗</button>':'<button class="app-primary full" data-command="package">Prepare sample output <span aria-hidden="true">→</span></button>';
 }
 if(state.phase==='packaging')html='<div class="flow-message"><span class="flow-stamp">Preparing output</span><h3>Everything<br>in its place.</h3><p>Keeping the artwork, brief and print specification together in a sample package.</p></div>';
 if(state.phase==='complete')html=`<div class="flow-message phase-arrival"><div class="success-mark" aria-hidden="true">✓</div><h3>From a quiet idea<br>to a clear output.</h3><p>${esc(state.input.title)} · ${state.input.format} · ${state.input.orientation}</p><ul class="package-files"><li><span>SVG</span> Illustrative artwork</li><li><span>JSON</span> Brief, checks & workflow record</li></ul><div class="export-actions"><button class="app-primary" data-command="export-svg">Download sample artwork ↓</button><button class="app-secondary" data-command="export-record">Download workflow record ↓</button></div><p class="package-footnote">Demo exports: a vector illustration and sample specifications. No production asset or marketplace listing is created.</p></div>`;
 $('#art-flow-content').innerHTML=html;
 const records=[['Idea','DEMO-IDEA-001',true],['Design brief','DEMO-BRIEF-001',!!state.brief],['Artwork','DEMO-ART-001',!!state.artwork],['Output','DEMO-PACK-001',!!state.output]];
 $('#art-records').innerHTML=records.map(([name,id,active])=>`<div class="record-node ${active?'active':''}"><strong>${name} ${active?'✓':''}</strong><span>${active?id:'Waiting for its step'}</span></div>`).join('');
 renderEvents('#art-events','#art-event-count',state.events);
}
async function process(start,steps,finish){const token=++run;try{commit({type:start});for(const message of steps){$('#art-processing-label').textContent=message;await delay(480);if(token!==run)return;}commit({type:finish});scrollToPanel('.art-flow');}catch(error){errorMessage(error.message);}}
$('#art-form').addEventListener('submit',e=>{e.preventDefault();process('BRIEF',['Recording the idea','Mapping the creative choices','Linking the design brief'],'BRIEF_READY');});
$('#art-title').addEventListener('input',e=>attempt({type:'EDIT',patch:{title:e.target.value}}));
$('#art-theme').addEventListener('change',e=>attempt({type:'EDIT',patch:{theme:e.target.value}}));
$('#source-quality').addEventListener('change',e=>attempt({type:'EDIT',patch:{quality:e.target.value}}));
$$('[data-palette]').forEach(b=>b.addEventListener('click',()=>attempt({type:'EDIT',patch:{palette:b.dataset.palette}})));
$$('[data-orientation]').forEach(b=>b.addEventListener('click',()=>attempt({type:'EDIT',patch:{orientation:b.dataset.orientation}})));
$$('[data-format]').forEach(b=>b.addEventListener('click',()=>attempt({type:'EDIT',patch:{format:b.dataset.format}})));
$('#reset-project').addEventListener('click',()=>{run++;commit({type:'RESET'});});
document.addEventListener('click',e=>{
 const command=e.target.closest('[data-command]')?.dataset.command;if(!command)return;
 if(command==='approve')attempt({type:'APPROVE_BRIEF'});
 if(command==='edit'){attempt({type:'EDIT_BRIEF'});$('#art-title').focus();}
 if(command==='render')process('RENDER',['Reading the approved brief','Building the composition','Linking the sample asset'],'ART_READY');
 if(command==='check')process('CHECK',['Checking the approval','Comparing dimensions and resolution','Checking the bleed specification'],'CHECKED');
 if(command==='fix-resolution'){attempt({type:'EDIT',patch:{quality:'print'}});$('#source-quality').focus({preventScroll:true});}
 if(command==='package')process('PACKAGE',['Preparing the sample artwork','Attaching the workflow record','Making the files available'],'PACKAGED');
 if(command==='export-svg'&&state.phase==='complete')downloadFile(`artwork-demo-${state.input.format}-${state.input.orientation}.svg`,artworkSvg(state.input,'export',printSpec(state.input)),'image/svg+xml');
 if(command==='export-record'&&state.phase==='complete')downloadFile('artwork-demo-workflow.json',JSON.stringify({demonstration:true,liveServicesCalled:false,illustrativeVectorPreview:true,idea:state.input,brief:state.brief,artwork:state.artwork,checks:state.checks,output:state.output,events:state.events},null,2),'application/json');
});
render();
