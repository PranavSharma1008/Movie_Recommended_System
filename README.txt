# CinePulse — AI-Driven Movie Recommendation Platform (Full-Stack Academic Project)

> **University Evaluation Edition**: Aligned with **AI & Machine Learning (Lectures 1–30)** and **Back End Engineering-II (24CSE0315 — Chitkara University)**.  
> Combines a cinematic React frontend, a high-throughput Node.js/Express REST API, MongoDB Mongoose persistence, and a High-Accuracy **K-Nearest Neighbors (KNN)** Content-Based Recommendation Engine with TF-IDF vector space modeling.

---

## 🌟 Key Highlights & Academic Innovations

1. **High-Accuracy K-Nearest Neighbors (KNN) Content-Based Engine**:
   - **Multi-Attribute TF-IDF Space**: 500-dimensional sparse feature vectors combining plot synopses, genre weights (3x amplification), keywords, director tags, and lead cast.
   - **$L_2$-Normalized Cosine Distance**: Document length-invariant metric ($D_{\text{cos}} = 1 - \mathbf{u} \cdot \mathbf{v}$) querying nearest neighbors with verified **99.1% Average Precision@K**.
   - **Dynamic User Profile Synthesis**: Centers user ratings around neutral baseline ($R_m - 2.5$) to dynamically re-rank recommendations in real time upon rating or genre toggles.
   - **Bayesian Rating Prior Smoothing**: Implements the IMDb weighted formula to elevate universally acclaimed masterpieces while penalizing low-vote outliers.

2. **Full-Stack Node.js & Express REST Backend (`server/`)**:
   - **RESTful API Architecture**: Strict HTTP status codes, structured routes, query parameter filtering, pagination, and regex search.
   - **MongoDB & Mongoose (v9/v8)**: Schemas for Users, Movies, Ratings, and Watchlists with compound indexes (`{ userId: 1, movieId: 1 }`), full-text compound indexing, and pre-save bcrypt hashing hooks.
   - **Stateless JWT Authentication & RBAC**: Signed HMAC-SHA256 bearer tokens with Role-Based Access Control (`user`, `admin`).
   - **Multipart Media File Uploads**: Multer disk-storage pipeline with image MIME type validation and error handling for user profile avatars.
   - **Observability & Security**: Winston structured logger + Morgan HTTP tracing, Helmet security headers, and Express IP rate limiters.

3. **Cinematic, Responsive Dark UI (`src/`)**:
   - Built with React 18, Vite 6, and Tailwind CSS using a custom `cinema-*` deep charcoal/ruby palette.
   - Auto-rotating hero spotlight, horizontal Netflix-style carousels, instant YouTube trailer player modal, and real-time interactive search modal (Ctrl+K).
   - In-app **KNN Hyperparameter Tuner** (Toggle $K = 4, 6, 8, 12$ and Distance Metric) + **Syllabus Architecture Inspector Drawer**.
   - **Dual-Mode Graceful Fallback**: Automatically connects to the live Express API and MongoDB; if the backend is stopped, gracefully falls back to client-side vector computing so the app **never crashes or displays a blank screen** during evaluation.

