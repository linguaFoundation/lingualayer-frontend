# LinguaLayer — Web application (Next.js / WhoPays-grade README)

**LinguaLayer Web** — showcase language communities, licensing paths, and royalty transparency for African and underrepresented language datasets on Stellar.

---

## 🎯 What is this app?

This Next.js app explains **who contributes data**, **how licenses work**, and **how royalties flow** back to communities. Dataset blobs stay off-chain; this UI surfaces **metadata, governance, and contributor UX**. Curator-only actions and payout-sensitive flows should ultimately call [`../backend/`](../backend/README.md) with authenticated sessions—not expose privileged keys in the bundle.

---

## ❓ Problems the **whole protocol** tackles

From the [root README](../../README.md):

- Most African languages are **underrepresented** in AI corpora, slowing equitable voice and text applications.
- Contributors rarely receive **ongoing compensation** when datasets are relicensed or models are commercialized.
- License terms are scattered across PDFs and emails—hard to **enforce** or audit.

---

## ✅ Goals this frontend supports

- Register datasets with **immutable provenance** and contributor share tables.
- Encode **license SKUs** (region, commercial use, model class) in `license-router`.
- Distribute **royalties** transparently via `royalty-splitter` as revenue arrives.
- Give communities **governance hooks** (curation, appeals, maintenance budgets).

---

## 💡 Why a dedicated **Next.js** frontend?

- **Community trust**: Language stewards need a clear story before they contribute.
- **Buyer journey**: NLP labs discover SKUs, pricing, and legal posture through `/licensing` and `/docs`.
- **Transparency**: `/royalties` becomes the receipt rail communities compare against on-chain splits.

---

## ✨ Features & surfaces (shipping roadmap)

- **🏠 Landing + site map** — route backlog visible on `/`.
- **🌍 Communities** — onboarding narrative for language circles (`/communities`).
- **📜 Licensing** — buyer-facing explanation of license layers (`/licensing`).
- **💸 Royalties** — dashboards-as-story for payout transparency (`/royalties`).
- **⚖️ Governance** — council/moderation overview (`/governance`).
- **📚 Docs hub** — curator handbook links (`/docs`).

---

## 🏗️ Architecture

| Layer | Choice |
| ----- | ------ |
| Framework | **Next.js 15** — App Router, React 19 |
| Language | **TypeScript** (strict) |
| Styling | **CSS variables** in `app/globals.css` — protocol-specific palette |
| Components | `components/expected-pages.tsx` — **site map table** synced with [`docs/SITE_MAP.md`](../../docs/SITE_MAP.md) |
| Data | Static/scaffold today → Server Components + [`../backend/`](../backend/README.md) for authenticated flows |
| Blockchain UX | Wallet demos optional — **RPC/signing secrets stay off this bundle** |

---

## 📁 Project structure

```
apps/web/
├── app/
│   ├── layout.tsx       # Shell: metadata + nav links
│   ├── page.tsx         # Landing + <ExpectedPages /> site map
│   ├── globals.css      # Design tokens / theme
│   └── …                # Feature routes (see route tables below)
├── components/
│   └── expected-pages.tsx
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md            # ← you are here
```

---

## 🗺️ Routes

### Header navigation

| Route | Label | Notes |
| ----- | ----- | ----- |
| `/communities` | Communities | Primary navigation |
| `/licensing` | Licensing | Primary navigation |
| `/royalties` | Royalties | Primary navigation |
| `/governance` | Governance | Primary navigation |
| `/roadmap` | Roadmap | Primary navigation |
| `/docs` | Docs | Primary navigation |

### Full backlog (canonical)

Authoritative **purpose + status**: [`../../docs/SITE_MAP.md`](../../docs/SITE_MAP.md).

| Route | Purpose | Status |
| ----- | ------- | ------ |
| `/` | Landing + site map | Scaffold * |
| `/communities` | Language community onboarding | Planned |
| `/licensing` | Buyer flows and license SKUs | Planned |
| `/royalties` | Payout transparency dashboard | Planned |
| `/governance` | Council and moderation policy | Planned |
| `/roadmap` | Delivery milestones | Scaffold * |
| `/docs` | Contributor and curator handbook | Scaffold * |

The **Expected pages** section on **`/`** mirrors this table so visitors see delivery honesty without opening GitHub.

---

## 🚀 Quick start

### Prerequisites

- **Node.js** 20.x or **22.x** (LTS)
- npm (pnpm/yarn OK if your org standardizes)

### Install & run (dev)

```bash
cd apps/web
npm install
npm run dev
```

Open **http://localhost:3000**

### Run **with** the API (integration dev)

```bash
# Terminal A — backend
cd ../backend && npm install && cp .env.example .env && npm run dev

# Terminal B — web (this folder)
cd ../web && npm run dev
```

Match [`../backend/README.md`](../backend/README.md) CORS origin ↔ Next origin.

---

## 📜 Available scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Dev server + hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve production output |
| `npm run lint` | ESLint (`next/core-web-vitals`) |

---

## 🔐 Environment variables

### Baseline

Static scaffold needs **no secrets**. Use `.env.local` (gitignored) for optional public config.

### Planned **browser-safe** vars (`NEXT_PUBLIC_*` only)

Never put private keys or RPC URLs here.

| Variable | Example | Purpose |
| -------- | ------- | ------- |
| `NEXT_PUBLIC_NETWORK` | `testnet` | Displayed network badge. |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8080` | API base for authenticated flows. |

---

## 🔗 Integration contract

- **REST**: Call [`apps/backend`](../backend/README.md) under `/api/v1/*` from Route Handlers or authenticated clients—never ship server secrets to `NEXT_PUBLIC_*`.
- **Soroban**: Demonstrate wallet flows with **test keys** only; production signing patterns belong in backend or secure wallets.
- **Contracts**: Rules live in [`../../contracts/`](../../contracts/) — UI reflects state via Horizon/indexers/backend.

---

## 🧪 Testing & quality gates

```bash
npm run lint
npm run build
```

Fix all ESLint + TypeScript errors before merging.

---

## 🚢 Deployment (e.g. Vercel / Netlify / Cloudflare Pages)

1. Set **build command**: `npm run build`
2. Set **output**: Next.js default (`.next`)
3. Configure **`NEXT_PUBLIC_*`** env vars per environment
4. Point **`NEXT_PUBLIC_BACKEND_URL`** at your deployed API
5. Enable **preview deployments** for grant demo links

---

## 🤝 Contributing

See [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md). UI changes should stay aligned with [`../../docs/SITE_MAP.md`](../../docs/SITE_MAP.md).

---

## 📄 License

Match repository license (Apache-2.0 common for OSS grants).

---

## 📞 Support & docs

| Resource | Link |
| -------- | ---- |
| Monorepo overview | [`../../README.md`](../../README.md) |
| Backend API | [`../backend/README.md`](../backend/README.md) |
| Site map | [`../../docs/SITE_MAP.md`](../../docs/SITE_MAP.md) |
| Layout plan | [`../../docs/layout-plan.md`](../../docs/layout-plan.md) |
| Milestones → issues | [`../../docs/milestones-issues.md`](../../docs/milestones-issues.md) |

---

**npm package:** `lingualayer-web` · **Slug:** `lingualayer` · **Stack:** Next.js App Router

**Ship it.** 🚀
