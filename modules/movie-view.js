import { formatGenres } from "./movie-data.js";

const movieDisplay = document.getElementById("movie-display");
const newestMovieList = document.getElementById("newest-movie-list");
const posterTrack = document.getElementById("poster-track");
const searchSuggestions = document.getElementById("search-suggestions");
const searchInput = document.getElementById("searchInput");
const movieDetails = document.getElementById("movie-details");
const movieDetailsContent = document.getElementById("movie-details-content");

export function createPosterStrip(moviesToShow) {
    const posterImages = [...moviesToShow]
        .filter(movie => movie.poster && movie.year !== "Unknown")
        .sort((first, second) => Number(first.year) - Number(second.year))
        .map(movie => movie.poster);
    const allPosters = [...posterImages, ...posterImages];

    posterTrack.innerHTML = allPosters
        .map(poster => `<img src="${poster}" alt="" aria-hidden="true">`)
        .join("");
}

export function movieCardMarkup(movie, favoriteMovies, bookmarkedMovies) {
    const isFavorite = favoriteMovies.has(movie.title);
    const isBookmarked = bookmarkedMovies.has(movie.title);

    return `
        <div class="movie-card-container">
            <div class="movie-card" data-movie-title="${movie.title}" role="button" tabindex="0"
                 aria-label="View details for ${movie.title}">
                <div class="movie-poster">
                    <img src="${movie.poster}" alt="${movie.title}">
                </div>
                <div class="movie-info">
                    <div class="movie-title-row">
                        <div class="movie-title"><h3>${movie.title}</h3></div>
                        <button class="bookmark-toggle" type="button" data-movie-title="${movie.title}"
                                aria-label="${isBookmarked ? "Remove" : "Add"} ${movie.title} ${isBookmarked ? "from" : "to"} bookmarks"
                                aria-pressed="${isBookmarked}">
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="movie-meta">
                        <div class="movie-rating">${movie.rating} stars</div>
                        <div class="movie-year">${movie.year}</div>
                        <div class="movie-genre">${formatGenres(movie.genre)}</div>
                    </div>
                </div>
            </div>
            <button class="favorite-toggle" type="button" data-movie-title="${movie.title}"
                    aria-label="${isFavorite ? "Remove" : "Add"} ${movie.title} ${isFavorite ? "from" : "to"} favorites"
                    aria-pressed="${isFavorite}">
                <span aria-hidden="true">${isFavorite ? "♥" : "♡"}</span>
            </button>
        </div>`;
}

export function displayMovies(moviesToDisplay, favoriteMovies, bookmarkedMovies) {
    movieDisplay.innerHTML = moviesToDisplay
        .map(movie => movieCardMarkup(movie, favoriteMovies, bookmarkedMovies))
        .join("");
}

export function renderNewestMovies(popularMovies, favoriteMovies, bookmarkedMovies) {
    const newestMovies = [...popularMovies]
        .sort((first, second) => {
            const firstYear = Number(first.year) || 0;
            const secondYear = Number(second.year) || 0;
            return secondYear - firstYear;
        })
        .slice(0, 10);

    newestMovieList.innerHTML = newestMovies
        .map(movie => movieCardMarkup(movie, favoriteMovies, bookmarkedMovies))
        .join("");
}

export function displaySearchSuggestions(suggestions) {
    searchSuggestions.replaceChildren();

    suggestions.forEach((movie, index) => {
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("search-suggestion-item");
        suggestionItem.id = `movie-suggestion-${index}`;
        suggestionItem.setAttribute("role", "option");
        suggestionItem.setAttribute("aria-selected", "false");
        suggestionItem.dataset.movieTitle = movie.title;
        suggestionItem.innerHTML = `<div class="search-suggestion-poster"><img src="${movie.poster}" alt=""></div>
                                    <div class="search-suggestion-title">${movie.title}</div>
                                    <div class="search-suggestion-year">${movie.year}</div>`;
        searchSuggestions.appendChild(suggestionItem);
    });

    searchInput.setAttribute("aria-expanded", String(suggestions.length > 0));
    searchInput.removeAttribute("aria-activedescendant");
}

export function showMovieDetails(title, movies, popularMovies, favoriteMovies, bookmarkedMovies) {
    const movie = movies.find(item => item.title === title) ||
        popularMovies.find(item => item.title === title);

    if (!movie) {
        return;
    }

    const isFavorite = favoriteMovies.has(movie.title);
    const isBookmarked = bookmarkedMovies.has(movie.title);

    movieDetailsContent.innerHTML = `
        <div class="details-poster">
            <img src="${movie.poster}" alt="Poster for ${movie.title}">
        </div>
        <div class="details-info">
            <p class="details-eyebrow">Movie details</p>
            <h2 id="details-title">${movie.title}</h2>
            <div class="details-actions">
                <button class="favorite-toggle" type="button" data-movie-title="${movie.title}"
                        aria-label="${isFavorite ? "Remove" : "Add"} ${movie.title} ${isFavorite ? "from" : "to"} favorites"
                        aria-pressed="${isFavorite}">
                    <span aria-hidden="true">${isFavorite ? "♥" : "♡"}</span>
                </button>
                <button class="bookmark-toggle" type="button" data-movie-title="${movie.title}"
                        aria-label="${isBookmarked ? "Remove" : "Add"} ${movie.title} ${isBookmarked ? "from" : "to"} bookmarks"
                        aria-pressed="${isBookmarked}">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4z"></path>
                    </svg>
                </button>
            </div>
            <div class="details-meta">
                <span>${movie.year}</span>
                <span>${movie.rating} / 10</span>
                <span class="movie-genre">${formatGenres(movie.genre)}</span>
            </div>
            ${movie.leadActors?.length
        ? `<h3>Lead actors</h3>
            <p class="details-description">${movie.leadActors.join(", ")}</p>`
        : ""}
            <h3>Overview</h3>
            <p class="details-description">${movie.description || "No description available."}</p>
        </div>`;

    movieDetails.showModal();
}
