# Outline — Design Instagram

> Working file for the `/new-chapter` flow. Not rendered by the site.

## Identity

- **Title:** Design Instagram
- **Subtitle:** How to store, process, and serve billions of photos and videos, and build a feed that opens in under a second (105 chars)
- **Description:** Design Instagram: photo and video uploads, media processing, CDN delivery, a hybrid fan-out home feed, sharded IDs, and like counters, with estimates.
- **Slug:** `design-instagram` · **Part:** case-studies · **Kind:** case-study
- **Tags (5):** system-design, distributed-systems, news-feed, fan-out, media-storage
- **Prerequisites (planned building blocks):** caching, sharding-and-partitioning, unique-id-generation
- **Author:** md-sakib-khan

## Scope

A photo- and video-sharing service: post photos, short videos, and carousels (up to 10 items);
follow accounts; a ranked home feed of posts from followed accounts; profile grids; likes and
comments; private accounts. One boundary sentence in the chapter: Stories, Reels, Direct
messages, Explore, and search reuse these building blocks but are not designed here (Explore's
ranking funnel is cited when we discuss feed ranking).

## Requirements

**Functional**
1. Upload a photo, a short video, or a carousel with a caption; the author sees it immediately.
2. Follow and unfollow accounts; private accounts approve followers.
3. Home feed: posts from followed accounts, ranked, paged with a cursor.
4. Profile grid: a user's posts, newest first.
5. Like/unlike and comment; see like and comment counts.
6. Delete a post; it disappears from feeds, profiles, and media URLs.

**Non-functional**
- Scale: 500M DAU, 100M new posts/day, 10B feed requests/day (worked out in estimation).
- Latency: feed API p99 < 500 ms server-side; first image visible < 1 s on a good connection (TODO: confirm we want a client-side target).
- Availability: reading (feed, media) 99.99% (≈ 53 min/year); posting 99.95% (≈ 4.4 h/year).
- Durability: an acknowledged upload is never lost (replicated or erasure-coded across zones).
- Consistency: eventual for followers' feeds and counts (new post visible to followers within ~1 min at p99); read-your-writes for the author's own posts, likes, and follows.
- Privacy: media of private accounts is not fetchable by non-followers via a guessed URL.

## Estimation (each table sits beside its assumption; all assumptions labeled)

**Traffic** — 500M DAU; 1 in 5 users posts once a day → 100M posts/day → ≈ 1,160/s avg; peak ×3 ≈ 3.5k/s.
80% photos (80M), 20% videos (20M).
Feed: 10 app opens × 2 pages per open per DAU → 10B feed requests/day → ≈ 116k/s avg, ≈ 350k/s peak.
Likes 20/DAU/day → 10B/day → ≈ 116k/s, peak ≈ 350k/s. Comments 2/DAU/day → 1B/day → ≈ 11.6k/s, peak ≈ 35k/s.
Read:write ≈ 100 feed requests per post.

**Fan-out** — average 200 followers (assumption; the distribution is heavily skewed) →
20B feed inserts/day → ≈ 230k/s avg, ≈ 700k/s at peak. One account with 100M followers → 100M inserts for a single post.

**Storage** — photo: original ≈ 1 MB (client resizes to ≤ 1080 px width, cited) + renditions ≈ 0.5 MB → 1.5 MB.
Video: 30 s average at ≈ 5 Mbps ≈ 20 MB original + ≈ 20 MB encoding ladder → 40 MB.
→ photos 120 TB/day, videos 800 TB/day (87% of bytes from 20% of posts), 920 TB/day → ≈ 336 PB/year before redundancy.
×3 replication ≈ 1 EB/year vs erasure coding at 2.1 effective (f4 figure) ≈ 705 PB/year.
Metadata: posts 1 KB × 100M = 100 GB/day (36.5 TB/year); likes 50 bytes × 10B = 500 GB/day (≈ 183 TB/year: likes outweigh posts).
Precomputed feeds: 500 entries × 16 bytes = 8 KB per active user × 500M ≈ 4 TB (fits in a cache cluster).

