# CHKP-Cloud-Firewall-Easy-Button

An interactive web wizard for generating ready-to-use [Check Point CloudGuard Network Security](https://registry.terraform.io/modules/CheckPointSW/cloudguard-network-security) Terraform configurations. Choose a cloud provider, pick a deployment module, fill in the required variables, and download a ZIP containing `main.tf`, `versions.tf`, and `README.md`.

Supported providers: **AWS · Azure · GCP · Alibaba Cloud · Nutanix · VMware**

---

## Architecture

```
browser (port 3000)
    └── React + Vite (nginx in Docker)
            │  /api/* proxy
    backend (port 3001)
        └── Node.js + Express
                └── Terraform Registry API (registry.terraform.io)
```

- The backend fetches module metadata (submodule list, variables) **live from the Terraform Registry** — no git clone required.
- API responses are cached in-memory for the lifetime of the process.

---

## Running with Docker (recommended)

**Prerequisites:** Docker Desktop installed and running.

```bash
# 1. Clone or download the project
cd CHKP-Cloud-Firewall-Easy-Button

# 2. Build and start both services
docker-compose up --build

# 3. Open in browser
open http://localhost:3000
```

To stop:
```bash
docker-compose down
```

---

## Running locally (development)

**Prerequisites:** Node.js 18+ and npm installed.

### Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:3001  (nodemon, auto-reload)
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:3000  (proxies /api → :3001)
```

Open `http://localhost:3000` in your browser.

---

## API Reference

All endpoints are mounted at `/api`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/providers` | List supported cloud providers |
| `POST` | `/clone` | `{ provider }` → fetch submodule list from Terraform Registry |
| `GET` | `/variables` | `?provider=&modulePath=` → return parsed variable list |
| `POST` | `/generate` | `{ provider, modulePath, moduleName, values }` → stream ZIP download |

---

## Module source versions

Module metadata is pulled from the Terraform Registry. Pinned versions (update in `backend/src/services/repoService.js` → `PROVIDER_VERSIONS`):

| Provider | Registry module | Version |
|----------|----------------|---------|
| AWS | `CheckPointSW/cloudguard-network-security/aws` | 1.0.11 |
| Azure | `CheckPointSW/cloudguard-network-security/azure` | 1.2.5 |
| GCP | `CheckPointSW/cloudguard-network-security/gcp` | 1.1.2 |
| Nutanix | `CheckPointSW/cloudguard-network-security/nutanix` | 1.0.3 |
| VMware | `CheckPointSW/cloudguard-network-security/vmware` | 1.0.2 |
| Alibaba | `CheckPointSW/cloudguard-network-security/alibaba` | 1.0.2 |

---

## Using the generated Terraform

The downloaded ZIP contains:

```
terraform-<provider>-<module>.zip
├── main.tf        # module block with your values
├── versions.tf    # terraform + provider version constraints
└── README.md      # quick-start instructions
```

```bash
unzip terraform-aws-gateway.zip -d my-infra
cd my-infra
terraform init
terraform plan
terraform apply
```

---

## Project structure

```
CHKP-Cloud-Firewall-Easy-Button/
├── backend/
│   ├── server.js
│   ├── Dockerfile
│   └── src/
│       ├── routes/api.js
│       └── services/
│           ├── repoService.js     # Terraform Registry API client + cache
│           ├── hclParser.js       # Maps registry inputs → form variables
│           └── fileGenerator.js  # Builds main.tf / versions.tf / README → ZIP
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── App.jsx                # 4-step wizard state machine
│       ├── App.css                # Cyberpunk theme
│       ├── api/client.js
│       └── components/
│           ├── ProgressBar.jsx
│           ├── ProviderSelect.jsx
│           ├── ModuleSelect.jsx
│           ├── VariableForm.jsx
│           └── DownloadStep.jsx
└── docker-compose.yml
```
