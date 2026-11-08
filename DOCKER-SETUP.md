# Local Docker setup

## Prerequisites

- Docker Desktop with the Docker Engine running
- Docker Compose v2 (`docker compose`)

## Configure the JWT secret (PowerShell)

From the repository root, copy the example environment file and generate a local secret:

```powershell
Copy-Item .env.example .env
$bytes = New-Object byte[] 48
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
"JWT_SECRET=$secret" | Set-Content -Path .env -Encoding ASCII -NoNewline
$rng.Dispose()
```

Keep `.env` private. It is excluded by the root `.gitignore`; do not commit it or share its contents.

## Build and start the application

Run these commands from the directory containing `docker-compose.yml`:

```powershell
docker compose config
docker compose up --build -d
docker compose ps
```

The first command validates the resolved Compose configuration and confirms that `JWT_SECRET` is set. The stack starts MongoDB first, waits for its health check, then starts the API and waits for its health check before starting Nginx.

Open the application at <http://localhost:8080>.

The API health endpoint is <http://localhost:8080/api/v1/health>.

## Useful troubleshooting commands

```powershell
docker compose logs -f
docker compose logs -f backend
docker compose ps
docker compose down
```

To stop the containers while preserving MongoDB data, use `docker compose down`. Do **not** add `-v` unless you intentionally want to delete the MongoDB data volume.

To rebuild after changing application code:

```powershell
docker compose up --build -d
```
