import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  adult: { type: Boolean, required: true },
  backdrop_path: { type: String },
  budget: { type: Number },
  genres: { type: String },
  homepage: { type: String },
  imdb_id: { type: String },
  original_language: { type: String },
  original_title: { type: String },
  overview: { type: String },
  popularity: { type: Number },
  poster_path: { type: String },
  production_companies: { type: String },
  production_countries: { type: String },
  release_date: { type: Date },
  revenue: { type: Number },
  runtime: { type: Number },
  spoken_languages: { type: String },
  status: { type: String },
  tagline: { type: String },
  title: { type: String, required: true },
  vote_average: { type: Number },
  vote_count: { type: Number },
  watched: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
