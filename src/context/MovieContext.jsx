import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MOVIES_DATA, ALL_GENRES } from '../data/moviesData';
import { getPersonalizedRecommendations, getSimilarMovies } from '../utils/recommendationEngine';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const MovieContext = createContext(null);

const deduplicateMovies = (list) => {
  const seen = new Set();
  return (list || []).filter((m) => {
    const key = String(m.tmdbId || m.id);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const MovieProvider = ({ children }) => {
  const { showToast } = useToast();
  const { user, updateProfile, isAuthenticated } = useAuth();

  // Dynamic movies state initialized from real TMDB catalog
  const [movies, setMovies] = useState(() => deduplicateMovies(MOVIES_DATA));

  // Sync movies from backend MongoDB / TMDB on startup
  useEffect(() => {
    let isMounted = true;
    api.getMovies({ limit: 100 })
      .then((fetched) => {
        if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
          setMovies(deduplicateMovies([...fetched, ...MOVIES_DATA]));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const safeParseArray = (val) => {
    try {
      if (!val) return [];
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  };

  const safeParseObject = (val) => {
    try {
      if (!val) return {};
      const p = JSON.parse(val);
      return p && typeof p === 'object' && !Array.isArray(p) ? p : {};
    } catch {
      return {};
    }
  };

  const userKey = user?.email || 'guest';

  // Watchlist state scoped to current account
  const [watchlist, setWatchlist] = useState(() => {
    return safeParseArray(localStorage.getItem(`cinepulse_watchlist_${userKey}`));
  });

  // Watched history scoped to current account
  const [watched, setWatched] = useState(() => {
    return safeParseArray(localStorage.getItem(`cinepulse_watched_${userKey}`));
  });

  // User movie ratings scoped to current account
  const [userRatings, setUserRatings] = useState(() => {
    return safeParseObject(localStorage.getItem(`cinepulse_ratings_${userKey}`));
  });

  // Active Trailer modal target
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);

  // Recommendation algorithm mode
  const [algorithmMode, setAlgorithmMode] = useState('hybrid'); // 'hybrid' | 'genre' | 'watched' | 'rating'

  // Load account data from backend MongoDB or user-scoped cache on login / user switch
  useEffect(() => {
    let isMounted = true;

    const loadUserAccountData = async () => {
      const currentKey = user?.email || 'guest';

      // 1. Load from local cache for this specific user
      try {
        const cachedWatchlist = safeParseArray(localStorage.getItem(`cinepulse_watchlist_${currentKey}`));
        const cachedWatched = safeParseArray(localStorage.getItem(`cinepulse_watched_${currentKey}`));
        const cachedRatings = safeParseObject(localStorage.getItem(`cinepulse_ratings_${currentKey}`));

        if (isMounted) {
          setWatchlist(cachedWatchlist);
          setWatched(cachedWatched);
          setUserRatings(cachedRatings);
        }
      } catch {}

      // 2. If authenticated, fetch real data from backend API
      if (isAuthenticated && localStorage.getItem('cinepulse_token')) {
        try {
          const backendData = await api.getWatchlist();
          if (isMounted && backendData) {
            if (Array.isArray(backendData.watchlist)) {
              setWatchlist(backendData.watchlist);
              localStorage.setItem(`cinepulse_watchlist_${currentKey}`, JSON.stringify(backendData.watchlist));
            }
            if (Array.isArray(backendData.watched)) {
              setWatched(backendData.watched);
              localStorage.setItem(`cinepulse_watched_${currentKey}`, JSON.stringify(backendData.watched));
            }
            if (backendData.userRatings && typeof backendData.userRatings === 'object') {
              setUserRatings(backendData.userRatings);
              localStorage.setItem(`cinepulse_ratings_${currentKey}`, JSON.stringify(backendData.userRatings));
            }
          }
        } catch {
          // Gracefully maintain client cache if offline
        }
      }
    };

    loadUserAccountData();

    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.id, isAuthenticated]);

  // Persist state changes to account-scoped local cache
  useEffect(() => {
    localStorage.setItem(`cinepulse_watchlist_${userKey}`, JSON.stringify(watchlist || []));
  }, [watchlist, userKey]);

  useEffect(() => {
    localStorage.setItem(`cinepulse_watched_${userKey}`, JSON.stringify(watched || []));
  }, [watched, userKey]);

  useEffect(() => {
    localStorage.setItem(`cinepulse_ratings_${userKey}`, JSON.stringify(userRatings || {}));
  }, [userRatings, userKey]);

  // Derived user genres (empty by default)
  const favoriteGenres = Array.isArray(user?.favoriteGenres) ? user.favoriteGenres : [];

  // Toggle Watchlist with live backend sync
  const toggleWatchlist = (movieId) => {
    if (!isAuthenticated) {
      showToast('Please sign in to save movies to your watchlist.', 'info');
      return;
    }
    const movie = (movies || []).find((m) => String(m.id) === String(movieId) || String(m.tmdbId) === String(movieId));
    const title = movie ? movie.title : 'Movie';

    setWatchlist((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const exists = arr.includes(movieId);
      if (exists) {
        showToast(`Removed "${title}" from Watchlist`, 'info');
        return arr.filter((id) => id !== movieId);
      } else {
        showToast(`Added "${title}" to your Watchlist!`, 'success');
        return [...arr, movieId];
      }
    });

    api.toggleWatchlist(movieId).catch(() => {});
  };

  const isInWatchlist = (movieId) => Array.isArray(watchlist) && watchlist.includes(movieId);

  // Toggle Watched with live backend sync
  const toggleWatched = (movieId) => {
    if (!isAuthenticated) {
      showToast('Please sign in to record watched films.', 'info');
      return;
    }
    const movie = (movies || []).find((m) => String(m.id) === String(movieId) || String(m.tmdbId) === String(movieId));
    const title = movie ? movie.title : 'Movie';

    setWatched((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const isAlreadyWatched = arr.includes(movieId);
      if (isAlreadyWatched) {
        showToast(`Unmarked "${title}" as watched`, 'info');
        return arr.filter((id) => id !== movieId);
      } else {
        showToast(`Marked "${title}" as watched! Recommendations updated.`, 'success');
        return [...arr, movieId];
      }
    });

    api.toggleWatched(movieId).catch(() => {});
  };

  const isWatched = (movieId) => Array.isArray(watched) && watched.includes(movieId);

  // Rate Movie with live backend sync
  const rateMovie = (movieId, rating) => {
    if (!isAuthenticated) {
      showToast('Please sign in to rate movies.', 'info');
      return;
    }
    const movie = movies.find((m) => String(m.id) === String(movieId) || String(m.tmdbId) === String(movieId));
    const title = movie ? movie.title : 'Movie';

    setUserRatings((prev) => ({
      ...prev,
      [movieId]: rating
    }));

    // Auto mark as watched if rated
    if (!watched.includes(movieId)) {
      setWatched((prev) => [...prev, movieId]);
    }

    showToast(`Rated "${title}" ${rating}★!`, 'success');
    api.submitRating(movieId, rating).catch(() => {});
  };

  // Toggle Favorite Genre in Profile
  const toggleFavoriteGenre = (genre) => {
    if (!isAuthenticated) {
      showToast('Please sign in to save your favorite genres.', 'info');
      return;
    }
    if (genre === 'All') return;
    const current = [...favoriteGenres];
    const index = current.indexOf(genre);
    let updated;
    if (index > -1) {
      updated = current.filter((g) => g !== genre);
    } else {
      updated = [...current, genre];
    }
    updateProfile({ favoriteGenres: updated });
    showToast(
      updated.length > 0 
        ? `Preferences updated: ${updated.join(', ')}` 
        : 'All genre preferences cleared.', 
      'info'
    );
  };

  // Trailer Modal controls
  const openTrailer = (movie) => {
    setActiveTrailerMovie(movie);
  };

  const closeTrailer = () => {
    setActiveTrailerMovie(null);
  };

  // Reset user preferences
  const resetPreferences = () => {
    setWatchlist([]);
    setWatched([]);
    setUserRatings({});
    localStorage.removeItem(`cinepulse_watchlist_${userKey}`);
    localStorage.removeItem(`cinepulse_watched_${userKey}`);
    localStorage.removeItem(`cinepulse_ratings_${userKey}`);
    showToast('Preferences cleared for this account!', 'info');
  };

  // Filtered categories computed dynamically from real TMDB movies state
  const trendingMovies = useMemo(() => deduplicateMovies(movies.filter((m) => m.trending)), [movies]);
  const popularMovies = useMemo(() => deduplicateMovies(movies.filter((m) => m.popular)), [movies]);
  const topRatedMovies = useMemo(() => deduplicateMovies(movies.filter((m) => m.topRated)), [movies]);
  const recentlyReleasedMovies = useMemo(() => deduplicateMovies(movies.filter((m) => m.recentlyReleased)), [movies]);
  const indianMovies = useMemo(
    () => deduplicateMovies(movies.filter((m) => (m.genres || []).includes('Indian Cinema') || ['hi', 'te', 'ta', 'ml', 'kn'].includes(m.language))),
    [movies]
  );

  // Personalized dynamic recommendations
  const personalizedRecommendations = useMemo(() => {
    return getPersonalizedRecommendations({
      allMovies: movies,
      favoriteGenres,
      watchedMovieIds: watched,
      userRatings,
      algorithmMode
    });
  }, [movies, favoriteGenres, watched, userRatings, algorithmMode]);

  // Last watched movie for "Because You Watched"
  const lastWatchedMovie = useMemo(() => {
    if (!watched.length) return null;
    const lastId = watched[watched.length - 1];
    return movies.find((m) => String(m.id) === String(lastId) || String(m.tmdbId) === String(lastId)) || null;
  }, [watched, movies]);

  const becauseYouWatchedRecommendations = useMemo(() => {
    if (!lastWatchedMovie) return [];
    return getSimilarMovies(lastWatchedMovie, movies, 6);
  }, [lastWatchedMovie, movies]);

  // Movies matching top favorite genres
  const favoriteGenreMovies = useMemo(() => {
    const topGenre = favoriteGenres[0] || 'Sci-Fi';
    return movies.filter((m) => (m.genres || []).includes(topGenre));
  }, [favoriteGenres, movies]);

  const getMovieById = (id) => movies.find((m) => String(m.id) === String(id) || String(m.tmdbId) === String(id));

  return (
    <MovieContext.Provider
      value={{
        movies,
        allGenres: ALL_GENRES,
        watchlist,
        watched,
        userRatings,
        favoriteGenres,
        algorithmMode,
        setAlgorithmMode,
        toggleWatchlist,
        isInWatchlist,
        toggleWatched,
        isWatched,
        rateMovie,
        toggleFavoriteGenre,
        activeTrailerMovie,
        openTrailer,
        closeTrailer,
        resetPreferences,
        getMovieById,
        trendingMovies,
        popularMovies,
        topRatedMovies,
        recentlyReleasedMovies,
        indianMovies,
        personalizedRecommendations,
        lastWatchedMovie,
        becauseYouWatchedRecommendations,
        favoriteGenreMovies
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};
