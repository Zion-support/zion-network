# Canonical Discovery consolidation — 2026-10-08

Retired the duplicate network/discovery/index.html form. It rendered an email-success claim without checking the HTTP response, used unsupported AJAX autoresponse behavior, and did not provide the canonical form's validation and delivery states.

Canonical questionnaire: https://ziontechgroup.com/discovery/

The network entry now has a static redirect and visible fallback link. It collects no answers and sends no email. Preserve the canonical local report, copy/download, provider-acceptance handling and Commercial/client CC delivery request.

Previously completed work preserved: network homepage's verified 421-ID snapshot and qualified delivery wording; existing Discovery→Apps guide and artifact-only related-app navigation.

Verification must distinguish source committed, public redirect reachable, provider accepted, and recipient inbox receipt. No email sent by this change.
