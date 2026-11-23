import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Movie } from '../models/Movie.js';
import { logger } from '../config/logger.js';
import { globalKNNRecommender } from '../utils/knnRecommender.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const DEFAULT_API_KEY = '44cdd23d855d0dc44ed0c840c30f3b25';

export const getApiKey = () => process.env.TMDB_API_KEY || DEFAULT_API_KEY;

/**
 * Robust HTTPS request with automatic retries across transient network resets
 */
export const fetchTMDB = async (endpoint, params = {}, retries = 3) => {
  const apiKey = getApiKey();
  const queryParams = new URLSearchParams({ api_key: apiKey, ...params });
  const url = `${TMDB_API_BASE}${endpoint}?${queryParams.toString()}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const req = https.get(
          url,
          {
            headers: {
              'User-Agent': 'CinePulse/1.0',
              'Accept': 'application/json'
            },
            timeout: 8000
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                if (res.statusCode >= 400) {
                  return reject(new Error(`TMDB HTTP ${res.statusCode}: ${data}`));
                }
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error(`TMDB JSON Parse Error: ${e.message}`));
              }
            });
          }
        );

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('TMDB Request Timeout'));
        });
      });
    } catch (err) {
      if (attempt === retries) {
        logger.error(`TMDB fetch failed after ${retries} attempts: ${err.message} (${endpoint})`);
        throw err;
      }
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
};

/**
 * Transform raw TMDB details into CinePulse Movie model format
 */
export const transformTMDBMovie = (tmdbMovie, details = {}, category = {}) => {
  const credits = details.credits || {};
  const videos = details.videos?.results || [];
  const rawKeywords = details.keywords?.keywords || details.keywords?.results || [];

  // Director
  const director = credits.crew?.find((c) => c.job === 'Director')?.name || 'Acclaimed Director';

  // Writers
  const writers = credits.crew
    ?.filter((c) => ['Screenplay', 'Writer', 'Story'].includes(c.job))
    .map((c) => c.name)
    .slice(0, 2)
    .join(', ');

  // Lead Cast (up to 5 actors)
  const cast = (credits.cast || []).slice(0, 5).map((actor) => ({
    name: actor.name,
    role: actor.character || 'Leading Cast',
    avatar: actor.profile_path
      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }));

  // YouTube Trailer
  const trailer =
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
    videos.find((v) => v.site === 'YouTube');

  // Genres
  const genres = (details.genres || tmdbMovie.genres || [])
    .map((g) => (typeof g === 'string' ? g : g.name))
    .filter(Boolean);

  const finalGenres = genres.length > 0 ? genres : ['Drama'];

  // Keywords
  const similarityKeywords = rawKeywords.length > 0
    ? rawKeywords.map((k) => k.name)
    : [...finalGenres, tmdbMovie.original_language === 'hi' ? 'bollywood' : 'cinema'];

  const posterPath = tmdbMovie.poster_path || details.poster_path;
  const backdropPath = tmdbMovie.backdrop_path || details.backdrop_path;

  const poster = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

  const backdrop = backdropPath
    ? `https://image.tmdb.org/t/p/original${backdropPath}`
    : poster;

  const voteAverage = Number((tmdbMovie.vote_average || details.vote_average || 7.5).toFixed(1));
  const voteCountRaw = tmdbMovie.vote_count || details.vote_count || 1000;
  const voteCountFormatted = voteCountRaw >= 1000
    ? `${(voteCountRaw / 1000).toFixed(1)}K`
    : `${voteCountRaw}`;

  const runtimeMinutes = details.runtime || 120;
  const releaseYear = (tmdbMovie.release_date || details.release_date)
    ? new Date(tmdbMovie.release_date || details.release_date).getFullYear()
    : 2024;

  const originalLang = tmdbMovie.original_language || details.original_language || 'en';

  return {
    id: String(tmdbMovie.id),
    tmdbId: Number(tmdbMovie.id),
    title: tmdbMovie.title || details.title || 'Untitled Movie',
    tagline: details.tagline || '',
    year: releaseYear,
    rating: voteAverage,
    voteCount: voteCountFormatted,
    certification: 'PG-13',
    runtime: `${runtimeMinutes} min`,
    runtimeMinutes,
    genres: finalGenres,
    director,
    writer: writers || director,
    description: tmdbMovie.overview || details.overview || 'No description available.',
    cast: cast.length > 0 ? cast : [{ name: 'Ensemble Cast', role: 'Main Lead', avatar: '' }],
    poster,
    backdrop,
    trailerId: trailer ? trailer.key : '',
    similarityKeywords,
    language: originalLang,
    trending: !!category.trending,
    popular: !!category.popular,
    topRated: !!category.topRated,
    recentlyReleased: !!category.recentlyReleased
  };
};

