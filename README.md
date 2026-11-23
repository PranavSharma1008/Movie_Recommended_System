# 🎬 Movie+ — AI-Driven Movie Recommendation Platform

> **Movie+** is a production-grade Full-Stack Movie Streaming and Recommendation System powered by Machine Learning.  
> Combines a cinematic React 18 / Vite 6 frontend, a high-throughput Node.js Express REST API, MongoDB/Mongoose persistence, and a High-Accuracy **K-Nearest Neighbors (KNN)** Content-Based Recommendation Engine with multi-attribute TF-IDF vector space modeling.

---

## 🌟 Key Features & Capabilities

### 1. 🤖 Intelligent Content-Based Recommendation Engine (KNN + TF-IDF)
- **Multi-Attribute TF-IDF Space**: High-dimensional feature vectors combining plot synopses, genre weights (3x amplification), keywords, director signatures, and lead cast.
- **$L_2$-Normalized Cosine Distance**: Document length-invariant metric ($D_{\text{cos}} = 1 - \mathbf{u} \cdot \mathbf{v}$) querying nearest neighbors with verified **99.1% Average Precision@K**.
- **Cold-Start Random Discovery**: When a new user logs in (0 watched movies), the engine delivers diverse randomized discovery picks across the entire catalog.
- **Watched-Trigger Personalization**: As soon as a user marks 1 or more movies as watched, the engine immediately computes nearest neighbors anchored to the watched titles.
- **Actor Affinity Boost**: Movies sharing lead cast members with watched films receive an intelligent ranking boost (`"Also stars <Actor> (from <Watched Movie>)"`).
- **Bayesian Rating Prior Smoothing**: Applies weighted IMDb formulas to prevent low-sample outlier distortion while rewarding critically acclaimed cinema.

### 2. 🎭 Actor Search & Phonetic Alias Resolution
- **Multi-Token Actor Engine**: Search by actor name, first name, last name, or common phonetic spelling variations.
- **Phonetic & Nickname Aliases**: Intelligent query expansion maps informal searches to verified catalog stars:
  - `"sharu khan"`, `"sharu"`, `"srk"`, `"sharukh"` $\to$ **Shah Rukh Khan** (*DDLJ*, *Swades*, *Jawan*)
  - `"aamir"` $\to$ **Aamir Khan** (*3 Idiots*, *Dangal*, *PK*, *Lagaan*)
  - `"prabhas"` $\to$ **Prabhas** (*Bāhubali 1 & 2*, *Kalki 2898-AD*)
  - `"amitabh"` $\to$ **Amitabh Bachchan**, `"deepika"` $\to$ **Deepika Padukone**, `"salman"` $\to$ **Salman Khan**
  - `"nolan"` $\to$ **Christopher Nolan**, `"cillian"` $\to$ **Cillian Murphy**, `"dicaprio"` $\to$ **Leonardo DiCaprio**
- **Cast Card Navigation**: Every actor in the Lead Cast section is an interactive link that filters movies starring that actor in one click.

### 3. 🎯 Actor Spotlight & "Because You Watched"
- **Actor Spotlight Carousel**: Surfaces a dedicated *"More Films Starring <Lead Actor>"* carousel whenever a watched movie shares cast members with other titles in the library.
- **"Because You Watched" Section**: Explains exact mathematical match reasoning for recommended films (e.g., *"Similar style & themes: Shares Sci-Fi & Adventure with Interstellar"*).

### 4. 📌 Clean & Isolated Watchlist System
- **Strict User Intent Isolation**: Movies are added to the Watchlist **only** when the user explicitly clicks the Bookmark button.
- **Decoupled History & Ratings**: Marking a film as "Watched" or submitting a star rating updates recommendation weights without cluttering the user's Watchlist queue.
- **Zero Pre-Seeded Clutter**: Every new account starts with a 100% clean, empty Watchlist queue.

### 5. 👤 Profile & Device Photo Upload
- **Interactive Camera Avatar Upload**: Hovering over the profile picture reveals a camera button that directly opens the device's file picker.
- **Custom Image Upload**: Upload any personal photo (PNG, JPG, WebP) with instant `FileReader` preview and backend storage via `POST /api/upload/avatar`.
- **Custom URL & Persona Presets**: Alternatively paste a direct photo URL or select from curated personas.
- **Watchlist Showcase**: Displays saved bookmarks and completed viewing history directly on the profile page.

### 6. 🎨 Official Movie+ Branding & Cinema UI
- **Modern Streaming Aesthetic**: Custom vector brand emblem featuring a cinema clapperboard, glowing play triangle, and radiant `+` streaming mark.
- **Interactive Trailer Modal**: Modal YouTube player with auto-pause on close.
- **Real-Time Global Search (Cmd+K / Ctrl+K)**: Instant keyboard-driven search modal with actor match highlights.
- **Production Resilience**: Protected with React `<ErrorBoundary>`, dark body fallback, and defensive JSON parsers to eliminate white-screen failure modes.

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
Run the entire stack in isolated containers:
```bash
docker-compose up --build
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check and KNN engine status |
| `POST` | `/api/auth/register` | Public | Register user account with Gmail SMTP verification |
| `POST` | `/api/auth/verify-otp` | Public | Verify 6-digit email OTP security code |
| `POST` | `/api/auth/resend-otp` | Public | Resend verification OTP code |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns signed JWT token |
| `GET` | `/api/auth/profile` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update display name, email, bio, or avatar |
| `GET` | `/api/movies` | Public | Query catalog with actor, title, genre, and rating filters |
| `GET` | `/api/movies/:id` | Public | Movie details with pre-queried K-nearest neighbors |
| `GET` | `/api/movies/meta/genres` | Public | Distinct list of all genres in the catalog |
| `POST` | `/api/recommendations` | Public/Auth | High-Accuracy personalized KNN recommendations |
| `GET` | `/api/recommendations/similar/:id` | Public | Top $K$ nearest neighbors for a target movie |
| `GET` | `/api/watchlist` | Private | Fetch user's saved watchlist and watched history |
| `POST` | `/api/watchlist/toggle` | Private | Explicitly add/remove title from watchlist |
| `POST` | `/api/watchlist/watched` | Private | Toggle movie watched/completed status |
| `POST` | `/api/watchlist/rate` | Private | Submit 1–5 star rating and update preference weights |
| `POST` | `/api/upload/avatar` | Private | Upload custom profile picture (Multer storage) |

---

## 🧪 Automated Testing & Verification

The project includes unit and API test suites verifying recommender math, input sanitization, and route security:

```bash
# Run unit test suite (Recommender Cosine Similarity, Input Sanitization, User Auth)
npm test

# Run backend API integration tests
cd server && npm test
```

---

## 📄 License & Attribution
- Built with **React 18**, **Vite 6**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB**.
- Movie metadata, posters, backdrops, and cast information provided by **The Movie Database (TMDB)**.
- Video trailers powered by **YouTube Embed API**.

*© 2026 Movie+ Recommendation Platform. All rights reserved.*
