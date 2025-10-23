# Phishing Simulation Platform

A full-stack phishing simulation platform for security awareness training. Built with NestJS (backend), React (frontend), MongoDB, and Docker.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Testing SMTP (Ethereal Email)](#testing-smtp-ethereal-email)
- [API Documentation](#api-documentation)
- [Frontend Usage](#frontend-usage)
- [Development](#development)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────────┐
│   Frontend (React)  │ ← http://localhost:8080
│   - Login/Register  │
│   - Dashboard       │
│   - Send Phishing   │
│   - View Attempts   │
└──────────┬──────────┘
           │ HTTP + JWT
           ▼
┌─────────────────────────────────────┐
│  phishing-management-server (3000)  │
│  • POST /auth/register              │
│  • POST /auth/login                 │
│  • GET  /attempts (JWT)             │
│  • POST /attempts/send (JWT)        │
└──────────┬──────────────────────────┘
           │ HTTP (internal)
           ▼
┌─────────────────────────────────────┐
│  phishing-simulation-server (3001)  │
│  • POST /phishing/send              │
│  • GET  /phishing/click/:id?t=...   │
└──────────┬──────────────────────────┘
           │ SMTP
           ▼
┌─────────────────────┐
│   Ethereal Email    │ ← Test SMTP Server
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   MongoDB (27017)   │ ← Shared Database
│   • users           │
│   • attempts        │
└─────────────────────┘
```

### Key Design Decisions

1. **Separation of Concerns**: Management server handles auth/admin, simulation server handles email delivery
2. **JWT Authentication**: Stateless auth with 7-day token expiration
3. **Click Token Validation**: Unique tokens prevent unauthorized click spoofing
4. **Shared MongoDB**: Both servers read from the same `attempts` collection
5. **Apple-Style UI**: Clean, minimalist design inspired by Apple's design system

---

## 🛠️ Tech Stack

### Backend
- **NestJS** — TypeScript framework for Node.js
- **MongoDB** + **Mongoose** — NoSQL database with ODM
- **Nodemailer** — Email sending via SMTP
- **JWT** + **Passport** — Authentication
- **Bcrypt** — Password hashing
- **Axios** — HTTP client for inter-service communication

### Frontend
- **React 18** + **TypeScript** — UI library
- **React Router** — Client-side routing
- **Axios** — API communication
- **Vite** — Build tool
- **NGINX** — Production web server

### DevOps
- **Docker** + **Docker Compose** — Containerization
- **MongoDB** — Official Docker image
- **NGINX** — Static file serving

---

## 📁 Project Structure

```
phishing-project/
├── phishing-simulation-server/    # Email sending & click tracking
│   ├── src/
│   │   ├── schemas/
│   │   │   └── attempt.schema.ts  # Attempt model
│   │   ├── phishing/
│   │   │   ├── phishing.service.ts
│   │   │   ├── phishing.controller.ts
│   │   │   └── phishing.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── phishing-management-server/    # Admin API & auth
│   ├── src/
│   │   ├── schemas/
│   │   │   ├── user.schema.ts     # User model
│   │   │   └── attempt.schema.ts  # Attempt model (shared)
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-auth.guard.ts
│   │   ├── attempts/
│   │   │   ├── attempts.service.ts
│   │   │   ├── attempts.controller.ts
│   │   │   └── attempts.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                       # React web app
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts          # Axios client
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Auth state
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Dashboard.tsx
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml              # Orchestration
├── .env                            # Environment variables
├── .env.example                    # Template
├── Makefile                        # Helper commands
└── README.md                       # This file
```

---

## ✅ Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Node.js** 18+ (for local development)
- **npm** 9+ (for local development)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd phishing-project
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your SMTP credentials (see below)
```

### 3. Start All Services
```bash
make rebuild  # Build all Docker images
make upd      # Start containers in detached mode
```

### 4. Access Services
- **Frontend**: http://localhost:8080
- **Management API**: http://localhost:3000
- **Simulation API**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27017/phishing_db

### 5. Register Admin Account
Navigate to http://localhost:8080/register and create an account.

---

## ⚙️ Environment Configuration

### `.env` File Structure

```env
# MongoDB
MONGO_URI=mongodb://mongo:27017/phishing_db

# Simulation Server
SIM_PORT=3001
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_username
SMTP_PASS=your_ethereal_password
FROM_EMAIL=no-reply@example.com
BASE_URL=http://localhost:3001

# Management Server
MAN_PORT=3000
JWT_SECRET=your_secure_random_secret_key
SIMULATION_SERVER_URL=http://phishing-simulation:3001

# Frontend
REACT_APP_API_URL=http://localhost:3000
```

### Important Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.ethereal.email` |
| `SMTP_USER` | SMTP username | `elisa92@ethereal.email` |
| `SMTP_PASS` | SMTP password | `AH5B4arD8ydd2sEq6d` |
| `JWT_SECRET` | Secret for JWT signing | `cymulate_i_love_you` |
| `SIMULATION_SERVER_URL` | Internal URL for management→simulation | `http://phishing-simulation:3001` |

⚠️ **Security**: Never commit `.env` to version control. Use `.env.example` as a template.

---

## 📧 Testing SMTP (Ethereal Email)

Ethereal is a fake SMTP service for testing email delivery without sending real emails.

### Step 1: Create Ethereal Account

1. Visit https://ethereal.email/
2. Click **"Create Ethereal Account"**
3. Copy the generated credentials:
   - **Username**: `elisa92@ethereal.email`
   - **Password**: `AH5B4arD8ydd2sEq6d`
   - **Host**: `smtp.ethereal.email`
   - **Port**: `587`

### Step 2: Update `.env`

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=elisa92@ethereal.email
SMTP_PASS=AH5B4arD8ydd2sEq6d
FROM_EMAIL=no-reply@example.com
```

### Step 3: Restart Containers

```bash
make rebuild
make upd
```

### Step 4: Send Test Email

**Via Frontend:**
1. Login at http://localhost:8080
2. Enter recipient email: `test@example.com`
3. Click "Send Phishing Email"

**Via API:**
```bash
# Get JWT token first
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.accessToken')

# Send phishing email
curl -X POST http://localhost:3000/attempts/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"victim@example.com","subject":"Security Alert","content":"Please verify your account"}'
```

### Step 5: View Email in Ethereal

1. Go to https://ethereal.email/messages
2. Login with your Ethereal credentials
3. Find the sent email
4. Click the phishing link to test click tracking

---

## 📚 API Documentation

### Management Server (Port 3000)

#### Authentication

**Register Admin**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword"
}

Response: { "accessToken": "eyJhbGci..." }
```

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword"
}

Response: { "accessToken": "eyJhbGci..." }
```

#### Attempts (Requires JWT)

**Get All Attempts**
```http
GET /attempts
Authorization: Bearer <JWT_TOKEN>

Response: [
  {
    "_id": "68fa0cb3fe2f3ec09b2f150f",
    "email": "victim@example.com",
    "subject": "Security Alert",
    "status": "clicked",
    "sentAt": "2025-10-23T11:08:36.437Z",
    "clickedAt": "2025-10-23T11:09:01.523Z"
  }
]
```

**Send Phishing Attempt**
```http
POST /attempts/send
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "email": "victim@example.com",
  "subject": "Security Alert",
  "content": "Please verify your account"
}

Response: { "_id": "...", "status": "sent", ... }
```

### Simulation Server (Port 3001)

**Send Email (Direct)**
```http
POST /phishing/send
Content-Type: application/json

{
  "email": "victim@example.com",
  "subject": "Security Alert",
  "content": "Please verify your account"
}
```

**Record Click**
```http
GET /phishing/click/:attemptId?t=<clickToken>

Response: "Recorded"
```

---

## 🎨 Frontend Usage

### User Flow

1. **Registration** (`/register`)
   - Enter email and password (min 6 chars)
   - Confirm password
   - Automatically logged in after registration

2. **Login** (`/login`)
   - Enter credentials
   - JWT token stored in `localStorage`
   - Redirected to dashboard

3. **Dashboard** (`/dashboard`)
   - **Send Form**: Enter email, optional subject/content
   - **Attempts Table**: View all attempts with status badges
   - **Logout**: Clear token and return to login

### Status Badges

| Status | Color | Meaning |
|--------|-------|---------|
| `pending` | Gray | Email queued but not sent |
| `sent` | Blue | Email delivered successfully |
| `clicked` | Green | Recipient clicked the link |
| `failed` | Red | Email delivery failed |

---

## 💻 Development

### Local Development (Without Docker)

#### Backend Services

**Simulation Server:**
```bash
cd phishing-simulation-server
npm install
npm run start:dev  # Runs on port 3001
```

**Management Server:**
```bash
cd phishing-management-server
npm install
npm run start:dev  # Runs on port 3000
```

**MongoDB:**
```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
```

#### Frontend

```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

### Build Commands

```bash
# Build all services
make rebuild

# Build individual services
docker compose build phishing-simulation
docker compose build phishing-management
docker compose build frontend
```

### Useful Make Commands

```bash
make upd        # Start all containers (detached)
make down       # Stop all containers
make logs       # View all logs
make rebuild    # Rebuild all images
make clean      # Remove all containers and volumes
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use real SMTP server (not Ethereal)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up MongoDB authentication
- [ ] Use environment-specific `.env` files
- [ ] Enable rate limiting on API endpoints
- [ ] Set up monitoring and logging

### Docker Compose Production

```bash
# Use production environment file
cp .env.production .env

# Build and start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

```env
# Use real SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Production URLs
BASE_URL=https://yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## 🔒 Security Considerations

### Implemented Security Measures

1. **Password Hashing**: Bcrypt with cost factor 10
2. **JWT Tokens**: 7-day expiration, stored in localStorage
3. **Click Token Validation**: Prevents unauthorized status updates
4. **CORS**: Configured for specific origins
5. **Input Validation**: Email format, password length checks
6. **Sensitive Data**: `passwordHash` and `clickToken` excluded from API responses

### Best Practices

- ⚠️ **Never log credentials** (passwords, tokens, SMTP credentials)
- ⚠️ **Never expose `clickToken`** in API responses
- ⚠️ **Use HTTPS** in production
- ⚠️ **Rotate JWT secrets** periodically
- ⚠️ **Implement rate limiting** on auth endpoints
- ⚠️ **Monitor failed login attempts**

---

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Error in Browser

**Symptom**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
- Verify `phishing-management-server/src/main.ts` has CORS enabled
- Check origin matches frontend URL
- Restart management server: `docker compose restart phishing-management`

#### 2. Email Not Sending

**Symptom**: Status stays `pending` or changes to `failed`

**Solution**:
```bash
# Check simulation server logs
docker logs phishing-project-phishing-simulation-1

# Verify SMTP credentials in .env
cat .env | grep SMTP

# Test SMTP connection
curl -X POST http://localhost:3001/phishing/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### 3. JWT Token Invalid

**Symptom**: `401 Unauthorized` on protected endpoints

**Solution**:
- Check `JWT_SECRET` matches in `.env`
- Verify token not expired (7 days)
- Clear localStorage and login again
- Restart management server

#### 4. MongoDB Connection Failed

**Symptom**: `MongooseServerSelectionError`

**Solution**:
```bash
# Check MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker compose restart mongo

# Check connection string
echo $MONGO_URI
```

#### 5. Frontend Shows Blank Page

**Symptom**: White screen, no errors

**Solution**:
```bash
# Rebuild frontend
cd frontend
npm run build

# Rebuild Docker image
docker compose build frontend
docker compose up -d frontend

# Check NGINX logs
docker logs phishing-project-frontend-1
```

### Debug Commands

```bash
# View all container logs
docker compose logs -f

# View specific service logs
docker logs phishing-project-phishing-management-1 --tail 50

# Check container status
docker compose ps

# Restart specific service
docker compose restart phishing-management

# Rebuild and restart
make rebuild && make upd

# Access container shell
docker exec -it phishing-project-phishing-management-1 sh
```

---

## 📝 Testing Workflow

### End-to-End Test

1. **Setup Ethereal SMTP** (see [Testing SMTP](#testing-smtp-ethereal-email))

2. **Start Services**
   ```bash
   make rebuild && make upd
   ```

3. **Register Admin**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"test123"}'
   ```

4. **Login and Get Token**
   ```bash
   TOKEN=$(curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"test123"}' \
     | jq -r '.accessToken')
   ```

5. **Send Phishing Email**
   ```bash
   curl -X POST http://localhost:3000/attempts/send \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email":"victim@example.com","subject":"Test"}'
   ```

6. **View Attempts**
   ```bash
   curl -X GET http://localhost:3000/attempts \
     -H "Authorization: Bearer $TOKEN"
   ```

7. **Check Email in Ethereal**
   - Login to https://ethereal.email/messages
   - Find the email
   - Copy the click link

8. **Simulate Click**
   ```bash
   curl "http://localhost:3001/phishing/click/<attempt_id>?t=<token>"
   ```

9. **Verify Status Updated**
   ```bash
   curl -X GET http://localhost:3000/attempts \
     -H "Authorization: Bearer $TOKEN" \
     | jq '.[] | select(.status == "clicked")'
   ```

---

## 📄 License

This project is for educational purposes only. Use responsibly and only for authorized security awareness training.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review Docker logs: `docker compose logs -f`
- Verify `.env` configuration
- Ensure all services are running: `docker compose ps`

---

**Built with ❤️ for security awareness training. From Alexey to Cimulate.**