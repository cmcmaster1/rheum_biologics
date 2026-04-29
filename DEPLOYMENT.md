# DigitalOcean Sydney Deployment

This deployment runs the app on a single DigitalOcean Droplet in `syd1` using Docker Compose:

- Caddy terminates HTTPS and proxies traffic.
- The frontend is built once and served by nginx.
- The backend runs the Express API and PBS ingestion scheduler.
- PostgreSQL runs on the same VM with a persistent Docker volume.

## Droplet

Create an Ubuntu LTS Droplet in **Sydney, Australia (`syd1`)**.

Recommended starting size: **2 vCPU / 4 GB RAM**. A smaller 1 GB droplet is likely tight for Node builds, PostgreSQL, and ingestion.

Open only:

- `22/tcp` for SSH, ideally restricted to your IP.
- `80/tcp`
- `443/tcp`

## Server Setup

Install Docker:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git ufw
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
```

Log out and back in after adding your user to the `docker` group.

Configure the firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Deploy

Clone the repo and configure env:

```bash
git clone https://github.com/cmcmaster1/rheum_biologics.git
cd rheum_biologics
cp .env.digitalocean.example .env
nano .env
```

Set long random values for `POSTGRES_PASSWORD`, `ANALYTICS_SALT`, and
`ANALYTICS_ADMIN_TOKEN`. The analytics token is required to read aggregate
analytics from `/api/analytics/summary`.

Make sure DNS for `SITE_DOMAIN` points to the Droplet IPv4 address before starting Caddy.
For `www`, either add a CNAME to the apex domain or an A record to the same Droplet IPv4 address.

Start the stack:

```bash
docker compose --env-file .env -f docker-compose.digitalocean.yml up -d --build
```

Check health:

```bash
docker compose --env-file .env -f docker-compose.digitalocean.yml ps
curl -fsS https://$SITE_DOMAIN/health
```

Check aggregate analytics after traffic starts:

```bash
curl -H "x-analytics-token: $ANALYTICS_ADMIN_TOKEN" \
  "https://$SITE_DOMAIN/api/analytics/summary?days=30"
```

Run initial ingestion:

```bash
docker compose --env-file .env -f docker-compose.digitalocean.yml exec backend npm run ingest:run:prod
```

## Updates

```bash
git pull
docker compose --env-file .env -f docker-compose.digitalocean.yml up -d --build
docker image prune -f
```

## Backups

Run a manual backup:

```bash
./scripts/backup-postgres.sh
```

Install a daily backup cron:

```bash
crontab -e
```

Add:

```cron
15 3 * * * cd /home/ubuntu/rheum_biologics && ./scripts/backup-postgres.sh >> ./backups/backup.log 2>&1
```

For production, sync `./backups/postgres` off the Droplet using DigitalOcean Spaces, Backblaze B2, or another offsite target.

## Restore

```bash
set -a
source .env
set +a
gunzip -c backups/postgres/rheum_biologics_YYYYMMDDTHHMMSSZ.sql.gz | \
  docker compose --env-file .env -f docker-compose.digitalocean.yml exec -T postgres \
  psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```
