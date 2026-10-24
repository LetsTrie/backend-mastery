# Outline — Design a notification service

> Working file for the `/new-chapter` flow. Not rendered by the site.

## Identity

- **Title:** Design a notification service
- **Subtitle:** Fan-out, retries, and user preferences at a billion messages a day
- **Description (159 chars):** Design a notification service that sends push, email, and SMS at a billion messages a day: estimates, APIs, fan-out, retries, deduplication, and failure modes.
- **Slug:** `design-a-notification-service` (replaces planned `design-a-notification-system` in parts.yml)
- **Part:** case-studies · **Kind:** case-study
- **Tags:** messaging, queues, fan-out, push-notifications, reliability
- **Prerequisites (planned building blocks):** message-queues, idempotency, rate-limiting-algorithms

## Scope

**In:** transactional and bulk (campaign) notifications over iOS push (APNs), Android push (FCM), email, SMS, and an in-app inbox; preferences and opt-outs; templates and localization; scheduling and local-time delivery; frequency caps; delivery tracking.

**Out:** building email/SMS transport (we use providers), ML relevance ranking (mentioned in Evolution), the real-time WebSocket gateway, campaign-authoring UI.

## Requirements

**Functional:** send to one user (API or event); campaign to a segment of up to 50M users; per-category × per-channel preferences, quiet hours, time zone; templates with i18n; scheduling; status query; frequency caps and dedup.

**Non-functional:**
- Throughput: 1B notifications/day, peak ≈ 58k/s
- Latency: high-priority (OTP, security) p99 < 5 s accept→provider handoff; bulk best-effort (minutes)
- Availability: ingestion API 99.99% (≈ 53 min/year)
- Durability: an accepted notification is never silently lost
- Semantics: at-least-once internally + dedup → duplicates rare and bounded

## Estimation (assumptions labeled)

- 200M DAU × 5 notifications/user/day = **1B/day** → 1B ÷ 86,400 s ≈ **11.6k/s avg**; peak ×5 ≈ **58k/s**
- Channel mix (assumption): push 60%, in-app 25%, email 13%, SMS 2% (20M SMS/day — cost matters)
- Push at peak: 58k × 0.6 ≈ 35k/s; Android share 50% → **≈ 17k/s ≈ 1.04M/min — above FCM's default 600k/min project quota** (real constraint, cited)
- Storage: 500 B/notification record → 500 GB/day → 45 TB at 90-day retention (×3 replicas ≈ 135 TB); delivery events 4 × 100 B → 400 GB/day; devices 1B tokens × 200 B = 200 GB; preferences 500M × 1 KB = 500 GB
- Concurrency via Little's law: 58k/s × 100 ms provider latency (assumption) ≈ **5.8k in-flight requests**
- Campaign: 50M recipients at a 40k/s bulk budget ≈ 21 min

## Sections

1. **Intro + KeyTakeaways** — why "just call APNs" fails; what makes it hard (third parties, fan-out, humans on the other end).
2. **Problem and scope** — above; interview callout: how to scope in the first five minutes.
3. **Requirements** — above.
4. **Back-of-the-envelope estimation** — three `<Estimate>` tables (traffic, storage, concurrency); call out the FCM quota surprise.
5. **API design** — `POST /v1/notifications` (Idempotency-Key, 202), `POST /v1/campaigns`, `GET /v1/notifications/{id}`, preferences, device registration, provider webhooks; event-based alternative via a topic.
6. **Data model** — notifications by `user_id` (wide-column, time-clustered, TTL); lookup by id; deliveries; devices (+ token→device index for invalidation); preferences (cached); templates (relational, versioned); idempotency keys (KV, 24 h TTL). Figure + Tabs (wide-column vs relational).
7. **High-level design** — start naive (sync call to providers) → break it → final design. Overview with ①–⑦ steps.
8. **Deep dives**
   - **A. Never lose, rarely duplicate** — outbox for producers, at-least-once pipeline, dedup at three layers, retries with exponential backoff + jitter, retry topics, DLQ, the "unknown outcome" timeout problem.
   - **B. Fan-out and priority** — campaign fan-out in batches; separate lanes so an OTP never waits behind a 50M campaign (head-of-line blocking); local-time scheduling by time-zone buckets. (Netflix RENO's priority queues as precedent.)
   - **C. Respecting the human** — processor pipeline: dedup → preferences → quiet hours → frequency caps → aggregation/digest → channel selection → render. (LinkedIn ATC as precedent.) Fail-open vs fail-closed when the preference service is down.
   - **D. Living with providers** — token lifecycle (APNs 410, FCM UNREGISTERED cleanup), provider quotas (FCM, Twilio MPS), circuit breakers, secondary-provider failover for email/SMS, webhook ingestion for delivery status, email deliverability (Gmail spam-rate threshold, RFC 8058 one-click unsubscribe).
9. **Scaling and bottlenecks** — from 58k/s: partitions, stateless workers, preference cache, FCM quota planning; ×10 and ×100.
10. **Reliability and failure modes** — table: provider down/slow, broker loss, worker crash, poison message, preference service down, runaway producer, region loss.
11. **Observability** — SLIs/SLOs per priority lane, queue lag, provider success rate, token-invalid rate, spam/complaint rate, cost per channel.
12. **Security and privacy** — producer auth + per-producer quotas, sensitive content on lock screens, PII retention/TTL, deletion, consent.
13. **Trade-offs and alternatives** — `<Tradeoffs>` table.
14. **Evolution** — v1 (Postgres-as-queue, one provider per channel) → v2 (log-based broker, lanes, preferences) → v3 (multi-region, send-time optimization, aggregation ML).
15. **Summary** — final figure recap + bullets.

## Figures (9)

| id | type | section |
| -- | ---- | ------- |
| `naive-design` | architecture | High-level design |
| `high-level-design` | architecture (overview, ①–⑦) | High-level design |
| `data-model` | ER (`sql_table`) | Data model |
| `notification-lifecycle` | state machine | Deep dive A |
| `retry-and-dedup` | sequence (failure path) | Deep dive A |
| `priority-lanes` | architecture (focus: lanes) | Deep dive B |
| `campaign-fanout` | data flow | Deep dive B |
| `processor-pipeline` | pipeline | Deep dive C |
| `provider-adapter` | architecture (circuit breaker, failover, token feedback) | Deep dive D |

## Sources

- Apple — Sending notification requests to APNs; Handling notification responses from APNs
- Firebase — Best practices for FCM registration token management; FCM throttling and quotas
- Google — Gmail email sender guidelines; IETF RFC 8058 (one-click unsubscribe)
- Twilio — Understanding Twilio rate limits and message queues
- AWS — Amazon SES reputation metrics messages
- Chris Richardson — Pattern: Transactional outbox (microservices.io)
- Uber Engineering — Uber's Real-Time Push Platform (RAMEN), 2020
- LinkedIn Engineering — Air Traffic Controller: Member-first notifications at LinkedIn, 2018
- InfoQ — Netflix's RENO keeps experience consistent across devices, 2022
- RFC 9110 / IETF Idempotency-Key draft (for the API section)

## Open questions for the author

1. Scale: is 1B/day (200M DAU) the right ambition, or prefer a smaller "startup" framing?
2. Four deep dives (~40% of words) — keep all four, or drop D into Scaling?
3. Length target: ~7,000–8,000 words, ~35 min read. OK?
