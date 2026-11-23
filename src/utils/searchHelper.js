/**
 * Cinema Search & Actor Matching Intelligence
 * Supports Multi-Token, Actor Aliases, Director, Genre, and Fuzzy Search
 */

export const ACTOR_ALIASES = {
  // Indian Cinema Legends
  'sharu khan': 'Shah Rukh Khan',
  'sharu': 'Shah Rukh Khan',
  'sharukh khan': 'Shah Rukh Khan',
  'sharukh': 'Shah Rukh Khan',
  'shahrukh': 'Shah Rukh Khan',
  'shahrukh khan': 'Shah Rukh Khan',
  'srk': 'Shah Rukh Khan',
  'king khan': 'Shah Rukh Khan',
  'shah rukh': 'Shah Rukh Khan',
  'shah rukh khan': 'Shah Rukh Khan',

  'aamir': 'Aamir Khan',
  'amir': 'Aamir Khan',
  'amir khan': 'Aamir Khan',
  'aamir khan': 'Aamir Khan',

  'salman': 'Salman Khan',
  'salman khan': 'Salman Khan',
  'sallu': 'Salman Khan',

  'amitabh': 'Amitabh Bachchan',
  'bachchan': 'Amitabh Bachchan',
  'big b': 'Amitabh Bachchan',
  'amitabh bachchan': 'Amitabh Bachchan',

  'hrithik': 'Hrithik Roshan',
  'hritik': 'Hrithik Roshan',
  'hritik roshan': 'Hrithik Roshan',
  'hrithik roshan': 'Hrithik Roshan',

  'deepika': 'Deepika Padukone',
  'deepika padukone': 'Deepika Padukone',

  'ranbir': 'Ranbir Kapoor',
  'ranbir kapoor': 'Ranbir Kapoor',

  'ranveer': 'Ranveer Singh',
  'ranveer singh': 'Ranveer Singh',

  'alia': 'Alia Bhatt',
  'alia bhatt': 'Alia Bhatt',

  'prabhas': 'Prabhas',
  'yash': 'Yash',
  'rocky bhai': 'Yash',

  'ntr': 'N.T. Rama Rao Jr.',
  'jr ntr': 'N.T. Rama Rao Jr.',
  'ram charan': 'Ram Charan',
  'allu arjun': 'Allu Arjun',

  'kamal haasan': 'Kamal Haasan',
  'rajinikanth': 'Rajinikanth',
  'rajini': 'Rajinikanth',
  'thalaivar': 'Rajinikanth',

  // Global Cinema & Hollywood Stars
  'nolan': 'Christopher Nolan',
  'chris nolan': 'Christopher Nolan',
  'christopher nolan': 'Christopher Nolan',

  'dicaprio': 'Leonardo DiCaprio',
  'leo': 'Leonardo DiCaprio',
  'leo dicaprio': 'Leonardo DiCaprio',
  'leonardo dicaprio': 'Leonardo DiCaprio',

  'cillian': 'Cillian Murphy',
  'cillian murphy': 'Cillian Murphy',

  'bale': 'Christian Bale',
  'christian bale': 'Christian Bale',

  'mcconaughey': 'Matthew McConaughey',
  'matthew mcconaughey': 'Matthew McConaughey',

  'tarantino': 'Quentin Tarantino',
  'quentin tarantino': 'Quentin Tarantino',

  'chalamet': 'Timothée Chalamet',
  'timothee': 'Timothée Chalamet',
  'timothee chalamet': 'Timothée Chalamet',

  'zendaya': 'Zendaya',

  'downey': 'Robert Downey Jr.',
  'robert downey': 'Robert Downey Jr.',
  'rdj': 'Robert Downey Jr.',

  'joaquin': 'Joaquin Phoenix',
  'joaquin phoenix': 'Joaquin Phoenix'
};

/**
 * Normalizes text by removing accents, extra punctuation, and whitespace
 */
export const normalizeText = (text = '') => {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if a movie matches a user search query (by title, actor/cast, director, genres, keywords)
 */
export const matchMovieSearch = (movie, rawQuery) => {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!movie) return false;

  const q = normalizeText(rawQuery);
  if (!q) return true;

  const movieTitle = normalizeText(movie.title);
  const movieDirector = normalizeText(movie.director);
  const movieCast = (movie.cast || []).map((c) => normalizeText(c.name || ''));
  const movieGenres = (movie.genres || []).map((g) => normalizeText(g));
  const movieKeywords = (movie.similarityKeywords || []).map((k) => normalizeText(k));

  // 1. Direct Alias Lookup (e.g. 'sharu khan' -> 'Shah Rukh Khan', 'srk' -> 'Shah Rukh Khan')
  const aliasMatch = ACTOR_ALIASES[q];
  if (aliasMatch) {
    const normAlias = normalizeText(aliasMatch);
    if (movieCast.some((c) => c.includes(normAlias) || normAlias.includes(c))) return true;
    if (movieDirector.includes(normAlias)) return true;
  }

  // 2. Direct Substring Check on Title, Cast, Director, Genres
  if (movieTitle.includes(q)) return true;
  if (movieDirector.includes(q)) return true;
  if (movieCast.some((c) => c.includes(q))) return true;
  if (movieGenres.some((g) => g.includes(q))) return true;
  if (movieKeywords.some((k) => k.includes(q))) return true;

  // 3. Multi-word Token Matching (e.g. 'sharu' and 'khan')
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);
  if (tokens.length > 0) {
    const allTokensMatch = tokens.every((token) => {
      // Check if token directly matches title, cast, or director
      if (movieTitle.includes(token)) return true;
      if (movieDirector.includes(token)) return true;
      if (movieCast.some((c) => c.includes(token))) return true;
      if (movieGenres.some((g) => g.includes(token))) return true;

      // Check if token matches an actor alias
      const subAlias = ACTOR_ALIASES[token];
      if (subAlias) {
        const normSubAlias = normalizeText(subAlias);
        if (movieCast.some((c) => c.includes(normSubAlias))) return true;
        if (movieDirector.includes(normSubAlias)) return true;
      }

      // Check sub-word prefixes (e.g. 'sharu' matching 'shah' or 'sharukh')
      if (token.length >= 4) {
        const prefix = token.slice(0, 4);
        if (movieCast.some((c) => c.includes(prefix))) return true;
      }

      return false;
    });

    if (allTokensMatch) return true;
  }

  // 4. Any Actor Token Match (if query matches any actor with length >= 3)
  if (movieCast.some((c) => {
    return c.split(/\s+/).some((part) => part.length >= 3 && (q.includes(part) || part.includes(q)));
  })) {
    return true;
  }

  return false;
};

/**
 * Returns a human-friendly highlight string explaining why this movie matched
 */
export const getMovieMatchHighlight = (movie, rawQuery) => {
  if (!rawQuery || !rawQuery.trim() || !movie) return null;
  const q = normalizeText(rawQuery);

  const alias = ACTOR_ALIASES[q];
  const targetActor = alias ? normalizeText(alias) : q;

  const matchedActor = (movie.cast || []).find((c) => {
    const norm = normalizeText(c.name);
    return norm.includes(targetActor) || targetActor.includes(norm) || (alias && norm.includes(normalizeText(alias)));
  });

  if (matchedActor) {
    return `Starring ${matchedActor.name}`;
  }

  if (movie.director && normalizeText(movie.director).includes(q)) {
    return `Directed by ${movie.director}`;
  }

  const matchedGenre = (movie.genres || []).find((g) => normalizeText(g).includes(q));
  if (matchedGenre) {
    return `Genre: ${matchedGenre}`;
  }

  return null;
};