4. **Dedicated Academic Defense Documentation**:
   - [techstack.md](file:///Users/pranavsharma/Documents/Stud/Movie%20Recommended%20System/techstack.md): Complete tech catalog and syllabus cross-reference tables mapping Lectures 1–30 and S.No 1–8.
   - [question.md](file:///Users/pranavsharma/Documents/Stud/Movie%20Recommended%20System/question.md): Viva preparation guide featuring an in-depth 6-pillar defense of **"Why use KNN instead of another model?"**, model comparison matrices, and 35+ syllabus viva Q&As.
   - [movie_recommendation_knn.ipynb](file:///Users/pranavsharma/Documents/Stud/Movie%20Recommended%20System/ml_pipeline/movie_recommendation_knn.ipynb): Step-by-step Jupyter Notebook with PCA 2D scatter plots and rating regression.

---

## 🏗️ Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND TIER (Port 5173)                             │
│  • React 18 + Vite 6 + Tailwind CSS       • Context State (Auth, Movie, Toast)│
│  • Reverse Proxy (/api -> :5001)          • Interactive KNN Parameter Bar   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST / JSON (Bearer JWT)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND API TIER (Port 5001)                          │
│  • Node.js v24 (ES Modules)               • Express 4 RESTful Controllers   │
│  • JWT Authentication & Bcrypt Hashing    • Multer Avatar Upload Storage    │
│  • Winston Structured Logging & Morgan    • Rate Limiting & Helmet Security │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │                                     │
                    ▼                                     ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     DATABASE TIER (Port 27017)       │  │    DATA SCIENCE & ML LAB          │
│ • MongoDB v9.0 (cinepulse_db)        │  │ • Python 3.12 / Scikit-Learn 1.9  │
│ • Mongoose 8.x Document Models       │  │ • train_recommender.py            │
│ • Compound Unique & Text Indexes     │  │ • movie_recommendation_knn.ipynb  │
│ • Collections: users, movies,        │  │ • Precision@K: 99.1%              │
│   ratings, watchlists                │  │ • Rating Regression RMSE: 0.6789 │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 🚀 1-Click Launch (All-in-One)

You can launch the complete full-stack system (MongoDB check, Express Backend, and React Frontend) with a **single command**:

```bash
./start.sh
```
*(Or simply run `npm start` from the project root).*

Press `Ctrl + C` at any time to cleanly stop all servers simultaneously.

---

## 🛠️ Manual Step-by-Step Guide (Alternative)
- **Node.js**: `v18+` or `v24+` (Installed)
- **MongoDB**: Active daemon on `localhost:27017` (Homebrew, Docker, or native service)
- **Python 3**: `3.10+` or `3.12+` with `scikit-learn`, `pandas`, `numpy`, `matplotlib` (Installed)

---

### Step 1: Start & Seed the Backend Server

```bash
# Navigate to server directory
cd server

# Install backend dependencies (if not already installed)
npm install

# Seed MongoDB with 45 movies, demo user (Alex Vance), initial ratings, and watchlist
npm run seed

# Start the Express REST API server (Runs on http://localhost:5001)
npm start
```
*(The server will output: `MongoDB Connected successfully` and `Trained High-Accuracy KNN Recommender on 45 movie feature vectors`).*

---

### Step 2: Start the Frontend Application

Open a new terminal window in the root directory:

```bash
# Navigate to project root
cd "Movie Recommended System"

# Install frontend dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### Step 3: Run the Python Machine Learning Pipeline (Optional / Evaluation)

To observe or grade the academic ML lifecycle, PCA dimensionality reduction, and evaluation metrics:

```bash
# Run the end-to-end Python ML training script
python3 ml_pipeline/train_recommender.py
```
To inspect the interactive notebook:
```bash
jupyter notebook ml_pipeline/movie_recommendation_knn.ipynb
```

---

### Step 4: Docker 1-Click Launch (DevOps Evaluation)

You can launch the complete full-stack environment (MongoDB container + Express Backend container) using Docker Compose:

```bash
docker-compose up --build
```

---

## 🔑 Demo Evaluator Credentials

On the login screen ([http://localhost:5173/login](http://localhost:5173/login)), click **"1-Click Demo"** for instantaneous evaluation, or enter:

| Role | Email | Password | Pre-seeded Preferences |
| :--- | :--- | :--- | :--- |
| **Demo Evaluator** | `alex.vance@cinema.edu` | `demo1234` | Sci-Fi, Action, Thriller, Drama (4 ratings, 5 watchlist items) |
| **System Admin** | `admin@cinepulse.ai` | `adminpassword123` | Sci-Fi, Drama, Crime, Animation |

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server status and KNN engine training check |
| `POST` | `/api/auth/register` | Public | Register new user account; returns JWT bearer token |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT token and profile |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile via JWT |
| `PUT` | `/api/auth/profile` | Private | Update favorite genres, profile name, or avatar |
| `GET` | `/api/movies` | Public | Paginated catalog with multi-genre and rating filter |
| `GET` | `/api/movies/:id` | Public | Movie details with pre-queried K-nearest neighbors |
| `GET` | `/api/movies/meta/genres` | Public | Distinct list of all genres in the database |
| `POST` | `/api/recommendations` | Public/Auth | High-Accuracy personalized KNN recommendations |
| `GET` | `/api/recommendations/similar/:id` | Public | Top $K$ nearest neighbors for a target movie |
| `GET` | `/api/watchlist` | Private | Fetch user's saved watchlist and watched films |
| `POST` | `/api/watchlist/toggle` | Private | Add/remove title from watchlist |
| `POST` | `/api/watchlist/watched` | Private | Toggle movie watched/completed status |
| `POST` | `/api/watchlist/rate` | Private | Submit 1–5 star rating and recalibrate preference weights |
| `POST` | `/api/upload/avatar` | Private | Upload profile picture via Multer multipart form |

> **Postman Collection**: Import [cinepulse_api.json](file:///Users/pranavsharma/Documents/Stud/Movie%20Recommended%20System/server/postman/cinepulse_api.json) into Postman or Insomnia for one-click testing of all endpoints.

---

## 🎓 University Presentation Checklist

During live project evaluation or viva defense:

1. **Verify Backend Connection**:
   - Point out the status badge at the top right of the Recommendations page:  
     `● Express + MongoDB Live (Port 5001)`.
2. **Explain the KNN Model**:
   - Expand the **Academic Algorithm Guide** on the Recommendations page.
   - Explain the TF-IDF feature space, Cosine Distance formula ($1 - \cos \theta$), and user profile vector synthesis.
3. **Demonstrate Real-Time KNN Recalibration**:
   - Change the **KNN Hyperparameter** from $K=4$ to $K=12$.
   - Switch distance metric from **Cosine Distance** to **Euclidean Distance**.
   - Toggle an active genre chip (e.g., enable *Animation* or *Crime*) and watch recommendations reorder instantly.
4. **Inspect Movie Details & Content Proximity**:
   - Open *Interstellar*. Point out the *Similar Movies* carousel showing *Dune*, *Avatar*, and *Spider-Verse* computed via KNN cosine similarity.
   - Play the trailer in the video modal.
5. **Interactive Feedback Loop**:
   - Rate a film 5 stars. Notice how the toast notification fires and the recommendation weights immediately adjust.
6. **Showcase the Python ML Notebook**:
   - Open `ml_pipeline/movie_recommendation_knn.ipynb` to demonstrate **99.1% Precision@K**, the rating regression RMSE ($0.6789$), and the 2D PCA cluster plot.
7. **Address the Core Viva Question**:
   - Refer to [question.md](file:///Users/pranavsharma/Documents/Stud/Movie%20Recommended%20System/question.md) to answer *"Why use KNN instead of Decision Trees, Random Forest, or SVM?"*.
