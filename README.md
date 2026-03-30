# Collaborative Article Editing

A **Java 17 / Spring Boot 3.x** microservices platform for collaborative article authoring, versioning, editorial workflow, JWT-secured APIs, and event-driven status updates via **Apache Kafka**. Infrastructure includes **MySQL**, **Netflix Eureka**, **Docker Compose**, **Swagger (OpenAPI)**, and **ELK** (Elasticsearch, Logstash, Kibana) for centralized logging.

---

## Architecture

```
                         ┌─────────────────┐
                         │   API Gateway   │ :9191
                         │  (Spring Cloud  │
                         │    Gateway)     │
                         └────────┬────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Eureka Discovery│    │  IDENTITY-SERVICE│    │  USER-SERVICE   │
│     :8761       │    │     :9000       │    │     :9003       │
└─────────────────┘    └────────┬────────┘    └────────┬────────┘
                                │                      │
    ┌───────────────┬───────────┴──────────┬───────────┴───────────┐
    │               │                      │                       │
    ▼               ▼                      ▼                       ▼
┌─────────┐  ┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ ARTICLE │  │  VERSION-   │    │ workflow-service │    │     Kafka       │
│ :9002   │  │  TRACKING   │    │     :8000        │    │   :9092         │
└────┬────┘  │   :1111     │    └────────┬─────────┘    └────────┬────────┘
     │       └─────────────┘             │                       │
     │                                   │    article-status-events
     └───────────────────────────────────┴───────────────────────┘
                    (Kafka: workflow publishes, article consumes)

Data stores: MySQL (`articledb`, `userdb`, `versiondb`, `hack3`) · Logs: Logstash :5000 → Elasticsearch :9200 → Kibana :5601
```

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Runtime | Java 17, Spring Boot 3.x |
| Cloud | Spring Cloud 2022.0.4, Netflix Eureka, OpenFeign |
| Gateway | Spring Cloud Gateway (WebFlux) |
| Security | Spring Security, JWT (JJWT) |
| Data | MySQL 8, Spring Data JPA |
| Messaging | Spring Kafka, Apache Kafka (Confluent images) |
| Resilience | Resilience4j (where configured) |
| API docs | springdoc-openapi 2.2.0 (Swagger UI) |
| Logging | Logback, Logstash TCP, ELK 8.10.2 |
| Containers | Docker, Docker Compose |

---

## Services (overview)

| Service | Port | Role |
|---------|------|------|
| **discovery-server** | 8761 | Eureka registry; no database. |
| **IDENTITY-SERVICE** (auth) | 9000 | Registration and JWT issue/validation; delegates user persistence to user-service via Feign. |
| **ARTICLE-SERVICE** | 9002 | Article CRUD, versions, comparisons, status; consumes Kafka `article-status-events`. |
| **USER-SERVICE** | 9003 | User profiles and orchestration to article/version APIs via Feign. |
| **VERSION-TRACKING-SERVICE** | 1111 | Version-tracking orchestration over article-service. |
| **workflow-service** | 8000 | Editorial workflow (editor/reviewer, feedback); publishes Kafka events when review is approved/rejected. |
| **api-gateway** | 9191 | Single entry point; JWT filter on secured routes. |

---

## Quick start (Docker)

From the project root:

```bash
docker compose up --build
```

This starts MySQL (with `init-db.sql`), Zookeeper, Kafka, Elasticsearch, Logstash, Kibana, Eureka, all microservices, and the API Gateway. Use profile `docker` (set in Compose) so each service uses `application-docker.yml` (container hostnames for MySQL, Eureka, Kafka, Logstash).

**Root password for MySQL (all environments):** `1234554321`

---

## Access points

| Resource | URL |
|----------|-----|
| API Gateway | http://localhost:9191 |
| Eureka Dashboard | http://localhost:8761 |
| Kibana | http://localhost:5601 |
| Elasticsearch | http://localhost:9200 |
| Kafka (host) | `localhost:9092` |

### Swagger UI (direct to each service)

| Service | Swagger UI |
|---------|------------|
| Auth (IDENTITY-SERVICE) | http://localhost:9000/swagger-ui.html |
| Article | http://localhost:9002/swagger-ui.html |
| User | http://localhost:9003/swagger-ui.html |
| Version control | http://localhost:1111/swagger-ui.html |
| Workflow | http://localhost:8000/swagger-ui.html |

