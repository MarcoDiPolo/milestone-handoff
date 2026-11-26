import test from "node:test";
import assert from "node:assert/strict";
import {defaultBlockers,handoff,loadMilestone,visibleLinks} from "./handoff.js";
import {collectEvidence} from "./evidence.js";

const type={id:"10000",name:"Blocks",inward:"is blocked by",outward:"blocks"};
const link=(side,state,custom=type)=>({id:side+"-"+String(state),type:custom,[side+"Issue"]:{key:"SUB-1",fields:{summary:"Approval draft",status:state?{statusCategory:{key:state}}:null}}});
const issue=links=>({key:"DEMO-1",fields:{issuelinks:links,duedate:"2026-12-05"}});
test("Inward is blocked by is a prerequisite; outward blocks is a downstream dependency",()=>{
  const item=issue([link("inward","indeterminate"),link("outward","done")]);
  const result=handoff(item,defaultBlockers(visibleLinks(item)));
  assert.equal(result.verdict,"Open prerequisite");assert.equal(result.blockers.length,1);assert.equal(result.due,"2026-12-05");
});
test("Customized link directions count only when selected",()=>{
  const t={id:"77",inward:"unblocks",outward:"awaits"};
  const item=issue([link("outward","done",t)]);
  assert.equal(handoff(item,defaultBlockers(visibleLinks(item))).verdict,"Choose a prerequisite relationship");
  assert.equal(handoff(item,["77/outward"]).verdict,"All selected prerequisites are done");
});
test("Unknown or unavailable relationships stay unknown",()=>{
  for (const links of [undefined,[{}],[link("inward",null)]]) {
    const item=issue(links);
    assert.equal(handoff(item,defaultBlockers(visibleLinks(item))).verdict,"Evidence incomplete");
  }
  assert.equal(handoff(issue([]),[]).verdict,"No visible prerequisites recorded");
});
test("Current user bridge requests only the four necessary fields",async()=>{
  const entry=issue([]);let path;
  assert.equal(await loadMilestone("DEMO-1",async value=>{path=value;return {ok:true,json:async()=>entry};}),entry);
  assert.equal(path,"/rest/api/3/issue/DEMO-1?fields=summary,status,duedate,issuelinks");
});
test("Permission denials and partially returned records are explicit",async()=>{
  for(const status of [401,403,404]) await assert.rejects(loadMilestone("DEMO-1",async()=>({ok:false,status})),/current user/);
  await assert.rejects(loadMilestone("DEMO-1",async()=>({ok:true,json:async()=>({})})),/incomplete/);
  await assert.rejects(loadMilestone("",async()=>{throw Error("Unexpected request");}),/inside a Jira/);
});

test("Rovo requests one normalized key and puts open prerequisites first", async () => {
  const records = Array.from({ length: 13 }, () => link("inward", "done"));
  records.push(link("inward", "indeterminate"), link("inward", null), link("outward", "indeterminate"));
  const ticket = issue(records);
  ticket.fields.summary = "Review the milestone";
  ticket.fields.status = { name: "In progress" };
  const requests = [];
  const result = await collectEvidence(" demo-1 ", async key => {
    requests.push(key);
    return { ok: true, json: async () => ticket };
  });
  assert.deepEqual(requests, ["DEMO-1"]);
  assert.equal(result.status, "In progress");
  assert.equal(result.dueDate, "2026-12-05");
  assert.equal(result.visibleLinkCount, 16);
  assert.equal(result.prerequisiteCount, 15);
  assert.equal(result.openCount, 1);
  assert.equal(result.unknownStatusCount, 1);
  assert.equal(result.prerequisites[0].state, "open");
  assert.equal(result.prerequisites[1].state, "unavailable");
  assert.equal(result.omittedPrerequisites, 3);
});

test("Rovo rejects ambiguous keys before reading Jira", async () => {
  for (const key of [undefined, "", "T-1,T-2", "../A-2", "T-0", { issueKey: "T-1" }]) {
    assert.match((await collectEvidence(key, assert.fail)).error, /one Jira issue key/);
  }
});

test("Rovo preserves missing evidence and Jira access boundaries", async () => {
  const missing = await collectEvidence("DEMO-1", async () => ({ ok: true, json: async () => issue() }));
  assert.equal(missing.verdict, "Evidence incomplete");
  assert.equal(missing.visibleLinkCount, null);
  assert.equal(missing.status, null);
  for (const status of [401, 403, 404]) {
    const result = await collectEvidence("DEMO-1", async () => ({ ok: false, status }));
    assert.deepEqual(result, { error: "Jira could not share this work item with the current user." });
  }
  const failure = await collectEvidence("DEMO-1", async () => { throw Error("private diagnostic"); });
  assert.deepEqual(failure, { error: "Jira could not be reached. Try again later." });
});
