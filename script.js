const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const clearSearchButton = document.getElementById("clearSearchButton");
const siteBrand = document.querySelector(".site-brand");
const genreFilter = document.querySelector("#filters");
const movieDisplay = document.getElementById("movie-display");
const newestMoviesSection = document.getElementById("newest-movies");
const newestMovieList = document.getElementById("newest-movie-list");
const loadMoreButton = document.getElementById("load-more-movies");
const movieLoadStatus = document.getElementById("movie-load-status");
const noPosterImage = "img/No-Poster.png";

document.addEventListener("error", event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) {
        return;
    }

    image.dataset.fallbackApplied = "true";
    image.src = noPosterImage;
}, true);


let movies = [];
let popularMovies = [];
let popularPage = 0;
let totalPopularPages = 1;
let isLoadingPopularMovies = false;
let isSearchActive = false;
let searchRequestId = 0;
const favoriteMovies = loadFavoriteMovies();
const bookmarkedMovies = loadBookmarkedMovies();
const bookmarkedMovieDetails = new Map(
    loadBookmarkedMovieDetails().map(movie => [movie.title, movie])
);

function loadFavoriteMovies() {
    const savedFavorites = localStorage.getItem("favoriteMovies");

    if (!savedFavorites) {
        return new Set();
    }

    try {
        const parsedFavorites = JSON.parse(savedFavorites);
        if (Array.isArray(parsedFavorites) &&
            parsedFavorites.every(title => typeof title === "string")) {
            return new Set(parsedFavorites);
        }
        throw new Error("Saved favorites must be an array of movie titles.");
    } catch (error) {
        console.error("Unable to load saved favorite movies:", error);
        return new Set();
    }
}

function loadBookmarkedMovies() {
    const savedBookmarks = localStorage.getItem("bookmarkedMovies");

    if (!savedBookmarks) {
        return new Set();
    }

    try {
        const parsedBookmarks = JSON.parse(savedBookmarks);
        if (Array.isArray(parsedBookmarks) &&
            parsedBookmarks.every(title => typeof title === "string")) {
            return new Set(parsedBookmarks);
        }
        throw new Error("Saved bookmarks must be an array of movie titles.");
    } catch (error) {
        console.error("Unable to load bookmarked movies:", error);
        return new Set();
    }
}

function loadBookmarkedMovieDetails() {
    const savedMovies = localStorage.getItem("bookmarkedMovieDetails");

    if (!savedMovies) {
        return [];
    }

    try {
        const parsedMovies = JSON.parse(savedMovies);
        if (Array.isArray(parsedMovies) &&
            parsedMovies.every(movie =>
                movie &&
                typeof movie.title === "string" &&
                typeof movie.poster === "string" &&
                (typeof movie.rating === "number" || typeof movie.rating === "string") &&
                typeof movie.year === "string" &&
                Array.isArray(movie.genre)
            )) {
            return parsedMovies;
        }
        throw new Error("Saved bookmarked movies have an invalid format.");
    } catch (error) {
        console.error("Unable to load bookmarked movie details:", error);
        return [];
    }
}

const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

function formatGenres(genreIds) {
    return genreIds.map(id => genreMap[id]).filter(Boolean).join(", ") || "Unknown";
}

const filterList = document.querySelector("#filters ul");
Object.entries(genreMap).forEach(([id, name]) => {
    const filter = document.createElement("li");
    filter.dataset.genre = id;
    filter.textContent = name;
    filterList.appendChild(filter);
});

//display all movies on page load
movies.forEach((movie) => {
    movieDisplay.insertAdjacentHTML('beforeend', `<div class="movie-card">
                            <div class="movie-poster">
                                <img src="${movie.poster}" alt="${movie.title}">
                            </div>
                            <div class="movie-info">
                                <div class="movie-title"><h3>${movie.title}</h3></div>
                                <div class="movie-meta">
                                    <div class="movie-rating">${movie.rating} stars</div>
                                    <div class="movie-year">${movie.year}</div>
                                    <div class="movie-description">${movie.description}</div>
                                    <div class="movie-genre">${formatGenres(movie.genre)}</div>
                                    
                                </div>
                            </div>
                        </div>`);

                        
});


