import api, { route } from "@forge/api";
import { collectEvidence } from "./evidence.js";
import { issueFields } from "./handoff.js";

export async function readEvidence(payload) {
  return collectEvidence(payload?.issueKey, key => api.asUser().requestJira(
    route`/rest/api/3/issue/${key}?fields=${issueFields}`
  ));
}