/**
 * Upsert movie into MongoDB: check TMDB ID, update if existing, insert if new
 */
export const upsertMovie = async (movieData) => {
  return await Movie.findOneAndUpdate(
    {
      $or: [{ tmdbId: movieData.tmdbId }, { id: movieData.id }]
    },
    { $set: movieData },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

/**
 * Fetch detailed movie by TMDB ID dynamically and store in MongoDB
 */
export const fetchMovieByIdFromTMDB = async (tmdbId) => {
  try {
    const details = await fetchTMDB(`/movie/${tmdbId}`, {
      append_to_response: 'credits,videos,keywords'
    });
    const movieData = transformTMDBMovie(details, details);
    return await upsertMovie(movieData);
  } catch (err) {
    logger.warn(`Could not dynamically fetch TMDB movie ${tmdbId}: ${err.message}`);
    return null;
  }
};

/**
 * Search TMDB dynamically
 */
export const searchTMDB = async (query, page = 1) => {
  const res = await fetchTMDB('/search/movie', { query, page });
  const rawResults = res.results || [];

  const movies = [];
  for (const raw of rawResults.slice(0, 10)) {
    try {
      const details = await fetchTMDB(`/movie/${raw.id}`, {
        append_to_response: 'credits,videos,keywords'
      });
      const transformed = transformTMDBMovie(raw, details);
      await upsertMovie(transformed);
      movies.push(transformed);
    } catch {
      const fallback = transformTMDBMovie(raw, {});
      movies.push(fallback);
    }
  }
  return movies;
};

/**
 * Sync curated list of Indian (Bollywood/Tollywood/South) & Global movies
 */
export const syncCuratedCatalog = async () => {
  logger.info('Starting TMDB Curated Catalog Sync (Indian & Global Hits)...');

  // Curated list of high-reputation TMDB IDs:
  // Indian masterpieces:
  // 19404: DDLJ, 20453: 3 Idiots, 579974: RRR, 360814: Dangal, 7598: Taare Zameen Par
  // 297222: PK, 256040: Baahubali, 350312: Baahubali 2, 560057: KGF, 872906: Jawan
  // 14624: Sholay, 106440: Gangs of Wasseypur, 534780: Stree, 4247: Lagaan, 73783: ZNMD
  // 376867: Andhadhun, 497814: Tumbbad, 335033: Drishyam
  const curatedIndianIds = [
    20453, 579974, 360814, 19404, 7598, 297222, 256040, 350312, 560057, 
    872906, 14624, 106440, 534780, 4247, 73783, 376867, 497814, 335033
  ];

  // Global Hollywood classics:
  // 157336: Interstellar, 27205: Inception, 155: The Dark Knight, 872585: Oppenheimer
  // 693134: Dune 2, 550: Fight Club, 278: Shawshank Redemption, 496243: Parasite
  // 603: The Matrix, 299534: Avengers Endgame, 634649: Spider-Man No Way Home
  // 129: Spirited Away, 76600: Avatar 2, 19995: Avatar, 680: Pulp Fiction
  // 545611: Everything Everywhere All at Once, 438631: Dune Part 1, 929590: Civil War
  const curatedGlobalIds = [
    157336, 27205, 155, 872585, 693134, 550, 278, 496243, 603,
    299534, 634649, 129, 76600, 19995, 680, 545611, 438631, 929590
  ];

  const uniqueIds = Array.from(new Set([...curatedIndianIds, ...curatedGlobalIds]));

  // Also fetch live trending movies to capture latest trending titles
  try {
    const trendingRes = await fetchTMDB('/trending/movie/week');
    (trendingRes.results || []).slice(0, 15).forEach((m) => uniqueIds.push(m.id));
  } catch (e) {
    logger.warn(`Could not fetch live trending: ${e.message}`);
  }

  // Also fetch popular Indian movies
  try {
    const indianPopRes = await fetchTMDB('/discover/movie', {
      with_origin_country: 'IN',
      sort_by: 'vote_count.desc',
      page: 1
    });
    (indianPopRes.results || []).slice(0, 15).forEach((m) => uniqueIds.push(m.id));
  } catch (e) {
    logger.warn(`Could not fetch popular Indian movies: ${e.message}`);
  }

  const finalUniqueIds = Array.from(new Set(uniqueIds));
  logger.info(`Fetching deep metadata for ${finalUniqueIds.length} unique TMDB titles...`);

  const processedMovies = [];
  const seenTmdbIds = new Set();

  for (const id of finalUniqueIds) {
    if (seenTmdbIds.has(id)) continue;
    try {
      const details = await fetchTMDB(`/movie/${id}`, {
        append_to_response: 'credits,videos,keywords'
      });

      const isIndian = details.original_language === 'hi' ||
        details.original_language === 'te' ||
        details.original_language === 'ta' ||
        details.original_language === 'ml' ||
        (details.origin_country || []).includes('IN');

      const isTopRated = details.vote_average >= 8.0;
      const isTrending = details.popularity >= 40;
      const isPopular = details.vote_count >= 1000 || details.popularity >= 30;

      const movieObj = transformTMDBMovie(details, details, {
        trending: isTrending,
        popular: isPopular,
        topRated: isTopRated,
        recentlyReleased: (details.release_date && new Date(details.release_date).getFullYear() >= 2023)
      });

      if (isIndian && !movieObj.genres.includes('Indian Cinema')) {
        // Tag Indian movies for UI filter ease if desired
        movieObj.language = details.original_language;
      }

      await upsertMovie(movieObj);
      processedMovies.push(movieObj);
      seenTmdbIds.add(id);
    } catch (err) {
      logger.warn(`Skipping TMDB movie ID ${id}: ${err.message}`);
    }
  }

  logger.info(`Successfully synced ${processedMovies.length} unique movies from TMDB into MongoDB`);

  // Train Recommender with fresh data
  globalKNNRecommender.fit(processedMovies);

  // Write static fallbacks so app is resilient offline
  saveStaticFallbacks(processedMovies);

  return processedMovies;
};

/**
 * Saves fetched TMDB data to seed and frontend files to completely replace dummy data
 */
export const saveStaticFallbacks = (movies) => {
  if (!movies || movies.length === 0) return;

  try {
    const seedPath = path.resolve(__dirname, '../data/moviesSeed.json');
    fs.writeFileSync(seedPath, JSON.stringify(movies, null, 2), 'utf-8');
    logger.info(`Saved ${movies.length} real TMDB movies to ${seedPath}`);

    const mlPath = path.resolve(__dirname, '../../ml_pipeline/data/movies_dataset.json');
    if (fs.existsSync(path.dirname(mlPath))) {
      fs.writeFileSync(mlPath, JSON.stringify(movies, null, 2), 'utf-8');
      logger.info(`Saved ${movies.length} real TMDB movies to ${mlPath}`);
    }

    const frontendPath = path.resolve(__dirname, '../../src/data/moviesData.js');
    if (fs.existsSync(path.dirname(frontendPath))) {
      const allGenres = Array.from(
        new Set(movies.flatMap((m) => m.genres || []))
      ).filter(Boolean);

      const frontendCode = `/**
 * Real TMDB Movie Dataset (Auto-generated from TMDB API)
 * Total Movies: ${movies.length} (Indian & Global Masterpieces)
 */
export const ALL_GENRES = ${JSON.stringify(['All', ...allGenres], null, 2)};

export const MOVIES_DATA = ${JSON.stringify(movies, null, 2)};
`;
      fs.writeFileSync(frontendPath, frontendCode, 'utf-8');
      logger.info(`Saved ${movies.length} real TMDB movies to ${frontendPath}`);
    }
  } catch (err) {
    logger.error(`Error saving static fallback files: ${err.message}`);
  }
};