// Create a poster strip for the hero section
const posterTrack = document.getElementById("poster-track");

function createPosterStrip(moviesToShow) {
    const posterImages = [...moviesToShow]
        .filter(movie => movie.poster && movie.year !== "Unknown")
        .sort((first, second) => Number(first.year) - Number(second.year))
        .map(movie => movie.poster);
    const allPosters = [...posterImages, ...posterImages];

    posterTrack.innerHTML = allPosters
        .map(poster => `<img src="${poster}" alt="" aria-hidden="true">`)
        .join("");
}

function movieCardMarkup(movie) {
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

function renderNewestMovies() {
    const newestMovies = [...popularMovies]
        .sort((first, second) => {
            const firstYear = Number(first.year) || 0;
            const secondYear = Number(second.year) || 0;
            return secondYear - firstYear;
        })
        .slice(0, 10);

    newestMovieList.innerHTML = newestMovies.map(movieCardMarkup).join("");
}

//add dark mode toggle functionality
const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", savedTheme);

updateThemeButton(savedTheme);

function updateThemeButton(theme) {
    themeToggle.textContent =
        theme === "dark" ? "Light Mode" : "Dark Mode";
}

themeToggle.addEventListener("click", () => {
    const currentTheme =
        document.documentElement.getAttribute("data-theme");

    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);

    localStorage.setItem("theme", newTheme);

    updateThemeButton(newTheme);
});

//smart search functionality
const searchSuggestions = document.getElementById("search-suggestions");
const movieDetails = document.getElementById("movie-details");
const movieDetailsContent = document.getElementById("movie-details-content");
let activeSuggestionIndex = -1;

searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase().trim();
    const matchingMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchValue)
    );

    clearSearchButton.hidden = !searchInput.value;
    activeSuggestionIndex = -1;
    // displayMovies(matchingMovies);
    displaySearchSuggestions(searchValue ? matchingMovies.slice(0, 5) : []);
});

// Handle keyboard navigation for search suggestions
searchInput.addEventListener("keydown", event => {
    const suggestions = getSuggestionItems();

    if (event.key === "ArrowDown" && suggestions.length) {
        event.preventDefault();
        activeSuggestionIndex = activeSuggestionIndex < suggestions.length - 1
            ? activeSuggestionIndex + 1
            : 0;
        updateActiveSuggestion(suggestions);
    } else if (event.key === "ArrowUp" && suggestions.length) {
        event.preventDefault();
        activeSuggestionIndex = activeSuggestionIndex > 0
            ? activeSuggestionIndex - 1
            : suggestions.length - 1;
        updateActiveSuggestion(suggestions);
    } else if (event.key === "Enter") {
        event.preventDefault();
        if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
            selectSuggestion(suggestions[activeSuggestionIndex]);
        } else {
            searchButton.click();
        }
    } else if (event.key === "Escape") {
        closeSuggestions();
    }
});

function getSuggestionItems() {
    return Array.from(searchSuggestions.querySelectorAll(".search-suggestion-item"));
}

function updateActiveSuggestion(suggestions) {
    suggestions.forEach((suggestion, index) => {
        const isActive = index === activeSuggestionIndex;
        suggestion.classList.toggle("is-active", isActive);
        suggestion.setAttribute("aria-selected", String(isActive));
    });

    const activeSuggestion = suggestions[activeSuggestionIndex];
    searchInput.setAttribute("aria-activedescendant", activeSuggestion.id);
    activeSuggestion.scrollIntoView({ block: "nearest" });
}

function closeSuggestions() {
    activeSuggestionIndex = -1;
    searchSuggestions.replaceChildren();
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
}

function selectSuggestion(suggestion) {
    closeSuggestions();
    showMovieDetails(suggestion.dataset.movieTitle);
}

