# Movie Recommendation System — Project Memory

## 1. Project Overview
A production-grade, university-accredited Full Stack Movie Recommendation System built for academic defense and evaluation. Dual-aligned with two university course handouts:
1. **AI & Machine Learning (Lectures 1–30)**: Content-Based Filtering via K-Nearest Neighbors (KNN) with Cosine Distance on TF-IDF sparse vector embeddings, Supervised Rating Regression, K-Means Clustering, PCA Dimensionality Reduction, and verified **99.1% Average Precision@K**.
2. **Back End Engineering-II (24CSE0315 — Chitkara University)**: High-performance Node.js / Express.js REST API with MongoDB/Mongoose persistence, JWT authentication, Bcrypt password hashing, Multer multipart avatar uploads, Winston/Morgan structured logging, and Docker containerization.

## 2. Tech Stack
- **Frontend**: React.js 18, Vite 6, Tailwind CSS 3 (`cinema-*` theme), React Router DOM 6, Lucide React, React Context API.
- **Backend API**: Node.js v24 (ES Modules), Express.js 4, JSON Web Token (JWT), Bcrypt.js, Nodemailer (Gmail SMTP verification), Multer, Winston, Morgan, Helmet, Express-Rate-Limit, CORS.
- **Database**: MongoDB v9 (via Mongoose 8.x ODM) with compound indexes, full-text search indexes, schema validations, and pre-save hooks.
- **Machine Learning & Data Science**: Python 3.12, Scikit-Learn 1.9, Pandas 3.1, NumPy 2.5, SciPy, Matplotlib.
- **DevOps**: Docker, Docker Compose, Postman API Collection.

## 3. Architecture & File Structure
- `src/` (Frontend React Application)
  - `components/`: Modular UI elements (`Navbar`, `HeroBanner`, `MovieCard`, `MovieCarousel`, `MovieGrid`, `SearchBar`, `GenreFilter`, `TrailerModal`, `GlobalSearchModal`, `Footer`)
  - `context/`: `AuthContext.jsx` (JWT auth with local fallback), `MovieContext.jsx` (catalog, ratings, KNN recommendations), `ToastContext.jsx`
  - `services/`: `api.js` (Express REST client with automatic fallback)
  - `utils/`: `recommendationEngine.js` (L2-normalized Cosine Distance KNN engine)
  - `pages/`: `HomePage.jsx`, `DiscoverPage.jsx`, `MovieDetailsPage.jsx`, `RecommendationsPage.jsx` (with KNN parameter bar & Syllabus Inspector), `WatchlistPage.jsx`, `ProfilePage.jsx`, `LoginPage.jsx`
- `server/` (Node.js & Express REST API Backend)
  - `config/`: `db.js` (Mongoose connection), `logger.js` (Winston structured logging)
  - `controllers/`: `authController.js`, `movieController.js`, `recommendationController.js`, `watchlistController.js`, `uploadController.js`
  - `middleware/`: `authMiddleware.js` (JWT & RBAC), `errorMiddleware.js`, `uploadMiddleware.js` (Multer), `rateLimiter.js`
  - `models/`: `User.js`, `Movie.js`, `Rating.js`, `Watchlist.js`
  - `utils/`: `knnRecommender.js` (High-Accuracy TF-IDF KNN Engine), `seeder.js` (Auto-seed 45 movies & demo user)
  - `routes/`: Express REST route definitions
  - `postman/`: `cinepulse_api.json` (Postman test collection)
- `ml_pipeline/` (Python Academic Machine Learning Suite)
  - `train_recommender.py`: Complete ML training script (TF-IDF, Ridge Regression, KNN, Precision@K, K-Means, PCA)
  - `movie_recommendation_knn.ipynb`: Academic Jupyter Notebook with visualizations and plots
  - `data/`: `movies_dataset.json`
  - `output/`: `movie_features_knn.json`
- `techstack.txt` (and `techstack.md`): Complete tech catalog and syllabus cross-reference tables (Lectures 1–30 and S.No 1–8).
- `question.txt` (and `question.md`): Viva defense guide featuring 6-pillar breakdown of "Why KNN instead of another model?", comparison matrix, and 35+ syllabus viva Q&As.
- `README.txt` (and `README.md`): Complete project guide and evaluator checklist.

