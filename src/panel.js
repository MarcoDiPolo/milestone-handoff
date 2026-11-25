import {requestJira,view} from "@forge/bridge";
import {defaultBlockers,handoff,loadMilestone,visibleLinks} from "./handoff.js";
const get=id=>document.getElementById(id);
let issue, selected=new Set(), revision=0;
function update(){
  const report=handoff(issue,[...selected]);
  get("finding").textContent=report.verdict;
  get("due").textContent=report.due||"Unspecified";
  get("stage").textContent=issue.fields.status?.name||"Unspecified";
  const list=get("links");list.replaceChildren();
  for(const link of report.blockers){
    const row=document.createElement("li");
    const state=link.state==="done"?"Done":link.state?"Open":"Status unavailable";
    row.textContent=[link.key,link.summary,state].filter(Boolean).join(" · ");
    list.append(row);
  }
}
async function refresh(){
  const ticket=++revision;
  get("detail").hidden=true;get("status").textContent="Loading visible Jira links…";
  try{
    const context=await view.getContext();
    const fresh=await loadMilestone(context.extension?.issue?.key,requestJira);
    if (ticket!==revision) return;
    const links=visibleLinks(fresh);
    const previous=issue?.key===fresh.key ? [...selected] : null;
    issue=fresh;
    const types=new Map((links||[]).filter(x=>x.labelId).map(x=>[x.labelId,x.label]));
    selected=new Set(previous ? previous.filter(id=>types.has(id)) : defaultBlockers(links));
    const filters=get("filters");
    while(filters.children.length>1) filters.lastElementChild.remove();
    filters.hidden=types.size===0;
    for(const [id,labelText] of types){
      const label=document.createElement("label"), box=document.createElement("input");
      box.type="checkbox";box.checked=selected.has(id);box.addEventListener("change",()=>{if(box.checked)selected.add(id);else selected.delete(id);update();});
      label.append(box,document.createTextNode(labelText));filters.append(label);
    }
    get("title").textContent=fresh.key+" · "+(fresh.fields.summary||"Summary unavailable");
    get("status").textContent="";get("detail").hidden=false;update();
  }catch(error){if(ticket===revision){get("title").textContent="Work item unavailable";get("status").textContent=error.message;}}
}
get("refresh").addEventListener("click",refresh);refresh();