**Bandwidth** — ingress: 80M × 1 MB + 20M × 20 MB = 480 TB/day ≈ 44 Gbps avg, ≈ 133 Gbps peak.
Egress: 400 posts seen per DAU per day (10 opens × 2 pages × 20); photos 320 × 150 KB = 48 MB;
videos 80 × 15 s watched × 1.5 Mbps ≈ 225 MB → ≈ 273 MB per DAU per day → 136.5 PB/day ≈ 12.6 Tbps avg,
≈ 38 Tbps peak. Egress/ingress ≈ 285×. 200B media objects/day ≈ 2.3M requests/s avg, ≈ 7M/s peak → only a CDN can serve this.

## Sections

0. **Intro** — "a photo app" sounds like file upload + a list; it is three systems: a write-once media pipeline, a 285:1 read-heavy delivery network, and a feed that must merge 200 timelines in < 500 ms.
1. **Problem and scope** — as above.
2. **Requirements** — as above, with `<Term>` tooltips (CDN, rendition, fan-out, read-your-writes, p99, erasure coding, …).
3. **Back-of-the-envelope estimation** — `###` Traffic, Fan-out, Storage, Bandwidth, (Cache memory). Two "stop and notice" moments: video is 87% of bytes; egress is 285× ingress.
4. **API design** — upload sessions (resumable, tus-style offsets) → `POST /v1/posts` with `Idempotency-Key` referencing upload ids (returns post in `processing` state); `GET /v1/feed?cursor=`; `GET /v1/users/{id}/posts`; `PUT/DELETE /v1/posts/{id}/likes/me` (idempotent by design); comments; follow/unfollow; media objects returned as a list of renditions (width, height, URL) for the client to pick.
5. **Data model** — users, posts (sharded by author `user_id`; id embeds the logical shard), media (blob keys, renditions, state), follows stored twice (following-by-follower and followers-by-followee), likes (by post, plus by user for "did I like it"), comments (by post), post counters, feed lists. Relational sharded store for users/posts/graph (Instagram's own path, cited); wide-column for likes/comments/feeds. ER figure.
6. **High-level design** — naive (one app server writes files to its disk and SELECTs feed with a JOIN over followees) → break it with the estimates → final: API gateway, upload service + blob store, media processing workers via queue, post service, graph service, fan-out service, feed service + ranking, counter service, CDN. Walkthrough ① upload … ⑨ fetch media from CDN.
7. **Deep dives** (~40% of words)
   - **A. The upload and media pipeline** — problem: 3.5k uploads/s at peak on mobile networks, 20 MB videos, phones that go into tunnels. Options: upload through the API vs direct-to-blob with pre-signed/upload-session URLs; whole-file vs resumable chunks. Choice: client-side resize + resumable upload sessions straight to blob storage, start uploading before the user taps Share, async processing through a queue: renditions (photo sizes/formats), video encoding ladder (Instagram's basic vs advanced encodings, cited), EXIF/GPS stripping, safety scanning, then publish. Media lifecycle state machine; idempotent post creation; orphan cleanup. Figures: `upload-sequence`, `media-lifecycle`.
   - **B. Building the home feed** — problem: merge recent posts from ~200 followees in < 500 ms at 350k req/s. Options: fan-out on read (pull), fan-out on write (push), hybrid. Choice: push for ordinary accounts into per-user feed lists, pull for accounts above a follower threshold, merged at read time; skip materializing feeds for inactive users; rank a candidate set then hydrate (cite Mosseri 2023 for what Feed ranks; Explore funnel for multi-stage ranking pattern; Twitter "Timelines at Scale" for the push model in production). Unfollows/blocks/deletes filtered at read. Figures: `feed-fanout`, `feed-read-path`.
   - **C. Serving media at 38 Tbps** — problem: 7M media requests/s; egress 285× ingress; popularity decays with age. Options: serve from origin vs CDN; mutable vs immutable URLs; one size vs renditions. Choice: content-addressed immutable URLs (`Cache-Control: immutable`, RFC 8246), client picks a rendition, layered caches (browser/edge/origin shares from the Facebook photo-caching study), progressive images and placeholders (Facebook PJPEG post), hot vs warm storage (Haystack, f4). Private accounts and deletion vs immutable caching: signed, expiring URLs + purge. Figure: `media-delivery`.
   - **D. IDs, shards, and hot counters** — problem: unique, time-sortable 64-bit ids across thousands of shards; a celebrity post getting thousands of likes/s on one row. Options: UUID, central ticket server, Snowflake-style service, DB-generated per-shard ids. Choice: Instagram-style id (41-bit ms time, 13-bit logical shard, 10-bit sequence; cited), logical→physical shard map; likes as rows + denormalized counter updated in the same transaction, cache with leases against thundering herds (Instagration pt. 2 cited); for very hot posts, sharded/buffered counters with approximate display. Figures: `id-layout`, `like-counter`.
8. **Scaling and bottlenecks** — from today's numbers: feed cache (4 TB), fan-out workers (700k inserts/s), metadata shards, CDN egress; ×10 and ×100. `### Regions` — global data (users, posts, graph: one primary, regional replicas) vs local data (caches, feeds), cited from Instagration/QCon. Figure: `regions`.
9. **Reliability and failure modes** — table: blob store, processing backlog, poison media file, fan-out lag, celebrity post, feed cache loss (rebuild by pull), counter drift (reconcile), CDN/origin outage, region loss, upload storm after an outage.
10. **Observability** — SLIs: feed p99, upload success rate by network type, time-to-visible for followers (fan-out lag), processing backlog age, CDN hit ratio and origin egress, counter drift.
11. **Security and privacy** — authN/Z on private accounts at the API and media URLs; EXIF/GPS stripping; abuse: hash-matching known abuse imagery (PhotoDNA), spam/fake likes rate limits; deletion and retention (including CDN purge and backups); upload validation (decompression bombs, malformed files processed in a sandbox).
12. **Trade-offs and alternatives** — `<Tradeoffs>` table.
13. **Evolution** — v1: one Django-style monolith, Postgres, object storage + CDN, Redis feed (Instagram's 2011 stack cited) → v2: sharded Postgres with logical shards, Cassandra for feeds/inboxes, async processing → v3: multi-region, ML ranking, warm-storage tier, advanced video encodings prioritised by watch time.
14. **Summary** — requirement → mechanism table + 6 bullets.

## Figures (12)

| id | type | section |
| -- | ---- | ------- |
| `naive-design` | architecture | High-level design |
| `high-level-design` | architecture overview (①–⑨) | High-level design |
| `data-model` | ER (`sql_table`, `class: reference` links) | Data model |
| `upload-sequence` | sequence | Deep dive A |
| `media-lifecycle` | state machine | Deep dive A |
| `feed-fanout` | data flow (push vs pull split, focus) | Deep dive B |
| `feed-read-path` | sequence (merge, rank, hydrate) | Deep dive B |
| `media-delivery` | architecture (client → edge → origin cache → hot/warm storage) | Deep dive C |
| `id-layout` | layout (64-bit field diagram) | Deep dive D |
| `like-counter` | data flow (likes table + counter + leased cache) | Deep dive D |
| `regions` | architecture (global vs local data) | Scaling — Regions |
| `celebrity-post` | failure-path sequence (a 100M-follower post + like storm) | Reliability |

## Sources (all checked reachable)

- Instagram Engineering — Sharding & IDs at Instagram (2012): https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c
- Instagram Engineering — What Powers Instagram: Hundreds of Instances, Dozens of Technologies (2011): https://instagram-engineering.com/what-powers-instagram-hundreds-of-instances-dozens-of-technologies-adf2e22da2ad
- Instagram Engineering — Instagration Pt. 2: Scaling our infrastructure to multiple data centers (2015): https://instagram-engineering.com/instagration-pt-2-scaling-our-infrastructure-to-multiple-data-centers-5745cbad7834
- Instagram Engineering — Open-sourcing a 10x reduction in Apache Cassandra tail latency (2018): https://instagram-engineering.com/open-sourcing-a-10x-reduction-in-apache-cassandra-tail-latency-d64f86b43589
- DataStax — Facebook's Instagram: Making the Switch to Cassandra from Redis (Rick Branson): https://datastax.com/blog/facebooks-instagram-making-switch-cassandra-redis-75-insta-savings
- Lisa Guo — Scaling Instagram Infrastructure (QCon, InfoQ): https://www.infoq.com/presentations/instagram-scale-infrastructure
- Engineering at Meta — How Instagram made its video infrastructure 94 percent more efficient (Peterman, Shi, 2022): https://engineering.fb.com/2022/11/04/video-engineering/instagram-video-processing-encoding-reduction/
- Engineering at Meta — Scaling the Instagram Explore recommendations system (Vorotilov, Shugaepov, 2023): https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/
- Instagram — Instagram Ranking Explained (Adam Mosseri, 2023): https://about.instagram.com/blog/announcements/instagram-ranking-explained
- Instagram Help Center — photo resolution (up to 1080 px wide): https://help.instagram.com/1631821640426723
- Beaver et al. — Finding a Needle in Haystack: Facebook's Photo Storage (OSDI 2010): https://www.usenix.org/conference/osdi10/finding-needle-haystack-facebooks-photo-storage
- Muralidhar et al. — f4: Facebook's Warm BLOB Storage System (OSDI 2014): https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar
- Huang et al. — An Analysis of Facebook Photo Caching (SOSP 2013): https://www.cs.princeton.edu/~wlloyd/papers/fb-photo-caching-sosp13.pdf
- Bronson et al. — TAO: Facebook's Distributed Data Store for the Social Graph (USENIX ATC 2013): https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson
- Nishtala et al. — Scaling Memcache at Facebook (NSDI 2013): https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala
- Engineering at Meta — Adopting Progressive JPEG in Facebook for iOS (2015): https://engineering.fb.com/2015/01/28/ios/faster-photos-in-facebook-for-ios/
- Raffi Krikorian — Timelines at Scale (QCon SF 2012, InfoQ): https://www.infoq.com/presentations/Twitter-Timeline-Scalability
- Twitter Engineering — Announcing Snowflake (2010): https://blog.x.com/engineering/en_us/a/2010/announcing-snowflake
- tus — Resumable upload protocol 1.0: https://tus.io/protocols/resumable-upload
- IETF — RFC 8246, HTTP Immutable Responses: https://www.rfc-editor.org/rfc/rfc8246
- AWS — Amazon S3 multipart upload limits: https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
- Microsoft — PhotoDNA: https://news.microsoft.com/features/microsofts-photodna-protecting-children-and-businesses-in-the-cloud/

## Open questions for the author

1. **Scale:** 500M DAU / 100M posts a day, clearly labeled as our assumption (Instagram reported 3B MAU in 2025; we do not claim its internals). OK, or a different target?
2. **Deep dives:** four (upload pipeline, home feed, media delivery, IDs + counters). Keep all four?
3. **Overlap with the planned `design-a-news-feed`:** this chapter would own fan-out on write/read/hybrid in depth. Should the future news-feed chapter link here for that, or should Instagram's feed dive stay lighter and defer to it?
4. **Video depth:** encoding ladder and adaptive bitrate at the level of "what renditions and why" only, with streaming protocols left to a future video chapter. OK?
