# Deploy the BRIDGE Flow backend (GHCR image + VPS)

This stands up the backend server (GraphQL API, AI/Copilot, sync) that the
Cloudflare-hosted frontend talks to. Without it the app is local-only.

High-level: **build the image in GitHub Actions → push to GHCR → run it on a VPS
with Postgres + Redis via Docker Compose.**

---

## 1. Build the server image (GitHub Actions → GHCR)

1. The workflow file is `.github/workflows/build-server-image.yml`. Pushing it
   needs the `workflow` token scope — if `git push` was rejected, add it via the
   GitHub **web UI**: repo → **Add file → Create new file**, name it
   `.github/workflows/build-server-image.yml`, paste the contents, commit.
2. Go to the repo's **Actions** tab → **Build Server Image (GHCR)** → **Run
   workflow**. It builds the Rust native module, the server, and the frontends,
   then pushes `ghcr.io/4waiz/bridge-flow:latest`. (Takes a while; AFFiNE-based
   builds are heavy. If a step fails, send me the failing log and I'll fix it.)
3. After the first successful run, make the image pullable: GitHub → your
   profile → **Packages** → `bridge-flow` → **Package settings** → **Change
   visibility → Public** (or keep private and log the VPS into GHCR).

---

## 2. Get a VPS

Any Ubuntu 22.04+ box with ~2 GB RAM works (Hetzner CX22 ~€4/mo, or DigitalOcean
$6/mo droplet). Note its public IP. SSH in.

Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
```

---

## 3. Configure and run

On the VPS:

```bash
# get the deploy files
mkdir -p ~/bridge && cd ~/bridge
# copy compose.yml, .env, config.json into this folder (see below)

mkdir -p ~/.bridgeflow/self-host/config
```

Create these three files in `~/bridge`:

- **compose.yml** — copy from the repo's `.docker/selfhost/compose.yml`
- **.env** — copy from `.docker/selfhost/.env.example` and set:
  - `DB_PASSWORD=` a strong password
  - `BRIDGEFLOW_SERVER_HTTPS=true` and `BRIDGEFLOW_SERVER_EXTERNAL_URL=https://api.yourdomain.com` (your backend's public URL)
- **config.json** — copy `.docker/selfhost/config.example.json` to
  `~/.bridgeflow/self-host/config/config.json` and paste your real OpenAI key in
  `copilot.providers.openai.apiKey`. **This file holds the secret — keep it off
  git.**

If the GHCR package is private, first: `docker login ghcr.io -u 4waiz` (use a
GitHub Personal Access Token with `read:packages` as the password).

Start it:

```bash
docker compose --env-file .env up -d
docker compose logs -f bridgeflow   # watch it boot; Ctrl+C to stop watching
```

The migration container runs first and sets up the database, then the server
starts on the port in `.env` (default 3010).

---

## 4. Put it behind HTTPS

Point a subdomain (e.g. `api.yourdomain.com`) at the VPS IP, then put a reverse
proxy with automatic TLS in front (Caddy is easiest):

```bash
# /etc/caddy/Caddyfile
api.yourdomain.com {
  reverse_proxy localhost:3010
}
```

Now the backend is reachable at `https://api.yourdomain.com`.

---

## 5. Point the frontend at the backend

The Cloudflare frontend currently runs local-only. To make it use this backend,
its server base URL must point at `https://api.yourdomain.com` instead of its own
origin. Tell me your backend URL and I'll wire the frontend to it and redeploy
Pages (`deploy-web.ps1`).

---

## Cost summary
- GHCR image build: free (GitHub Actions).
- VPS: ~€4–6/mo.
- OpenAI: pay-per-use on your key.
