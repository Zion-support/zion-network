# 🚚 Spotlight — Batch 75 (2026-10-05): Logistics & Supply Chain AI

6 new apps joined the **Zion AI App Network**, all interlinked (README + ZION_APP_NETWORK.md with full mesh):

- [route-optimization-ai](https://github.com/Zion-support/route-optimization-ai) — multi-stop routing with traffic, windows and cost constraints
- [freight-rate-forecaster](https://github.com/Zion-support/freight-rate-forecaster) — lane-level rate forecasts and tender timing
- [warehouse-slotting-optimizer](https://github.com/Zion-support/warehouse-slotting-optimizer) — SKU placement that cuts pick time
- [delivery-exception-copilot](https://github.com/Zion-support/delivery-exception-copilot) — early delay detection + auto customer comms
- [supplier-risk-radar](https://github.com/Zion-support/supplier-risk-radar) — multi-signal supplier risk monitoring (adopted into batch 75)
- [demand-sensing-forecaster](https://github.com/Zion-support/demand-sensing-forecaster) — short-horizon demand sensing from POS/weather/events

## 🎯 Free AI Discovery — always free, always online
https://ziontechgroup.com/discovery/ — 5-minute questionnaire → instant personalized AI opportunity report, delivered to the client **and** commercial@ziontechgroup.com simultaneously.

Showcase: https://ziontechgroup.com/apps/network-batch75.html · Network map: https://ziontechgroup.com/apps/network.html · Plans: https://ziontechgroup.com/en/plans/

## ⚙️ Deploy rule (learned 2026-10-05)
Production site deploys ONLY from `public/` in zion-support.github.io via `scripts/prepare-pages-out.sh`. Commit site content to `public/` paths, then dispatch workflow **Simple Static Deploy** (id 348640155) on main. Root `apps/` is never published.