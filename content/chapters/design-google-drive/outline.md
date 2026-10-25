# Outline — Design Google Drive

Working file for approval. Not rendered by the site.

## Identity

- **Slug:** `design-google-drive`
- **Kind:** case-study
- **Part:** case-studies (after `design-a-notification-service`)
- **Title:** Design Google Drive (19 chars)
- **Subtitle:** How to store, sync, and share billions of files across every device without losing a byte
- **Description (146 chars):** Design a Google Drive-like service that stores, syncs, and shares files: chunked uploads, delta sync, conflicts, permissions, and exabyte storage.
- **Tags (5):** `system-design`, `distributed-systems`, `file-storage`, `file-sync`, `access-control`
- **Prerequisites (planned building blocks, linked not re-explained):** `sharding-and-partitioning`, `replication`, `consistency-models`, `idempotency`
- **Framing:** we design *a Google Drive-like service*. Claims about how Google or Dropbox actually work appear only where cited; everything else is our design.

## Hook (intro)

You edit a slide deck on a plane. A colleague edits the same deck at their desk. You land, your laptop reconnects, and three things must happen at once: only the slides you changed go up, not the 300 MB file; your colleague's version is not silently overwritten; and the intern you removed from the folder yesterday cannot open either version. That is the whole chapter in one scene.

## Scope (for approval; the chapter itself has no "out of scope" list)

**In:** upload and download of any file type up to 5 TB; folders; desktop and mobile sync clients; version history; trash and restore; sharing with users, groups, and links; search by name and metadata; storage quotas.

**Out (one-sentence boundary where it matters):** real-time collaborative editing inside Docs/Sheets (its own chapter: operational transforms / CRDTs); full-text search inside file content (mention as a downstream indexer only); previews and thumbnails rendering (a worker pool, mentioned once); billing.

## Requirements

**Functional**
1. Upload, download, rename, move, and delete files and folders, from web, desktop, and mobile.
2. Large files upload reliably over bad networks and resume after interruption.
3. Every device a user signs in to converges on the same tree; offline edits sync when back online.
4. Concurrent edits to the same file never silently lose data (conflicted copy, not last-writer-wins).
5. Version history: older versions are kept for 30 days or 100 versions, matching Drive's documented policy for uploaded files <Cite: support.google.com/drive/answer/2409045>; "keep forever" pins a version.
6. Share a file or folder with users, groups, or "anyone with the link", as viewer, commenter, or editor; permissions inherit down folders.
7. Deleted items go to trash and can be restored for 30 days.
8. Per-user storage quota (free tier 15 GB shared across products <Cite: support.google.com/accounts/answer/9312312>).

