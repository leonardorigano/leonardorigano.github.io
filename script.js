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
  const apiKey = "461d2fea677606dba09d967afd874b31"; // Replace with your actual TMDb API key
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
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const scheduleContainer = document.getElementById('schedule');
  scheduleContainer.innerHTML = ''; // Clear previous content

  weekdays.forEach((weekday) => {
    const daySection = document.createElement('section');
    daySection.classList.add('day');
    daySection.id = weekday;

    const dayTitle = document.createElement('h2');
    dayTitle.textContent = weekday;
    daySection.appendChild(dayTitle);

    const moviesContainer = document.createElement('div');
    moviesContainer.classList.add('movies');

    if (schedule[weekday] && schedule[weekday].length > 0) {
      // Render movies for this weekday
      schedule[weekday].forEach((movie) => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie');

        movieCard.innerHTML = `
          <img src="${movie.image}" alt="${movie.title}" class="movie-poster">
          <h3>${movie.title}</h3>
          <p><strong>Description:</strong> ${movie.description}</p>
          <p><strong>Genre:</strong> ${movie.genre}</p>
          <p><strong>Director:</strong> ${movie.director}</p>
          <p><strong>Release Date:</strong> ${movie.release_date}</p>
          <p><strong>Language:</strong> ${movie.language} (${movie.subtitles})</p>
          <p><strong>Length:</strong> ${movie.length}</p>
          <p><a href="${movie.trailer}" target="_blank">Watch Trailer</a></p>
        `;
        moviesContainer.appendChild(movieCard);
      });
    } else {
      // No movies for this weekday
      const noMovies = document.createElement('p');
      noMovies.textContent = "No movies scheduled.";
      noMovies.classList.add('no-movies');
      moviesContainer.appendChild(noMovies);
    }

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