Gateway does **not** host Swagger for all APIs; call services on their ports for OpenAPI UIs, or use the gateway for actual HTTP routes below.

---

## API examples (via gateway :9191)

Obtain a JWT after registering a user (roles must satisfy auth-service security rules for protected routes).

**1. Register a user** (through user-service routing — adjust body to match `User` entity: `username`, `password`, `role`):

```bash
curl -s -X POST http://localhost:9191/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"author1","password":"secret","role":"AUTHOR"}'
```

**2. Get a token** (IDENTITY-SERVICE):

```bash
curl -s -X POST http://localhost:9191/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"author1","password":"secret"}'
```

**3. Create an article** (ARTICLE-SERVICE — requires `Authorization: Bearer <token>`):

```bash
curl -s -X POST "http://localhost:9191/api/article/user/1" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Article","content":"Hello world"}'
```

**4. Assign an editor** (workflow-service):

```bash
curl -s "http://localhost:9191/workflow/assign/editor/{articleId}/{editorId}" \
  -H "Authorization: Bearer YOUR_JWT"
```

Replace `{articleId}` and `{editorId}` with real values from your data.

---

## Event-driven flow (Kafka)

1. **workflow-service** updates reviewer status in `changeWorkflowReviewStatus`. After a successful save, if status is **approved** or **rejected**, it publishes an `ArticleStatusEvent` to the topic **`article-status-events`** (key = `articleId`).
2. **article-service** consumes the same topic with consumer group **`article-service-group`** and calls `ArticleService.setArticleStatus(articleId, newStatus)` to align persisted article status.

Local development uses `spring.kafka.bootstrap-servers: localhost:9092` in `application.yml` for article-service and workflow-service. Docker uses `kafka:29092` via `application-docker.yml` and environment variables.

---

## Monitoring (Kibana)

1. Open http://localhost:5601  
2. Create an **index pattern**: `microservices-logs-*`  
3. Logs are shipped only when `SPRING_PROFILES_ACTIVE=docker` (Logstash appender in `logback-spring.xml`). Each log line includes `service_name` from `spring.application.name`.

---

## Local development (without Docker)

1. Install **Java 17**, **Maven**, **MySQL 8**, and optionally **Kafka** (or use Docker only for Kafka/MySQL).  
2. Create databases (`articledb`, `userdb`, `versiondb`, `hack3`) or run `init-db.sql` once.  
3. Start **Eureka** first (`discovery-server`), then other services, then **api-gateway**.  
4. Configure `application.yml` / `application.properties` on each service for `localhost` MySQL and `http://localhost:8761/eureka/`.  
5. For Kafka, start a broker on `localhost:9092` or override `spring.kafka.bootstrap-servers`.

---

## Project structure

```
Collaborative-Article-Editing-main/
├── docker-compose.yml
├── init-db.sql
├── logstash/pipeline/logstash.conf
├── README.md
├── discovery-server/
├── auth-service/auth-service/
├── article-service/
├── user-service/
├── version-control-service/
├── workflow-service/
└── api-gateway/
```

Each service folder (or `auth-service/auth-service`) contains its own `Dockerfile`, `pom.xml`, `mvnw`, and `src/main/resources/application-docker.yml` for containerized runs.

---

## Verification checklist

- [ ] `docker compose up --build` completes without build/runtime errors  
- [ ] Eureka at :8761 lists registered services  
- [ ] `POST /auth/register` and `POST /auth/token` via gateway :9191  
- [ ] Swagger UI at each service port `/swagger-ui.html`  
- [ ] Kibana index pattern `microservices-logs-*` shows JSON logs from services  
- [ ] Approving/rejecting workflow review publishes to Kafka and article-service updates status  

---

## Notes

- JWT signing uses the same secret in **auth-service** `JwtService` and **api-gateway** `JwtUtil` (do not commit production secrets).  
- Compose sets `SPRING_PROFILES_ACTIVE=docker` and wires Eureka, JDBC, and Kafka for each container.  
- **User-service** and **version-control-service** receive Kafka-related env vars in Compose for consistency; only **article-service** and **workflow-service** include Kafka client code in this repo.
