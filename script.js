import { genreMap, noPosterImage } from "./modules/movie-data.js";
import {
    loadBookmarkedMovieDetails,
    loadBookmarkedMovies,
    loadFavoriteMovies,
    saveBookmarkedMovieDetails,
    saveBookmarkedMovies,
    saveFavoriteMovies
} from "./modules/storage.js";
import {
    createPosterStrip,
    displayMovies as renderMovieList,
    displaySearchSuggestions,
    renderNewestMovies as renderNewestMovieList,
    showMovieDetails as renderMovieDetails
} from "./modules/movie-view.js";
import { initializeTheme } from "./modules/theme.js";

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

const filterList = document.querySelector("#filters ul");
Object.entries(genreMap).forEach(([id, name]) => {
    const filter = document.createElement("li");
    filter.dataset.genre = id;
    filter.textContent = name;
    filterList.appendChild(filter);
});

initializeTheme();

//smart search functionality
const searchSuggestions = document.getElementById("search-suggestions");
const movieDetails = document.getElementById("movie-details");
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

searchSuggestions.addEventListener("click", event => {
    const suggestionItem = event.target.closest(".search-suggestion-item");

    if (!suggestionItem) {
        return;
    }

    selectSuggestion(suggestionItem);
});

function showMovieDetails(title) {
    renderMovieDetails(title, movies, popularMovies, favoriteMovies, bookmarkedMovies);
}

movieDetails.querySelector(".details-close").addEventListener("click", () => {
    movieDetails.close();
});

movieDetails.addEventListener("click", event => {
    const favoriteButton = event.target.closest(".favorite-toggle");
    if (favoriteButton) {
        toggleFavorite(favoriteButton);
        return;
    }

    const bookmarkButton = event.target.closest(".bookmark-toggle");
    if (bookmarkButton) {
        toggleBookmark(bookmarkButton);
    }
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

    saveFavoriteMovies(favoriteMovies);

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

    saveBookmarkedMovies(bookmarkedMovies, bookmarkedMovieDetails);

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
    renderMovieList(moviesToDisplay, favoriteMovies, bookmarkedMovies);
}

function renderNewestMovies() {
    renderNewestMovieList(popularMovies, favoriteMovies, bookmarkedMovies);
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

async function fetchMovieCredits(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMGJlYzI4YzBhMjNiMTEwNDZjMjdmYzI0YjQxNGNjOSIsIm5iZiI6MTc0NDAwOTcwNS4yOTksInN1YiI6IjY3ZjM3OWU5N2I0M2JkY2UyMGFkMjdjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9DmsGx94V5itCcE1395vOs24F9mkWjd_KOtldnwGizY`,
                accept: "application/json"
            }
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.cast || [];
    } catch (error) {
        console.error(`Unable to load credits for movie ${movieId}:`, error);
        return [];
    }
}

function getLeadActors(cast = []) {
    return cast
        .slice(0, 3)
        .map(actor => actor.name)
        .filter(Boolean);
}

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
        const formattedMovies = await Promise.all(data.results.map(async movie => {
            const cast = await fetchMovieCredits(movie.id);

            return {
                title: movie.title,
                poster: movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : noPosterImage,
                rating: movie.vote_average,
                year: movie.release_date
                    ? movie.release_date.split("-")[0]
                    : "Unknown",
                genre: movie.genre_ids,
                description: movie.overview || "",
                leadActors: getLeadActors(cast),
                cast
            };
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
    const formattedMovies = await Promise.all(data.results.map(async movie => {
        const cast = await fetchMovieCredits(movie.id);

        return {
            title: movie.title,
            poster: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : noPosterImage,
            rating: movie.vote_average,
            year: movie.release_date
                ? movie.release_date.split("-")[0]
                : "Unknown",
            genre: movie.genre_ids,
            description: movie.overview || "",
            leadActors: getLeadActors(cast),
            cast
        };
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
            saveBookmarkedMovieDetails(bookmarkedMovieDetails);
        }
        return;
    }

    movies = formattedMovies;
    displayMovies(formattedMovies);
}