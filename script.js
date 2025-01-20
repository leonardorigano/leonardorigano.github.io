async function loadSchedule() {
  try {
    const response = await fetch('schedule.md');
    const markdown = await response.text();
    const schedule = markdownToHTML(markdown);
    renderSchedule(schedule);
  } catch (error) {
    document.getElementById('schedule').innerHTML = '<p>Failed to load schedule.</p>';
  }
}

function markdownToHTML(markdown) {
  const lines = markdown.split('\n');
  const schedule = {};

  lines.forEach((line, index) => {
    if (line.startsWith('# ')) {
      const movie = { title: line.replace('# ', '') };

      // Extract weekday
      const weekdayLine = lines[index + 1];
      if (weekdayLine?.startsWith('Weekday: ')) {
        movie.weekday = weekdayLine.replace('Weekday: ', '').trim();
      } else {
        movie.weekday = 'Unscheduled';
      }

      // Extract description
      const descriptionLine = lines[index + 2];
      if (descriptionLine?.startsWith('Description: ')) {
        movie.description = descriptionLine.replace('Description: ', '').trim();
      }

      // Extract length
      const lengthLine = lines[index + 3];
      if (lengthLine?.startsWith('Length: ')) {
        movie.length = lengthLine.replace('Length: ', '').trim();
      }

      // Extract trailer link
      const trailerLine = lines[index + 4];
      if (trailerLine?.startsWith('Trailer: ')) {
        movie.trailer = trailerLine.replace('Trailer: ', '').trim();
      }

      // Add movie to the appropriate weekday
      if (!schedule[movie.weekday]) {
        schedule[movie.weekday] = [];
      }
      schedule[movie.weekday].push(movie);
    }
  });

  return schedule;
}

function renderSchedule(schedule) {
  for (const [weekday, movies] of Object.entries(schedule)) {
    const dayElement = document.getElementById(weekday);
    if (dayElement) {
      const moviesContainer = dayElement.querySelector('.movies');
      moviesContainer.innerHTML = movies
        .map(
          (movie) => `
          <div class="movie">
            <h3>${movie.title}</h3>
            <p><strong>Description:</strong> ${movie.description}</p>
            <p><strong>Length:</strong> ${movie.length}</p>
            <p><a href="${movie.trailer}" target="_blank">Watch Trailer</a></p>
          </div>
        `
        )
        .join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', loadSchedule);
