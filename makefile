# Makefile for phishing-project

# Start all services (with build)
up:
	docker compose up --build

# Start all services in detached mode
upd:
	docker compose up --build -d

# Stop all running services
down:
	docker compose down

# Rebuild all containers without cache
rebuild:
	docker compose build --no-cache

# Show logs for all services
logs:
	docker compose logs -f

# Show logs for a specific service (example: make logs-simulation)
logs-%:
	docker compose logs -f $*

# Start only the frontend
frontend:
	docker compose up --build frontend

# Start only the management backend
management:
	docker compose up --build phishing-management

# Start only the simulation backend
simulation:
	docker compose up --build phishing-simulation

# Remove all containers, networks, and volumes
clean:
	docker compose down -v --remove-orphans