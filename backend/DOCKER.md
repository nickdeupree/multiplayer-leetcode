# Docker Setup for Multiplayer Leetcode Backend

This directory contains Docker configurations to run the backend services.

## Services

1. **SpringBoot API** (Port 8080) - Main REST API for code execution and problem management
2. **Y-WebSocket Server** (Port 1234) - WebSocket server for real-time collaboration

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2+

## Quick Start

### Build and run all services:

```bash
cd backend
docker-compose up --build
```

### Run in detached mode:

```bash
docker-compose up -d --build
```

### Stop all services:

```bash
docker-compose down
```

### View logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f springboot
docker-compose logs -f y-websocket
```

## Frontend Configuration

The frontend (Next.js) should be configured to connect to the dockerized backend.

Create or update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:1234
```

Then run the frontend locally:

```bash
cd frontend
npm run dev
```

## Development Workflow

1. Start the dockerized backend:
   ```bash
   cd backend
   docker-compose up -d --build
   ```

2. Start the frontend in development mode:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## Rebuilding Individual Services

```bash
# Rebuild SpringBoot only
docker-compose up -d --build springboot

# Rebuild WebSocket server only
docker-compose up -d --build y-websocket
```

## Troubleshooting

### Port conflicts
If ports 8080 or 1234 are already in use, modify the port mappings in `docker-compose.yml`.

### Container not starting
Check logs for errors:
```bash
docker-compose logs springboot
docker-compose logs y-websocket
```

### Network issues
Ensure Docker network is created:
```bash
docker network ls
```
