# Milestone Handoff privacy notice

Effective 25 November 2026. This notice applies to the Milestone Handoff Forge app for Jira Cloud, maintained by Marc SEB.

## Data used in Jira

When you open or refresh the issue panel, Forge supplies the current work-item context. The app uses the issue key to request its summary, status, due date and issue links from Jira. Link records can include issue keys, summaries, relation names and statuses. Summaries can contain personal information entered by your team. The app reads these values to display the milestone and identify visible prerequisites. It makes this request as the current Jira user, subject to that user's access. [Atlassian's explanation of the bridge](https://developer.atlassian.com/platform/forge/apis-reference/ui-api-bridge/requestJira/)

## Processing, storage and retention

The panel processes the response in browser memory. Its relationship choices stay in that panel instance. Closing the panel instance clears the app's in-memory state. Milestone Handoff has no app database or backend function, makes no changes to Jira and sends no issue content to the maintainer or any external service. Its code sets no cookies, uses no browser storage and adds no analytics. The app does not sell data.

Your organisation continues to manage the original Jira records and who can access them. Atlassian provides Jira and the Forge infrastructure under its own terms and may process operational data for those services. Uninstalling this app leaves Jira's records under the site's control. Contact your Jira site administrator for requests about access, correction or deletion of those records. [Atlassian privacy policy](https://www.atlassian.com/legal/privacy-policy)

## Support

For a general support or privacy question, use the project's public GitHub issue tracker. Anyone can read the contents of a public issue. Describe the behaviour with invented example data. Keep real ticket content, personal details, tenant URLs and credentials out of the report. Opening a GitHub issue is a separate action governed by GitHub's policies. [Support tracker](https://github.com/MarcoDiPolo/milestone-handoff/issues) · [GitHub privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)