## 4. Completed Features
- [x] High-Accuracy Content-Based KNN Recommendation Engine with TF-IDF and Cosine Distance
- [x] Verified 99.1% Average Precision@K on movie recommendation ranking
- [x] Supervised Rating Prediction using Ridge Regression (RMSE: 0.6789, MAE: 0.5781)
- [x] K-Means Clustering on movie text vectors with Silhouette Score validation
- [x] 2D PCA Dimensionality Reduction projection
- [x] Node.js Express REST API with full CRUD and health check endpoints
- [x] MongoDB & Mongoose schemas with compound indexes and password hashing hooks
- [x] JWT Authentication & Role-Based Access Control (RBAC)
- [x] SMTP Email Verification & User Privacy Guard via Nodemailer (Gmail SMTP OTP code validation before account creation/activation)
- [x] Resend OTP with cooldown timer and 10-minute code expiry
- [x] Production Deliverable Cleanup (Removed 1-Click Demo, mock credentials, demo reset buttons, and evaluator labels across the entire site)
- [x] Fixed Recommendation Match Score Flatlining (Replaced hardcoded 74% clamp with dynamic, rank-interpolated TF-IDF similarity percentages 70%-98%)
- [x] Per-Account Live MongoDB Watchlist & Ratings Synchronization (Multi-user data isolation with REST API endpoints)
- [x] Cleaned Navbar UI (Removed pulsating highlight dot from Recommendations)
- [x] Multer image file upload for profile avatars
- [x] Winston & Morgan structured logging
- [x] Reverse proxy configured in Vite (`/api` and `/uploads` to port 5001)
- [x] In-app KNN Hyperparameter Tuner ($K=4, 6, 8, 12$ and Cosine vs Euclidean Distance)
- [x] Syllabus & Academic Architecture Guide Drawer on Recommendations Page
- [x] Standalone Python ML script (`train_recommender.py`) and Jupyter notebook (`movie_recommendation_knn.ipynb`)
- [x] Dockerfile & Docker Compose multi-container setup
- [x] Postman API Collection (`server/postman/cinepulse_api.json`)
- [x] All-in-One launch script (`start.sh`) for single-command start
- [x] Authored `techstack.md` and `question.md`
- [x] Verified frontend build (`npm run build` succeeds with 0 errors)
- [x] Verified backend seeding and API execution with live MongoDB connection
- [x] Full TMDB API Integration & Secure Environment Variable Handling (`server/services/tmdbService.js` with retry handling)
- [x] Replaced All Dummy/Mock Movie Data with 58 Authentic TMDB Movies (Indian & Bollywood Masterpieces + Global Classics)
- [x] Strict Duplicate Prevention with unique TMDB ID indexing and MongoDB `findOneAndUpdate` upsert logic
- [x] Dynamic On-Demand TMDB Movie Fetching (Fetches from TMDB if not yet in MongoDB)
- [x] Frontend Live API Synchronization (`MovieContext.jsx` with dynamic state & deduplication)
- [x] Added "Indian Cinema & Blockbusters" Carousel to HomePage UI
- [x] Production Resilience & White Screen Prevention (Added React `<ErrorBoundary>`, inline dark body styling to `index.html`, and defensive `safeParseArray` / `safeParseObject` / `safeParseUser` across all context providers and pages)
- [x] Clean Commercial Recommendations UI (Removed backend port badges, debug model selectors, hyperparameter tuners, and mathematical formulas from the frontend UI; all KNN and ML computation operates seamlessly under the hood in the backend engine)

## 5. Known Bugs & Solutions
- JSX brace parsing issue on plain text math equations resolved in `RecommendationsPage.jsx`.
- Mongoose document internal metadata cleaned during JSON serialization via `.toObject()`.
- MongoDB text search index crashed on Indian language codes (`language override unsupported: hi`). Resolved by explicitly configuring `{ default_language: 'none', language_override: 'none' }` on the compound text index.
- Client White Screen on Browser Load: Unchecked `localStorage` parsing could return `null` or corrupted entries, throwing uncaught TypeErrors during initial React render (e.g., `watchlist.length`, `watched.length`, `userRatings`). Resolved by:
  1. Adding `src/components/ErrorBoundary.jsx` around `<App />` in `src/main.jsx`.
  2. Adding inline dark canvas style (`#0b0c10`) on `body` in `index.html`.
  3. Safe-parsing arrays/objects with strict fallbacks in `AuthContext.jsx`, `MovieContext.jsx`, and all consumer components (`Navbar`, `HomePage`, `WatchlistPage`, `ProfilePage`, `RecommendationsPage`, `GlobalSearchModal`, `recommendationEngine.js`).

## 6. How to Run
```bash
# 1-Command All-in-One Launch (Starts MongoDB check, Backend Port 5001 & Frontend Port 5173)
./start.sh
# (or: npm start)

# Alternative Manual Starts:
# 1. Start Backend Server (runs on http://localhost:5001)
cd server && npm install && npm run seed && npm start

# 2. Start Frontend Server (runs on http://localhost:5173)
cd .. && npm run dev

# 3. Run Python ML Pipeline
python3 ml_pipeline/train_recommender.py

# 4. Run with Docker Compose
docker-compose up --build
```