function displaySearchSuggestions(suggestions) {
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

searchSuggestions.addEventListener("click", event => {
    const suggestionItem = event.target.closest(".search-suggestion-item");

    if (!suggestionItem) {
        return;
    }

    selectSuggestion(suggestionItem);
});

function showMovieDetails(title) {
    const movie = movies.find(item => item.title === title) ||
        popularMovies.find(item => item.title === title);

    if (!movie) {
        return;
    }

    movieDetailsContent.innerHTML = `
        <div class="details-poster">
            <img src="${movie.poster}" alt="Poster for ${movie.title}">
        </div>
        <div class="details-info">
            <p class="details-eyebrow">Movie details</p>
            <h2 id="details-title">${movie.title}</h2>
            <div class="details-meta">
                <span>${movie.year}</span>
                <span>${movie.rating} / 10</span>
                <span class="movie-genre">${formatGenres(movie.genre)}</span>
            </div>
            <h3>Overview</h3>
            <p class="details-description">${movie.description || "No description available."}</p>
        </div>`;

    movieDetails.showModal();
}

movieDetails.querySelector(".details-close").addEventListener("click", () => {
    movieDetails.close();
});

movieDisplay.addEventListener("click", event => {
    const bookmarkButton = event.target.closest(".bookmark-toggle");
    if (bookmarkButton) {
        toggleBookmark(bookmarkButton);
        return;
    }

    const favoriteButton = event.target.closest(".favorite-toggle");
    if (favoriteButton) {
        toggleFavorite(favoriteButton);
        return;
    }

    const movieCard = event.target.closest(".movie-card");

    if (movieCard) {
        showMovieDetails(movieCard.dataset.movieTitle);
    }
});

newestMovieList.addEventListener("click", event => {
    const bookmarkButton = event.target.closest(".bookmark-toggle");
    if (bookmarkButton) {
        toggleBookmark(bookmarkButton);
        return;
    }

    const favoriteButton = event.target.closest(".favorite-toggle");
    if (favoriteButton) {
        toggleFavorite(favoriteButton);
        return;
    }

    const movieCard = event.target.closest(".movie-card");

    if (movieCard) {
        showMovieDetails(movieCard.dataset.movieTitle);
    }
});

function toggleFavorite(button) {
    const title = button.dataset.movieTitle;
    const isFavorite = !favoriteMovies.has(title);

    if (isFavorite) {
        favoriteMovies.add(title);
    } else {
        favoriteMovies.delete(title);
    }

    try {
        localStorage.setItem("favoriteMovies", JSON.stringify([...favoriteMovies]));
    } catch (error) {
        console.error("Unable to save favorite movies:", error);
    }

    document.querySelectorAll(".favorite-toggle").forEach(favoriteButton => {
        if (favoriteButton.dataset.movieTitle !== title) {
            return;
        }

        favoriteButton.setAttribute("aria-pressed", String(isFavorite));
        favoriteButton.setAttribute(
            "aria-label",
            `${isFavorite ? "Remove" : "Add"} ${title} ${isFavorite ? "from" : "to"} favorites`
        );
        favoriteButton.querySelector("span").textContent = isFavorite ? "♥" : "♡";
    });

    const activeFilter = document.querySelector("#filters li.active")?.dataset.genre;
    if (activeFilter === "favorites") {
        displayMovies(filterMoviesByGenre(activeFilter));
    }
}

function toggleBookmark(button) {
    const title = button.dataset.movieTitle;
    const isBookmarked = !bookmarkedMovies.has(title);

    if (isBookmarked) {
        bookmarkedMovies.add(title);
        const movie = [...movies, ...popularMovies].find(item => item.title === title);
        if (movie) {
            bookmarkedMovieDetails.set(title, movie);
        }
    } else {
        bookmarkedMovies.delete(title);
        bookmarkedMovieDetails.delete(title);
    }

    try {
        localStorage.setItem("bookmarkedMovies", JSON.stringify([...bookmarkedMovies]));
        localStorage.setItem(
            "bookmarkedMovieDetails",
            JSON.stringify([...bookmarkedMovieDetails.values()])
        );
    } catch (error) {
        console.error("Unable to save bookmarked movies:", error);
    }

    document.querySelectorAll(".bookmark-toggle").forEach(bookmarkButton => {
        if (bookmarkButton.dataset.movieTitle !== title) {
            return;
        }

        bookmarkButton.setAttribute("aria-pressed", String(isBookmarked));
        bookmarkButton.setAttribute(
            "aria-label",
            `${isBookmarked ? "Remove" : "Add"} ${title} ${isBookmarked ? "from" : "to"} bookmarks`
        );
    });

    const activeFilter = document.querySelector("#filters li.active")?.dataset.genre;
    if (activeFilter === "bookmarks") {
        displayMovies(filterMoviesByGenre(activeFilter));
    }
}

movieDisplay.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") &&
        event.target.matches(".movie-card")) {
        event.preventDefault();
        showMovieDetails(event.target.dataset.movieTitle);
    }
});

