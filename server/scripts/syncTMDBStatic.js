import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.TMDB_API_KEY || '44cdd23d855d0dc44ed0c840c30f3b25';

async function fetchTMDB(endpoint, params = {}, retries = 4) {
  const queryParams = new URLSearchParams({ api_key: API_KEY, ...params });
  const url = `https://api.themoviedb.org/3${endpoint}?${queryParams.toString()}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'CinePulse/1.0' }, timeout: 8000 }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      });
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

function transformMovie(tmdbMovie, details = {}) {
  const credits = details.credits || {};
  const videos = details.videos?.results || [];
  const rawKeywords = details.keywords?.keywords || details.keywords?.results || [];

  const director = credits.crew?.find(c => c.job === 'Director')?.name || 'Acclaimed Director';
  const writers = credits.crew
    ?.filter(c => ['Screenplay', 'Writer', 'Story'].includes(c.job))
    .map(c => c.name)
    .slice(0, 2)
    .join(', ');

  const cast = (credits.cast || []).slice(0, 5).map(actor => ({
    name: actor.name,
    role: actor.character || 'Leading Cast',
    avatar: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }));

  const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
                  videos.find(v => v.site === 'YouTube' && v.type === 'Teaser') ||
                  videos.find(v => v.site === 'YouTube');

  const genres = (details.genres || tmdbMovie.genres || []).map(g => typeof g === 'string' ? g : g.name).filter(Boolean);
  const finalGenres = genres.length ? genres : ['Drama'];

  const originalLang = tmdbMovie.original_language || details.original_language || 'en';
  const isIndian = ['hi', 'te', 'ta', 'ml', 'kn'].includes(originalLang);

  if (isIndian && !finalGenres.includes('Indian Cinema')) {
    finalGenres.push('Indian Cinema');
  }

  const similarityKeywords = rawKeywords.length 
    ? rawKeywords.map(k => k.name) 
    : [...finalGenres, isIndian ? 'bollywood' : 'cinema'];

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
  const voteCountFormatted = voteCountRaw >= 1000 ? `${(voteCountRaw / 1000).toFixed(1)}K` : `${voteCountRaw}`;

  const runtimeMinutes = details.runtime || 135;
  const releaseYear = (tmdbMovie.release_date || details.release_date) 
    ? new Date(tmdbMovie.release_date || details.release_date).getFullYear() 
    : 2024;

  return {
    id: String(tmdbMovie.id),
    tmdbId: Number(tmdbMovie.id),
    title: tmdbMovie.title || details.title,
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
    cast: cast.length ? cast : [{ name: 'Ensemble Cast', role: 'Main Lead', avatar: '' }],
    poster,
    backdrop,
    trailerId: trailer ? trailer.key : '',
    similarityKeywords,
    language: originalLang,
    trending: voteAverage >= 7.8 || (details.popularity && details.popularity > 30),
    popular: voteCountRaw >= 1500 || (details.popularity && details.popularity > 25),
    topRated: voteAverage >= 8.0,
    recentlyReleased: releaseYear >= 2022
  };
}

async function run() {
  console.log('Fetching curated real TMDB catalog (Indian & Global Masterpieces)...');

  const indianIds = [
    20453,   // 3 Idiots
    579974,  // RRR
    360814,  // Dangal
    19404,   // Dilwale Dulhania Le Jayenge
    7598,    // Taare Zameen Par (Like Stars on Earth)
    297222,  // PK
    256040,  // Baahubali: The Beginning
    350312,  // Baahubali 2: The Conclusion
    560057,  // K.G.F: Chapter 1
    632617,  // K.G.F: Chapter 2
    872906,  // Jawan
    14624,   // Sholay
    106440,  // Gangs of Wasseypur
    534780,  // Stree
    4247,    // Lagaan
    73783,   // Zindagi Na Milegi Dobara
    376867,  // Andhadhun
    497814,  // Tumbbad
    335033,  // Drishyam
    955991,  // Kantara
    19402,   // Swades
    592834,  // Chhichhore
    780076,  // Vikram
    799766   // Kalki 2898 AD
  ];

  const globalIds = [
    157336,  // Interstellar
    27205,   // Inception
    155,     // The Dark Knight
    872585,  // Oppenheimer
    693134,  // Dune: Part Two
    550,     // Fight Club
    278,     // The Shawshank Redemption
    496243,  // Parasite
    603,     // The Matrix
    299534,  // Avengers: Endgame
    634649,  // Spider-Man: No Way Home
    129,     // Spirited Away
    76600,   // Avatar: The Way of Water
    19995,   // Avatar
    680,     // Pulp Fiction
    545611,  // Everything Everywhere All at Once
    438631,  // Dune: Part One
    98,      // Gladiator
    238,     // The Godfather
    13,      // Forrest Gump
    244786,  // Whiplash
    569094,  // Spider-Man: Across the Spider-Verse
    361743,  // Top Gun: Maverick
    335984   // Blade Runner 2049
  ];

  const targetIds = Array.from(new Set([...indianIds, ...globalIds]));
  console.log(`Processing ${targetIds.length} unique TMDB movie IDs...`);

  const movies = [];
  for (let i = 0; i < targetIds.length; i++) {
    const id = targetIds[i];
    try {
      const details = await fetchTMDB(`/movie/${id}`, { append_to_response: 'credits,videos,keywords' });
      const movie = transformMovie(details, details);
      movies.push(movie);
      console.log(`[${movies.length}/${targetIds.length}] ✓ ${movie.title} (${movie.year}) [${movie.language}]`);
    } catch (err) {
      console.warn(`[WARN] Skipping ${id}: ${err.message}`);
    }
    // Small pause to be gentle with TMDB rate limits
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nSuccessfully fetched ${movies.length} real TMDB movies!`);

  // 1. Write server/data/moviesSeed.json
  const seedFile = path.resolve(__dirname, '../data/moviesSeed.json');
  fs.writeFileSync(seedFile, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`✓ Saved server/data/moviesSeed.json (${movies.length} movies)`);

  // 2. Write ml_pipeline/data/movies_dataset.json
  const mlFile = path.resolve(__dirname, '../../ml_pipeline/data/movies_dataset.json');
  fs.writeFileSync(mlFile, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`✓ Saved ml_pipeline/data/movies_dataset.json (${movies.length} movies)`);

  // 3. Write src/data/moviesData.js
  const allGenresSet = new Set(['All', 'Indian Cinema']);
  movies.forEach(m => (m.genres || []).forEach(g => allGenresSet.add(g)));
  const allGenres = Array.from(allGenresSet).sort();

  const frontendCode = `/**
 * Real TMDB Movie Dataset (Generated directly from TMDB API)
 * Total Movies: ${movies.length} (Featuring Indian & Global Masterpieces)
 */
export const ALL_GENRES = ${JSON.stringify(allGenres, null, 2)};

export const MOVIES_DATA = ${JSON.stringify(movies, null, 2)};
`;

  const frontendFile = path.resolve(__dirname, '../../src/data/moviesData.js');
  fs.writeFileSync(frontendFile, frontendCode, 'utf-8');
  console.log(`✓ Saved src/data/moviesData.js (${movies.length} movies)`);

  console.log('\nAll dummy data has been successfully replaced with real TMDB movie data!');
}

run().catch(console.error);
