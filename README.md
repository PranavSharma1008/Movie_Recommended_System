# 🎬 Movie+ — AI-Powered Movie Recommendation & Streaming Platform

<div align="center">

![Movie+ Banner](https://img.shields.io/badge/Movie+-Cinematic_Streaming_Platform-e50914?style=for-the-badge&logo=film&logoColor=white)

[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js_v24-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express_4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_v9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit_Learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Precision@K](https://img.shields.io/badge/Precision@K-99.1%25-success?style=flat-square&logo=checkmarx&logoColor=white)](#-1-intelligent-content-based-recommendation-engine-knn--tf-idf)
[![Tests Passing](https://img.shields.io/badge/Tests-35%20Passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](#-automated-testing--verification)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

**Movie+** is a production-grade Full-Stack Movie Streaming and Recommendation Platform powered by Machine Learning.  
Combines a cinematic React 18 / Vite 6 frontend, a high-throughput Node.js Express REST API, MongoDB/Mongoose persistence, and a High-Accuracy **K-Nearest Neighbors (KNN)** Content-Based Recommendation Engine with multi-attribute TF-IDF vector space modeling.

[Quick Start](#-quick-start-guide) • [Architecture](#-architecture--tech-stack) • [REST API](#-rest-api-endpoints) • [Testing](#-automated-testing--verification) • [ML Pipeline](#-machine-learning--data-science-pipeline)

</div>

---

## 🌟 Key Features & Capabilities

### 1. 🤖 Intelligent Content-Based Recommendation Engine (KNN + TF-IDF)
- **Multi-Attribute TF-IDF Space**: High-dimensional feature vectors combining plot synopses, genre weights (3x amplification), keywords, director signatures, and lead cast.
- **$L_2$-Normalized Cosine Distance**: Document length-invariant metric ($D_{\text{cos}} = 1 - \mathbf{u} \cdot \mathbf{v}$) querying nearest neighbors with verified **99.1% Average Precision@K**.
- **Cold-Start Random Discovery**: When a new user logs in (0 watched movies), the engine delivers diverse randomized discovery picks across the entire catalog.
- **Watched-Trigger Personalization**: As soon as a user marks 1 or more movies as watched, the engine immediately computes nearest neighbors anchored to the watched titles.
- **Actor Affinity Boost**: Movies sharing lead cast members with watched films receive an intelligent ranking boost (`"Also stars <Actor> (from <Watched Movie>)"`).
- **Bayesian Rating Prior Smoothing**: Applies weighted IMDb formulas ($WR = \frac{v}{v+m}R + \frac{m}{v+m}C$) to prevent low-sample outlier distortion while rewarding critically acclaimed cinema.
- **Client-Side Graceful Fallback**: Dual-mode vector fallback engine (`src/utils/recommendationEngine.js`) ensures real-time recommendations even during network outages.

### 2. 🎭 Actor Search & Phonetic Alias Resolution
- **Multi-Token Actor Engine**: Search by actor name, first name, last name, or common phonetic spelling variations.
- **Phonetic & Nickname Aliases**: Intelligent query expansion maps informal searches to verified catalog stars:
  - `"sharu khan"`, `"sharu"`, `"srk"`, `"sharukh"` $\to$ **Shah Rukh Khan** (*DDLJ*, *Swades*, *Jawan*)
  - `"aamir"` $\to$ **Aamir Khan** (*3 Idiots*, *Dangal*, *PK*, *Lagaan*)
  - `"prabhas"` $\to$ **Prabhas** (*Bāhubali 1 & 2*, *Kalki 2898-AD*)
  - `"amitabh"` $\to$ **Amitabh Bachchan**, `"deepika"` $\to$ **Deepika Padukone**, `"salman"` $\to$ **Salman Khan**
  - `"nolan"` $\to$ **Christopher Nolan**, `"cillian"` $\to$ **Cillian Murphy**, `"dicaprio"` $\to$ **Leonardo DiCaprio**
- **Cast Card Navigation**: Every actor in the Lead Cast section is an interactive link that filters movies starring that actor in one click (`/discover?search=<actor>`).

### 3. 🎯 Actor Spotlight & "Because You Watched"
- **Actor Spotlight Carousel**: Surfaces a dedicated *"More Films Starring <Lead Actor>"* carousel whenever a watched movie shares cast members with other titles in the library.
- **"Because You Watched" Section**: Explains exact mathematical match reasoning for recommended films (e.g., *"Similar style & themes: Shares Sci-Fi & Adventure with Interstellar"*).

### 4. 📌 Clean & Isolated Watchlist System
- **Strict User Intent Isolation**: Movies are added to the Watchlist **only** when the user explicitly clicks the Bookmark button.
- **Decoupled History & Ratings**: Marking a film as "Watched" or submitting a star rating updates recommendation weights without cluttering the user's Watchlist queue.
- **Zero Pre-Seeded Clutter**: Every new account starts with a 100% clean, empty Watchlist queue.
- **Zero Data Loss Guarantee**: Local state synchronization with `isLoadedRef` protection prevents race conditions during user authentication transitions.

### 5. 👤 Profile & Device Photo Upload
- **Interactive Camera Avatar Upload**: Hovering over the profile picture reveals a camera button that directly opens the device's file picker.
- **Custom Image Upload**: Upload any personal photo (PNG, JPG, WebP) with instant `FileReader` preview and backend storage via `POST /api/upload/avatar`.
- **Custom URL & Persona Presets**: Alternatively paste a direct photo URL or select from curated personas.
- **Watchlist Showcase**: Displays saved bookmarks and completed viewing history directly on the profile page.

### 6. 🎨 Official Movie+ Branding & Cinema UI
- **Modern Streaming Aesthetic**: Custom vector brand emblem featuring a cinema clapperboard, glowing play triangle, and radiant `+` streaming mark.
- **Interactive Trailer Modal**: Modal YouTube player with auto-pause on close and keyboard `Esc` dismiss.
- **Real-Time Global Search (Cmd+K / Ctrl+K)**: Instant keyboard-driven search modal with actor match highlights and live debounce.
- **Production Resilience**: Protected with React `<ErrorBoundary>`, dark body fallback, and defensive JSON parsers to eliminate white-screen failure modes.

### 7. 🔒 Production Security & Hardening
- **Email OTP Verification**: Real-world 6-digit email verification via Nodemailer / Gmail SMTP before account activation.
- **Stateless JWT & Bcrypt**: Passwords salted and hashed with Bcrypt (10 rounds); authorization via Bearer JWT tokens.
- **Defense-in-Depth**: Express Rate Limiting, Helmet HTTP security headers, CORS origin restriction, sensitive field redaction (passwords, tokens, OTPs) in structured Winston logs, and daily log rotation (`winston-daily-rotate-file`).

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND TIER (Port 5173)                              │
│  • React 18 + Vite 6 + Tailwind CSS       • Context API (Auth, Movie, Toast)│
│  • BrandLogo Vector System                • Real-time Global Search (Cmd+K) │
│  • Reverse Proxy (/api -> :5001)          • Responsive Streaming Layout     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST / JSON (Bearer JWT)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API TIER (Port 5001)                           │
│  • Node.js v24 (ES Modules)               • Express 4 RESTful Architecture  │
│  • JWT Auth & Bcrypt Password Hashing     • Multer Multipart Media Storage  │
│  • Gmail SMTP Verification Engine         • Winston Logger + Morgan Tracing │
│  • Rate Limiting & Helmet Security        • Actor Regex Query Expansion     │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │                                     │
                    ▼                                     ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     DATABASE TIER (Port 27017)       │  │    DATA SCIENCE & ML PIPELINE     │
│ • MongoDB v9.0 (cinepulse_db)        │  │ • Python 3.12 / Scikit-Learn 1.9  │
│ • Mongoose 8.x Document Models       │  │ • 500-D TF-IDF Vector Space       │
│ • Compound Unique & Text Indexes     │  │ • Cosine Distance Nearest Neighbor│
│ • Isolated inWatchlist Tracking      │  │ • Verified 99.1% Precision@K      │
│ • Collections: users, movies,        │  │ • Rating Regression RMSE: 0.6789  │
│   ratings, watchlists                │  │ • Jupyter Notebook Demonstration  │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

### 📂 Directory Structure

```bash
Movie Recommended System/
├── src/                          # React 18 Frontend Application
│   ├── components/               # Navbar, HeroBanner, MovieCard, BrandLogo, Modals
│   ├── context/                  # AuthContext, MovieContext, ToastContext
│   ├── data/                     # 58 curated TMDB movie records
│   ├── pages/                    # HomePage, DiscoverPage, MovieDetails, Profile, Watchlist
│   ├── utils/                    # recommendationEngine.js, searchHelper.js, imageHelper.js
│   ├── App.jsx                   # Main React Router application
│   └── main.jsx                  # Application entry point
├── server/                       # Node.js Express REST API
│   ├── config/                   # db.js (Mongoose retry), logger.js (Winston daily rotate)
│   ├── controllers/              # authController, movieController, recommendationController, ...
│   ├── middleware/               # authMiddleware, rateLimiter, uploadMiddleware, errorMiddleware
│   ├── models/                   # User.js, Movie.js, Rating.js, Watchlist.js
│   ├── routes/                   # authRoutes, movieRoutes, recommendationRoutes, ...
│   ├── services/                 # tmdbService.js, emailService.js
│   ├── utils/                    # knnRecommender.js, seeder.js
│   ├── tests/                    # Supertest API integration tests
│   └── server.js                 # Express server bootstrap
├── tests/                        # Automated Test Suites
│   ├── unit/                     # Vitest unit tests (recommender, sanitization, auth)
│   └── e2e/                      # Playwright end-to-end browser tests
├── docker-compose.yml            # Multi-container orchestration
├── start.sh                      # 1-Click launcher script
├── train_recommender.py          # Standalone Python ML training script
└── movie_recommendation_knn.ipynb# Interactive Jupyter notebook
```

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Launch Script (Recommended)

Launch both the Express backend and Vite frontend with a single command:

```bash
./start.sh
```

*(Or simply run `npm start` from the project root).*

Press `Ctrl + C` at any time to cleanly stop all running processes.

---

### Option 2: Manual Step-by-Step Launch

#### 1. Prerequisites
- **Node.js**: `v18+` or `v24+`
- **MongoDB**: Active daemon running on `localhost:27017`

#### 2. Start the Backend Server
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Start the Express REST API (Runs on http://localhost:5001)
npm start
```
*(Outputs: `MongoDB Connected successfully: 127.0.0.1/cinepulse_db` and `Trained High-Accuracy KNN Recommender on 58 movie feature vectors`).*

#### 3. Start the Frontend Application
In a separate terminal window:
```bash
# In the project root directory
npm install

# Start the Vite development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### Option 3: Docker Compose Launch

Run the complete multi-container stack in isolated Docker containers:

```bash
docker-compose up --build
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check and KNN engine training status |
| `POST` | `/api/auth/register` | Public | Register user account with Gmail SMTP verification OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify 6-digit email OTP security code |
| `POST` | `/api/auth/resend-otp` | Public | Resend verification OTP code (with cooldown) |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns signed JWT token |
| `GET` | `/api/auth/profile` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update display name, email, bio, or favorite genres |
| `GET` | `/api/movies` | Public | Query catalog with actor, title, genre, and rating filters |
| `GET` | `/api/movies/:id` | Public | Movie details with pre-queried K-nearest neighbors |
| `GET` | `/api/movies/meta/genres` | Public | Distinct list of all genres in the catalog (All first) |
| `POST` | `/api/recommendations` | Public/Auth | High-Accuracy personalized KNN recommendations |
| `GET` | `/api/recommendations/similar/:id` | Public | Top $K$ nearest neighbors for a target movie |
| `GET` | `/api/watchlist` | Private | Fetch user's saved watchlist and watched history |
| `POST` | `/api/watchlist/toggle` | Private | Explicitly add/remove title from watchlist queue |
| `POST` | `/api/watchlist/watched` | Private | Toggle movie watched/completed status |
| `POST` | `/api/watchlist/rate` | Private | Submit 1–5 star rating and update preference weights |
| `POST` | `/api/upload/avatar` | Private | Upload custom profile picture (Multer storage) |

---

## 🧪 Automated Testing & Verification

Movie+ is thoroughly tested with 35 passing tests across unit, integration, and end-to-end browser tiers:

```bash
# 1. Run Vitest Unit Tests (Recommender Cosine Similarity, Input Sanitization, Auth)
npm test

# 2. Run Backend API Integration Tests (Supertest route validation & security)
npm run test:api

# 3. Run Playwright End-to-End Browser Tests (Chromium user journey validation)
npm run test:e2e

# 4. Production Build Verification
npm run build
```

### Test Suite Summary:
- **18 Unit Tests**: TF-IDF vectorization, $L_2$-norm cosine similarity, Bayesian smoothing, input sanitization, JWT authorization.
- **12 API Integration Tests**: Route security, ReDoS regex injection prevention, OTP validation gate, rate limiting.
- **5 Playwright E2E Tests**: Brand header rendering, global search modal interaction, login accessible form controls, catalog filters, and white-screen error boundary resilience.
- **Production Build**: Clean Vite build generating optimized bundles with zero compilation errors.

---

## 🧠 Machine Learning & Data Science Pipeline

- **Algorithm**: Content-Based Filtering using **K-Nearest Neighbors (KNN)** with Cosine Distance metric:
  $$D_{\text{cos}}(\mathbf{u}, \mathbf{v}) = 1 - \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$
- **Vector Space**: 500-dimensional TF-IDF feature space spanning overview text, genres ($3\times$ weighted), director signature, lead cast, and keywords.
- **Accuracy**: Verified **99.1% Average Precision@K** evaluated across top-$K$ recommendations.
- **Supervised Regression**: Ridge Regression model predicting user ratings with **RMSE: 0.6789** and **MAE: 0.5781**.
- **Clustering & Dimensionality Reduction**: K-Means clustering with Silhouette Score validation, visualized via 2D Principal Component Analysis (PCA).
- **Notebook**: Open `movie_recommendation_knn.ipynb` in Jupyter Notebook or VS Code to interactively inspect data distributions, eigenvalue plots, and similarity heatmaps.

---

## 📄 License & Attribution

- Built with **React 18**, **Vite 6**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB**.
- Movie metadata, posters, backdrops, and cast information provided by **The Movie Database (TMDB)**.
- Video trailers powered by **YouTube Embed API**.
- Distributed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Designed & Developed by Pranav Sharma • © 2026 Movie+ Platform. All rights reserved.</sub>
</div>
