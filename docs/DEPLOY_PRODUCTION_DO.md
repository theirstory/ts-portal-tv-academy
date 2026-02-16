# Production Deployment on DigitalOcean Droplet

This guide is optimized for the fewest possible steps.

## Prerequisites

- Ubuntu 24.04 Droplet
- SSH access to the Droplet
- Your repository available on the Droplet

Recommended size: **4GB RAM minimum**.

## 1) Install minimal prerequisites on the Droplet

```bash
sudo apt update
sudo apt install -y git
```

## 2) Clone repository on the Droplet

```bash
git clone git@github.com:theirstory/ts-portal.git
cd ts-portal
```

## 3) Install Docker on the Droplet (one command)

Inside the repository:

```bash
sudo bash scripts/deploy/setup-docker-ubuntu.sh
```

What this script does:

- Installs Docker Engine + Docker Compose plugin
- Enables Docker service on boot
- Verifies installation

## 4) Start production stack (one command)

```bash
./scripts/deploy/deploy-prod.sh
```

What it does:

- Creates missing config/env files from examples
- Builds and starts production services

Default production services:

- `weaviate`
- `nlp-processor` (required for semantic search)
- `frontend`

## 5) Optional: move your already-indexed local Weaviate data to prod

Use this if you want to avoid re-running GLiNER/embedding import in production.

### 5.1 Export on local machine

Inside local repo:

```bash
./scripts/deploy/export-weaviate-data.sh "$PWD/weaviate-data.tar.gz" ts-portal_weaviate_data root@YOUR_DROPLET_IP /root/ts-portal
```

This command exports Weaviate data and uploads to the Droplet:
- `/tmp/weaviate-data.tar.gz`
- `config.json`
- `json/`
- `public/`

### 5.2 Restore on Droplet

Inside Droplet repo:

```bash
./scripts/deploy/restore-weaviate-data.sh /root/weaviate-data.tar.gz
./scripts/deploy/deploy-prod.sh
```

## 6) Verify

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml exec weaviate sh -lc "wget -qO- --header='Content-Type: application/json' --post-data='{\"query\":\"{ Aggregate { Testimonies { meta { count } } Chunks { meta { count } } } }\"}' http://localhost:8080/v1/graphql"
```

Open:

- `http://YOUR_DROPLET_IP:3000`

## Optional operations

Run schema+import manually only when needed:

```bash
docker compose -f docker-compose.prod.yml --profile init run --rm weaviate-init
```

Update deployment after `git pull`:

```bash
./scripts/deploy/deploy-prod.sh
```
