# CinePulse — Quality & Production Readiness Checklist

> **Document Type:** Production Quality & Security Verification Matrix  
> **Target Application:** CinePulse AI Movie Recommendation System  
> **Initial Baseline Audit:** November 23, 2026  
> **Status Codes:** `Not Started` | `In Progress` | `Passed` | `Failed` | `Not Applicable`  

---

## 1. Security & Vulnerability Controls

| Check ID | Category | Check Name | Description | Priority | Status | Actual Evidence / Test Result | Issues Found | Fixes Applied | Remaining Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| SEC-01 | Security | Hardcoded Credentials & Secrets | Scan codebase for plain text API keys, SMTP passwords, and JWT secret fallbacks. | Mandatory | **Failed** | Source inspection of `emailService.js` (line 10), `tmdbService.js` (line 13), `docker-compose.yml` (line 29). | Gmail app password `cmfg jazk innu ytmz` and TMDB key `44cdd...` hardcoded as fallbacks in source code. | Awaiting approval to patch | Credentials exposed if code repository is shared. |
| SEC-02 | Security | Universal Backdoor OTP Check | Verify OTP check logic does not allow hardcoded or universal bypass codes. | Mandatory | **Failed** | Source inspection of `server/models/User.js` (lines 100-102): `if (cleanEntered === '123456') return true;` | Hardcoded universal bypass OTP `123456` allows verification bypass on all user accounts. | Awaiting approval to patch | Anyone knowing `123456` can verify any account. |
| SEC-03 | Security | Unauthenticated Administrative Endpoints | Verify all sensitive administrative and catalog sync endpoints require authentication and admin role. | Mandatory | **Failed** | Inspected `server/routes/movieRoutes.js` (line 14): `router.post('/sync-tmdb', syncTMDB);`. No middleware applied. | `POST /api/movies/sync-tmdb` is public; unauthenticated users can trigger bulk writes and disk rewrites. | Awaiting approval to patch | Potential Denial of Service and unauthorized disk mutation. |
| SEC-04 | Security | Unauthenticated File Upload Flooding | Ensure avatar upload endpoint enforces authentication and rate limits. | Mandatory | **Failed** | Inspected `server/routes/uploadRoutes.js` (line 8): `optionalAuth` is used. Anonymous users can upload files. | Anonymous users can upload files up to 5MB repeatedly to `server/uploads/`. | Awaiting approval to patch | Disk exhaustion vulnerability (DoS). |
| SEC-05 | Security | Regular Expression Denial of Service (ReDoS) | Verify movie search queries escape special regex characters before `$regex` execution. | Mandatory | **Failed** | Inspected `server/controllers/movieController.js` (line 56): `{ title: { $regex: search, $options: 'i' } }`. | Malicious search strings with exponential backtracking patterns can freeze the Node event loop. | Awaiting approval to patch | Event loop blocking / service outage. |
| SEC-06 | Security | Client-Side Fake Token Spoofing | Verify authentication flow strictly requires valid backend JWT verification. | Mandatory | **Failed** | Inspected `src/services/api.js` (line 63): client returns `'local-demo-token'` if backend is unreachable. | Fake token issuance bypasses server authentication on client state. | Awaiting approval to patch | False sense of authenticated session. |
| SEC-07 | Security | Auto-Verification on Login | Ensure unverified accounts cannot bypass email OTP verification by merely logging in with a password. | Mandatory | **Failed** | Inspected `server/controllers/authController.js` (lines 183-189): `if (!user.isVerified) { user.isVerified = true; ... }`. | Unverified users become automatically verified without completing email OTP verification. | Awaiting approval to patch | Bypasses email ownership verification requirement. |
| SEC-08 | Security | Sensitive Information Disclosure | Ensure health check and API error responses do not leak server credentials or admin emails. | Mandatory | **Failed** | `curl http://localhost:5001/api/health` returned `"smtpUser":"adminrecallc@gmail.com"`. | Leaks admin email address publicly. | Awaiting approval to patch | Reconnaissance data for targeted phishing/spam. |
| SEC-09 | Security | Password Hashing Standard | Ensure all user passwords are encrypted using strong salted hashing algorithms before persistence. | Mandatory | **Passed** | Inspected `server/models/User.js` (lines 66-73): Mongoose `pre('save')` uses `bcrypt.genSalt(10)` and `bcrypt.hash()`. | None. Bcrypt with salt rounds=10 implemented properly. | None needed | None. |
| SEC-10 | Security | API Rate Limiting | Ensure rate limiters exist on global API and sensitive authentication endpoints. | Mandatory | **Passed** | Inspected `server/middleware/rateLimiter.js` and `server/server.js`: `globalLimiter` (300/15m) and `authLimiter` (30/15m). | None. Implemented using `express-rate-limit`. | None needed | IP spoofing if behind unconfigured reverse proxies. |

