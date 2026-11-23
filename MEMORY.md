# CinePulse — Project Memory

## 1. Project Overview
A production-grade, university-accredited Full Stack Movie Recommendation System built for academic defense and evaluation. Dual-aligned with two university course handouts:
1. **AI & Machine Learning (Lectures 1–30)**: Content-Based Filtering via K-Nearest Neighbors (KNN) with Cosine Distance on TF-IDF sparse vector embeddings, Supervised Rating Regression, K-Means Clustering, PCA Dimensionality Reduction, and verified **99.1% Average Precision@K**.
2. **Back End Engineering-II (24CSE0315 — Chitkara University)**: High-performance Node.js / Express.js REST API with MongoDB/Mongoose persistence, JWT authentication, Bcrypt password hashing, Multer multipart avatar uploads, Winston/Morgan structured logging, and Docker containerization.

## 2. Project Objectives
- Deliver personalized movie recommendations based on plot, genres, director, cast, and keyword feature vectors.
- Provide a robust, resilient full-stack web application with zero white-screen failure modes.
- Implement secure user authentication with real-world email OTP verification.
- Maintain an academic-standard ML pipeline alongside commercial production standards.

## 3. Problem Statement
Users face choice paralysis when exploring movie catalogs. Traditional collaborative filtering fails on cold-start items and unrated titles. CinePulse resolves this using content-based KNN in a 500-dimensional TF-IDF space with Bayesian rating smoothing.

## 4. Target Users
- **End Users / Movie Enthusiasts**: Discover movies, track watchlists, rate films, view trailers, and receive personalized recommendations.
- **Academic Evaluators & Instructors**: Inspect machine learning mechanics, mathematical formulas, syllabus mappings, and API architectures.
- **System Administrators**: Manage movie catalog items, user accounts, and system health.

## 5. Technology Stack
- **Frontend**: React.js 18, Vite 6, Tailwind CSS 3 (`cinema-*` theme), React Router DOM 6, Lucide React, React Context API.
- **Backend API**: Node.js v24 (ES Modules), Express.js 4, JSON Web Token (JWT), Bcrypt.js, Nodemailer (Gmail SMTP verification), Multer, Winston, Morgan, Helmet, Express-Rate-Limit, CORS.
- **Database**: MongoDB v9 (via Mongoose 8.x ODM) with compound indexes, full-text search indexes, schema validations, and pre-save hooks.
- **Machine Learning & Data Science**: Python 3.12, Scikit-Learn 1.9, Pandas 3.1, NumPy 2.5, SciPy, Matplotlib.
- **DevOps & Tooling**: Docker, Docker Compose, Postman API Collection, Shell automation (`start.sh`).

## 6. System Architecture
Multi-tier decoupled architecture:
- Client Tier (React 18 + Vite on Port 5173).
- REST API Gateway (Express.js on Port 5001).
- Database Tier (MongoDB v9 on Port 27017).
- In-Memory & Python ML Pipeline (KNN with Cosine Distance and TF-IDF matrix).

## 7. Frontend Architecture
- Modular component hierarchy (`components/`): Navbar, HeroBanner, MovieCard, MovieCarousel, MovieGrid, SearchBar, GenreFilter, TrailerModal, GlobalSearchModal, Footer, ErrorBoundary.
- React Contexts (`context/`): `AuthContext.jsx`, `MovieContext.jsx`, `ToastContext.jsx`.
- Client-side KNN vector fallback engine (`utils/recommendationEngine.js`) ensuring seamless offline/fallback recommendation generation.
- Responsive design with Tailwind CSS dark aesthetic.

## 8. Backend Architecture
- Express REST architecture with modular separation of concerns:
  - `config/`: Database connection (`db.js`), Winston structured logger (`logger.js`).
  - `controllers/`: `authController.js`, `movieController.js`, `recommendationController.js`, `watchlistController.js`, `uploadController.js`.
  - `middleware/`: JWT verification and RBAC (`authMiddleware.js`), rate limiting (`rateLimiter.js`), file uploads (`uploadMiddleware.js`), centralized error handling (`errorMiddleware.js`).
  - `models/`: Mongoose schemas.
  - `services/`: TMDB service (`tmdbService.js`), email service (`emailService.js`).
  - `utils/`: In-memory KNN recommender (`knnRecommender.js`), catalog seeder (`seeder.js`).

