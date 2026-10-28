function loadMovieTitles(storageKey, description, errorMessage) {
    const savedTitles = localStorage.getItem(storageKey);

    if (!savedTitles) {
        return new Set();
    }

    try {
        const parsedTitles = JSON.parse(savedTitles);
        if (Array.isArray(parsedTitles) &&
            parsedTitles.every(title => typeof title === "string")) {
            return new Set(parsedTitles);
        }
        throw new Error(`Saved ${description} must be an array of movie titles.`);
    } catch (error) {
        console.error(errorMessage, error);
        return new Set();
    }
}

export function loadFavoriteMovies() {
    return loadMovieTitles(
        "favoriteMovies",
        "favorites",
        "Unable to load saved favorite movies:"
    );
}

export function loadBookmarkedMovies() {
    return loadMovieTitles(
        "bookmarkedMovies",
        "bookmarks",
        "Unable to load bookmarked movies:"
    );
}

export function loadBookmarkedMovieDetails() {
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

export function saveFavoriteMovies(favoriteMovies) {
    try {
        localStorage.setItem("favoriteMovies", JSON.stringify([...favoriteMovies]));
    } catch (error) {
        console.error("Unable to save favorite movies:", error);
    }
}

export function saveBookmarkedMovies(bookmarkedMovies, bookmarkedMovieDetails) {
    try {
        localStorage.setItem("bookmarkedMovies", JSON.stringify([...bookmarkedMovies]));
        saveBookmarkedMovieDetails(bookmarkedMovieDetails);
    } catch (error) {
        console.error("Unable to save bookmarked movies:", error);
    }
}

export function saveBookmarkedMovieDetails(bookmarkedMovieDetails) {
    localStorage.setItem(
        "bookmarkedMovieDetails",
        JSON.stringify([...bookmarkedMovieDetails.values()])
    );
}
