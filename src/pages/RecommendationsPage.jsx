import React from 'react';
import { 
  Sparkles, 
  History, 
  Star, 
  Film,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { MovieCarousel } from '../components/MovieCarousel';

export const RecommendationsPage = () => {
  const {
    personalizedRecommendations,
    lastWatchedMovie,
    becauseYouWatchedRecommendations,
    favoriteGenreMovies,
    favoriteGenres,
    allGenres,
    toggleFavoriteGenre,
    watched,
    userRatings
  } = useMovies();

  const safePersonalized = personalizedRecommendations || [];
  const safeWatched = watched || [];
  const safeRatings = userRatings || {};
  const safeFavGenres = favoriteGenres || [];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cinema-800 border border-cinema-700 text-cinema-cyan text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Curated For You</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          Personalized Recommendations
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Films tailored to your personal taste, favorite genres, and viewing history.
        </p>
      </div>

      {/* User Preferences & Taste Filter Panel */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cinema-700/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cinema-cyan" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                Your Taste Preferences
              </h2>
              <span className="text-xs text-slate-400">• Click to toggle & re-rank your recommendations</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(allGenres || []).filter((g) => g !== 'All').map((genre) => {
                const isSelected = safeFavGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleFavoriteGenre(genre)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cinema-accent text-white shadow-md shadow-cinema-accent/30 scale-105'
                        : 'bg-cinema-850 text-slate-400 hover:text-white hover:bg-cinema-800 border border-cinema-750'
                    }`}
                  >
                    {genre} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Account Activity Counters */}
          <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-cinema-800">
            <span className="flex items-center gap-1.5 bg-cinema-850 px-3 py-1.5 rounded-xl border border-cinema-750">
              <History className="w-4 h-4 text-emerald-400" />
              <strong className="text-white">{safeWatched.length}</strong> Watched
            </span>
            <span className="flex items-center gap-1.5 bg-cinema-850 px-3 py-1.5 rounded-xl border border-cinema-750">
              <Star className="w-4 h-4 text-cinema-gold" />
              <strong className="text-white">{Object.keys(safeRatings).length}</strong> Rated
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Top AI Recommendations Grid */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cinema-800 text-cinema-cyan border border-cinema-700">
              Top Picks
            </span>
            <h2 className="font-display font-bold text-2xl text-white">
              Top Picks For You
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Films curated with highest affinity to your current preferences
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {safePersonalized.slice(0, 12).map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              showMatchScore={true}
              matchScore={movie.matchPercentage}
              matchReason={movie.matchReasons?.[0]}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Because You Watched */}
      {lastWatchedMovie && (
        <section className="space-y-5 pt-6 border-t border-cinema-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Similar Cinema
              </span>
              <h2 className="font-display font-bold text-2xl text-white">
                Because You Watched {lastWatchedMovie.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Films you might love based on your interest in {lastWatchedMovie.title}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(becauseYouWatchedRecommendations || []).slice(0, 6).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                showMatchScore={true}
                matchScore={movie.matchPercentage}
                matchReason={movie.matchReason}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Favorite Genres Spotlight */}
      {favoriteGenreMovies && favoriteGenreMovies.length > 0 && (
        <section className="space-y-5 pt-6 border-t border-cinema-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cinema-gold/20 text-cinema-gold border border-cinema-gold/30">
                Genre Spotlight
              </span>
              <h2 className="font-display font-bold text-2xl text-white">
                More in {safeFavGenres[0] || 'Your Favorites'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Popular and critically acclaimed titles in your preferred genre
            </p>
          </div>

          <MovieCarousel movies={favoriteGenreMovies} />
        </section>
      )}
    </div>
  );
};