**Non-functional (targets)**
- **Durability:** 99.999999999% (11 nines) annual for file content; metadata never loses an acknowledged change.
- **Availability:** 99.99% for metadata reads and downloads, 99.9% for uploads (≈ 8.8 h/year).
- **Sync latency:** a change on one online device appears on the user's other online devices within p99 10 s.
- **Consistency:** metadata is strongly consistent per namespace (read-your-writes; a listing never shows a file whose upload hasn't committed). Permission removal takes effect before the next access (the "new enemy" problem). Search and "recent" views may lag by seconds.
- **Max file size:** 5 TB, the limit Drive documents <Cite: developers.google.com/workspace/drive/api/guides/limits>.
- **Efficiency:** re-uploading an unchanged file costs ~0 bytes; editing 1 MB of a 1 GB file uploads ~1 block, not 1 GB.

## Estimation (inputs → math → results; computed)

| Step | Assumption | Calculation | Result |
| --- | --- | --- | --- |
| Users | 1B registered, 200M DAU | — | — |
| Stored data | 2 GB per user on average | 1B × 2 GB | 2 EB logical |
| Files | 500 files and folders per user | 1B × 500 | 500B entries; avg file ≈ 4 MB |
| File writes | 5 creates/edits per DAU per day | 200M × 5 | 1B per day ≈ 11.6k/s avg, ≈ 35k/s peak (×3) |
| Upload bytes | 1 MB of *new* bytes per write after chunk dedup | 1B × 1 MB | 1 PB/day ≈ 93 Gbps avg, ≈ 280 Gbps peak |
| Download bytes | 2× upload (sync to other devices, previews, shares) | 2 × 1 PB | 2 PB/day ≈ 560 Gbps peak |
| Growth | ingress kept | 1 PB × 365 | ≈ 365 PB/year before deletes and dedup |
| Metadata requests | 100 per DAU per day (list, changes, search, permission checks) | 200M × 100 | 20B/day ≈ 230k/s avg, ≈ 700k/s peak |
| Metadata size | ≈ 1 KB per entry | 500B × 1 KB | ≈ 500 TB (before replication) |
| Block index | 4 MB average block, ≈ 100 bytes per index row | 2 EB ÷ 4 MB; × 100 bytes | 500B blocks; ≈ 50 TB |
| Raw disk | f4-style erasure coding ≈ 2.1× vs 3× replication | 2 EB × 2.1 / × 3 | 4.2 EB vs 6 EB (≈ 210k vs 300k 20 TB drives) |
| Versions | 30 days of overwritten blocks, upper bound | 1 PB × 30 | ≤ 30 PB (≈ 1.5% of total) |
| Sync connections | 1.5 devices per DAU, 40% online at peak | 300M × 40% | 120M open connections ≈ 1,200 servers at 100k each |

Headline insights for the prose: metadata, not bytes, is the hard scaling problem (700k/s, 500B rows, strong consistency); the bytes problem is a *cost* problem (erasure coding saves ~1.8 EB of disk vs 3× replication); every metadata/content request also needs a permission check (~700k/s, cf. Zanzibar's "millions per second").

## Sections (blueprint)

1. **Problem and scope** — producers are clients (web, desktop, mobile); the platform covers the list above.
2. **Requirements** — as above, with tooltips on durability nines, namespace, read-your-writes, new enemy.
3. **Back-of-the-envelope estimation** — Users and data; Traffic; Metadata; Storage and cost of durability; Sync connections. Small tables per step.
4. **API design** — `POST /v1/uploads` (start session with file size + block hashes) → `PUT /v1/blocks/{hash}` for missing blocks → `POST /v1/files/{id}/commit` with base revision (optimistic concurrency); `GET /v1/changes?cursor=` (cursor pagination, like Drive's `startPageToken` <Cite>); `GET /v1/files/{id}/content` → short-lived signed URL; `POST /v1/files/{id}/permissions`. Idempotency via client-generated commit id.
5. **Data model** — `namespaces`, `files` (id, namespace, parent, name, head_revision), `revisions` (blocklist), `blocks` (hash → location, size, refcount/epoch), `journal` (namespace, seq, change), `permissions` as relation tuples, `devices`/cursors. ER figure with key links. Storage: sharded strongly consistent store for metadata (Spanner-like or sharded MySQL like Dropbox Edgestore <Cite>), blob store for blocks.
6. **High-level design** — clients → API gateway → metadata service / block service / sync (notification) service / permission service; blob store; async workers (thumbnails, indexing, GC). Numbered walkthrough of an upload and of a sync.
7. **Deep dives** (below).
8. **Scaling and bottlenecks** — hot namespaces (a company-wide shared folder with 100k members), giant folders (1M children), notification fan-out for shared folders, metadata shard splits, ×10 / ×100.
9. **Reliability and failure modes** — upload interrupted mid-block, commit lost after blocks uploaded (orphan blocks), corrupted block (end-to-end checksums, scrubbing), sync loop between two devices, clock skew, region loss (RPO/RTO), poison file (thumbnailer crash), runaway client.
10. **Observability** — SLIs: upload success, time-to-sync p99, conflict rate, permission-check latency, durability audit (scrub results), GC safety (block-not-found must be 0).
11. **Security and privacy** — encryption at rest with per-block keys and key hierarchy, crypto-shredding for deletion, link-sharing tokens, malware/abuse on shared links, cross-user dedup side channel, data residency.
12. **Trade-offs and alternatives** — `<Tradeoffs>` covering each major decision.
13. **Evolution** — v1: one region, Postgres + S3, polling, whole-file upload; v2: chunking + dedup + notifications; v3: own blob store (Dropbox moved off AWS with Magic Pocket <Cite>), Zanzibar-style ACL service, multi-region. Buy vs build.
14. **Summary** — recap figure + bullets.

## Deep dives (4)

### 1. Upload only what changed [#chunked-upload]
- **Problem:** a 1 GB file with 1 MB edited; flaky mobile networks; 5 TB files.
- **Options:** whole-file upload; rsync-style rolling-checksum delta <Cite: rsync TR-CS-96-05>; fixed-size blocks (Dropbox: 4 MB blocks, SHA-256 per block, blocklist <Cite: Dropbox content hash; Streaming Sync>); content-defined chunking (LBFS <Cite>, FastCDC <Cite>) where an insertion shifts only nearby boundaries.
- **Likely choice:** content-addressed blocks: content-defined chunking (min 1 MB, avg 4 MB, max 16 MB) on desktop clients, fixed 4 MB for API/browser uploads; client asks "which of these hashes are missing?", uploads only those (each block its own retryable request, like Drive's resumable protocol with 256 KB-aligned chunks and one-week sessions <Cite>), then commits the blocklist as a new revision in one metadata transaction. Dedup scope per user/organization (see Security).
- **Figures:** `chunking-boundaries` (fixed vs CDC after an insertion), `upload-sequence`.

### 2. Keeping every device in sync [#sync]
- **Problem:** 120M connected devices; offline edits; two edits to the same file; renames and moves racing with edits.
- **Options:** client polling of full listings; per-file timestamps (clock skew); a per-namespace change journal with a monotonically increasing sequence number and a cursor per device (Drive's changes API + `startPageToken` <Cite>); push as a *hint* over a long-lived connection, pull as the truth (like Drive `changes.watch` <Cite>).
- **Likely choice:** journal + cursor + push-as-hint; commits carry the base revision (compare-and-set); a stale base produces a conflicted copy instead of an overwrite; the client keeps three views (remote, local, synced base) as Dropbox's Nucleus does <Cite>.
- **Figures:** `sync-sequence`, `conflict-flow`.

### 3. Sharing and permissions [#permissions]
- **Problem:** inheritance down deep folder trees; "shared with me" listing; groups of 100k; revocation must apply before the next read.
- **Options:** ACL copied onto every file (fan-out on change); ACL on folders with inheritance evaluated at read time; a relation-tuple service like Zanzibar, which Google built for Drive, Calendar, YouTube and others: trillions of ACLs, millions of checks per second, p95 < 10 ms <Cite>.
- **Likely choice:** Zanzibar-style tuples (`folder:F#viewer@group:eng#member`, `file:X#parent@folder:F`), check API + reverse index for listing, consistency tokens (zookies) to solve the new-enemy problem <Cite>; content URLs are short-lived signed URLs so revocation is fast.
- **Figure:** `permission-graph`.

### 4. Storing exabytes cheaply without losing a byte [#blob-storage]
- **Problem:** 2 EB, 11 nines, most data cold; deletes must be safe with shared blocks.
- **Options:** 3× replication; erasure coding (Reed-Solomon; Backblaze 17+3 <Cite>; f4's 2.1× with RS(10,4) + cross-region XOR <Cite>); hot/warm tiering; packing 4 MB blocks into large immutable volumes (Magic Pocket: optimized for 4 MB immutable blobs <Cite>).
- **Likely choice:** immutable content-addressed blocks packed into volumes; recent data replicated, data older than ~30 days erasure-coded across regions; garbage collection by mark-and-sweep with a grace period (never inline refcount decrement-to-delete); deletion via per-block keys.
- **Figures:** `blob-storage-tiers`, `block-lifecycle` (state machine).

## Figure list

| id | type | purpose | section |
| --- | --- | --- | --- |
| `high-level-design` | architecture | clients, gateway, metadata/block/sync/permission services, blob store, workers; numbered upload + sync paths | High-level design |
| `data-model` | ER | files, revisions, blocks, journal, permissions, with key links | Data model |
| `chunking-boundaries` | diagram | fixed-size vs content-defined chunks before/after an insertion | Deep dive 1 |
| `upload-sequence` | sequence | hash → missing-blocks check → block uploads → commit | Deep dive 1 |
| `sync-sequence` | sequence | commit → journal → push hint → other device pulls changes since cursor | Deep dive 2 |
| `conflict-flow` | sequence/state | two offline edits; second commit's base is stale → conflicted copy | Deep dive 2 |
| `permission-graph` | diagram | relation tuples: user → group → folder → file inheritance | Deep dive 3 |
| `blob-storage-tiers` | architecture | hot replicated → warm erasure-coded volumes, cross-region | Deep dive 4 |
| `block-lifecycle` | state | uploaded → referenced → unreferenced → grace → swept | Deep dive 4 |
| `scaled-design` | architecture | multi-region, sharded metadata, notification tier | Scaling |

10 figures.

## Sources (verified reachable)

1. Google Drive API — Upload file data (resumable uploads, 256 KB chunks, one-week sessions). https://developers.google.com/workspace/drive/api/guides/manage-uploads
2. Google Drive API — Retrieve changes / `changes.getStartPageToken`. https://developers.google.com/workspace/drive/api/guides/manage-changes
3. Google Drive API — Notifications for resource changes (`changes.watch`). https://developers.google.com/workspace/drive/api/guides/push
4. Google Drive API — Usage limits (5 TB max file size). https://developers.google.com/workspace/drive/api/guides/limits
5. Google Drive Help — Check activity & file versions (30 days / 100 versions). https://support.google.com/drive/answer/2409045
6. Google Account Help — How your Google storage works (15 GB shared). https://support.google.com/accounts/answer/9312312
7. Pang et al. — Zanzibar: Google's Consistent, Global Authorization System. USENIX ATC 2019. https://www.usenix.org/conference/atc19/presentation/pang
8. Dropbox — Rewriting the heart of our sync engine (Nucleus). 2020. https://dropbox.tech/infrastructure/rewriting-the-heart-of-our-sync-engine
9. Dropbox — Streaming File Synchronization (4 MB blocks, SHA-256 blocklist). 2014. https://dropbox.tech/infrastructure/streaming-file-synchronization
10. Dropbox API — Content hash. https://docs.dropboxapi.com/dropbox-api/docs/technical-reference/content-hash
11. Dropbox — Inside the Magic Pocket. 2016. https://dropbox.tech/infrastructure/inside-the-magic-pocket
12. Dropbox — Broccoli: Syncing faster by syncing less. https://dropbox.tech/infrastructure/-broccoli--syncing-faster-by-syncing-less
13. Dropbox — Reintroducing Edgestore; Panda metadata store. https://dropbox.tech/infrastructure/reintroducing-edgestore · https://dropbox.tech/infrastructure/panda-metadata-stack-petabyte-scale-transactional-key-value-store
14. Muthitacharoen, Chen, Mazières — A Low-bandwidth Network File System (LBFS). SOSP 2001. https://pdos.csail.mit.edu/archive/lbfs/pubs.html
15. Xia et al. — FastCDC. USENIX ATC 2016. https://www.usenix.org/conference/atc16/technical-sessions/presentation/xia
16. Tridgell, Mackerras — The rsync algorithm. TR-CS-96-05, ANU, 1996. https://rsync.samba.org/tech_report/
17. Muralidhar et al. — f4: Facebook's Warm BLOB Storage System. OSDI 2014. https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar
18. Backblaze — Reed-Solomon erasure coding. https://www.backblaze.com/blog/reed-solomon/
19. Drago et al. — Inside Dropbox: Understanding Personal Cloud Storage Services. IMC 2012. https://dx.doi.org/10.1145/2398776.2398827

To verify while drafting: the cross-user dedup side-channel paper (Harnik, Pinkas, Shulman-Peleg, IEEE S&P magazine 2010) and Drive's 30-day trash policy page.

## Open questions for the author

1. **Title:** keep "Design Google Drive", or "Design a file storage and sync service" with Google Drive as the example? The first matches what readers search for.
2. **Chunking:** content-defined chunking on desktop + fixed 4 MB elsewhere (proposed), or fixed 4 MB everywhere (simpler, what Dropbox documents)?
3. **Scale:** 1B users / 200M DAU / 2 EB is a deliberately large target. Keep it, or size down (e.g. 100M users) to keep the numbers closer to a typical interview?
4. **Real-time co-editing** (Docs-style) stays out and gets its own future chapter. OK?
