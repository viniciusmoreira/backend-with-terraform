# Alvorada - User Profile API

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-ECS%20%7C%20RDS%20%7C%20Cognito-FF9900?logo=amazon-aws&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-1.6-7B42BC?logo=terraform&logoColor=white)
![AWS Cost](https://img.shields.io/badge/AWS%20Cost-~%2485%2Fmo-green)

---

## TL;DR

Production-ready user profile API demonstrating backend and platform engineering skills:

| Area               | Implementation                                                            |
| ------------------ | ------------------------------------------------------------------------- |
| **Backend**        | Node.js/TypeScript, Use Cases pattern, Zod validation, Prisma ORM         |
| **Infrastructure** | 10 Terraform modules (VPC, ECS Fargate, RDS, Cognito, API Gateway)        |
| **Security**       | Private subnets, JWT auth at edge, least-privilege IAM, encrypted secrets |
| **CI/CD**          | Separate pipelines for app (Docker -> ECR -> ECS) and infra (Terraform)   |

---

## Quick Links

| What                   | Where                                                           |
| ---------------------- | --------------------------------------------------------------- |
| API Endpoints          | [API Reference](#api-reference)                                 |
| Run Locally            | [Local Development](#local-development)                         |
| Deploy to AWS          | [Infrastructure Deployment](#infrastructure-deployment)         |
| Architecture Decisions | [Architecture Decision Records](#architecture-decision-records) |
| Security Model         | [Security Model](#security-model)                               |
| Production Readiness   | [Production Readiness](#production-readiness)                   |

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Decision Records](#architecture-decision-records)
- [Security Model](#security-model)
- [Testing Strategy](#testing-strategy)
- [Configuration Reference](#configuration-reference)
- [Roadmap](#roadmap)

---

## Overview

A production-ready user profile management API showcasing modern backend development and cloud infrastructure practices:

- **Backend Development**: Modular architecture with Use Cases pattern, TypeScript, Express, and Prisma ORM
- **Cloud Infrastructure**: AWS services orchestrated with Terraform (VPC, ECS Fargate, RDS, Cognito, API Gateway)
- **DevOps Practices**: Separate CI/CD pipelines for application and infrastructure deployment

### AWS Architecture Diagram

```
                                    +------------------+
                                    |   Amazon         |
                                    |   Cognito        |
                                    |   (User Pool)    |
                                    +--------+---------+
                                             |
                                             | JWT Validation
                                             |
+------------------+              +----------v---------+
|                  |   HTTPS      |                    |
|     Client       +-------------->   API Gateway      |
|                  |              |   (HTTP API)       |
+------------------+              +----------+---------+
                                             |
                                             | VPC Link
                                             |
+------------------------------------------------------------------------------------+
|  VPC (10.0.0.0/16)                                                                 |
|                                                                                    |
|  +----------------------------------+    +----------------------------------+      |
|  |  Public Subnets                  |    |  Private Subnets                 |      |
|  |  (10.0.1.0/24, 10.0.2.0/24)      |    |  (10.0.3.0/24, 10.0.4.0/24)      |      |
|  |                                  |    |                                  |      |
|  |  +----------------------------+  |    |  +----------------------------+  |      |
|  |  |                            |  |    |  |                            |  |      |
|  |  |  Application Load Balancer |  |    |  |  ECS Fargate               |  |      |
|  |  |  (ALB)                     +-------->  |  (Node.js API)             |  |      |
|  |  |                            |  |    |  |                            |  |      |
|  |  +----------------------------+  |    |  +-------------+--------------+  |      |
|  |                                  |    |                |                 |      |
|  +----------------------------------+    |                |                 |      |
|                                          |  +-------------v--------------+  |      |
|                                          |  |                            |  |      |
|                                          |  |  RDS PostgreSQL 15         |  |      |
|                                          |  |  (Multi-AZ optional)       |  |      |
|                                          |  |                            |  |      |
|                                          |  +----------------------------+  |      |
|                                          |                                  |      |
|                                          +----------------------------------+      |
|                                                                                    |
+------------------------------------------------------------------------------------+

                    +------------------+    +------------------+
                    |  SSM Parameter   |    |  Amazon ECR      |
                    |  Store           |    |  (Container      |
                    |  (Secrets)       |    |   Registry)      |
                    +------------------+    +------------------+
```

---

## Architecture

### Application Architecture

The application follows a **modular structure** organized by domain with the **Use Cases pattern** for business logic encapsulation:

| Pattern                | Implementation                                                         |
| ---------------------- | ---------------------------------------------------------------------- |
| **Modular Structure**  | Code organized by domain (auth, profile, system) with clear boundaries |
| **Use Cases**          | Business logic encapsulated in single-responsibility classes           |
| **Factory Pattern**    | Centralized dependency injection in `src/infra/factories`              |
| **Request Validation** | Zod schemas applied via middleware before reaching controllers         |
| **Repository Pattern** | Data access abstracted through repository classes                      |

> **Architecture Note**: The current modular structure is pragmatic for the project scope. For a larger-scale application, consider adopting Hexagonal Architecture (Ports and Adapters) with explicit boundaries between layers and dependency inversion at the infrastructure level.

### Infrastructure Architecture

| Component              | Service             | Configuration                                        |
| ---------------------- | ------------------- | ---------------------------------------------------- |
| **Networking**         | VPC                 | 2 public subnets (ALB), 2 private subnets (ECS, RDS) |
| **Compute**            | ECS Fargate         | Serverless containers, no EC2 management             |
| **Database**           | RDS PostgreSQL 15   | Private subnet, encrypted at rest                    |
| **Authentication**     | Cognito User Pool   | Managed user directory with JWT tokens               |
| **API Gateway**        | HTTP API            | JWT Authorizer integrated with Cognito               |
| **Secrets**            | SSM Parameter Store | SecureString parameters for sensitive data           |
| **Container Registry** | ECR                 | Private registry for Docker images                   |

### CI/CD Pipelines

The project uses separate GitHub Actions workflows for independent deployment:

**deploy.yml (Application Pipeline)**

```
Trigger: push to src/**, prisma/**, Dockerfile, package*.json
Flow:   Checkout -> AWS Auth -> ECR Login -> Docker Build -> Push -> ECS Deploy
```

**infra.yml (Infrastructure Pipeline)**

```
Trigger: push to terraform/environments/**, terraform/modules/**
Flow:   Checkout -> AWS Auth -> Terraform Init -> Validate -> Plan -> Apply
```

---

## API Reference

### Public Endpoints

| Endpoint         | Method | Description                         |
| ---------------- | ------ | ----------------------------------- |
| `/health`        | GET    | Health check (shallow)              |
| `/auth/register` | POST   | Register a new user in Cognito      |
| `/auth/confirm`  | POST   | Confirm email verification code     |
| `/auth/login`    | POST   | Authenticate and receive JWT tokens |

### Protected Endpoints (Requires JWT)

| Endpoint         | Method | Description                           |
| ---------------- | ------ | ------------------------------------- |
| `/profile`       | GET    | Retrieve authenticated user's profile |
| `/profile`       | PUT    | Update authenticated user's profile   |
| `/system/secret` | GET    | Retrieve SSM parameter value (demo)   |

### Request/Response Examples

<details>
<summary><strong>POST /auth/register</strong></summary>

```bash
curl -X POST https://api.example.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!"}'
```

Response (201):

```json
{
  "message": "User registered successfully. Please check your email for verification code.",
  "userSub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

</details>

<details>
<summary><strong>POST /auth/login</strong></summary>

```bash
curl -X POST https://api.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!"}'
```

Response (200):

```json
{
  "accessToken": "eyJraWQiOiJ...",
  "idToken": "eyJraWQiOiJ...",
  "refreshToken": "eyJjdHkiOiJ...",
  "expiresIn": 3600
}
```

</details>

<details>
<summary><strong>GET /profile</strong></summary>

```bash
curl https://api.example.com/profile \
  -H "Authorization: Bearer eyJraWQiOiJ..."
```

Response (200):

```json
{
  "id": "uuid",
  "cognitoSub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

</details>

<details>
<summary><strong>PUT /profile</strong></summary>

```bash
curl -X PUT https://api.example.com/profile \
  -H "Authorization: Bearer eyJraWQiOiJ..." \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe"}'
```

Response (200):

```json
{
  "id": "uuid",
  "cognitoSub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

</details>

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- AWS CLI v2 (configured with appropriate credentials)
- Terraform >= 1.6

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend-with-terraform
```

### 2. Deploy Infrastructure

The API depends on AWS Cognito for authentication. Deploy the infrastructure first.

#### 2.1 Bootstrap (One-time setup)

Create S3 bucket and DynamoDB table for Terraform state:

```bash
cd terraform/bootstrap
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your AWS account ID and profile

terraform init
terraform apply
```

#### 2.2 Deploy AWS Resources

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings

# Initialize with backend configuration
terraform init \
  -backend-config="bucket=<STATE_BUCKET_FROM_BOOTSTRAP>" \
  -backend-config="region=us-east-1" \
  -backend-config="profile=<YOUR_PROFILE>"

# Review and apply
terraform plan
terraform apply
```

#### 2.3 Get Terraform Outputs

After `terraform apply`, get the values needed for local development:

```bash
terraform output
```

Save these values for the next step:

- `cognito_user_pool_id`
- `cognito_client_id`
- `ssm_parameter_name`

### 3. Run Locally

```bash
# From project root
cp .env.example .env
```

Edit `.env` with the Terraform outputs:

```env
COGNITO_USER_POOL_ID=us-east-1_xxxxx      # from terraform output
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxx        # from terraform output
SSM_PARAMETER_NAME=/alvorada/dev/secret    # from terraform output
```

Start the application:

```bash
docker-compose up
```

This will:

- Start PostgreSQL with health checks
- Run database migrations automatically
- Start the API with hot-reload at `http://localhost:3000`

### 4. Configure CI/CD (Optional)

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

| Secret                  | Description                                     | Example                                 |
| ----------------------- | ----------------------------------------------- | --------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM user access key with deployment permissions | `AKIA...`                               |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key                             | `wJalr...`                              |
| `TF_STATE_BUCKET`       | S3 bucket name from bootstrap step              | `alvorada-terraform-state-123456789012` |
| `TF_LOCK_TABLE`         | DynamoDB table for state locking                | `alvorada-terraform-state-locks`        |
| `SYSTEM_SECRET`         | Demo value for SSM parameter (optional)         | `my-secret-value`                       |

> **Note**: See [IAM Permissions for CI/CD](#iam-permissions-for-cicd) for the required IAM policy.

---

## Project Structure

```
backend-with-terraform/
├── src/
│   ├── modules/                    # Domain modules
│   │   ├── auth/                   # Authentication (Cognito)
│   │   │   ├── use-cases/          # register, confirm, login
│   │   │   ├── schemas/            # Zod validation
│   │   │   ├── interfaces/
│   │   │   └── errors/
│   │   ├── profile/                # User profiles
│   │   │   ├── use-cases/          # get-profile, update-profile
│   │   │   └── repositories/       # Data access
│   │   └── system/                 # Health, secrets
│   ├── shared/                     # Cross-cutting concerns
│   │   ├── middleware/             # auth, validation, error-handler
│   │   ├── errors/                 # Base error classes
│   │   └── interfaces/             # Shared interfaces
│   ├── infra/                      # Infrastructure layer
│   │   ├── aws/                    # Cognito, SSM clients
│   │   ├── database/               # Prisma client
│   │   └── factories/              # Dependency injection
│   └── index.ts                    # Entry point
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── terraform/
│   ├── bootstrap/                  # State management (run once)
│   ├── modules/                    # Reusable modules
│   │   ├── vpc/
│   │   ├── security-groups/
│   │   ├── ecs/
│   │   ├── rds/
│   │   ├── cognito/
│   │   ├── api-gateway/
│   │   ├── alb/
│   │   ├── ecr/
│   │   ├── iam/
│   │   └── ssm/
│   └── environments/
│       └── dev/
└── .github/workflows/
    ├── deploy.yml                  # App deployment
    └── infra.yml                   # Infra deployment
```

---

## Architecture Decision Records

### ADR-001: ECS Fargate over Lambda

**Context**: The API handles user profile operations requiring database connections and consistent latency.

**Decision**: ECS Fargate

| Factor             | ECS Fargate        | Lambda                       |
| ------------------ | ------------------ | ---------------------------- |
| Cold starts        | None               | 100-500ms (Node.js)          |
| Max execution      | Unlimited          | 15 minutes                   |
| Local development  | Docker parity      | Requires SAM/emulators       |
| Cost at scale      | Predictable        | Variable with concurrency    |
| Connection pooling | Native with Prisma | Requires RDS Proxy (+$15/mo) |
| Minimum cost       | ~$15/mo            | Pay-per-request              |

**Tradeoff Accepted**: Higher baseline cost (~$15/mo minimum) in exchange for operational simplicity, consistent latency, and native connection pooling.

**When to Reconsider**: If traffic becomes highly variable (>10x spikes) or cost optimization becomes critical priority.

---

### ADR-002: API Gateway HTTP API over REST API

**Context**: Need an API Gateway to handle authentication and route requests to backend.

**Decision**: HTTP API (not REST API)

| Aspect               | HTTP API               | REST API                   |
| -------------------- | ---------------------- | -------------------------- |
| Latency              | ~10ms                  | ~30ms                      |
| Cost                 | $1.00/million requests | $3.50/million requests     |
| JWT Authorizer       | Native (Cognito)       | Requires Lambda authorizer |
| Request validation   | Application level      | JSON Schema at gateway     |
| Usage plans/API keys | Not available          | Available                  |
| Response caching     | Not available          | Available                  |

**Tradeoff Accepted**: No built-in request validation or response caching. Validation handled at application level with Zod schemas. Caching not required for user profiles (personalized, low-volume reads).

**When to Reconsider**: If gateway-level request validation or response caching becomes a requirement.

---

### ADR-003: SSM Parameter Store over Secrets Manager

**Context**: Need to store and inject secrets into ECS tasks.

**Decision**: SSM Parameter Store (SecureString)

| Feature               | SSM Parameter Store  | Secrets Manager       |
| --------------------- | -------------------- | --------------------- |
| Cost                  | Free (standard tier) | $0.40/secret/month    |
| Automatic rotation    | Manual               | Native support        |
| Cross-account sharing | Limited              | Native support        |
| Max size              | 8KB                  | 64KB                  |
| RDS integration       | Manual               | Automatic credentials |

**Tradeoff Accepted**: No automatic credential rotation. Current secrets (system demo value) are static. DATABASE_URL uses a generated password stored in Terraform state.

**Migration Path**: For production, migrate DATABASE_URL to Secrets Manager with RDS credential rotation integration.

---

### ADR-004: Terraform over CloudFormation

**Context**: Need Infrastructure as Code for reproducible deployments.

**Decision**: Terraform

| Aspect            | Terraform                 | CloudFormation        |
| ----------------- | ------------------------- | --------------------- |
| State management  | S3 + DynamoDB (explicit)  | Managed by AWS        |
| Module ecosystem  | Terraform Registry        | Limited               |
| Multi-cloud       | Yes                       | AWS only              |
| Drift detection   | `terraform plan`          | Stack drift detection |
| Learning curve    | Moderate                  | AWS-specific          |
| Local development | `terraform plan` anywhere | Requires AWS access   |

**Rationale**: Better developer experience, powerful module system, and transferable skills. The explicit state management requires additional setup (S3 + DynamoDB) but provides better visibility into infrastructure state.

---

### ADR-005: Separate CI/CD Pipelines

**Context**: Need automated deployment for both application code and infrastructure.

**Decision**: Two separate GitHub Actions workflows

| Approach            | Single Pipeline     | Separate Pipelines   |
| ------------------- | ------------------- | -------------------- |
| Blast radius        | Full stack affected | Isolated changes     |
| Deployment speed    | Sequential          | Independent/parallel |
| Rollback complexity | Complex             | Simple per-component |
| Trigger granularity | All changes         | Path-based triggers  |

**Rationale**: Infrastructure changes (Terraform) and application changes (Docker) have different risk profiles and deployment frequencies. Separating them reduces blast radius and allows independent evolution.

---

## Security Model

### Defense in Depth

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Edge (API Gateway)                                │
│  ├─ TLS 1.2+ termination                                    │
│  ├─ JWT validation (Cognito issuer, signature, expiry)      │
│  └─ [Recommended] AWS WAF rate limiting                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Network (VPC)                                     │
│  ├─ ALB in public subnet (port 443 only)                    │
│  ├─ ECS in private subnet (no public IP)                    │
│  ├─ RDS in private subnet (no internet access)              │
│  └─ Security Groups: ALB→ECS:3000, ECS→RDS:5432             │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Application                                       │
│  ├─ Input validation (Zod schemas)                          │
│  ├─ Parameterized queries (Prisma ORM)                      │
│  ├─ No secrets in code or logs                              │
│  └─ Non-root container user                                 │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Data                                              │
│  ├─ RDS encryption at rest (AES-256, AWS managed key)       │
│  ├─ TLS in transit (sslmode=require)                        │
│  ├─ SSM SecureString (KMS encryption)                       │
│  └─ Terraform state encryption (S3 SSE)                     │
└─────────────────────────────────────────────────────────────┘
```

### Security Controls Matrix

| Control                  | Status          | Implementation         |
| ------------------------ | --------------- | ---------------------- |
| Authentication           | Implemented     | Cognito + JWT          |
| Authorization            | Implemented     | API Gateway authorizer |
| Input validation         | Implemented     | Zod schemas            |
| SQL injection prevention | Implemented     | Prisma ORM             |
| Secrets management       | Implemented     | SSM SecureString       |
| Encryption at rest       | Implemented     | RDS, S3                |
| Encryption in transit    | Implemented     | TLS everywhere         |
| Network isolation        | Implemented     | Private subnets        |
| Least privilege IAM      | Implemented     | Scoped policies        |
| Rate limiting            | Not implemented | Recommend AWS WAF      |
| WAF protection           | Not implemented | Recommend WAF rules    |
| Audit logging            | Partial         | CloudWatch Logs        |

### Known Limitations and Mitigations

| Risk                   | Current State                 | Mitigation                        | Priority |
| ---------------------- | ----------------------------- | --------------------------------- | -------- |
| No rate limiting       | API Gateway soft limits only  | Add WAF rate-based rules          | High     |
| DB credentials static  | Generated, stored in TF state | Migrate to Secrets Manager        | Medium   |
| No request audit trail | CloudWatch Logs only          | Enable CloudTrail for API Gateway | Medium   |
| Single NAT Gateway     | Cost optimization for dev     | Add second NAT for prod HA        | Low      |
| RDS single-AZ          | Cost optimization for dev     | Enable Multi-AZ for prod          | Low      |

---

## Testing Strategy

### Recommendations

| Area                  | Recommendation                                             |
| --------------------- | ---------------------------------------------------------- |
| **Unit Tests**        | Add tests for use cases (`*.use-case.spec.ts`) with Jest   |
| **Integration Tests** | Add API tests (`*.controller.spec.ts`) with Supertest      |
| **CI Integration**    | Add test step to `deploy.yml` pipeline before Docker build |

> **Note**: The Use Cases pattern makes unit testing straightforward - each use case has a single responsibility and can be tested in isolation with mocked dependencies.

---

## Configuration Reference

### Environment Variables

| Variable               | Description                          | Required | Default   |
| ---------------------- | ------------------------------------ | -------- | --------- |
| `NODE_ENV`             | Environment (development/production) | Yes      | -         |
| `PORT`                 | Server port                          | No       | 3000      |
| `DATABASE_URL`         | PostgreSQL connection string         | Yes      | -         |
| `AWS_REGION`           | AWS region                           | Yes      | us-east-1 |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID                 | Yes      | -         |
| `COGNITO_CLIENT_ID`    | Cognito App Client ID                | Yes      | -         |
| `SSM_PARAMETER_NAME`   | SSM parameter path                   | Yes      | -         |

### Terraform Variables

| Variable            | Description            | Default               |
| ------------------- | ---------------------- | --------------------- |
| `aws_region`        | AWS region             | us-east-1             |
| `project_name`      | Resource naming prefix | alvorada-user-profile |
| `environment`       | Environment name       | dev                   |
| `vpc_cidr`          | VPC CIDR block         | 10.0.0.0/16           |
| `task_cpu`          | ECS task CPU units     | 256                   |
| `task_memory`       | ECS task memory (MB)   | 512                   |
| `desired_count`     | ECS task count         | 1                     |
| `db_instance_class` | RDS instance type      | db.t3.micro           |

### GitHub Secrets

| Secret                  | Description              | Used By        |
| ----------------------- | ------------------------ | -------------- |
| `AWS_ACCESS_KEY_ID`     | CI user access key       | Both pipelines |
| `AWS_SECRET_ACCESS_KEY` | CI user secret key       | Both pipelines |
| `TF_STATE_BUCKET`       | Terraform state bucket   | infra.yml      |
| `TF_LOCK_TABLE`         | Terraform lock table     | infra.yml      |
| `SYSTEM_SECRET`         | Demo SSM parameter value | infra.yml      |

### IAM Permissions for CI/CD

<details>
<summary><strong>Application Deployment (deploy.yml)</strong></summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECSDeployment",
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeClusters"
      ],
      "Resource": [
        "arn:aws:ecs:*:*:service/alvorada-*",
        "arn:aws:ecs:*:*:cluster/alvorada-*"
      ]
    }
  ]
}
```

</details>

<details>
<summary><strong>Infrastructure Deployment (infra.yml)</strong></summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TerraformState",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": ["arn:aws:s3:::alvorada-terraform-state-*"]
    },
    {
      "Sid": "TerraformLocking",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
      "Resource": "arn:aws:dynamodb:*:*:table/alvorada-terraform-state-locks"
    },
    {
      "Sid": "InfraManagement",
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "ecs:*",
        "ecr:*",
        "rds:*",
        "elasticloadbalancing:*",
        "cognito-idp:*",
        "apigateway:*",
        "ssm:*",
        "iam:*",
        "logs:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": { "aws:RequestedRegion": "us-east-1" }
      }
    }
  ]
}
```

> **Note**: For production, scope down `iam:*` to specific roles and use resource-based conditions.

</details>

---

## Roadmap

### Completed

- [x] Core API implementation (auth, profile, system modules)
- [x] Modular Terraform infrastructure (10 modules)
- [x] VPC with public/private subnet architecture
- [x] ECS Fargate deployment
- [x] RDS PostgreSQL with encryption
- [x] Cognito authentication with JWT
- [x] API Gateway with JWT authorizer
- [x] Separate CI/CD pipelines
- [x] IAM least-privilege policies
- [x] SSM Parameter Store for secrets

### In Progress

- [ ] Unit tests for use cases
- [ ] Integration tests for API endpoints

### Planned

- [ ] E2E tests with Testcontainers
- [ ] AWS WAF integration
- [ ] ECS auto-scaling policies
- [ ] CloudWatch alarms and dashboard
- [ ] Secrets Manager migration for DATABASE_URL
- [ ] VPC Flow Logs
- [ ] OpenAPI/Swagger documentation

### Future Considerations

- [ ] Multi-region deployment
- [ ] Aurora Serverless v2 migration
- [ ] AWS X-Ray tracing
- [ ] Feature flags (LaunchDarkly/AWS AppConfig)

---

## License

MIT License - Feel free to use this project as a reference for your own implementations.

---

## Author

Vinicius Moreira - [GitHub](https://github.com/viniciusmoreira)
