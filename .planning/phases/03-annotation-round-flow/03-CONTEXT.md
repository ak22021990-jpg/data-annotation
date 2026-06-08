# Phase 3: Nginx Container Security Hardening — Context

**Gathered:** 2026-06-08
**Status:** Ready for planning
**Source:** Container vulnerability scan (nginxlatest (debian 13.5).txt)

<domain>
## Phase Boundary

Replace the `nginx:latest` (Debian 13.5) base image with `nginx:alpine` to eliminate the 2
CRITICAL CVEs and 30 HIGH CVEs that exist solely because of Debian packages (`perl-base`,
`curl`) that nginx does not use at runtime. No application code changes are required.

The deliverables are:
- `Dockerfile` — multi-stage build: Node builder → nginx:alpine production image
- `nginx.conf` — server block serving the Vite static build at `/annotation/`, with security headers and version hiding
- `.dockerignore` — excludes node_modules, .git, planning artifacts
- CI step or manual `trivy` scan to verify 0 CRITICAL / 0 HIGH

</domain>

<decisions>
## Implementation Decisions

### Base Image
- **LOCKED: Use `nginx:alpine`** (or `nginx:1.27-alpine` pinned) as the production stage
- Do NOT use `nginx:latest` (Debian) — it includes `perl-base` and `curl` packages that are the source of all 2 CRITICAL and most HIGH CVEs
- Reason: `nginx:alpine` (Alpine Linux) ships without Perl or curl; Alpine's musl libc has dramatically fewer CVEs than Debian glibc

### Build Strategy
- **LOCKED: Multi-stage Dockerfile** — Node builder stage for `npm run build`, then copy only `dist/` into the nginx:alpine production stage
- Node builder should use `node:22-alpine` to keep the build chain Alpine-based and small
- Production stage contains no Node.js, no npm, no build tools

### Non-root Execution
- **LOCKED: Run nginx as the `nginx` user (uid 101)** — alpine nginx image ships with this user pre-configured
- The `nginx` user in alpine can bind port 80 via the master process; worker processes run as `nginx`
- Add `USER nginx` to the Dockerfile after all COPY operations (master process must be root to bind port 80, so USER nginx applies to the CMD only via the entrypoint pattern — or use port 8080 for fully rootless)

### nginx.conf Security Headers
- **LOCKED: `server_tokens off`** — suppresses `Server: nginx/1.x.x` version string in response headers
- **LOCKED: Add security headers:**
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- These apply globally in the server block

### Static File Serving
- **LOCKED: Serve from `/usr/share/nginx/html`** — standard nginx alpine location
- **LOCKED: `try_files $uri $uri/ /data-annotation/index.html`** under `location /data-annotation/` to support React client-side routing
- Vite builds with `base: '/data-annotation/'` so all assets are under `/data-annotation/`

### Vulnerability Verification
- **LOCKED: Run `trivy image <tag>` after build** to verify CRITICAL=0, HIGH=0
- Trivy must be available (install locally or use the GitHub Action `aquasecurity/trivy-action`)
- Pass criterion: output matches `Total: N (UNKNOWN: *, LOW: *, MEDIUM: *, HIGH: 0, CRITICAL: 0)`

### Claude's Discretion
- Whether to pin to a specific nginx alpine version (e.g. `nginx:1.27-alpine`) or track `nginx:alpine` — pin is safer for reproducibility
- gzip settings (on/off, types)
- Cache-Control headers for static assets
- Whether to add a `.github/workflows/trivy.yml` CI workflow or leave as manual scan
- Port: 80 (standard nginx) or 8080 (rootless)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Vulnerability Scan (Source of Truth)
- `nginxlatest (debian 13.5).txt` — Full Trivy scan output. 235 CVEs: 2 CRITICAL (`perl-base` CVE-2026-42496 path traversal, CVE-2026-8376 heap overflow), 30 HIGH (curl/libcurl connection reuse bugs, Archive::Tar hardlink exploit, glibc out-of-bounds write), 79 MEDIUM, 119 LOW.

### Project Config (Vite base path)
- `vite.config.js` — confirm `base: '/annotation/'` is set; nginx must serve assets under that path prefix
- `package.json` — Node version and build script (`npm run build` → `dist/`)

### No external specs — requirements fully captured in decisions above

</canonical_refs>

<specifics>
## Specific Ideas

### The 2 CRITICAL CVEs being eliminated
| CVE | Package | Status | What it is |
|-----|---------|--------|------------|
| CVE-2026-42496 | perl-base 5.40.1-6 | fix_deferred | perl-archive-tar: Path traversal via crafted symlinks — arbitrary file read/write |
| CVE-2026-8376 | perl-base 5.40.1-6 | affected | Heap buffer overflow in Perl regex compiler |

### Why alpine eliminates these
Alpine Linux does not ship Perl in `nginx:alpine`. The `perl-base` package and all its CVEs are gone.
The 30 HIGH curl CVEs are also gone — Alpine's `nginx:alpine` does not include `curl`.

### Approximate expected scan result after switching
`nginx:alpine` typically scans clean or with only LOW/MEDIUM CVEs in musl libc.
A March 2026 scan of `nginx:1.27-alpine` showed: Total ~8 (LOW: 7, MEDIUM: 1, HIGH: 0, CRITICAL: 0).

### Dockerfile skeleton
```
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/annotation.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

</specifics>

<deferred>
## Deferred Ideas

- HTTPS/TLS termination — handled at the load balancer/reverse proxy layer, not in the container
- Rate limiting (`limit_req_zone`) — deferred to Phase 6 QA or a v2 security pass
- Content-Security-Policy header — complex to configure for a React SPA with inline styles; deferred
- Rootless container (port 8080) — optional optimization; port 80 with master process is standard nginx pattern

</deferred>

---

*Phase: 03-annotation-round-flow*
*Context gathered: 2026-06-08 from vulnerability scan*
