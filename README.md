# PlaybackSpace 🎥

[![PlaybackSpace Demo](/assets/UI_1.png)](https://www.youtube.com/watch?v=018ZpQAmcx8)


**A production-grade, DevOps-heavy Video Distribution Platform built on the MERN Stack.**

**PlaybackSpace** is a high-performance media application designed to simulate a modern streaming environment (like YouTube). Users can upload content, build communities through tweets and playlists, and track their engagement via analytics.

Unlike standard web apps, **PlaybackSpace is built on a "DevOps-First" architecture**. The entire infrastructure is automated using Terraform, containerized with Docker, orchestrated via AWS EKS, and monitored using Prometheus & Grafana.

## 📑 Table of Contents

- Architecture & Design
- Tech Stack
- Folder Structure
- User Interface (UI)
- Infrastructure & Pipeline
- Getting Started
- API Endpoints

## 🏗 Architecture & Design

### 1. System Architecture
High-level overview of the MERN stack and Microservices components.

![System Architecture Diagram](/assets/Playback%20Space%20Architecture%20Diagram.png)

### 2. Database Design

Schema design showing relationships between Users, Videos, Tweets, and Playlists.

![Database Diagram](/assets/DB%20Diagram.png)

### 3. Cloud Deployment

Deployment Flow Diagram

![Deployment Diagram](/assets/Deployment%20Flow%20Diagram.png)

---

### How pipeline will look after deployment:

#### CI pipeline to build and push

![](/assets/CI%20Pipeline.png)

#### CD pipeline to update application version

![](/assets/CD%20Pipeline.png)

#### ArgoCD application for deployment on EKS

![](/assets/ArgoCD%20Application.png)

---

## 🛠 Tech Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS | User Interface & State Management |
| **Backend** | Node.js, Express.js | API & Business Logic |
| **Media Storage** | Cloudinary | Store images & videos |
| **Database** | MongoDB, Mongoose | Data Persistence & Aggregations |
| **DevOps** | Docker, Kubernetes (EKS) | Containerization & Orchestration |
| **CI/CD** | Jenkins, ArgoCD | Automated Building, Testing & Deployment |
| **Monitoring** | Prometheus, Grafana | Metrics & Visualization |
| **IaC** | Terraform, eksctl | Infrastructure Provisioning |

## 📂 Folder Structure

```
playback-space/
├── backend/                # Node.js & Express API
│   ├── src/                # Core logic (Controllers, Models, Routes)
│   ├── tests/              # Unit & Integration tests (Jest)
│   └── Dockerfile          # Backend containerization
├── client/                 # React.js frontend (Vite)
│   ├── src/                # UI Components & Pages
│   └── Dockerfile          # Frontend containerization
├── kubernetes/             # K8s Deployment & Service manifests
├── terraform/              # IaC for AWS VPC, EC2, and Security Groups
│   └── modules/            # Reusable Infrastructure modules
├── GitOps/                 # GitOps workflow configurations
├── docker-compose.yml      # Multi-container orchestration for local dev
└── Jenkinsfile             # CI/CD pipeline definition
```

## 💻 User Interface (UI)
The frontend is built with React.js and styled for a modern, responsive user experience.

![](/assets/UI_1.png)

![](/assets/UI_2.png)

![](/assets/UI_3.png)

![](/assets/UI_4.png)

![](/assets/UI_5.png)

![](/assets/UI_6.png)

![](/assets/UI_7.png)

## ♾️ Infrastructure & Pipeline

### 1. Infrastructure as Code (Terraform)

Automated provisioning of the cloud environment.

* Final Terraform Apply
* AWS EC2 Instances

![](/assets/terraform%20apply.png)

![](/assets/aws%20instances.png)

### 2. CI/CD & Security (Jenkins, SonarQube, Trivy)
The pipeline handles automated testing and multi-layer security scanning.

* Build Pipeline
* Quality Gate
* Vulnerability Scan

![](/assets/CI%20Pipeline.png)

![](/assets/CD%20Pipeline.png)

![](/assets/sonar%20scan.png)

### 3. Orchestration & GitOps (EKS & ArgoCD)
Production-grade deployment using Kubernetes.

Cluster Verification
ArgoCD Sync

![](/assets/clusters.png)

![](/assets/ArgoCD.png)

![](/assets/ArgoCD%20Application.png)

### 4. Monitoring & Notifications (Prometheus, Grafana, Email)

* Real-time observability and automated alerts.
* Metrics: Prometheus & Grafana dashboards for cluster health.
* Alerting: Automated build status notifications sent via Email.

![](/assets/Grafana%201.png)

![](/assets/Prometheus.png)

![](/assets/Grafana%202.png)

![](/assets/Email%20Alert.png)


## ⚡ Getting Started

### Prerequisites
* Node.js v18+
* Docker Desktop
* MongoDB Connection String

### Local Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/alisameed32/playback-space.git](https://github.com/alisameed32/playback-space.git)
    cd playback-space
    ```

2.  **Run with Docker Compose**
    ```bash
    docker-compose up --build
    ```

The app will be live at:
* **Frontend**: `http://localhost:5173`
* **Backend**: `http://localhost:8000`



## 📡 API Endpoints

All API endpoints are accessible under the `/api/v1` prefix.

| Feature        | Endpoint                  | Description                         |
|---------------|---------------------------|-------------------------------------|
| Users         | `/api/v1/users`           | Register, Login, History, Profile   |
| Videos        | `/api/v1/videos`          | Video CRUD, Publish Toggle          |
| Tweets        | `/api/v1/tweets`          | Text Post CRUD                      |
| Playlists     | `/api/v1/playlist`        | Playlist Management                 |
| Comments      | `/api/v1/comments`        | Video & Tweet Comments              |
| Likes         | `/api/v1/likes`           | Like Toggle System                  |
| Subscriptions | `/api/v1/subscriptions`   | Channel Subscriptions & Subscribers |
| Dashboard     | `/api/v1/dashboard`       | Channel Analytics                   |
| Health        | `/api/v1/healthcheck`     | Server Status Check                 |


### 👤 Author
**Ali Sameed**
[LinkedIn](https://github.com/alisameed32) | [GitHub](https://www.linkedin.com/in/alisameed/)