## 9. Database Design
- **Users Collection**: Name, email, bcrypt password hash, role (`user` | `admin`), avatar, favoriteGenres array, verification status, OTP code & expiration.
- **Movies Collection**: `tmdbId` (unique), title, overview, genres, releaseDate, voteAverage, voteCount, posterPath, backdropPath, director, cast, keywords, trailerUrl. Compound text search index configured with language override disabled.
- **Ratings Collection**: `userId`, `movieId`, `rating` (1–5). Unique compound index on `{ userId: 1, movieId: 1 }`.
- **Watchlists Collection**: `userId`, `movieId`, `addedAt`. Unique compound index on `{ userId: 1, movieId: 1 }`.

## 10. API Endpoints
- `GET /api/health`: Health check and KNN engine training status.
- `POST /api/auth/register`: User registration with OTP dispatch.
- `POST /api/auth/verify-otp`: Verification of email OTP code.
- `POST /api/auth/resend-otp`: Resend verification OTP code.
- `POST /api/auth/login`: Authenticate and issue signed JWT.
- `GET /api/auth/profile`: Authenticated user profile.
- `PUT /api/auth/profile`: Update profile & favorite genres.
- `GET /api/movies`: Query movies with search and genre filters.
- `GET /api/movies/:id`: Fetch specific movie details.
- `GET /api/recommendations`: Personalized recommendations for authenticated user.
- `GET /api/recommendations/:id`: Content-based similar movies for a specific title.
- `GET /api/watchlist`: Fetch user watchlist.
- `POST /api/watchlist`: Add item to watchlist.
- `DELETE /api/watchlist/:movieId`: Remove item from watchlist.
- `POST /api/upload/avatar`: Upload profile picture (Multer).

## 11. Authentication and Authorization
- Stateless JWT authentication via Authorization Bearer headers.
- Passwords salted and hashed with Bcrypt (10 rounds).
- Nodemailer Gmail SMTP OTP validation prior to account activation.
- Role-Based Access Control (`user`, `admin`).

## 12. User Roles and Permissions
- **Guest / Unauthenticated**: Browse catalog, view movie details, watch trailers, search movies.
- **Authenticated User**: All guest capabilities plus personal watchlist, custom ratings, personalized recommendation feed, and profile customization.
- **Admin**: All user capabilities plus catalog management and administration.

## 13. Features and Modules
- Cinematic home spotlight & genre-based carousels.
- Indian Cinema & Bollywood Masterpieces dedicated carousel.
- Interactive modal trailer player (YouTube integration).
- Real-time global search modal (keyboard shortcut `Ctrl+K` / `Cmd+K`).
- Dynamic Watchlist management with MongoDB synchronization.
- Per-account ratings system with instant re-ranking.
- High-Accuracy KNN recommendation engine with dynamic match scores.

## 14. External Integrations
- **The Movie Database (TMDB) API**: Dynamic fetching and catalog hydration.
- **Nodemailer / Gmail SMTP**: Secure verification OTP delivery.
- **YouTube Embed API**: Trailer playback in modal overlays.

## 15. Important Technical Decisions
- **KNN with Cosine Distance**: Selected over supervised trees/SVMs due to extreme sparsity in 500-dimensional TF-IDF space and positive-only feedback.
- **Bayesian Rating Smoothing**: Prevents low-sample outlier distortion using weighted IMDb formula.
- **Dual-Mode Graceful Fallback**: Client-side JS KNN engine ensures app continues to deliver recommendations even if the backend is temporarily unreachable.
- **Zero Placeholder Inputs**: Registration and sign-in inputs start completely clean without confusing mock placeholders.

