import express from 'express';
import { 
  getMovies, 
  getMovieById, 
  getGenres, 
  syncTMDB, 
  searchLiveTMDB 
} from '../controllers/movieController.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/meta/genres', getGenres);
router.post('/sync-tmdb', syncTMDB);
router.get('/search/live', searchLiveTMDB);
router.get('/:id', getMovieById);

export default router;