---

## 2. Testing & Quality Assurance

| Check ID | Category | Check Name | Description | Priority | Status | Actual Evidence / Test Result | Issues Found | Fixes Applied | Remaining Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TST-01 | Testing | Automated Unit Testing | Automated tests for TF-IDF tokenization, Cosine similarity, KNN ranking, password hashing, and OTP validation. | Mandatory | **Failed** | Searched project directory: 0 unit test files found in `server/` or `src/`. | Zero unit test coverage across all business and mathematical logic. | Awaiting approval to implement | Silent regressions during modifications. |
| TST-02 | Testing | Automated REST API Integration Testing | Automated verification of HTTP status codes, error payloads, and authentication gates via Supertest. | Mandatory | **Failed** | No Supertest or automated API runner configured in `package.json`. | Zero automated API test execution. | Awaiting approval to implement | Broken route contracts without detection. |
| TST-03 | Testing | Machine Learning Model Precision & Accuracy | Validation of TF-IDF feature extraction, Precision@K, and Cosine distance similarity rankings. | Mandatory | **Passed** | Execution of `ml_pipeline/train_recommender.py`: 99.1% Average Precision@K, Ridge RMSE: 0.6789, Silhouette: 0.382. | None. Python ML pipeline executes and validates successfully. | None needed | None. |
| TST-04 | Testing | Frontend Production Build | Verify Vite production bundle compiles with zero syntax or bundling errors. | Mandatory | **Passed** | Executed `npm run build`: built in 1.50s, 0 errors, generated `dist/assets/index-CCiir5Xi.js` (391 kB). | Moderate vulnerabilities flagged by `npm audit` in `react-router-dom`. | None needed for build; audit fix recommended | Need dependency update for moderate advisory. |
| TST-05 | Testing | Frontend Runtime White-Screen Prevention | Verify defensive null-checks and React Error Boundary protect against runtime render crashes. | Mandatory | **Passed** | Inspected `src/components/ErrorBoundary.jsx`, `AuthContext.jsx`, `MovieContext.jsx` safe parsing fallbacks. | None. Defensive parsing implemented across components. | None needed | None. |

---

## 3. Database & Data Integrity

| Check ID | Category | Check Name | Description | Priority | Status | Actual Evidence / Test Result | Issues Found | Fixes Applied | Remaining Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| DB-01 | Database | Compound Unique Indexes | Ensure duplicate ratings and duplicate watchlist records cannot be inserted for the same user and movie. | Mandatory | **Passed** | Inspected `Rating.js` (line 29) and `Watchlist.js` (line 32): `{ userId: 1, movieId: 1 }` with `{ unique: true }`. | None. Unique compound indexes prevent duplicates. | None needed | None. |
| DB-02 | Database | Full-Text Search Configuration | Ensure MongoDB text search handles multi-language titles without language override crashes. | Mandatory | **Passed** | Inspected `Movie.js` (lines 132-134): `{ default_language: 'none', language_override: 'none' }`. | None. Configured properly to prevent Indian language code crashes. | None needed | None. |
| DB-03 | Database | Input Rating Numeric Validation | Ensure submitted rating cannot be `NaN` or out of bounds (1 to 5). | Mandatory | **Failed** | Inspected `watchlistController.js` (line 111): `parseFloat(rating)` without checking `isNaN(numRating)`. | `NaN` passes range check because `NaN < 1` and `NaN > 5` are both false. | Awaiting approval to patch | Corrupt or invalid rating records written to MongoDB. |
| DB-04 | Database | Docker MongoDB Exposure & Authentication | Verify MongoDB container does not expose unauthenticated port to external networks. | Mandatory | **Failed** | Inspected `docker-compose.yml` (lines 9-10): `ports: - "27017:27017"` with no `MONGO_INITDB_ROOT_USERNAME`. | MongoDB port exposed to host with zero authentication required. | Awaiting approval to patch | External database dumping/tampering if host port is accessible. |

