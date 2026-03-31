# One-Host Docker Compose Deployment

This guide deploys the full backend stack on one Linux VM and keeps the frontend on Vercel.

For now, you can use the VM public IP directly and skip domain/DNS setup. Once you buy a domain later, you can enable the optional Caddy HTTPS profile.

## Recommended Host

- OS: Ubuntu 22.04 or 24.04 LTS
- Size: 2 vCPU / 4 GB RAM minimum
- Providers: Hetzner CX22, DigitalOcean Basic 4 GB, AWS EC2 `t3.medium`
- Temporary option: use `http://YOUR_VM_IP:9191`
- Later option: point `api.yourdomain.com` to the VM public IP

For this repository, one VM is the fastest production path because Eureka, Kafka, MySQL, and the Spring services can stay on one private Docker network.

## Files Used

- `docker-compose.backend.yml`
- `deploy/Caddyfile`
- `deploy/backend.env.example`

## What This Stack Runs

- `mysql`
- `zookeeper`
- `kafka`
- `discovery-server`
- `auth-service`
- `article-service`
- `user-service`
- `version-control-service`
- `workflow-service`
- `api-gateway`
- `caddy` only when you enable the optional `domain` profile

This production stack intentionally skips:

- `frontend` because Vercel hosts the UI
- ELK because it increases memory usage and is not required for first production launch

## 1. Prepare The VM

SSH into the server:

```bash
ssh root@your-server-ip
```

Install Docker Engine and the Compose plugin:

```bash
apt-get update
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git
systemctl enable docker
systemctl start docker
```

## 2. Clone The Repository

```bash
git clone https://github.com/manishasahu271/Collaborative-Article-Editing.git
cd Collaborative-Article-Editing
git checkout main
```

## 3. Create The Production Env File

```bash
cp deploy/backend.env.example deploy/backend.env
nano deploy/backend.env
```

For VM-IP-only deployment, you only need:

```env
MYSQL_ROOT_PASSWORD=replace-with-a-strong-password
```

Optional values for later if you buy a domain and want HTTPS:

```env
API_DOMAIN=api.yourdomain.com
ACME_EMAIL=you@example.com
```

## 4. Start The Backend Stack

For the temporary VM-IP path:

```bash
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml up -d --build
```

This starts `api-gateway` on:

```text
http://YOUR_VM_IP:9191
```

## 5. Optional Domain Setup Later

Create an `A` record:

- Host: `api`
- Value: your VM public IPv4 address

Wait until DNS resolves before starting Caddy, otherwise HTTPS certificate issuance will fail.

To enable HTTPS later:

```bash
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml --profile domain up -d --build
```

Check container status:

```bash
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml ps
```

Follow logs if a service is not healthy:

```bash
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml logs -f discovery-server
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml logs -f api-gateway
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml logs -f auth-service
```

## 6. Verify Service Startup Order

Expect this order:

1. `mysql`
2. `zookeeper`
3. `kafka`
4. `discovery-server`
5. all Spring services
6. `api-gateway`
7. `caddy` only if using the `domain` profile

Useful checks:

```bash
curl http://localhost:9191/auth/token
curl http://YOUR_VM_IP:9191/auth/token
```

If you want to inspect Eureka from inside the VM:

```bash
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml exec discovery-server wget -qO- http://localhost:8761
```

## 6. Connect Vercel

In Vercel, set:

```env
VITE_API_BASE_URL=http://YOUR_VM_IP:9191
```

Apply it to:

- Production
- Preview

Then redeploy the frontend.

Later, after you buy a domain and enable Caddy, change it to:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 7. Validate CORS And Login

From your local machine, test preflight:

```bash
curl -i -X OPTIONS "http://YOUR_VM_IP:9191/auth/token" \
  -H "Origin: https://your-vercel-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
```

Expected result:

- status `200` or `204`
- no `403`

Then test in the browser:

1. Register a user
2. Sign in
3. Create an article
4. Assign editor / reviewer
5. Approve or reject an article

## 8. Day-2 Commands

Update after pulling new commits:

```bash
git pull origin main
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml up -d --build
```

Restart one service:

```bash
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml restart api-gateway
```

Stop the stack:

```bash
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml down
```

Stop without deleting MySQL data:

- Safe: `down`
- Data is preserved in the named Docker volume `mysql-data`

## 9. Production Notes

- For the temporary VM-IP path, `api-gateway` is exposed publicly on `9191`.
- After moving to a real domain, use the `domain` profile so `caddy` handles `80/443`.
- All application services stay on the internal `backend` network.
- The compose file keeps the current microservice topology unchanged, so no app code changes are required to run on one host.
- ELK can be added later from the original `docker-compose.yml` if you need centralized logs.
