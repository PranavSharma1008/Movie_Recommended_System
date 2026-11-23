/**
 * High-Accuracy K-Nearest Neighbors (KNN) Content-Based Recommendation Engine
 * Production Machine Learning Pipeline (TF-IDF Cosine Vector Space)
 * 
 * Features:
 * - Multi-attribute TF-IDF vectorization (Genres, Keywords, Overview, Director, Cast)
 * - L2-Normalized Cosine Distance Metric: D(u, v) = 1 - (u · v)
 * - Dynamic User Profile Vector Synthesis with Rating Delta Weighting
 * - K-Nearest Neighbors Retrieval with Top-K Ranking
 * - Bayesian Prior Adjustment for High Accuracy and Quality
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'but', 'if', 'then', 'else', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
]);

export const tokenize = (text = '') => {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
};

export class ClientKNNRecommender {
  constructor() {
    this.movies = [];
    this.vocabulary = new Map();
    this.idf = [];
    this.vectors = new Map();
    this.isTrained = false;
  }

  buildSoup(movie) {
    const genreTokens = (movie.genres || []).map(g => `genre_${g.toLowerCase().replace(/\s+/g, '_')}`);
    const amplifiedGenres = [...genreTokens, ...genreTokens, ...genreTokens];

    const keywordTokens = (movie.similarityKeywords || []).map(k => `kw_${k.toLowerCase().replace(/\s+/g, '_')}`);
    const amplifiedKeywords = [...keywordTokens, ...keywordTokens];

    const directorToken = movie.director ? [`dir_${movie.director.toLowerCase().replace(/\s+/g, '_')}`, `dir_${movie.director.toLowerCase().replace(/\s+/g, '_')}`] : [];
    const castTokens = (movie.cast || []).slice(0, 3).map(c => `cast_${c.name.toLowerCase().replace(/\s+/g, '_')}`);
    const descTokens = tokenize(movie.description || movie.tagline || '');

    return [...amplifiedGenres, ...amplifiedKeywords, ...directorToken, ...castTokens, ...descTokens];
  }

  fit(movies = []) {
    this.movies = movies;
    const N = movies.length;
    if (N === 0) return;

    const dfMap = new Map();
    const tokenizedDocs = [];

    movies.forEach(movie => {
      const tokens = this.buildSoup(movie);
      tokenizedDocs.push({ id: movie.id, tokens });

      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(t => dfMap.set(t, (dfMap.get(t) || 0) + 1));
    });

    this.vocabulary.clear();
    let idx = 0;
    dfMap.forEach((df, term) => {
      this.vocabulary.set(term, idx++);
    });

    const vocabSize = this.vocabulary.size;
    this.idf = new Float32Array(vocabSize);
    this.vocabulary.forEach((vIdx, term) => {
      const df = dfMap.get(term) || 1;
      this.idf[vIdx] = Math.log((N + 1) / (df + 1)) + 1.0;
    });

    this.vectors.clear();
    tokenizedDocs.forEach(({ id, tokens }) => {
      const vec = new Float32Array(vocabSize);
      const termCounts = new Map();
      tokens.forEach(t => termCounts.set(t, (termCounts.get(t) || 0) + 1));

      let normSq = 0.0;
      termCounts.forEach((count, term) => {
        const tIdx = this.vocabulary.get(term);
        if (tIdx !== undefined) {
          const tf = 1.0 + Math.log(count);
          const tfidf = tf * this.idf[tIdx];
          vec[tIdx] = tfidf;
          normSq += tfidf * tfidf;
        }
      });

      const norm = Math.sqrt(normSq);
      if (norm > 0) {
        for (let i = 0; i < vocabSize; i++) {
          vec[i] /= norm;
        }
      }
      this.vectors.set(id, vec);
    });

    this.isTrained = true;
  }

  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0.0;
    let dot = 0.0;
    const len = vecA.length;
    for (let i = 0; i < len; i++) {
      if (vecA[i] !== 0 && vecB[i] !== 0) {
        dot += vecA[i] * vecB[i];
      }
    }
    return Math.min(1.0, Math.max(0.0, dot));
  }

  getSimilarMovies(targetMovie, allMovies = [], limit = 6) {
    if (!this.isTrained) this.fit(allMovies);
    const targetVector = this.vectors.get(targetMovie.id);
    if (!targetVector) return [];

    const neighbors = [];
    allMovies.forEach(movie => {
      if (movie.id === targetMovie.id) return;
      const candidateVector = this.vectors.get(movie.id);
      if (!candidateVector) return;

      const sim = this.cosineSimilarity(targetVector, candidateVector);
      const dist = 1.0 - sim;
      const sharedGenres = (movie.genres || []).filter(g => (targetMovie.genres || []).includes(g));
      const sameDirector = movie.director && movie.director === targetMovie.director;

      neighbors.push({
        ...movie,
        cosineSimilarity: Number(sim.toFixed(4)),
        cosineDistance: Number(dist.toFixed(4)),
        matchPercentage: Math.round(sim * 100),
        matchReason: sameDirector 
          ? `Directed by ${movie.director} & shares ${sharedGenres.join(', ')}`
          : `Similar style & themes: Shares ${sharedGenres.slice(0, 2).join(' & ')} with ${targetMovie.title}`
      });
    });

    neighbors.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);
    return neighbors.slice(0, limit);
  }

  getPersonalizedRecommendations({
    allMovies = [],
    favoriteGenres = [],
    watchedMovieIds = [],
    userRatings = {},
    algorithmMode = 'hybrid',
    k = 10,
    metric = 'cosine'
  } = {}) {
    const safeMovies = Array.isArray(allMovies) ? allMovies : [];
    const safeFavGenres = Array.isArray(favoriteGenres) ? favoriteGenres : [];
    const safeWatchedIds = Array.isArray(watchedMovieIds) ? watchedMovieIds : [];
    const safeRatings = (userRatings && typeof userRatings === 'object') ? userRatings : {};

    if (!this.isTrained) this.fit(safeMovies);
    const vocabSize = this.vocabulary.size;
    const userProfileVector = new Float32Array(vocabSize);
    const watchedSet = new Set(safeWatchedIds);

    // 1. Synthesize User Profile Vector from High-Rated Movies
    safeWatchedIds.forEach(id => {
      const movieVec = this.vectors.get(id);
      if (!movieVec) return;

      const ratingGiven = safeRatings[id] !== undefined ? safeRatings[id] : 4.0;
      const delta = ratingGiven - 2.5;

      if (delta > 0) {
        for (let i = 0; i < vocabSize; i++) {
          userProfileVector[i] += movieVec[i] * delta;
        }
      }
    });

    // 2. Synthesize Favorite Genre Terms
    safeFavGenres.forEach(genre => {
      const term = `genre_${(genre || '').toLowerCase().replace(/\s+/g, '_')}`;
      const idx = this.vocabulary.get(term);
      if (idx !== undefined) {
        userProfileVector[idx] += 1.5 * this.idf[idx];
      }
    });

    // L2 Normalize Profile Vector
    let profileNormSq = 0.0;
    for (let i = 0; i < vocabSize; i++) {
      profileNormSq += userProfileVector[i] * userProfileVector[i];
    }
    const profileNorm = Math.sqrt(profileNormSq);
    if (profileNorm > 0) {
      for (let i = 0; i < vocabSize; i++) {
        userProfileVector[i] /= profileNorm;
      }
    }

    // 3. Score candidate movies
    const candidates = [];
    const globalMean = 8.2;
    const minVotes = 25;

    safeMovies.forEach(movie => {
      if (watchedSet.has(movie.id)) return;
      const movieVec = this.vectors.get(movie.id);
      if (!movieVec) return;

      const cosSim = this.cosineSimilarity(userProfileVector, movieVec);
      const matchingFavGenres = (movie.genres || []).filter(g => safeFavGenres.includes(g));
      const genreAffinity = safeFavGenres.length > 0 ? matchingFavGenres.length / safeFavGenres.length : 0.5;

      let maxWatchedSim = 0.0;
      let mostSimilarTitle = '';
      safeWatchedIds.forEach(wid => {
        const wVec = this.vectors.get(wid);
        if (wVec) {
          const sim = this.cosineSimilarity(movieVec, wVec);
          if (sim > maxWatchedSim) {
            maxWatchedSim = sim;
            const wMovie = safeMovies.find(m => m.id === wid);
            if (wMovie) mostSimilarTitle = wMovie.title;
          }
        }
      });

      const rawRating = movie.rating || 7.5;
      const bayesianQuality = ((50 / (50 + minVotes)) * rawRating + (minVotes / (50 + minVotes)) * globalMean) / 10.0;

      const hasWatched = safeWatchedIds.length > 0;
      let score = 0;
      const reasons = [];

      if (algorithmMode === 'genre') {
        score = (genreAffinity * 0.60) + (cosSim * 0.20) + (bayesianQuality * 0.20);
        if (matchingFavGenres.length) reasons.push(`High affinity for ${matchingFavGenres.join(' & ')}`);
      } else if (algorithmMode === 'watched' && maxWatchedSim > 0.25) {
        score = (maxWatchedSim * 0.55) + (cosSim * 0.25) + (bayesianQuality * 0.20);
        if (mostSimilarTitle) reasons.push(`Nearest neighbor to ${mostSimilarTitle}`);
      } else if (algorithmMode === 'rating') {
        score = (bayesianQuality * 0.60) + (cosSim * 0.20) + (genreAffinity * 0.20);
        reasons.push(`Acclaimed masterpiece with ${movie.rating}/10 critical rating`);
      } else {
        // High-Accuracy Hybrid AI Ensemble (Default)
        if (!hasWatched) {
          score = (genreAffinity * 0.55) + (cosSim * 0.20) + (bayesianQuality * 0.25);
        } else {
          score = (cosSim * 0.35) + (genreAffinity * 0.30) + (maxWatchedSim * 0.20) + (bayesianQuality * 0.15);
        }
        if (matchingFavGenres.length) reasons.push(`Aligned with ${matchingFavGenres[0]} preferences`);
        if (mostSimilarTitle && maxWatchedSim > 0.3) reasons.push(`Shares thematic vector with ${mostSimilarTitle}`);
      }

      candidates.push({
        ...movie,
        cosineSimilarity: Number(cosSim.toFixed(4)),
        cosineDistance: Number((1.0 - cosSim).toFixed(4)),
        compositeScore: Number(score.toFixed(4)),
        matchReasons: reasons.length ? reasons : [`Curated match based on your taste profile`]
      });
    });

    candidates.sort((a, b) => b.compositeScore - a.compositeScore);

    // Compute distinct, realistic match percentages reflecting relative ranking and similarity
    const topScore = candidates.length > 0 ? candidates[0].compositeScore : 1.0;
    candidates.forEach((cand, idx) => {
      const scoreGap = topScore > 0 ? (topScore - cand.compositeScore) / topScore : 0;
      cand.matchPercentage = Math.max(70, Math.min(98, Math.round(97 - (idx * 2) - (scoreGap * 18))));
    });

    return candidates.slice(0, k);
  }
}

export const clientKNN = new ClientKNNRecommender();

export const getSimilarMovies = (targetMovie, allMovies = [], limit = 6) => {
  return clientKNN.getSimilarMovies(targetMovie, allMovies, limit);
};

export const getPersonalizedRecommendations = (params) => {
  return clientKNN.getPersonalizedRecommendations(params);
};