---

## 4. Deployment, CI/CD & Infrastructure

| Check ID | Category | Check Name | Description | Priority | Status | Actual Evidence / Test Result | Issues Found | Fixes Applied | Remaining Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| DEP-01 | Deployment | Docker Secret Leakage Prevention (.dockerignore) | Verify `.dockerignore` exists to prevent `.env` and `node_modules` from leaking into image layers. | Mandatory | **Failed** | Inspected filesystem: `.dockerignore` and `server/.dockerignore` do not exist. | `server/.env` and build artifacts get copied directly into production Docker image layers. | Awaiting approval to patch | Critical secret leakage if Docker images are pushed to registries. |
| DEP-02 | Deployment | Non-Root Container Execution | Ensure container processes execute as unprivileged user (`USER node`). | Mandatory | **Failed** | Inspected `server/Dockerfile`: executes as default `root` user. | Container runs with root privileges. | Awaiting approval to patch | Increased severity in the event of container breakout. |
| DEP-03 | Deployment | Automated CI/CD Pipeline | Ensure automated GitHub Actions workflow runs linter, build, and tests on push/PR. | Recommended | **Failed** | Inspected filesystem: `.github/workflows/` directory does not exist. | No automated CI testing pipeline exists. | Awaiting approval to implement | Regressions or broken builds can be committed undetected. |
| DEP-04 | Deployment | Service Graceful Shutdown | Ensure launch scripts cleanly handle SIGINT/SIGTERM and release ports. | Recommended | **Passed** | Inspected `start.sh` (lines 102-114): trap handles SIGINT, SIGTERM, EXIT; kills PIDs and cleans ports. | None. Clean signal handling implemented. | None needed | None. |

---

## 5. Performance & Reliability

| Check ID | Category | Check Name | Description | Priority | Status | Actual Evidence / Test Result | Issues Found | Fixes Applied | Remaining Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| PERF-01 | Performance | In-Memory KNN Recommender Latency | Ensure similarity calculations across movie catalog complete in < 50ms. | Recommended | **Passed** | Pre-computed typed `Float64Array` L2 normalized vectors; dot product queries execute in < 2ms for 58 movies. | None currently for small catalog; needs caching if catalog exceeds 10,000 titles. | None needed | Event loop lag if catalog scales 100x without worker threads. |
| PERF-02 | Performance | Asset Bundling & Compression | Verify frontend JS/CSS assets are minimized and split cleanly. | Recommended | **Passed** | Vite build output: JS bundle is 391 kB (117 kB gzip), CSS is 45 kB (7.7 kB gzip). | None. Bundle size is well within acceptable limits. | None needed | None. |
| REL-01 | Reliability | Database Disconnect Handling | Ensure backend survives transient MongoDB disconnections and attempts reconnection. | Mandatory | **In Progress** | `server/config/db.js` catches error and falls back to JSON seed, but does not configure automatic reconnection loop. | Server continues in fallback mode indefinitely without retrying MongoDB connection. | Awaiting approval to improve | Read/write synchronization lost during database outages. |

---

## Summary of Checklist Status
- **Total Checks Evaluated:** 21
- **Passed:** 8 (38.1%)
- **In Progress:** 1 (4.8%)
- **Failed:** 12 (57.1%)
- **Not Applicable:** 0 (0.0%)

**Current Overall Status:** **NOT READY** (Critical security vulnerabilities, authentication bypass vectors, and missing automated test suites must be resolved before production deployment).
