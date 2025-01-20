---
layout: default
---

<div class="schedule">
  {% for day in site.data.schedule %}
    <div class="day">
      <h2>{{ day.day }}</h2>
      <div class="movie">
        <h3>{{ day.movie.title }}</h3>
        <p>{{ day.movie.description }}</p>
        <p><strong>Length:</strong> {{ day.movie.length }}</p>
        <p><a href="{{ day.movie.trailer }}" target="_blank">Watch Trailer</a></p>
      </div>
    </div>
  {% endfor %}
</div>