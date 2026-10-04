# 🛰️ Space & Satellite Ops AI Suite (Batch 77 — 2026-10-04)

Four interlinked apps covering the satellite operations loop: **screen → schedule → monitor → deploy**.

Part of the [Zion App Network](../APPS_NETWORK.md) · [Hub](../index.html) · [Status](https://zion-support.github.io/zion-status/)

## The loop

1. **[Orbital Conjunction Screener](https://github.com/Zion-support/orbital-conjunction-screener)** — automated CDM screening with probability-of-collision triage, risk-ranked queues and avoidance maneuver suggestions ([Live](https://ziontechgroup.com/orbital-conjunction-screener/)).
2. **[Satellite Pass Scheduler](https://github.com/Zion-support/satellite-pass-scheduler)** — contact-window planning, conflict resolution across fleets, what-if scheduling; coordinates avoidance windows with the Screener ([Live](https://ziontechgroup.com/satellite-pass-scheduler/)).
3. **[Ground Station Link Monitor](https://github.com/Zion-support/ground-station-link-monitor)** — real-time link budgets, RF health (SNR, Eb/N0, BER), outage alerting; feeds utilization analytics back to the Scheduler ([Live](https://ziontechgroup.com/ground-station-link-monitor/)).
4. **[AI Edge Deployer](https://github.com/Zion-support/ai-edge-deployer)** — pushes optimized AI models to ground stations and edge sites with monitoring, closing the on-prem loop ([Live](https://ziontechgroup.com/ai-edge-deployer/)).

## Why it matters

- **Collision avoidance is mission-critical** — automated CDM triage cuts analyst workload per conjunction event.
- **Downlink revenue depends on contacts** — scheduler + link monitor maximize successful passes per day.
- **Edge AI at the station** — deploy screening/scoring models next to the RF chain with the Edge Deployer, governed by [Zion AI Governance](https://github.com/Zion-support/zion-ai-governance) and observable via [Zion Edge AI Platform](https://github.com/Zion-support/zion-edge-ai-platform).

## Related suites

- [Security & Compliance Edge Suite](security-compliance-edge-suite.md)
- [Sustainability & ESG AI Suite](sustainability-esg-suite.md)
- [Data Operations & Observability AI](../network/data-observability-ai.md)
- [Industry Platforms](../network/industry-platforms.md)

## Registry

Machine-readable registry: [`network/space-satellite-apps.json`](../network/space-satellite-apps.json)

---
🏠 [ziontechgroup.com](https://ziontechgroup.com) · 🌐 [Network Index](../APPS_NETWORK.md) · 📊 [Status](https://zion-support.github.io/zion-status/) · 💼 [Plans](https://zion-support.github.io/zion-plans/)
