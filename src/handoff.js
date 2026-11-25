export const issueFields="summary,status,duedate,issuelinks";

export async function loadMilestone(issueKey,requestJira) {
  if (typeof issueKey!=="string" || !issueKey.trim()) throw Error("Open the panel inside a Jira work item.");
  const response=await requestJira("/rest/api/3/issue/"+encodeURIComponent(issueKey)+"?fields="+issueFields);
  if (!response.ok) {
    if ([401,403,404].includes(response.status)) throw Error("Jira could not share this work item with the current user.");
    throw Error("Jira could not load this work item (HTTP "+response.status+").");
  }
  const issue=await response.json();
  if (!issue?.key || !issue.fields) throw Error("Jira returned an incomplete work item.");
  return issue;
}

// Jira associates the inwardIssue with the inward label in a GET issue response.
// Sites can rename and reverse types. Exact displayed labels let the user override.
export function visibleLinks(issue) {
  if (!Array.isArray(issue.fields.issuelinks)) return null;
  return issue.fields.issuelinks.map(link=>{
    const side=link.inwardIssue?"inward":link.outwardIssue?"outward":null;
    const other=side?link[side+"Issue"]:null;
    return {id:String(link.id||""),key:other?.key||"",label:link.type?.[side]||"Unspecified relationship",
      labelId:side&&link.type?.id?link.type.id+"/"+side:null,summary:other?.fields?.summary||"Summary unavailable",
      state:other?.fields?.status?.statusCategory?.key||null};
  });
}
const usualLabels=new Set(["is blocked by","est bloqué par","est bloquée par"]);
export function defaultBlockers(links) {
  return [...new Set((links||[]).filter(l=>l.labelId && usualLabels.has(l.label.trim().toLowerCase())).map(l=>l.labelId))];
}
export function handoff(issue,selected) {
  const links=visibleLinks(issue);
  const blockers=(links||[]).filter(x=>selected.includes(x.labelId));
  const open=blockers.filter(x=>x.state && x.state!=="done");
  const unknown=blockers.filter(x=>!x.state);
  let verdict;
  if (open.length) verdict="Open prerequisite";
  else if (links===null || unknown.length || links.some(x=>!x.labelId)) verdict="Evidence incomplete";
  else if (links.length && !selected.length) verdict="Choose a prerequisite relationship";
  else if (!blockers.length) verdict="No visible prerequisites recorded";
  else verdict="All selected prerequisites are done";
  return {verdict,blockers,open,unknown,due:issue.fields.duedate||null};
}
