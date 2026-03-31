# Collaborative Article Editing Platform

## Project Description

A full-stack editorial workflow platform built with Java microservices and React, enabling authors, editors, and reviewers to collaboratively create, edit, version, and publish articles through a structured approval pipeline.

The system implements a role-based editorial workflow where authors write articles, editors refine content and create new versions, and reviewers provide feedback before approving or rejecting articles for publication. Services communicate both synchronously via REST (OpenFeign) and asynchronously via Apache Kafka events, with all traffic routed through a centralized API Gateway secured by JWT authentication.

The entire stack — 7 backend microservices, React frontend, MySQL, Kafka, and the ELK logging stack — starts with a single `docker-compose up` command.

### Key Features

- **Role-based editorial workflow** — Three distinct user roles (Author, Editor, Reviewer) with role-specific dashboards and permissions controlling who can create, edit, review, approve, or reject articles
- **Article versioning system** — Full version history for every article with side-by-side diff comparison highlighting additions and removals between any two versions
- **Event-driven architecture** — When a reviewer approves or rejects an article, the Workflow Service publishes a Kafka event to the `article-status-events` topic; the Article Service consumes it asynchronously, decoupling the services and ensuring eventual consistency
- **API Gateway with JWT security** — Single entry point handling authentication, routing, and token validation across all services using Spring Cloud Gateway and JJWT
- **Service discovery** — Netflix Eureka for dynamic service registration, enabling load-balanced inter-service communication without hardcoded URLs
- **Interactive API documentation** — SpringDoc OpenAPI (Swagger UI) on every service for browsable, testable endpoint documentation
- **Centralized logging** — All services ship structured JSON logs to the ELK stack (Elasticsearch, Logstash, Kibana) for unified monitoring and debugging across the distributed system
- **One-command deployment** — Docker Compose orchestrates 14 containers (7 services + MySQL + Kafka + Zookeeper + Elasticsearch + Logstash + Kibana + Nginx frontend) with health checks, dependency ordering, and persistent volumes
- **Circuit breakers** — Resilience4j circuit breakers on inter-service Feign calls to handle cascading failures gracefully

---

## Tools & Technologies

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Language |
| Spring Boot 3.x | Microservice framework |
| Spring Cloud 2022.0.4 | Cloud-native tooling (Gateway, Eureka, OpenFeign) |
| Spring Cloud Gateway | API Gateway with reactive routing and JWT filter |
| Netflix Eureka | Service discovery and registration |
| Spring Cloud OpenFeign | Declarative REST client for synchronous inter-service calls |
| Spring Security | Authentication and authorization |
| JJWT (io.jsonwebtoken) | JWT token generation, signing, and validation |
| Spring Data JPA | ORM and database access layer |
| Hibernate | JPA implementation |
| MySQL 8.0 | Relational database (separate DB per service) |
| Apache Kafka | Asynchronous event-driven messaging between services |
| Resilience4j | Circuit breaker pattern for fault tolerance |
| SpringDoc OpenAPI 2.2 | Swagger UI / API documentation |
| Logback + Logstash Encoder | Structured JSON logging shipped to ELK |
| Lombok | Boilerplate reduction (getters, setters, builders, logging) |
| Maven | Build tool with Maven Wrapper |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptor |
| Tailwind CSS | Utility-first styling |
| React Hot Toast | Toast notifications |
| Vite | Build tool and dev server |
| Nginx | Production static file server + reverse proxy to API Gateway |

### Infrastructure & DevOps
| Technology | Purpose |
|---|---|
| Docker | Containerization (multi-stage builds for minimal image size) |
| Docker Compose | Multi-container orchestration (14 containers) |
| Elasticsearch 8.10 | Log storage and indexing |
| Logstash 8.10 | Log collection pipeline (TCP input, Elasticsearch output) |
| Kibana 8.10 | Log visualization and monitoring dashboard |
| Zookeeper | Kafka cluster coordination |

### Architecture Patterns
| Pattern | Implementation |
|---|---|
| Microservices | 7 independently deployable services |
| API Gateway | Single entry point with authentication filter |
| Service Discovery | Eureka server with client-side load balancing |
| Event-Driven | Kafka pub/sub for async status updates |
| Database per Service | Separate MySQL databases (articledb, userdb, versiondb, hack3) |
| Circuit Breaker | Resilience4j on Feign clients |
| JWT Authentication | Stateless auth with token validation at the gateway |
| Reverse Proxy | Nginx proxying frontend requests to the API Gateway |

---

## Architecture Overview

