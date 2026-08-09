const API_KEY = "26f048e106a683702b2fb2bb90265a47";

const BASE_URL = "https://api.themoviedb.org/3";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";


let currentSearchMovies = [];
let currentGenreMovies = [];
let currentTopRatedMovies = [];
let currentTrendingMovies = [];

// ================= FAVORITES SYSTEM =================

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function isFavorite(movieId){

    return favorites.some(
        movie => movie.id === movieId
    );

}


// ADD / REMOVE FAVORITE

function toggleFavorite(movieId,event){

    event.stopPropagation();

    fetch(
        `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
    )
    .then(response => response.json())
    .then(movie => {

        const exists = favorites.some(
            fav => fav.id === movie.id
        );


        if(exists){

            favorites = favorites.filter(
                fav => fav.id !== movie.id
            );

        }

        else{

            favorites.push(movie);

        }


        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );


        displayFavorites();


        // Refresh all movie cards so the heart changes immediately
        getTrendingMovies();

getTopRatedMovies();

displayFavorites();

refreshMovieCards();

getFeaturedMovie();

    })
    .catch(error => {

        console.error("Favorite Error:", error);

    });

}

// DISPLAY FAVORITES

function displayFavorites(){

    const container = document.getElementById("favoritesMovies");


    container.innerHTML = "";


    if(favorites.length === 0){

        container.innerHTML = `

        <div class="favorites-empty">

        ❤️

        <p>
        Your favorite movies will appear here
        </p>

        </div>

        `;

        return;

    }


    favorites.forEach(movie=>{

        container.innerHTML += createMovieCard(movie);

    });

}




// ================= TRENDING MOVIES =================


async function getTrendingMovies(){

    const response = await fetch(
        `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
    );


    const data = await response.json();


    const movies = data.results;


    const movieContainer = document.getElementById("trendingMovies");


    movieContainer.innerHTML = "";


    movies.forEach(movie => {


        movieContainer.innerHTML += createMovieCard(movie);


    });

}



function createMovieCard(movie){

    return `

    <div class="movie-card" onclick="getMovieDetails(${movie.id})">


        <button class="fav-btn ${isFavorite(movie.id) ? "active" : ""}" 
onclick="toggleFavorite(${movie.id}, event)">
${isFavorite(movie.id) ? "❤️" : "🤍"}
</button>


        <img 
            src="${
                movie.poster_path
                ? IMAGE_URL + movie.poster_path
                : 'assets/images/no-poster.jpg'
            }"
            alt="${movie.title}"
        >


        <div class="movie-info">


            <span class="rating">
                ⭐ ${
                    typeof movie.vote_average === "number"
                    ? movie.vote_average.toFixed(1)
                    : "N/A"
                }
            </span>


            <h3>
                ${movie.title}
            </h3>


            <p>
                ${
                    movie.release_date
                    ? movie.release_date.substring(0,4)
                    : "N/A"
                }
            </p>


        </div>


    </div>

    `;

}

// ================= FEATURED MOVIE =================

