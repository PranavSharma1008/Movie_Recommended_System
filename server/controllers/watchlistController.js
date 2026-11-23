import { Watchlist } from '../models/Watchlist.js';
import { Rating } from '../models/Rating.js';

// @desc    Get user's watchlist and watched history
// @route   GET /api/watchlist
// @access  Private
export const getWatchlist = async (req, res, next) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id });
    const watchlistIds = items.map(i => i.movieId);
    const watchedIds = items.filter(i => i.watched).map(i => i.movieId);

    const ratings = await Rating.find({ userId: req.user._id });
    const ratingsMap = {};
    ratings.forEach(r => {
      ratingsMap[r.movieId] = r.rating;
    });

    res.status(200).json({
      success: true,
      data: {
        watchlist: watchlistIds,
        watched: watchedIds,
        userRatings: ratingsMap
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or remove movie from watchlist
// @route   POST /api/watchlist/toggle
// @access  Private
export const toggleWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ success: false, error: 'Movie ID required' });
    }

    const existing = await Watchlist.findOne({ userId: req.user._id, movieId });
    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
      return res.status(200).json({
        success: true,
        action: 'removed',
        movieId
      });
    } else {
      await Watchlist.create({
        userId: req.user._id,
        movieId,
        watched: false
      });
      return res.status(201).json({
        success: true,
        action: 'added',
        movieId
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle watched status of a movie
// @route   POST /api/watchlist/watched
// @access  Private
export const toggleWatched = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ success: false, error: 'Movie ID required' });
    }

    let entry = await Watchlist.findOne({ userId: req.user._id, movieId });
    if (!entry) {
      entry = await Watchlist.create({
        userId: req.user._id,
        movieId,
        watched: true,
        watchedAt: new Date()
      });
    } else {
      entry.watched = !entry.watched;
      entry.watchedAt = entry.watched ? new Date() : null;
      await entry.save();
    }

    res.status(200).json({
      success: true,
      movieId,
      watched: entry.watched
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit or update user rating for a movie
// @route   POST /api/ratings
// @access  Private
export const submitRating = async (req, res, next) => {
  try {
    const { movieId, rating } = req.body;
    if (!movieId || rating === undefined) {
      return res.status(400).json({ success: false, error: 'movieId and rating required' });
    }

    const numRating = parseFloat(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const updated = await Rating.findOneAndUpdate(
      { userId: req.user._id, movieId },
      { rating: numRating },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also mark as watched automatically
    await Watchlist.findOneAndUpdate(
      { userId: req.user._id, movieId },
      { watched: true, watchedAt: new Date() },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      movieId,
      rating: updated.rating
    });
  } catch (error) {
    next(error);
  }
};
