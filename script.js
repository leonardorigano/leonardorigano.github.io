async function loadSchedule() {
  try {
    const response = await fetch('schedule.md');
    const markdown = await response.text();
    const schedule = parseMarkdown(markdown);
    renderSchedule(schedule);
  } catch (error) {
    document.getElementById('schedule').innerHTML = '<p>Failed to load schedule.</p>';
  }
}

function parseMarkdown(markdown) {
  const lines = markdown.split('\n');
  const schedule = {};

  lines.forEach((line, index) => {
    if (line.startsWith('# ')) {
      const movie = { title: line.replace('# ', '') };

      // Parse movie details
      const details = ['Weekday', 'Description', 'Genre', 'Director', 'Release Date', 'Language', 'Subtitles', 'Length', 'Trailer'];
      details.forEach((detail) => {
        const detailLine = lines[index + 1]?.startsWith(`${detail}: `) ? lines[index + 1].replace(`${detail}: `, '').trim() : null;
        if (detailLine) {
          movie[detail.toLowerCase().replace(' ', '_')] = detailLine;
          index++;
        }
      });

      // Add to schedule
      const weekday = movie.weekday || 'Unscheduled';
      if (!schedule[weekday]) schedule[weekday] = [];
      schedule[weekday].push(movie);
    }
  });

  return schedule;
}

function renderSchedule(schedule) {
  Object.entries(schedule).forEach(([weekday, movies]) => {
    const daySection = document.getElementById(weekday);
    if (daySection) {
      const moviesContainer = daySection.querySelector('.movies');
      moviesContainer.innerHTML = movies
        .map(
          (movie) => `
          <div class="movie">
            <h3>${movie.title}</h3>
            <p><strong>Description:</strong> ${movie.description}</p>
            <p><strong>Genre:</strong> ${movie.genre}</p>
            <p><strong>Director:</strong> ${movie.director}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Language:</strong> ${movie.language} (${movie.subtitles})</p>
            <p><strong>Length:</strong> ${movie.length}</p>
            <p><a href="${movie.trailer}" target="_blank">Watch Trailer</a></p>
          </div>
        `
        )
        .join('');
    }
  });
}

document.addEventListener('DOMContentLoaded', loadSchedule);
