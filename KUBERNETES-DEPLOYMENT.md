# Campus Service Request Management System — Kubernetes deployment

These manifests target the existing Docker Desktop single-node Kubernetes cluster and the public GHCR images:

- `ghcr.io/sdishtiyaqahmed/campus-backend:latest`
- `ghcr.io/sdishtiyaqahmed/campus-frontend:latest`

## 1. Prerequisites

- Docker Desktop Kubernetes is enabled and `kubectl get nodes` shows `Ready`.
- Both GHCR packages are public.
- Run PowerShell from the project root (the directory containing `docker-compose.yml`).
- Keep the Docker Compose deployment and its `mongodb_data` volume separate; Kubernetes creates its own PVC.

## 2. Create the namespace and configuration

```powershell
kubectl apply -f .\k8s\00-namespace.yaml
kubectl apply -f .\k8s\01-configmap.yaml
```

## 3. Create a Kubernetes JWT secret

Generate a fresh secret locally. This command does not print the secret:

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
$rng.Dispose()
kubectl create secret generic campus-secrets -n campus --from-literal=JWT_SECRET=$secret --dry-run=client -o yaml | kubectl apply -f -
Remove-Variable secret, bytes, rng
```

Do not commit this value or put it in a YAML file.

## 4. Deploy MongoDB, backend and frontend

```powershell
kubectl apply -f .\k8s\02-mongodb.yaml
kubectl rollout status deployment/mongodb -n campus --timeout=180s
kubectl apply -f .\k8s\03-backend.yaml
kubectl rollout status deployment/backend -n campus --timeout=180s
kubectl apply -f .\k8s\04-frontend.yaml
kubectl rollout status deployment/frontend -n campus --timeout=180s
```

## 5. Verify

```powershell
kubectl get all -n campus
kubectl get pvc -n campus
kubectl get events -n campus --sort-by=.lastTimestamp
```

Expected: MongoDB, backend and frontend Pods show `Running` and `READY 1/1`; the MongoDB PVC shows `Bound`.

## 6. Open the app

In a dedicated PowerShell window, keep this command running:

```powershell
kubectl port-forward service/frontend 8080:80 -n campus
```

Open <http://localhost:8080>. Nginx forwards `/api/` requests to the Kubernetes `backend` Service on port 5000.

To test the backend health endpoint directly, use another PowerShell window:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
```

## Troubleshooting

- `ImagePullBackOff`: verify the exact GHCR package names and public visibility; inspect `kubectl describe pod -n campus <pod-name>`.
- Backend `CrashLoopBackOff`: inspect `kubectl logs deployment/backend -n campus` and confirm the `campus-secrets` Secret exists.
- PVC `Pending`: run `kubectl get storageclass` and `kubectl describe pvc mongodb-data -n campus`.
- Frontend loads but API fails: inspect `kubectl logs deployment/frontend -n campus` and `kubectl logs deployment/backend -n campus`; confirm the frontend Nginx config proxies to `http://backend:5000`.

## Cleanup warning

`kubectl delete namespace campus` deletes all Kubernetes resources in this namespace, including the MongoDB PVC. Do not run it if you need the Kubernetes database data. The Kubernetes PVC is separate from the Docker Compose volume.
