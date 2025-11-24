# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing a user authentication system with email verification and OAuth integration (Google/Facebook). The project uses:
- **Backend**: Node.js/Express with TypeScript, Redis for data storage
- **Frontend**: React 19 with TypeScript, Vite, TailwindCSS, React Router, Framer Motion

## Development Commands

### Server (Backend)
```bash
cd server
npm install
npm run dev        # Start development server with nodemon (runs on port 3000)
```

### Client (Frontend)
```bash
cd client
npm install
npm run dev        # Start Vite dev server (runs on port 5173)
npm run build      # Build for production (TypeScript check + Vite build)
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Architecture

### Server Architecture (Repository Pattern + Dependency Injection)

The backend follows a **layered architecture** with clear separation of concerns:

1. **Routes** (`server/src/routes/`) - HTTP endpoint definitions
2. **Controllers** (`server/src/controllers/`) - Request/response handling
3. **Services** (`server/src/services/`) - Business logic layer
   - `AuthService`: Handles registration, login, email verification using OTP stored in Redis
   - `EmailService`: Sends verification emails
4. **Repositories** (`server/src/repositories/`) - Data access layer
   - `IUserRepository`: Interface defining user data operations
   - `RedisUserRepository`: Redis implementation using key-value patterns
5. **Models** (`server/src/models/`) - Data schemas using Zod for validation
6. **Middleware** (`server/src/middleware/`) - Authentication middleware using JWT

**Key Patterns:**
- Dependency injection: Services accept repository/Redis instances in constructor for testability
- Redis keys use prefixes: `user:{id}`, `user:email:{email}`, `otp:{email}`
- Redis pipelines for atomic multi-key operations
- OAuth flows configured via Passport strategies in `server/src/config/passport.ts`

### Client Architecture (Component-Based)

1. **Pages** (`client/src/pages/`) - Route-level components (Login, Register, VerifyEmail, Home)
2. **Components** (`client/src/components/ui/`) - Reusable UI components (Button, Card, Input)
3. **Routing** - React Router with `PrivateRoute` wrapper checking localStorage token
4. **API Communication** - Axios for HTTP requests to backend
5. **Styling** - TailwindCSS with `tailwind-merge` and `clsx` utilities in `client/src/lib/utils.ts`

### Data Flow

**Registration Flow:**
1. User submits email/password → `AuthController.register()`
2. `AuthService` hashes password, creates user in Redis, generates 6-digit OTP
3. OTP stored in Redis with 15-minute expiry (`otp:{email}`)
4. Email sent via `EmailService`
5. User enters OTP → `AuthController.verifyEmail()`
6. Service validates OTP, marks user as verified, deletes OTP from Redis

**Login Flow:**
1. User submits credentials → `AuthController.login()`
2. `AuthService` verifies password with bcrypt, checks `isVerified` flag
3. Returns JWT token (1-day expiry) signed with `JWT_SECRET`

**OAuth Flow:**
1. User redirects to OAuth provider (Google/Facebook)
2. Passport strategy receives profile, finds or creates user
3. OAuth users are automatically verified (`isVerified: true`)

## Environment Setup

### Redis Requirement
The server requires a running Redis instance. See `redis_setup_guide.md` for Windows setup options (Memurai, Redis port, or WSL).

### Environment Variables
Server requires `.env` file (see `server/.env` for template):
- `PORT`: Server port (default: 3000)
- `REDIS_HOST`, `REDIS_PORT`: Redis connection
- `JWT_SECRET`: JWT signing key
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`: Facebook OAuth credentials
- `EMAIL_USER`, `EMAIL_PASS`: Email service credentials
- `CLIENT_URL`: Frontend URL for CORS (default: http://localhost:5173)

## Testing Considerations

When writing tests:
- Services accept Redis client via constructor - inject `ioredis-mock` for unit tests
- Repository interface allows easy mocking of data layer
- Use separate Redis database index for integration tests to avoid data conflicts