async function getFeaturedMovie(){

    try{

        const response = await fetch(
            `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
        );

        const data = await response.json();

        const movie = data.results[0];


        document.getElementById("featured-title").innerText =
        movie.title;


        document.querySelector(".featured").style.backgroundImage =
`
linear-gradient(
    90deg,
    rgba(9,9,11,0.95) 15%,
    rgba(9,9,11,0.75) 45%,
    rgba(9,9,11,0.2)
),
url(
${IMAGE_URL + movie.backdrop_path}
)
`;


        document.getElementById("featured-meta").innerHTML =
        `
        ⭐ ${movie.vote_average.toFixed(1)}
        <span>•</span>
        ${movie.release_date.substring(0,4)}
        `;

document.getElementById("featured-trailer")
.onclick = () => openTrailer(movie.id);

        document.querySelector(".featured-buttons .outline-btn")
        .onclick = () => getMovieDetails(movie.id);


    }
    catch(error){

        console.error("Featured Error:",error);

    }

}


getFeaturedMovie();





// ================= SEARCH MOVIES =================


const searchInput = document.getElementById("searchInput");

const searchBtn = document.getElementById("searchBtn");



async function searchMovies(){


const query = searchInput.value.trim();


if(query === ""){
    return;
}



const response = await fetch(

`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`

);



const data = await response.json();



displaySearchResults(data.results);



document.getElementById("search-results")
.scrollIntoView({

behavior:"smooth"

});


}




function displaySearchResults(movies){

currentSearchMovies = movies;


const movieContainer = document.getElementById("searchMovies");

movieContainer.innerHTML = "";


movies.forEach(movie=>{

movieContainer.innerHTML += createMovieCard(movie);

});

}

function refreshMovieCards(){


    displaySearchResults(currentSearchMovies);


    displayGenreMovies(
        currentGenreMovies,
        currentGenre
    );


}



searchBtn.addEventListener(
"click",
searchMovies
);



searchInput.addEventListener(
"keypress",
function(event){

if(event.key === "Enter"){

searchMovies();

}

});



// START

getTrendingMovies();

// ================= TOP RATED MOVIES =================


async function getTopRatedMovies(){

    try {


        const response = await fetch(
            `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`
        );


        const data = await response.json();


        const movies = data.results;


        const movieContainer = document.getElementById("topRatedMovies");


        movieContainer.innerHTML = "";


        movies.forEach(movie => {


            movieContainer.innerHTML += createMovieCard(movie);


        });


    } catch(error) {


        console.error("Top Rated Error:", error);


    }

}


getTopRatedMovies();

// ================= MOVIE DETAILS =================


async function getMovieDetails(movieId){


    const response = await fetch(

        `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`

    );


    const movie = await response.json();

    document.getElementById("trailer-btn").onclick = () => {
    openTrailer(movieId);
};



    document.getElementById("details-image").src =
movie.poster_path
? IMAGE_URL + movie.poster_path
: "assets/images/no-poster.jpg";



    document.getElementById("details-title").innerText =
    movie.title;



    document.getElementById("details-overview").innerText =
    movie.overview;

document.getElementById("details-runtime").innerText =
"⏱ " + (movie.runtime || "N/A") + " min";


document.getElementById("details-language").innerText =
"🌎 " + movie.original_language.toUpperCase();


document.getElementById("details-popularity").innerText =
"🔥 " + movie.popularity.toFixed(0);

    document.getElementById("details-meta").innerHTML = `

        ⭐ ${movie.vote_average.toFixed(1)}

        &nbsp; • &nbsp;

        ${movie.release_date ? movie.release_date.substring(0,4) : "N/A"}

        &nbsp; • &nbsp;

        ${movie.genres.map(genre => genre.name).join(", ")}

    `;



    document.getElementById("movie-details").style.display="block";



    document.getElementById("movie-details")
.scrollIntoView({

behavior:"smooth",

block:"start"

});


}

async function openTrailer(movieId) {
    const trailerTab = window.open("", "_blank");

    if (!trailerTab) {
        alert("Please allow pop-ups to watch the trailer.");
        return;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
        );

        const data = await response.json();

        const trailer =
            data.results.find(video =>
                video.site === "YouTube" &&
                video.type === "Trailer"
            ) ||
            data.results.find(video => video.site === "YouTube");

        if (trailer) {
            trailerTab.location.href =
                `https://www.youtube.com/watch?v=${trailer.key}`;
        } else {
            trailerTab.close();
            alert("Trailer is not available for this movie.");
        }
    } catch (error) {
        trailerTab.close();
        console.error("Trailer Error:", error);
        alert("Could not load the trailer. Please try again.");
    }
}

// CLOSE DETAILS


document.getElementById("close-details")
.addEventListener("click",()=>{


    document.getElementById("movie-details")
    .style.display="none";


});


// ================= GENRE MOVIES =================

let currentGenre = "";
async function getMoviesByGenre(genreId){


    const response = await fetch(

        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`

    );


    const data = await response.json();


    displayGenreMovies(data.results, currentGenre);


}




function displayGenreMovies(movies, genreName){


    currentGenreMovies = movies;


    const movieContainer = document.getElementById("genreMovies");

    const title = document.getElementById("genre-title");


    title.innerText = `${genreName} Movies`;


    movieContainer.innerHTML = "";


    movies.forEach(movie => {


        movieContainer.innerHTML += createMovieCard(movie);


    });

}

// ================= GENRE CLICK EVENTS =================


const genreCards = document.querySelectorAll(".genre-card");


genreCards.forEach(card => {


    card.addEventListener("click", () => {

currentGenre = card.innerText;

const genreId = card.dataset.genre;


/* Remove previous genre class */

const genreResult = document.getElementById("genre-result");

genreResult.className = "";


/* Add the correct genre class */

const genreClasses = {

    "28": "genre-action",
    "12": "genre-adventure",
    "878": "genre-sci",
    "14": "genre-fantasy",
    "27": "genre-horror",
    "53": "genre-thriller",
    "35": "genre-comedy",
    "18": "genre-drama",
    "10749": "genre-romance",
    "9648": "genre-mystery",
    "16": "genre-animation",
    "99": "genre-documentary"

};


genreResult.classList.add(
    genreClasses[genreId]
);


getMoviesByGenre(genreId);


        document.getElementById("genre-result")
.scrollIntoView({

    behavior:"smooth",

    block:"start"

});


    });


});

