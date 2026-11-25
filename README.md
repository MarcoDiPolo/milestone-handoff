# Milestone Handoff

A read-only Jira Cloud issue panel for the person taking over a milestone. Open a work item to see its recorded due date, current status and the linked prerequisites visible to you.

## Read a handoff

Open **Milestone Handoff** from the work item's apps menu. The panel shows the due date exactly as recorded in Jira. If a prerequisite remains open, it lists the linked item with its key and summary. A completed work item and its prerequisites have separate status indicators.

The panel recognises the ordinary English and French equivalents of “is blocked by”. Jira administrators can rename or reverse link labels. Use the relationship checkboxes to choose which directions count for this milestone. Choose **Refresh** after an issue changes. Your selections last while this panel instance is open.

An unreturned link collection or an unavailable prerequisite status can leave the evidence incomplete. A site can also limit what Jira returns for your account. The result describes the visible work items and their recorded status. Client acceptance and payment require separate evidence.

## How it works

A Forge Custom UI panel requests the current issue through the browser bridge. It selects four fields in one Jira REST request: summary, status, due date and issue links. The app builds its checklist from the linked summaries and status categories already in the response. The manifest declares one Jira scope, `read:jira-work`. [How the Forge bridge uses the current user's permissions](https://developer.atlassian.com/platform/forge/apis-reference/ui-api-bridge/requestJira/)

## Build and test

With Node.js 24 and npm installed, run these commands in the repository root.

~~~sh
npm ci
npm test
npm run build
~~~

The build writes `static/panel.bundle.js`. Five Node.js tests cover relationship direction, renamed relationships, absent fields, current-user requests and permissions errors. Test fixtures use invented issue data.

To run your own copy, follow the [Forge getting-started guide](https://developer.atlassian.com/platform/forge/getting-started/). The manifest includes the original app's public identifier. Register your copy with Forge under your own account before deploying to a Jira Cloud test site you administer. Run `npx forge lint`, `npx forge deploy` and `npx forge install`, then open the panel on a work item. [Forge register command](https://developer.atlassian.com/platform/forge/cli-reference/register/)

## Privacy, support and licence

[Privacy notice](PRIVACY.md) · [Public support tracker](https://github.com/MarcoDiPolo/milestone-handoff/issues) · [MIT licence for the original source](LICENSE)

Forge CLI, Forge Bridge and other dependencies retain their own licences. Forge Bridge's package refers to the [Atlassian Developer Terms](https://developer.atlassian.com/platform/marketplace/atlassian-developer-terms/). Install dependencies from the pinned npm lockfile to build the browser bundle.