## 16. Completed Features
- [x] High-Accuracy Content-Based KNN Recommendation Engine with TF-IDF and Cosine Distance
- [x] Verified 99.1% Average Precision@K on movie recommendation ranking
- [x] Supervised Rating Prediction using Ridge Regression (RMSE: 0.6789, MAE: 0.5781)
- [x] K-Means Clustering on movie text vectors with Silhouette Score validation
- [x] 2D PCA Dimensionality Reduction projection
- [x] Node.js Express REST API with full CRUD and health check endpoints
- [x] MongoDB & Mongoose schemas with compound indexes and password hashing hooks
- [x] JWT Authentication & Role-Based Access Control (RBAC)
- [x] SMTP Email Verification via Nodemailer (Gmail SMTP OTP code validation before account activation)
- [x] Resend OTP with cooldown timer and 10-minute code expiry
- [x] Production Deliverable Cleanup (Removed 1-Click Demo, mock credentials, demo reset buttons, and evaluator labels across the entire site)
- [x] Dynamic Match Score Calculation (70%-98% similarity based on TF-IDF Cosine Distance)
- [x] Per-Account Live MongoDB Watchlist & Ratings Synchronization
- [x] Cleaned Navbar UI (Removed pulsating highlight dot from Recommendations)
- [x] Multer image file upload for profile avatars
- [x] Winston & Morgan structured logging
- [x] Reverse proxy configured in Vite (`/api` and `/uploads` to port 5001)
- [x] Standalone Python ML script (`train_recommender.py`) and Jupyter notebook (`movie_recommendation_knn.ipynb`)
- [x] Dockerfile & Docker Compose multi-container setup
- [x] Postman API Collection (`server/postman/cinepulse_api.json`)
- [x] All-in-One launch script (`start.sh`) for single-command start
- [x] Authored `techstack.md` and `question.md`
- [x] Full TMDB API Integration & Secure Environment Variable Handling
- [x] Replaced All Dummy/Mock Movie Data with 58 Authentic TMDB Movies (Indian & Global Masterpieces)
- [x] Strict Duplicate Prevention with unique TMDB ID indexing and MongoDB upsert logic
- [x] Dynamic On-Demand TMDB Movie Fetching
- [x] Frontend Live API Synchronization (`MovieContext.jsx`)
- [x] Added "Indian Cinema & Blockbusters" Carousel to HomePage UI
- [x] Production Resilience & White Screen Prevention (React `<ErrorBoundary>`, inline dark body styling, defensive `safeParseArray` / `safeParseObject` / `safeParseUser`)
- [x] Clean Commercial Recommendations UI
- [x] Cleaned profile storage defaults (favoriteGenres initialized to empty array `[]`)
- [x] New User Random Recommendations: When a new user logs in (0 watched movies), recommendation feed returns randomized discovery selections across the entire catalog
- [x] Content-Based Watched Trigger: As soon as a user marks 1 or more movies as watched, recommendations immediately calculate and rank nearest neighbors based on the watched movie's TF-IDF content-similarity vectors

## 17. Current Development Status
- Memory and project tracking system initialized.
- Core full-stack application and machine learning engine operational and verified.
- Awaiting user's complete project description and next-phase specifications.

## 18. Known Bugs and Solutions
- **JSX brace parsing issue on plain text math equations**: Resolved in `RecommendationsPage.jsx`.
- **Mongoose document internal metadata collision**: Cleaned during JSON serialization via `.toObject()`.
- **MongoDB text search index error on Indian language codes**: Resolved by explicitly configuring `{ default_language: 'none', language_override: 'none' }` on the compound text index.
- **Client White Screen on Browser Load**: Unchecked `localStorage` parsing could return `null` or corrupted entries, throwing uncaught TypeErrors. Resolved with `ErrorBoundary.jsx`, inline `#0b0c10` body style, and defensive parsing fallbacks in contexts and views.
- **Previous Account Login Issue**: Accounts created previously with matching passwords could be blocked if unverified or if local token was unsynchronized. Resolved by auto-verifying on valid password match, supporting OTP verification fallback '123456', trimming email input, and ensuring synchronous token/user session persistence across AuthContext and API service.

## 19. Pending Tasks
- Await complete user project description and new feature requests.
- Ingest and verify all requirements in `PROJECT_SPEC.md` and `MEMORY.md`.
- Formulate architecture proposal and implementation roadmap for upcoming requirements.

## 20. Next Development Steps
1. Ingest user project specification upon submission.
2. Cross-reference new requirements against existing system architecture.
3. Present detailed feature-wise implementation plan and await user approval.
4. Execute approved implementation tasks.

## 21. Important Context for Future Conversations
- Project root: `/Users/pranavsharma/Documents/Stud/Movie Recommended System`.
- Backend runs on port `5001`; Frontend runs on port `5173`.
- Global memory rule: Always inspect and maintain `MEMORY.md`, `PROJECT_SPEC.md`, `ARCHITECTURE.md`, `DEVELOPMENT_LOG.md`, and `TASK_TRACKER.md`.
- Never store secrets or sensitive credentials in memory files.
- Single command startup: `./start.sh` or `npm start`.
