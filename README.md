# PlaybackSpace

**PlaybackSpace** is a scalable video distribution platform backend built with the **MERN stack**. It features a production-grade architecture designed for complex media management, secure authentication, and high-performance database aggregations.

> 🚧 **Project Status**:
> - 🟢 **Backend**: Completed
> - 🟡 **Frontend**: In Progress (React.js)
> - 🟡 **DevOps**: Planned (AWS, Kubernetes, Jenkins)

- 🔗 **[Database Model & Architecture (Eraser.io)](https://app.eraser.io/workspace/xZP3enHeIyrlohZgcUOa?origin=share)**

---

## 🛠 Tech Stack

### **Backend (Implemented)**
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Authentication**: JWT (Access & Refresh Tokens), Bcrypt
* **File Storage**: Cloudinary (Video & Image management)
* **File Uploads**: Multer

### **Frontend (Coming Soon)**
* **Framework**: React.js
* **State Management**: Redux Toolkit
* **Styling**: Tailwind CSS

### **DevOps (Planned Architecture)**
* **Cloud Provider**: AWS
* **CI/CD**: Jenkins (Master-Agent Architecture)
* **Containerization**: Docker
* **Orchestration**: Kubernetes (K8s)
* **Code Quality**: SonarQube
* **Security Scanning**: Trivy
* **Version Control**: Git

---

## 🚀 Key Features

The backend API is fully functional and supports the following features:

* **Authentication & Security**:
    * Secure User Registration & Login (JWT w/ Refresh Token rotation)
    * Password management and secure logout.
* **Video Management**:
    * Upload, publish/unpublish, update, and delete videos.
    * Cloudinary integration for optimized media storage.
* **Dashboard & Analytics**:
    * Aggregated channel statistics (Total Views, Subscribers, Likes).
* **Social Interaction**:
    * **Tweets**: Create, update, and delete text-based posts.
    * **Comments**: Add comments to both Videos and Tweets.
    * **Likes**: Toggle likes on Videos, Comments, and Tweets.
* **Playlists**:
    * Create public or private playlists and manage video collections.
* **Subscriptions**:
    * Subscribe/Unsubscribe to channels and view subscriber lists.
* **User History**:
    * Efficiently track and retrieve user watch history via aggregation pipelines.

---

## ⚙️ DevOps Roadmap

The application deployment pipeline is designed for scalability and security on AWS:

1.  **Source Control**: Code pushed to **Git**.
2.  **Continuous Integration (Jenkins)**:
    * **Master-Agent Architecture**: Distributes build tasks for efficiency.
    * **SonarQube**: Performs static code analysis to ensure code quality.
    * **Trivy**: Scans filesystems and Docker images for vulnerabilities (CVEs).
3.  **Containerization**: Application packaged using **Docker**.
4.  **Orchestration**: Deployed to **Kubernetes** clusters on **AWS**.

---

## 🔧 Environment Variables

To run the backend locally, create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/PlaybackSpace-DB
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📥 Local Installation
## 1. Clone the repository

```bash
git clone https://github.com/alisameed32/playback-space.git
cd playback-space
```

---

**2. Install dependencies**

```Bash
npm install
```
---
**3. Run the server**

```Bash
npm run dev
```

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