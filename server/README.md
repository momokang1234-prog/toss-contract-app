# Toss Payment Server

토스 간편 송금 백엔드 API — 회원가입, 로그인, 잔액조회, 송금, 거래내역 기능을 제공하는 RESTful API 서버입니다.

## 기술 스택

- **Runtime**: Node.js 24
- **Framework**: Express 4 + TypeScript
- **Database**: PostgreSQL 16
- **Auth**: JWT (JSON Web Token)
- **Validation**: Zod
- **Docs**: Swagger / OpenAPI 3.0
- **Testing**: Vitest + Supertest
- **Container**: Docker + Docker Compose

## 빠른 시작

### 사전 요구사항

- Node.js 24+
- Docker + Docker Compose (또는 로컬 PostgreSQL)

### Docker로 실행 (권장)

```bash
# PostgreSQL + API 서버 함께 실행
cd server
docker compose up -d

# 서버 확인
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}

# Swagger 문서
open http://localhost:3000/api-docs
```

### 로컬 개발

```bash
cd server

# 의존성 설치
npm install

# .env 설정
cp .env.example .env
# DATABASE_URL과 JWT_SECRET 수정

# DB 마이그레이션
psql $DATABASE_URL -f src/db/migrations/001_initial.sql

# 개발 서버 실행 (tsx watch)
npm run dev

# 테스트
npm test
```

## API 엔드포인트

| Method | Endpoint              | Auth | 설명               |
|--------|-----------------------|------|-------------------|
| POST   | `/auth/register`      | ✗    | 회원가입            |
| POST   | `/auth/login`         | ✗    | 로그인              |
| GET    | `/accounts/balance`   | ✓    | 잔액 조회           |
| POST   | `/accounts/deposit`   | ✓    | 입금 (테스트/관리용) |
| POST   | `/transfers`          | ✓    | 송금                |
| GET    | `/transactions`       | ✓    | 거래 내역 조회      |
| GET    | `/health`             | ✗    | 헬스 체크           |

### 사용 예시

```bash
# 회원가입
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"01012345678","password":"test1234"}'

# 로그인 → JWT 발급
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"01012345678","password":"test1234"}' | jq -r .token)

# 잔액 조회
curl http://localhost:3000/accounts/balance \
  -H "Authorization: Bearer $TOKEN"

# 입금
curl -X POST http://localhost:3000/accounts/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":50000}'

# 송금
curl -X POST http://localhost:3000/transfers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverPhone":"01087654321","amount":30000}'

# 거래 내역
curl "http://localhost:3000/transactions?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

## 프로젝트 구조

```
server/
├── src/
│   ├── config/          # 환경 설정
│   │   └── index.ts
│   ├── db/
│   │   ├── client.ts    # PostgreSQL Pool
│   │   └── migrations/  # SQL 마이그레이션
│   │       └── 001_initial.sql
│   ├── middleware/
│   │   ├── auth.ts      # JWT 인증 미들웨어
│   │   └── validation.ts # Zod 요청 검증
│   ├── models/          # TypeScript 타입 정의
│   │   └── index.ts
│   ├── routes/
│   │   ├── auth.ts      # POST /auth/register, /auth/login
│   │   ├── accounts.ts  # GET /accounts/balance, POST /accounts/deposit
│   │   ├── transfers.ts # POST /transfers
│   │   └── transactions.ts # GET /transactions
│   ├── app.ts           # Express 앱 생성
│   ├── server.ts        # 진입점
│   └── swagger.ts       # Swagger 설정
├── tests/               # 통합 테스트
│   ├── auth.test.ts
│   ├── accounts.test.ts
│   ├── transfers.test.ts
│   └── transactions.test.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 데이터 모델

### users

| Column        | Type         | Description     |
|---------------|--------------|-----------------|
| id            | UUID (PK)    | 사용자 ID       |
| phone         | VARCHAR(20)  | 휴대폰 번호 (unique) |
| password_hash | VARCHAR(255) | bcrypt 해시     |
| created_at    | TIMESTAMPTZ  | 가입 시간       |

### accounts

| Column   | Type      | Description         |
|----------|-----------|---------------------|
| id       | UUID (PK) | 계좌 ID             |
| user_id  | UUID (FK) | users.id (unique)  |
| balance  | BIGINT    | 잔액 (원), CHECK >= 0 |
| created_at | TIMESTAMPTZ |                    |

### transactions

| Column      | Type         | Description                  |
|-------------|--------------|------------------------------|
| id          | UUID (PK)    | 거래 ID                      |
| sender_id   | UUID (FK)    | 송신자 users.id              |
| receiver_id | UUID (FK)    | 수신자 users.id              |
| amount      | BIGINT       | 금액 (원), CHECK > 0         |
| kind        | VARCHAR(10)  | 'transfer' 또는 'deposit'    |
| created_at  | TIMESTAMPTZ  | 거래 시간                    |

## 설계 결정

- **송금 원자성**: `BEGIN` → `SELECT ... FOR UPDATE` → 잔액 차감 → 잔액 증액 → 거래 기록 → `COMMIT`. 실패 시 `ROLLBACK`.
- **중복 방지**: `FOR UPDATE` 락으로 동시 송금 시 경합 조건(race condition) 방지.
- **잔액 무결성**: `CHECK (balance >= 0)` 제약조건으로 마이너스 잔액 방지.
- **커서 페이지네이션**: `GET /transactions?cursor=<id>&limit=N` 방식으로 무한 스크롤 지원.

## 라이선스

Private — Toss mini-app 프로젝트의 일부입니다.
