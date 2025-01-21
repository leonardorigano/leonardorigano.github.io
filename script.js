async function loadSchedule() {
  try {
    const response = await fetch("schedule.md");
    const markdown = await response.text();
    const schedule = parseMarkdown(markdown);

    for (const day in schedule) {
      for (const movie of schedule[day]) {
        if (movie.tmdbid) {
          const details = await fetchMovieDetails(movie.tmdbid);
          if (details) {
            movie.title = details.title;
            movie.description = details.overview;
            movie.genre = details.genres.map((g) => g.name).join(", ");
            movie.release_date = details.release_date;
            movie.length = `${details.runtime} minutes`;
            movie.language = details.original_language.toUpperCase();
            movie.image = `https://image.tmdb.org/t/p/w500${details.poster_path}`;
          }
        }
      }
    }

    renderSchedule(schedule);
  } catch (error) {
    document.getElementById("schedule").innerHTML =
      "<p>Failed to load schedule.</p>";
    console.error("Error loading schedule:", error);
  }
}

function parseMarkdown(markdown) {
  const lines = markdown.split("\n");
  const schedule = {};

  lines.forEach((line, index) => {
    if (line.startsWith("# ")) {
      const movie = { title: line.replace("# ", "").trim() };

      // Parse movie details
      const details = ["Weekday", "TMDbID"];
      details.forEach((detail) => {
        const detailLine = lines[index + 1]?.startsWith(`${detail}: `)
          ? lines[index + 1].replace(`${detail}: `, "").trim()
          : null;
        if (detailLine) {
          movie[detail.toLowerCase()] = detailLine;
          index++;
        }
      });

      // Add to schedule
      const weekday = movie.weekday || "Unscheduled";
      if (!schedule[weekday]) schedule[weekday] = [];
      schedule[weekday].push(movie);
    }
  });

  return schedule;
}

async function fetchMovieDetails(tmdbId) {
  const apiKey = "YOUR_TMDB_API_KEY"; // Replace with your actual TMDb API key
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch movie details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

function renderSchedule(schedule) {
  const scheduleContainer = document.getElementById("schedule");
  scheduleContainer.innerHTML = "";

  Object.entries(schedule).forEach(([weekday, movies]) => {
    const daySection = document.createElement("section");
    daySection.className = "day";
    daySection.id = weekday;

    const heading = document.createElement("h2");
    heading.textContent = weekday;
    daySection.appendChild(heading);

    const moviesContainer = document.createElement("div");
    moviesContainer.className = "movies";

    movies.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.className = "movie";

      const movieTitle = document.createElement("h3");
      movieTitle.textContent = movie.title || "Unknown Title";
      movieCard.appendChild(movieTitle);

      if (movie.image) {
        const movieImage = document.createElement("img");
        movieImage.src = movie.image;
        movieImage.alt = `${movie.title} poster`;
        movieImage.className = "movie-poster";
        movieCard.appendChild(movieImage);
      }

      if (movie.description) {
        const movieDescription = document.createElement("p");
        movieDescription.innerHTML = `<strong>Description:</strong> ${movie.description}`;
        movieCard.appendChild(movieDescription);
      }

      if (movie.genre) {
        const movieGenre = document.createElement("p");
        movieGenre.innerHTML = `<strong>Genre:</strong> ${movie.genre}`;
        movieCard.appendChild(movieGenre);
      }

      if (movie.release_date) {
        const movieReleaseDate = document.createElement("p");
        movieReleaseDate.innerHTML = `<strong>Release Date:</strong> ${movie.release_date}`;
        movieCard.appendChild(movieReleaseDate);
      }

      if (movie.language) {
        const movieLanguage = document.createElement("p");
        movieLanguage.innerHTML = `<strong>Language:</strong> ${movie.language}`;
        movieCard.appendChild(movieLanguage);
      }

      if (movie.length) {
        const movieLength = document.createElement("p");
        movieLength.innerHTML = `<strong>Length:</strong> ${movie.length}`;
        movieCard.appendChild(movieLength);
      }

      moviesContainer.appendChild(movieCard);
    });

    daySection.appendChild(moviesContainer);
    scheduleContainer.appendChild(daySection);
  });
}

async function handleWishlistSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const response = await fetch(form.action, {
    method: form.method,
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (response.ok) {
    document.getElementById("success-message").style.display = "block";
    form.reset();
  } else {
    alert("There was a problem submitting your wishlist movie.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();

  const wishlistForm = document.querySelector("#submit-movie form");
  if (wishlistForm) {
    wishlistForm.addEventListener("submit", handleWishlistSubmit);
  }
});