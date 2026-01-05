# Online Code Editor 🚀

A full-stack online code editor that allows users to write and run code securely using Docker-based execution.

## ✨ Features
- Supports Python, JavaScript, and C++
- Secure code execution using Docker containers
- Clean and responsive user interface
- Isolated execution environment for safety

## 🛠 Tech Stack
**Frontend:** React  
**Backend:** Node.js  
**Execution Environment:** Docker  

## 🐳 Docker Usage
Docker is used to execute user-submitted code inside isolated containers, ensuring security and preventing direct access to the host system.



## 🚀 How to Run Locally

### 🔹 Using Docker (Recommended)
```bash
docker build -t online-code-editor .
docker run -p 5000:5000 online-code-editor

## 🔹Without Docker

npm install
npm start

