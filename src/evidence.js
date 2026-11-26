import { defaultBlockers, handoff, readJiraIssue, visibleLinks } from "./handoff.js";

export async function collectEvidence(input, requestIssue) {
  const key = typeof input === "string" ? input.trim().toUpperCase() : "";
  if (key.length > 255 || !/^[A-Z][A-Z0-9_]*-[1-9][0-9]*$/.test(key)) {
    return { error: "Provide one Jira issue key, for example TEAM-17." };
  }

  let response;
  try {
    response = await requestIssue(key);
  } catch {
    return { error: "Jira could not be reached. Try again later." };
  }
  let issue;
  try {
    issue = await readJiraIssue(response);
  } catch {
    if ([401, 403, 404].includes(response.status)) {
      return { error: "Jira could not share this work item with the current user." };
    }
    return { error: "Jira did not supply a usable work item. Try again later." };
  }

  const links = visibleLinks(issue);
  const selected = defaultBlockers(links);
  const report = handoff(issue, selected);
  const done = report.blockers.filter(link => link.state === "done");
  const ordered = [...report.open, ...report.unknown, ...done];
  const shown = ordered.slice(0, 12);
  return {
    key: issue.key,
    title: issue.fields.summary || null,
    status: issue.fields.status?.name || null,
    dueDate: report.due,
    verdict: report.verdict,
    visibleLinkCount: links === null ? null : links.length,
    prerequisiteCount: ordered.length,
    openCount: report.open.length,
    unknownStatusCount: report.unknown.length,
    omittedPrerequisites: ordered.length - shown.length,
    prerequisites: shown.map(link => ({
      key: link.key || null,
      title: link.summary,
      state: link.state === "done" ? "done" : link.state ? "open" : "unavailable"
    }))
  };
}
