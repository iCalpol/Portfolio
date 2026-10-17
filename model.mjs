export const STATUS = {ready:'Ready',collected:'Collected',issue:'Issue',transit:'In transit'};
const sampleParcels = [
  {id:'DEMO-001',name:'Ceramic sample set',location:'North hub',items:2,status:'ready',order:'ORDER-101',note:'',history:['Dispatched','Arrived at North hub']},
  {id:'DEMO-002',name:'Sketchbook bundle',location:'North hub',items:4,status:'ready',order:'ORDER-102',note:'',history:['Dispatched','Arrived at North hub']},
  {id:'DEMO-003',name:'Notebook collection',location:'Studio',items:3,status:'ready',order:'ORDER-103',note:'',history:['Dispatched','Arrived at Studio']},
  {id:'DEMO-004',name:'Art print samples',location:'East hub',items:2,status:'transit',order:'ORDER-104',note:'Awaiting arrival.',history:['Dispatched']},
  {id:'DEMO-005',name:'Fabric colour swatches',location:'North hub',items:6,status:'issue',order:'ORDER-105',note:'Outer packaging damaged. Check before collection.',history:['Dispatched','Arrived at North hub','Issue flagged']},
  {id:'DEMO-006',name:'Packaging samples',location:'Studio',items:5,status:'collected',order:'ORDER-106',note:'Collected and checked.',history:['Dispatched','Arrived at Studio','Collection recorded']}
];
export function createState(){return {parcels:structuredClone(sampleParcels),selected:'DEMO-003',filter:'all',query:''};}
export function getMetrics(parcels){return {total:parcels.length,ready:parcels.filter(p=>p.status==='ready').length,collected:parcels.filter(p=>p.status==='collected').length,issue:parcels.filter(p=>p.status==='issue').length};}
export function visibleParcels(state){const query=state.query.trim().toLowerCase();return state.parcels.filter(p=>(state.filter==='all'||p.status===state.filter)&&(!query||[p.id,p.name,p.location,p.order].some(s=>s.toLowerCase().includes(query))));}
export function updateParcel(state,id,action,note=''){
  const original=state.parcels.find(p=>p.id===id);
  if(!original) throw Error('Choose a parcel first.');
  const parcel={...original,history:[...original.history]};
  const cleanNote=String(note).trim().slice(0,500);
  let message='';
  if(action==='collect'){
    if(parcel.status!=='ready') throw Error('Only a parcel marked ready can be collected.');
    parcel.status='collected';parcel.history.push('Collection recorded');
    if(cleanNote)parcel.note=cleanNote;
    message=`${id} collected. The collection total and dashboard have updated.`;
  }else if(action==='issue'){
    if(!['ready','transit'].includes(parcel.status))throw Error('This parcel cannot be flagged from its current state.');
    if(!cleanNote)throw Error('Add a short note so the next person knows what needs attention.');
    parcel.previousStatus=parcel.status;parcel.status='issue';parcel.note=cleanNote;parcel.history.push('Issue flagged');
    message=`${id} flagged for attention. Your note is attached to the record.`;
  }else if(action==='resolve'){
    if(parcel.status!=='issue')throw Error('There is no open issue to resolve.');
    parcel.status=parcel.previousStatus||'ready';delete parcel.previousStatus;parcel.note=cleanNote;parcel.history.push('Issue resolved');
    message=parcel.status==='ready'?`${id} returned to ready. It can now be collected.`:`${id} issue resolved. It is still in transit and awaiting arrival.`;
  }else if(action==='note'){
    if(!cleanNote)throw Error('Write a note before saving.');
    parcel.note=cleanNote;parcel.history.push('Collection note updated');
    message=`Note saved against ${id}.`;
  }else throw Error('Unknown parcel action.');
  return {state:{...state,parcels:state.parcels.map(p=>p.id===id?parcel:p),selected:id},message};
}
export function reviewDesign(action){
 if(action==='approve')return {title:'Approved → ready for the next step',detail:'The review decision is stored. In the intended workflow, approval makes the design eligible for product creation. This demo creates no Gelato product or Shopify listing.'};
 if(action==='reject')return {title:'Rejected → revision needed',detail:'The design stays out of product creation. A review record can capture what needs changing. Automated learning from that feedback remains planned.'};
 return {title:'Awaiting review',detail:'A person checks the design before the workflow proceeds. Choose a review decision to explore the intended behaviour.'};
}
export function artworkOrientation(value){
 if(value==='portrait')return {title:'Portrait · 1 : 1.414',detail:'The orientation choice maps to a portrait A-series aspect ratio on the design brief. The Ready for Artwork and Artwork Created fields control whether processing should proceed.'};
 return {title:'Landscape · 1.414 : 1',detail:'The orientation choice maps to a landscape A-series aspect ratio on the design brief. An orientation change is data that the next workflow stage can use.'};
}