newestMovieList.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") &&
        event.target.matches(".movie-card")) {
        event.preventDefault();
        showMovieDetails(event.target.dataset.movieTitle);
    }
});


//search functionality
searchButton.addEventListener("click", () => {
    const searchValue = searchInput.value.trim();
    const normalizedSearchValue = searchValue.toLowerCase();
    if (!searchValue) return;
    isSearchActive = true;
    const requestId = ++searchRequestId;
    newestMoviesSection.hidden = true;
    loadMoreButton.hidden = true;
    movieLoadStatus.textContent = "";
    searchMovies(normalizedSearchValue, requestId);

    closeSuggestions();
    genreFilter.style.display = "none";

    const existingDescription = document.querySelector(".search-result-description");
    if (existingDescription) {
        existingDescription.remove();
    }

    if (searchValue) {
        movieDisplay.insertAdjacentHTML('afterbegin', `<div class="search-result-description">
                                <h3>Results for "${searchValue}"</h3>
                            </div>`);
    }
});

function returnToHome() {
    searchRequestId += 1;
    isSearchActive = false;
    searchInput.value = "";
    clearSearchButton.hidden = true;
    closeSuggestions();

    movies = [...popularMovies];
    filters.forEach(filter => {
        filter.classList.toggle("active", filter.dataset.genre === "all");
    });
    newestMoviesSection.hidden = false;
    genreFilter.style.display = "block";
    loadMoreButton.hidden = isLoadingPopularMovies || popularPage >= totalPopularPages;
    movieLoadStatus.textContent = "";
    displayMovies(movies);
}

clearSearchButton.addEventListener("click", () => {
    returnToHome();
    searchInput.focus();
});

