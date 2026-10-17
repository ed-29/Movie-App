const searchInput = document.getElementById("searchInput").value;
const searchButton = document.getElementById("searchButton");
const genreFilter = document.querySelectorAll("#filters li");
const movieDisplay = document.getElementById("movie-display");


const movies = [
    {
        title: "Inception",
        year: 2010,
        genre: "action",
        rating: 8.8,
        poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        description: "A thief enters people's dreams to steal secrets and is tasked with planting an idea in someone's mind."
    },
    {
        title: "The Dark Knight",
        year: 2008,
        genre: "action",
        rating: 9.0,
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        description: "Batman faces the Joker, a criminal mastermind who throws Gotham City into chaos."
    },
    {
        title: "The Hangover",
        year: 2009,
        genre: "comedy",
        rating: 7.7,
        poster: "https://image.tmdb.org/t/p/w500/uluhlXubGu1VxU63X9VHCLWDAYP.jpg",
        description: "Three friends wake up after a wild bachelor party in Las Vegas and try to find the missing groom."
    },
    {
        title: "The Pursuit of Happyness",
        year: 2006,
        genre: "drama",
        rating: 8.0,
        poster: "https://image.tmdb.org/t/p/w500/lBYOKAMcxIvuk9s9hMuecB9dPBV.jpg",
        description: "A struggling father works to build a better life for himself and his young son."
    },
    {
        title: "Interstellar",
        year: 2014,
        genre: "drama",
        rating: 8.7,
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        description: "A team of explorers travels through a wormhole in search of a new home for humanity."
    },
    {
        title: "The Conjuring",
        year: 2013,
        genre: "horror",
        rating: 7.5,
        poster: "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg",
        description: "Paranormal investigators help a family experiencing disturbing events in their farmhouse."
    },
    {
        title: "Titanic",
        year: 1997,
        genre: "romance",
        rating: 7.9,
        poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
        description: "Two young people from different social backgrounds fall in love aboard the ill-fated Titanic."
    },
    {
        title: "The Notebook",
        year: 2004,
        genre: "romance",
        rating: 7.8,
        poster: "https://image.tmdb.org/t/p/w500/rpzFxv78UvYG5yQba2soO9ODXxw.jpg",
        description: "A young couple's enduring love story unfolds across years of separation and hardship."
    },
    {
        title: "Superbad",
        year: 2007,
        genre: "comedy",
        rating: 7.6,
        poster: "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg",
        description: "Two high school friends try to make the most of their final days before graduation."
    },
    {
        title: "A Quiet Place",
        year: 2018,
        genre: "horror",
        rating: 7.5,
        poster: "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg",
        description: "A family struggles to survive in a world where deadly creatures hunt by sound."
    }
];


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
                                    <div class="movie-discription">${movie.description}</div>
                                    <div class="movie-genre">${movie.genre}</div>
                                    
                                </div>
                            </div>
                        </div>`);

                        
});


// Create a poster strip for the hero section
const posterTrack = document.getElementById("poster-track");

const posterImages = movies
    .map(movie => movie.poster)
    .filter(poster => poster);

function createPosterStrip() {
    // Duplicate the posters to create a continuous loop
    const allPosters = [...posterImages, ...posterImages];

    posterTrack.innerHTML = allPosters
        .map(poster => `<img src="${poster}" alt="" aria-hidden="true">`)
        .join("");
}

createPosterStrip();

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