import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Movie from "./models/Movie.mjs";
import User from "./models/User.mjs";
import UserMovies from "./models/UserMovies.mjs";
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://madhursharma2001:JgmirhGdM1eVP88m@cinequeue.suvyvqt.mongodb.net/?retryWrites=true&w=majority&appName=cinequeue",
    {}
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(cors());
app.use(bodyParser.json());

// User Signup
app.post("/signup", async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({ userName, email, password });
    await user.save();
    res.status(201).json({
      message: "User created successfully",
      user: {
        userName: user.userName,
        email: user.email,
        _id: user._id,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userName: user.userName,
        email: user.email,
        _id: user._id,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all movies
app.get("/", async (req, res) => {
  try {
    res.send("Server is running good");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/usermovies", async (req, res) => {
  const { userId } = req.query;
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    const movies = await UserMovies.find({ userId: objectId });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a movie
app.post("/movies", async (req, res) => {
  const movie = new Movie(req.body);
  try {
    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get user movie
app.post("/getUserMovie", async (req, res) => {
  const { userId, movieId } = req.body;
  try {
    let userMovie = await UserMovies.findOne({ userId, movieId: movieId });
    if (userMovie) {
      res.status(200).json(userMovie);
    } else {
      res.status(400).json({ message: "Unable to find movie" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add or update a user movie
app.post("/usermoviewatch", async (req, res) => {
  const { movieId, userId, watchStatus, ...movieData } = req.body;
  try {
    let userMovie = await UserMovies.findOne({ userId, movieId: movieId });
    if (userMovie) {
      userMovie.watched = watchStatus;
      await userMovie.save();
      res.status(200).json(userMovie);
    } else {
      // Create new movie entry if it doesn't exist
      userMovie = new UserMovies({
        userId,
        movieId: movieId,
        watched: watchStatus,
        ...movieData,
      });
      const newUserMovie = await userMovie.save();
      res.status(201).json(newUserMovie);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add or update a user movie
app.post("/usermovies", async (req, res) => {
  const { movieId, userId, newRating, ...movieData } = req.body;
  try {
    let userMovie = await UserMovies.findOne({ userId, movieId: movieId });
    if (userMovie) {
      // Update rating if movie exists
      userMovie.rating = newRating;
      await userMovie.save();
      res.status(200).json(userMovie);
    } else {
      // Create new movie entry if it doesn't exist
      userMovie = new UserMovies({
        userId,
        movieId: movieId,
        rating: newRating,
        ...movieData,
      });
      const newUserMovie = await userMovie.save();
      res.status(201).json(newUserMovie);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Edit a movie
app.put("/usermovieedit/:id", async (req, res) => {
  const { original_title, overview } = req.body;
  try {
    const updatedMovie = await UserMovies.findByIdAndUpdate(
      req.params.id,
      { original_title, overview },
      { new: true }
    );
    if (!updatedMovie) {
      res.status(404).json({ message: "Movie not found" });
    } else {
      res.json(updatedMovie);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a movie
app.delete("/usermovies/:id", async (req, res) => {
  try {
    const deletedMovie = await UserMovies.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      res.status(404).json({ message: "Movie not found" });
    } else {
      res.status(204).end();
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