siteBrand.addEventListener("click", event => {
    event.preventDefault();
    returnToHome();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

displayMovies(movies);

function displayMovies(moviesToDisplay) {
    movieDisplay.innerHTML = moviesToDisplay.map(movieCardMarkup).join("");
}

//filter functionality
function filterMoviesByGenre(genre) {
    if (genre === "all") {
        return movies;
    }
    if (genre === "favorites") {
        return movies.filter(movie => favoriteMovies.has(movie.title));
    }
    if (genre === "bookmarks") {
        const availableMovies = new Map(
            [...bookmarkedMovieDetails.values(), ...popularMovies, ...movies]
                .map(movie => [movie.title, movie])
        );
        return [...availableMovies.values()]
            .filter(movie => bookmarkedMovies.has(movie.title));
    }
    return movies.filter(movie => movie.genre.includes(Number(genre)));
}

async function loadMissingBookmarkedMovieDetails(requestId) {
    const availableTitles = new Set([
        ...bookmarkedMovieDetails.keys(),
        ...popularMovies.map(movie => movie.title),
        ...movies.map(movie => movie.title)
    ]);
    const missingTitles = [...bookmarkedMovies].filter(title => !availableTitles.has(title));

    for (const title of missingTitles) {
        if (requestId !== searchRequestId) {
            return;
        }
        await searchMovies(title, requestId, true);
    }

    if (document.querySelector("#filters li.active")?.dataset.genre === "bookmarks") {
        displayMovies(filterMoviesByGenre("bookmarks"));
    }
}

const filters = document.getElementById("filters").querySelectorAll("li");
filters.forEach((filter) => {
    filter.addEventListener("click", (event) => {
        const selectedGenre = event.currentTarget.dataset.genre;
        const requestId = ++searchRequestId;

        filters.forEach((item) => {
            item.classList.toggle("active", item === event.currentTarget);
        });

        isSearchActive = false;
        newestMoviesSection.hidden = false;
        genreFilter.style.display = "block";
        movieLoadStatus.textContent = "";
        displayMovies(filterMoviesByGenre(selectedGenre));

        if (selectedGenre === "bookmarks") {
            loadMissingBookmarkedMovieDetails(requestId).catch(error => {
                console.error("Unable to load bookmarked movies:", error);
                movieLoadStatus.textContent = "Could not load all bookmarked movies. Please try again.";
            });
        }
    });
});

const filterScroller = document.querySelector(".filter-controls ul");

loadMoreButton.addEventListener("click", () => {
    fetchPopularMovies().catch(error => {
        console.error("Unable to load more movies:", error);
        movieLoadStatus.textContent = "Could not load more movies. Please try again.";
    });
});

async function fetchPopularMovies(){
    if (isLoadingPopularMovies || popularPage >= totalPopularPages) {
        return;
    }

    isLoadingPopularMovies = true;
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading movies...";
    movieLoadStatus.textContent = "";

    try {
   const response = await fetch(`https://api.themoviedb.org/3/movie/popular?page=${popularPage + 1}`,
    {
        headers: {
            Authorization :`Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMGJlYzI4YzBhMjNiMTEwNDZjMjdmYzI0YjQxNGNjOSIsIm5iZiI6MTc0NDAwOTcwNS4yOTksInN1YiI6IjY3ZjM3OWU5N2I0M2JkY2UyMGFkMjdjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9DmsGx94V5itCcE1395vOs24F9mkWjd_KOtldnwGizY`,
            accept : "application/json"
        }
    }
     );
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        const formattedMovies = data.results.map(movie => ({
            title: movie.title,
            poster: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : noPosterImage,
            rating: movie.vote_average,
            year: movie.release_date
                ? movie.release_date.split("-")[0]
                : "Unknown",
            genre: movie.genre_ids,
            description: movie.overview
        }));

        popularPage += 1;
        totalPopularPages = data.total_pages || popularPage;
        popularMovies = [...popularMovies, ...formattedMovies];
        createPosterStrip(popularMovies);
        renderNewestMovies();

        if (!isSearchActive) {
            movies = [...popularMovies];
            const selectedGenre = document.querySelector("#filters li.active")?.dataset.genre || "all";
            displayMovies(filterMoviesByGenre(selectedGenre));
        }
        loadMoreButton.hidden = isSearchActive || popularPage >= totalPopularPages;
    } finally {
        isLoadingPopularMovies = false;
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = "Load more movies";
    }

}
fetchPopularMovies().catch(error => {
    console.error("Unable to load popular movies:", error);
    movieLoadStatus.textContent = "Could not load movies. Please refresh and try again.";
});

async function searchMovies(searchTerm, requestId, resolveBookmark = false) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMGJlYzI4YzBhMjNiMTEwNDZjMjdmYzI0YjQxNGNjOSIsIm5iZiI6MTc0NDAwOTcwNS4yOTksInN1YiI6IjY3ZjM3OWU5N2I0M2JkY2UyMGFkMjdjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9DmsGx94V5itCcE1395vOs24F9mkWjd_KOtldnwGizY`,
            accept: "application/json"
        }
    });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    if (requestId !== searchRequestId) {
        return;
    }
    const formattedMovies = data.results.map(movie => ({
        title: movie.title,
        poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : noPosterImage,
        rating: movie.vote_average,
        year: movie.release_date
            ? movie.release_date.split("-")[0]
            : "Unknown",
        genre: movie.genre_ids,
        description: movie.overview || ""
    }));

    if (resolveBookmark) {
        const bookmarkMovie = formattedMovies.find(movie =>
            movie.title.toLowerCase() === searchTerm.toLowerCase()
        ) || formattedMovies[0];
        const savedTitle = [...bookmarkedMovies].find(title =>
            title.toLowerCase() === searchTerm.toLowerCase()
        );

        if (bookmarkMovie && savedTitle) {
            bookmarkedMovieDetails.set(savedTitle, {
                ...bookmarkMovie,
                title: savedTitle
            });
            localStorage.setItem(
                "bookmarkedMovieDetails",
                JSON.stringify([...bookmarkedMovieDetails.values()])
            );
        }
        return;
    }

    movies = formattedMovies;
    displayMovies(formattedMovies);
}