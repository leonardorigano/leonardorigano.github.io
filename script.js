async function loadSchedule() {
  try {
    const response = await fetch('schedule.md');
    const markdown = await response.text();
    const schedule = markdownToHTML(markdown);
    document.getElementById('schedule').innerHTML = schedule;
  } catch (error) {
    document.getElementById('schedule').innerHTML = '<p>Failed to load schedule.</p>';
  }
}

function markdownToHTML(markdown) {
  const lines = markdown.split('\n');
  let html = '';
  let movie = {};

  lines.forEach((line) => {
    if (line.startsWith('# ')) {
      if (Object.keys(movie).length > 0) {
        html += generateMovieHTML(movie);
        movie = {};
      }
      movie.title = line.replace('# ', '');
    } else if (line.startsWith('Description: ')) {
      movie.description = line.replace('Description: ', '');
    } else if (line.startsWith('Length: ')) {
      movie.length = line.replace('Length: ', '');
    } else if (line.startsWith('Trailer: ')) {
      movie.trailer = line.replace('Trailer: ', '');
    }
  });

  if (Object.keys(movie).length > 0) {
    html += generateMovieHTML(movie);
  }

  return html;
}

function generateMovieHTML(movie) {
  return `
    <div class="movie">
      <h2>${movie.title}</h2>
      <p><strong>Description:</strong> ${movie.description}</p>
      <p><strong>Length:</strong> ${movie.length}</p>
      <p><a href="${movie.trailer}" target="_blank">Watch Trailer</a></p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadSchedule);
