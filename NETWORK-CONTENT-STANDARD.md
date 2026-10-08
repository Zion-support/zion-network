# Zion network publishing standard

## Shared pattern
All new pages: responsive system-font layout, dark #0b1220 background, #121a2b cards, #7dd3fc links, visible keyboard focus, semantic main/nav/section, descriptive titles and one primary heading. Top/bottom navigation: homepage, network hub, app explorer and free Discovery. Preserve existing content until individual migrations are reviewed and tested.

## Catalog integrity
Load all files referenced by network.json.apps_files from one immutable commit. Validate IDs, reject duplicates, derive the count and compare to apps_total. Do not replace complete arrays with placeholders, invent app counts or confuse repository counts with deployed apps. Explorer snapshot: 0416c7057cea0ff26a5412a0e813224705de32da, 421 IDs.

## Interlinks
Every explorer entry links to its source and an app detail; details provide up to six shared-description-word suggestions. These are discoverability links, not evidence of compatibility. Preserve breadcrumb and back navigation. Publish thematic paths instead of reusing collided batch numbers.

## Evidence labels
Registered != published != functional-test passed != production-ready. Each claim needs separate evidence. Savings are illustrative until measured. Availability depends on hosting. Discovery is free, but inbox delivery depends on the email provider. Provider acceptance is not receipt in both inboxes. Do not use unsupported autoresponse fields; preserve the tested provider-copy contract.

## Commercial safeguards
No app authorizes real dispatch, reservation or purchases. Written scope, client confirmation, applicable PO and Zion authorization are required. Do not expose customer sites or confidential details in public guides.

## Release checklist
1. Validate HTML and JavaScript; check loading failure, search, selected app, related links and mobile/keyboard navigation.
2. Read back the immutable GitHub commit.
3. Verify live HTTP status plus expected content marker; raw GitHub success is not website deployment.
4. Record functional tests and any unverified routes separately in Notion.
5. For Discovery emails, use an explicitly approved test address and check client + Commercial receipt. Do not infer receipt from HTTP 200.
6. Update this standard incrementally; do not overwrite concurrent homepage/Discovery work.
