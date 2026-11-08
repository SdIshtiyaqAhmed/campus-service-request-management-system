# Campus Service Request Management System

A web-based platform for managing campus service requests, built with React, Node.js, Express, and MongoDB. The project demonstrates containerization, automated CI/CD, container image publishing, and Kubernetes orchestration.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Enabled-326CE5?logo=kubernetes&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [GitHub Container Registry](#github-container-registry)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Verification](#verification)
- [Environment Variables](#environment-variables)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Project Overview

The Campus Service Request Management System provides a centralized platform for handling campus-related service requests.

The system is designed to simplify communication between students, staff, and administrators by providing a structured process for submitting, assigning, tracking, and managing service requests.

The project also demonstrates a complete DevOps workflow:

1. Application development using React and Node.js.
2. Database integration using MongoDB.
3. Containerization using Docker.
4. Multi-container orchestration using Docker Compose.
5. Automated code quality checks and testing using GitHub Actions.
6. Docker image publishing using GitHub Container Registry (GHCR).
7. Application deployment using Kubernetes.

## Features

### Application Features

- User registration and authentication.
- Role-based access control.
- Campus service request submission.
- Service request tracking and management.
- Request status updates.
- Request comments and communication.
- Administrative management of users and requests.

### DevOps Features

- Separate Docker images for frontend and backend.
- Docker Compose orchestration.
- MongoDB container with persistent storage.
- GitHub Actions continuous integration.
- Automated linting and testing.
- Automated frontend production build.
- Docker image publishing to GHCR.
- Kubernetes Deployments and Services.
- Kubernetes ConfigMaps and Secrets.
- PersistentVolumeClaim for MongoDB.
- Container health checks and Kubernetes probes.

---

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19, Vite |
| Backend | Node.js, Express |
| Database | MongoDB 8 |
| Database ODM | Mongoose |
| Authentication | JWT |
| Containerization | Docker |
| Container Orchestration | Docker Compose |
| CI/CD | GitHub Actions |
| Container Registry | GitHub Container Registry |
| Deployment | Kubernetes |
| Web Server | Nginx |
| Testing | Jest, Supertest, Vitest |
| Code Quality | ESLint |

---

## System Architecture

### Application Architecture

```text
              USERS
                |
                v
         REACT FRONTEND
                |
              NGINX
                |
                v
         NODE.JS BACKEND
           (Express API)
                |
                v
             MONGODB
                |
                v
        PERSISTENT STORAGE
```

### DevOps Architecture

```text
             GITHUB REPOSITORY
                     |
                     v
              GITHUB ACTIONS
                     |
          +----------+----------+
          |                     |
          v                     v
     BACKEND CI             FRONTEND CI
          |                     |
          +----------+----------+
                     |
              CI SUCCESSFUL
                     |
                     v
              DOCKER BUILDS
                     |
                     v
             GITHUB CONTAINER
                 REGISTRY
                  (GHCR)
                     |
                     v
              KUBERNETES
                 CLUSTER
                     |
          +----------+----------+
          |          |          |
          v          v          v
       FRONTEND    BACKEND    MONGODB
         POD        POD        POD
          |          |          |
          +----------+----------+
                     |
              PERSISTENT VOLUME
```

---

## Repository Structure

```text
campus-service-request-management-system/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── k8s/
│   ├── 00-namespace.yaml
│   ├── 01-configmap.yaml
│   ├── 02-mongodb.yaml
│   ├── 03-backend.yaml
│   └── 04-frontend.yaml
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── DOCKER-SETUP.md
├── KUBERNETES-DEPLOYMENT.md
└── README.md
```

---

## Getting Started

### Prerequisites

Install the following tools:

- Node.js 22 or later.
- npm.
- Docker Desktop.
- Docker Compose v2.
- Kubernetes-enabled Docker Desktop (for local Kubernetes deployment).
- kubectl.
- GitHub account (for CI/CD and GHCR).

### Clone the Repository

```bash
git clone https://github.com/SdIshtiyaqAhmed/campus-service-request-management-system.git

cd campus-service-request-management-system
```

### Configure Environment Variables

Copy the example environment file.

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Generate a secure JWT secret:

```powershell
$bytes = New-Object byte[] 48
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

"JWT_SECRET=$secret" | Set-Content .env -Encoding ASCII -NoNewline

$rng.Dispose()
Remove-Variable secret, bytes, rng
```

Keep the `.env` file private. Never commit it to GitHub.

---

## Docker Deployment

The application uses Docker Compose to orchestrate the frontend, backend, and MongoDB containers.

### Build and Start Containers

```powershell
docker compose up --build -d
```

### Check Container Status

```powershell
docker compose ps
```

### Access the Application

| Component | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend Health Check | http://localhost:8080/api/v1/health |

### View Logs

```powershell
docker compose logs -f
```

View individual service logs:

```powershell
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb
```

### Stop Containers

```powershell
docker compose down
```

MongoDB data is retained in the Docker Compose named volume when using this command.

Avoid `docker compose down -v` unless you intentionally want to delete the database volume.

For detailed Docker instructions, see [DOCKER-SETUP.md](DOCKER-SETUP.md).

---

## CI/CD Pipeline

GitHub Actions automates code validation, testing, frontend production builds, and container image publishing.

Workflow configuration:

```text
.github/workflows/ci.yml
```

### Continuous Integration

The pipeline contains separate backend and frontend validation jobs.

**Backend CI**

1. Check out the repository.
2. Set up Node.js 22.
3. Install dependencies using `npm ci`.
4. Run ESLint.
5. Execute backend tests.

**Frontend CI**

1. Check out the repository.
2. Set up Node.js 22.
3. Install dependencies using `npm ci`.
4. Run ESLint.
5. Execute frontend tests.
6. Generate the production build.

### Container Publishing

After successful CI jobs, GitHub Actions publishes the backend and frontend Docker images to GHCR.

The publishing workflow uses GitHub Actions `GITHUB_TOKEN` with package write permissions.

---

## GitHub Container Registry

The project uses GitHub Container Registry (GHCR) to store Docker images.

### Published Images

| Component | Image |
|---|---|
| Backend | `ghcr.io/sdishtiyaqahmed/campus-backend` |
| Frontend | `ghcr.io/sdishtiyaqahmed/campus-frontend` |

Images are published with:

- `latest`
- `sha-<commit-sha>`

### Pull Images

```powershell
docker pull ghcr.io/sdishtiyaqahmed/campus-backend:latest

docker pull ghcr.io/sdishtiyaqahmed/campus-frontend:latest
```

The packages are configured for public access.

---

## Kubernetes Deployment

The Kubernetes manifests are maintained in the `k8s/` directory.

The application is deployed to a local Kubernetes cluster using Docker Desktop Kubernetes.

### Kubernetes Resources

| Resource | Name | Purpose |
|---|---|---|
| Namespace | campus | Application isolation |
| ConfigMap | campus-config | Application configuration |
| Secret | campus-secrets | JWT signing secret |
| Deployment | mongodb | MongoDB database |
| Deployment | backend | Backend API |
| Deployment | frontend | Frontend application |
| Service | mongodb | Database communication |
| Service | backend | Backend communication |
| Service | frontend | Frontend access |
| PVC | mongodb-data | Persistent database storage |

### Step 1: Verify Kubernetes

Enable Kubernetes in Docker Desktop.

```powershell
kubectl config current-context
kubectl get nodes
```

The Docker Desktop Kubernetes node should report `Ready`.

### Step 2: Create Namespace

```powershell
kubectl apply -f .\k8s\00-namespace.yaml
```

### Step 3: Apply ConfigMap

```powershell
kubectl apply -f .\k8s\01-configmap.yaml
```

### Step 4: Create Kubernetes Secret

Generate a fresh JWT secret:

```powershell
$bytes = New-Object byte[] 48
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
$rng.Dispose()

kubectl create secret generic campus-secrets -n campus --from-literal=JWT_SECRET=$secret --dry-run=client -o yaml | kubectl apply -f -

Remove-Variable secret, bytes, rng
```

The secret is stored in Kubernetes and is not committed to GitHub.

### Step 5: Deploy MongoDB

```powershell
kubectl apply -f .\k8s\02-mongodb.yaml

kubectl rollout status deployment/mongodb -n campus --timeout=180s
```

### Step 6: Deploy Backend

```powershell
kubectl apply -f .\k8s\03-backend.yaml

kubectl rollout status deployment/backend -n campus --timeout=180s
```

### Step 7: Deploy Frontend

```powershell
kubectl apply -f .\k8s\04-frontend.yaml

kubectl rollout status deployment/frontend -n campus --timeout=180s
```

### Step 8: Access the Application

Forward the frontend service to a local port:

```powershell
kubectl port-forward service/frontend 8081:80 -n campus
```

Keep the terminal running.

Open:

http://localhost:8081

For detailed deployment instructions, see [KUBERNETES-DEPLOYMENT.md](KUBERNETES-DEPLOYMENT.md).

---

## Verification

### Check Kubernetes Resources

```powershell
kubectl get all -n campus
```

### Check Persistent Storage

```powershell
kubectl get pvc -n campus
```

The MongoDB PVC should show `Bound`.

### Check Application Logs

```powershell
kubectl logs deployment/backend -n campus

kubectl logs deployment/frontend -n campus

kubectl logs deployment/mongodb -n campus
```

### Test Backend Health

```powershell
Invoke-RestMethod http://localhost:8081/api/v1/health
```

Expected response:

```text
success: True
message: Campus Service Management API is running
```

### Expected Deployment State

| Component | Expected Status |
|---|---|
| MongoDB Pod | Running |
| Backend Pod | Running |
| Frontend Pod | Running |
| MongoDB Deployment | 1/1 Available |
| Backend Deployment | 1/1 Available |
| Frontend Deployment | 1/1 Available |
| MongoDB PVC | Bound |

---

## Environment Variables

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key used for JWT signing |
| `NODE_ENV` | Application environment |
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |

The `.env.example` file contains the environment variable template.

Never commit actual credentials or production secrets.

---

## Security Considerations

- JWT-based authentication.
- Role-based access control.
- Password hashing.
- Environment-based secret configuration.
- Kubernetes Secrets for JWT configuration.
- GitHub Actions token-based GHCR authentication.
- `.gitignore` excludes local environment files and generated dependencies.

For production deployment, use appropriately managed secrets, HTTPS, database backups, and restricted network access.

---

## Troubleshooting

### Pod Not Starting

```powershell
kubectl get pods -n campus

kubectl describe pod <pod-name> -n campus
```

### Backend CrashLoopBackOff

```powershell
kubectl logs deployment/backend -n campus
```

Check MongoDB connectivity and the Kubernetes Secret.

### ImagePullBackOff

Verify:

- GHCR package visibility.
- Image names in Kubernetes manifests.
- Image tags.
- Registry permissions.

### MongoDB PVC Pending

```powershell
kubectl get pvc -n campus

kubectl get storageclass

kubectl describe pvc mongodb-data -n campus
```

### Port Already in Use

Use a different local port:

```powershell
kubectl port-forward service/frontend 8082:80 -n campus
```

### Stop Port Forwarding

Press `Ctrl + C` in the terminal running the port-forward command.

The Kubernetes workloads continue running.

### Remove Kubernetes Deployment

```powershell
kubectl delete namespace campus
```

**Warning:** This deletes the namespace and its resources, including the MongoDB PVC. Database data may be permanently lost.

---

## Future Improvements

- Automated deployment to a remote Kubernetes cluster.
- Ingress controller and HTTPS configuration.
- Monitoring and centralized logging.
- Database backup and recovery automation.
- Horizontal pod autoscaling.
- Resource optimization.
- Additional integration and end-to-end testing.

---

## Author

**Syed Ishtiyaq Ahmed**

M.Tech – Computer Science and Engineering  
SR University

**GitHub:** [SdIshtiyaqAhmed](https://github.com/SdIshtiyaqAhmed)

**Project Repository:** [Campus Service Request Management System](https://github.com/SdIshtiyaqAhmed/campus-service-request-management-system)

---

## License

This project is developed for academic and educational purposes.