```
                    ┌─────────────────┐
                    │  React Frontend │ :3000
                    │  (Nginx Proxy)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │ :9191
                    │  (JWT Filter)   │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │     Eureka Discovery    │ :8761
                └────────────┬────────────┘
       ┌──────┬──────────────┼──────────────┬──────────┐
       │      │              │              │          │
  ┌────▼──┐ ┌─▼──────┐ ┌────▼───┐ ┌───────▼──┐ ┌─────▼────┐
  │ Auth  │ │Article │ │  User  │ │ Workflow  │ │ Version  │
  │ :9000 │ │ :9002  │ │ :9003  │ │  :8000   │ │  :1111   │
  └───────┘ └──┬─────┘ └────────┘ └────┬─────┘ └──────────┘
               │                       │
               │    ┌──────────┐       │
               └────┤  Kafka   ├───────┘
                    │ (Events) │
                    └──────────┘

  ┌──────────────┐  ┌──────────┐  ┌────────┐
  │Elasticsearch │◄─┤ Logstash │◄─┤All Svcs│
  │   :9200      │  │  :5000   │  │ (logs) │
  └──────┬───────┘  └──────────┘  └────────┘
         │
    ┌────▼───┐
    │ Kibana │ :5601
    └────────┘
```

---

## Microservices

| Service | Port | Database | Description |
|---|---|---|---|
| Auth (Identity) Service | 9000 | — | User registration, login, JWT token generation and validation. Delegates user persistence to User Service via Feign. |
| Article Service | 9002 | articledb | Full CRUD on articles, multi-version support, version comparison, status management. Consumes Kafka events for async status updates. |
| User Service | 9003 | userdb | User profiles and orchestration layer coordinating with Article and Version Control services via Feign. |
| Workflow Service | 8000 | hack3 | Editorial workflow engine: assign editors/reviewers, track editor changes, manage reviewer feedback. Publishes article status events to Kafka. |
| Version Control Service | 1111 | versiondb | Tracks version metadata, delegates to Article Service for version creation and comparison. |
| API Gateway | 9191 | — | Single entry point with JWT authentication filter. Routes requests to services via Eureka service discovery. |
| Discovery Server (Eureka) | 8761 | — | Service registry enabling dynamic discovery and client-side load balancing. |

---

## Quick Start

```bash
git clone https://github.com/your-username/Collaborative-Article-Editing.git
cd Collaborative-Article-Editing
docker-compose up --build
```

Then open:
- Frontend: http://localhost:3000
- Eureka Dashboard: http://localhost:8761
- Kibana (Logs): http://localhost:5601
- Swagger (Article API): http://localhost:9002/swagger-ui.html

## Live Demo

- Frontend demo: `https://collaborative-article-editing-lu2xofi8c.vercel.app/`

Important:

- The Vercel demo frontend needs a running backend.
- If the backend/ngrok tunnel is not running, the UI may open but API calls will fail.
- For a permanent always-on demo, deploy the backend to a real VM or cloud host instead of a local machine.

## Run After Cloning

If you download the codebase from GitHub and want to run it on your own machine, use one of these options.

### Option 1: Full Local Stack

This starts frontend, backend, MySQL, Kafka, Eureka, and ELK locally with Docker Compose.

```bash
git clone https://github.com/manishasahu271/Collaborative-Article-Editing.git
cd Collaborative-Article-Editing
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:9191`
- Eureka: `http://localhost:8761`

### Option 2: Use The Vercel Frontend With Your Local Backend

This is useful if you want to use the hosted frontend while running the backend on your own machine.

1. Start the backend:

```bash
git clone https://github.com/manishasahu271/Collaborative-Article-Editing.git
cd Collaborative-Article-Editing
printf 'MYSQL_ROOT_PASSWORD=1234554321\n' > deploy/backend.env
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml up -d --build
```

2. Start ngrok in a separate terminal:

```bash
ngrok http 9191
```

3. Use the generated ngrok HTTPS URL as `VITE_API_BASE_URL` if you deploy your own Vercel frontend.

Important:

- Keep the Docker containers running.
- Keep the ngrok terminal running.
- If ngrok stops, the hosted frontend will lose backend access.

## One-Host Production Deployment

For the simplest production setup, keep the frontend on Vercel and run the full backend stack on one Linux VM with Docker Compose.

- Production compose file: `docker-compose.backend.yml`
- Reverse proxy config: `deploy/Caddyfile`
- Production env template: `deploy/backend.env.example`
- Full VM guide: `docs/one-host-docker-compose-deployment.md`

Quick start on the VM using the public VM IP directly:

```bash
cp deploy/backend.env.example deploy/backend.env
# edit deploy/backend.env with a strong MYSQL_ROOT_PASSWORD
docker compose --env-file deploy/backend.env -f docker-compose.backend.yml up -d --build
```

Point Vercel to:

```env
VITE_API_BASE_URL=http://YOUR_VM_IP:9191
```

Later, once you buy a domain, you can enable the optional `domain` profile and switch Vercel to `https://api.yourdomain.com`.
