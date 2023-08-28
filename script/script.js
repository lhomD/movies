let outputElem;     //Output elem
let searchForm;     //Referens till sök elementets parent
let searchQuery     //Text fältet i formen för sök
let genresBtn;      //Knappar för genrer som ligger under header
let pageNr = 0;     //Page nr
let modal;          //Modal background
let loadBtn;        //Get position when clicking load more btn
let sacrollBack;    //Scroll back page while new movies loads
//URL
const movieDb = "https://api.themoviedb.org/3/";
const movieDbKey = "api_key=cebaa0500440eb0f48f42d229a57cc8b";
//Referens to poster img
const imgPathSmall = 'https://image.tmdb.org/t/p/w300';
let loader;         //Loader animation container
//---------------------------------------------------
//Load Js after page loaded
function init() {
    loader = document.querySelector(".loader_container")
    outputElem = document.getElementById("output");
    searchForm = document.getElementById("search");
    searchQuery = searchForm.getElementsByTagName("input");
    let searchBtn = searchForm.getElementsByTagName("button");
    searchBtn[0].addEventListener("click", searchMovie);

    //-----------------------------------
    genresBtn = document.getElementsByClassName("gener");
    for (let i = 0; i < genresBtn.length; i++) {
        genresBtn[i].addEventListener("click", getGenres);
    }

    //-------------------------------------
    setTimeout(hideLoader, 1000)
    document.body.style.overflow = "hidden";

    checkUrl();
} //End function init
window.addEventListener("load", init)
//-------------------------------------------------
//Function to hide loader
function hideLoader() {
    loader.style.opacity = "0";
    setTimeout(() => {
        loader.style.display = "none";
        document.body.style.overflow = "auto";
    }, 500);
}
//-------------------------------------------------
//Search movie with query from query field
function searchMovie(e) {
    e.preventDefault();
    let searchTerm = searchQuery[0].value
    searchForm.classList.toggle("active");

    if (searchTerm && searchTerm !== "") {
        searchQuery[0].value = "";
        //Load search page code here
        let search = encodeURIComponent(searchTerm);
        location.href = "index.html?" + search;
    }
}//End searchMovie
//------------------------------------------------
//Load genres
function getGenres(e) {
    let circle = document.createElement("span");
    circle.classList.add('circle');
    this.appendChild(circle);
    setTimeout(() => {
        let search = encodeURIComponent(this.id + "/" + this.value);
        location.href = "index.html?genre" + search;
    }, 700);
}//End getGenres
//-------------------------------------------------
//Read url field
function checkUrl(e) {
    let dataStr = location.search.substring(1);
    dataStr = decodeURIComponent(dataStr);
    let genre = dataStr.substring(0, 5);
    //Check if titel for search and genres exist
    let titelElem = document.getElementById("titel");

    if (dataStr == "") {
        outputElem.innerHTML = `<section class="section"> 
        <h1>popular movies</h1>
        <div id="popular" class="cards popular">
        </section>
        <section class="section">
        <h1>popular kids movies</h1>
        <div id="kids" class="cards kids">
        </section>
        <section class="section">
        <h1>most voted movies</h1>
        <div id="hight" class="cards highest">
        </section>`
        popular();
        return;
    }
    //Load genres
    if (genre === "genre") {
        let genreId = dataStr.substring(5).split("/");
        pageNr++;
        const movieDbGenres = movieDb + "discover/movie?" + movieDbKey + "&with_genres=" + genreId[0] + "&sort_by=popularity.desc&page=" + pageNr;
        console.log(movieDbGenres)
        if (titelElem) {
            getMovies(e, movieDbGenres);
        } else {
            outputElem.innerHTML = `
        <h1 id= "titel">'${genreId[1]}'</h1>
        <div class="moviecards" id="moviecards">
        <button type="button" class="load" id="load">load more</button></div>`;
            getMovies(e, movieDbGenres);
        }
        return;
    }
    else { //Load search
        pageNr++;
        let movieDbSearch = movieDb + "search/movie?" + movieDbKey + "&query=" + dataStr + "&sort_by=popularity.desc&page=" + pageNr;

        if (titelElem) {
            getMovies(e, movieDbSearch);
        } else {
            outputElem.innerHTML = `
        <h1 id= "titel">'${dataStr}'</h1>
        <div class="moviecards" id="moviecards">
        <button type="button" class="load" id="load">load more</button></div>`;
            getMovies(e, movieDbSearch);
        }
        return;
    }
}//End checkUrl
//------------------------------------------------
function loadStartMovies(arg) {
    return fetch(arg).then(res => res.json()).then(data => data.results);
} //End loadStartMovies
//------------------------------------------------
//Load popuar movies
function popular() {
    let container = document.getElementById("popular");
    const movieDbPop = "discover/movie?sort_by=popularity.desc&";
    const url = movieDb + movieDbPop + movieDbKey;
    loadStartMovies(url)
        .then(data => data.forEach(movie => {
            const { title, poster_path, vote_average, id } = movie;

            //Vote avarage
            if (vote_average >= 5) {
                first = "rotate(180deg)";
                second = "rotate(" + vote_average * 36 + "deg)"
                opacity = 0;
            } if (vote_average <= 5) {
                first = "rotate(" + vote_average * 36 + "deg)";
                second = "rotate(0deg)"
                opacity = 1;
            }
            //poster
            if (poster_path) {
                posterImg = imgPathSmall + poster_path;
            } else {
                posterImg = "img/no_img.jpg";
            }

            let movieEl = document.createElement("article");
            movieEl.innerHTML =
                `<img src="${posterImg}" alt="${title}" loading="lazy" >
                <div class="avarage_container">
                    <div class="avarege ${getClass(vote_average)}">
                        <div class="avarege-half" style ="transform:${first};"></div>
                        <div class="avarege-half" style ="transform:${second};"></div>
                        <div class="avarege-top" style ="opacity:${opacity};"></div>
                        <span class="avarege-value">${vote_average}</span>
                    </div>
                </div>
                <h2>"${title}"</h2>`
            let infoElem = document.createElement("i");
            infoElem.id = id;
            infoElem.classList.add("fas", "fa-info");
            infoElem.addEventListener("click", ripple);
            infoElem.addEventListener("click", function () {
                setTimeout(showModal, 700, infoElem.id)
            });
            movieEl.appendChild(infoElem);
            container.appendChild(movieEl);
        }));
    kids();
} //End popular
//------------------------------------------------
//Load kids movies
function kids() {
    let container = document.getElementById("kids");
    const movieDbKids = "discover/movie?certification_country=US&certification.lte=G&sort_by=popularity.desc&";
    const url = movieDb + movieDbKids + movieDbKey;
    loadStartMovies(url)
        .then(data => data.forEach(movie => {
            const { title, poster_path, vote_average, id } = movie;

            //Vote avarage
            if (vote_average >= 5) {
                first = "rotate(180deg)";
                second = "rotate(" + vote_average * 36 + "deg)"
                opacity = 0;
            } if (vote_average <= 5) {
                first = "rotate(" + vote_average * 36 + "deg)";
                second = "rotate(0deg)"
                opacity = 1;
            }
            //poster
            if (poster_path) {
                posterImg = imgPathSmall + poster_path;
            } else {
                posterImg = "img/no_img.jpg";
            }

            let movieEl = document.createElement("article");
            movieEl.innerHTML =
                `<img src="${posterImg}" alt="${title}" loading="lazy">
            <i class="fas fa-info" id="${id}"></i>
            <div class="avarage_container">
                <div class="avarege ${getClass(vote_average)}">
                    <div class="avarege-half" style ="transform:${first};"></div>
                    <div class="avarege-half" style ="transform:${second};"></div>
                    <div class="avarege-top" style ="opacity:${opacity};"></div>
                    <span class="avarege-value">${vote_average}</span>
                </div>
            </div>
            <h2>"${title}"</h2>`
            let infoElem = document.createElement("i");
            infoElem.id = id;
            infoElem.classList.add("fas", "fa-info")
            infoElem.addEventListener("click", ripple);
            infoElem.addEventListener("click", function () {
                setTimeout(showModal, 700, infoElem.id)
            });
            movieEl.appendChild(infoElem);
            container.appendChild(movieEl);
        }));
    highest();
} //End kids
//------------------------------------------------
//Load highest rated movies
function highest() {
    let container = document.getElementById("hight");
    "discover/movie?";
    const url = "https://api.themoviedb.org/3/discover/movie?api_key=cebaa0500440eb0f48f42d229a57cc8b&sort_by=vote_count.desc&page=1";
    loadStartMovies(url)
        .then(data => data.forEach(movie => {
            const { title, poster_path, vote_average, id } = movie;

            //Vote avarage
            if (vote_average >= 5) {
                first = "rotate(180deg)";
                second = "rotate(" + vote_average * 36 + "deg)"
                opacity = 0;
            } if (vote_average <= 5) {
                first = "rotate(" + vote_average * 36 + "deg)";
                second = "rotate(0deg)"
                opacity = 1;
            }
            //poster
            if (poster_path) {
                posterImg = imgPathSmall + poster_path;
            } else {
                posterImg = "img/no_img.jpg";
            }

            let movieEl = document.createElement("article");
            movieEl.innerHTML =
                `<img src="${posterImg}" alt="${title}" loading="lazy">
            <i class="fas fa-info" id="${id}"></i>
            <div class="avarage_container">
                <div class="avarege ${getClass(vote_average)}">
                    <div class="avarege-half" style ="transform:${first};"></div>
                    <div class="avarege-half" style ="transform:${second};"></div>
                    <div class="avarege-top" style ="opacity:${opacity};"></div>
                    <span class="avarege-value">${vote_average}</span>
                </div>
            </div>
            <h2>"${title}"</h2>`
            let infoElem = document.createElement("i");
            infoElem.id = id;
            infoElem.classList.add("fas", "fa-info")
            infoElem.addEventListener("click", ripple);
            infoElem.addEventListener("click", function () {
                setTimeout(showModal, 700, infoElem.id)
            });
            movieEl.appendChild(infoElem);
            container.appendChild(movieEl);
        }));
} //End highest
//------------------------------------------------
//Get movies with genres or search query
async function getMovies(e, url) {
    const res = await fetch(url)
    const data = await res.json()
    let titelElem = document.getElementById("titel");
    if (pageNr === 1) {
        titelElem.innerHTML += " found " + data.total_results + " movies";
    }

    let movieCards = document.getElementById("moviecards");
    loadBtn = document.getElementById("load");

    if (pageNr < data.total_pages) {
        loadBtn.style.display = "flex";
        loadBtn.addEventListener("click", ripple);
    } if (pageNr === data.total_pages) {
        loadBtn.disabled = true;
    }

    //avarage section
    let first;
    let second;
    let opacity;

    //Image poster
    let posterImg;

    data.results.forEach((movie, idx) => {
        const { title, poster_path, vote_average, id } = movie;

        //Vote avarage
        if (vote_average >= 5) {
            first = "rotate(180deg)";
            second = "rotate(" + vote_average * 36 + "deg)"
            opacity = 0;
        } if (vote_average <= 5) {
            first = "rotate(" + vote_average * 36 + "deg)";
            second = "rotate(0deg)"
            opacity = 1;
        }
        //poster
        if (poster_path) {
            posterImg = imgPathSmall + poster_path;
        } else {
            posterImg = "img/no_img.jpg";
        }
        movieEl = document.createElement("article");
        movieEl.innerHTML =
            `<img src="${posterImg}" alt="${title}" loading="lazy">
            <i class="fas fa-info" id="${id}"></i>
            <div class="avarage_container">
                <div class="avarege ${getClass(vote_average)}">
                    <div class="avarege-half" style ="transform:${first};"></div>
                    <div class="avarege-half" style ="transform:${second};"></div>
                    <div class="avarege-top" style ="opacity:${opacity};"></div>
                    <span class="avarege-value">${vote_average}</span>
                </div>
            </div>
            <h2>"${title}"</h2>`
        movieCards.appendChild(movieEl);

    })
    //Scroll back to the top
    if (sacrollBack) {
        window.scrollTo(0, sacrollBack);
    }
    //Info btn 
    let infoBtn = document.querySelectorAll(".fa-info");
    for (let i = 0; i < infoBtn.length; i++) {
        infoBtn[i].addEventListener("click", ripple);
        infoBtn[i].addEventListener("click", function () {
            setTimeout(showModal, 700, this.id);
        });
    }
}//End getMovies
//------------------------------------------------
//Get class to the avarage container
function getClass(avg) {
    if (avg >= 8) {
        return "green";
    } else if (avg >= 5) {
        return 'orange'
    } else {
        return 'red'
    }
}//End getClasss
//-------------------------------------------------------
//Show modal
async function showModal(arg) {

    document.body.style.overflow = "hidden";
    //Show and hide modal
    modal = document.getElementById("modal");
    modal.classList.add("show");

    modal.addEventListener("click", hideModal)
    let closeBtn = document.getElementById("close");
    closeBtn.addEventListener("click", hideModal);

    //Url adress to the movie
    let url = "https://api.themoviedb.org/3/movie/" + arg + "?api_key=cebaa0500440eb0f48f42d229a57cc8b&append_to_response=videos";

    let actors = "https://api.themoviedb.org/3/movie/" + arg + "/credits?api_key=cebaa0500440eb0f48f42d229a57cc8b&append_to_response=videos";
    const imgPath = "https://image.tmdb.org/t/p/w500";

    //get movie info
    const result = await fetch(url);
    const data = await result.json();
    console.log(url)
    //get acter info
    const actor = await fetch(actors);
    const actorData = await actor.json();

    //Modal background img
    let bgImg = modal.querySelector(".modal_inner");
    bgImg.scrollTop = 0;
    bgImg.style.backgroundImage = "";
    let bgEmpty = "img/big_img.jpg";
    if (data.backdrop_path) {
        bgImg.style.backgroundImage = "linear-gradient(90deg, rgba(8, 7, 8, 0.6) 0%, rgba(8, 7, 8, 0.6) 100%), url(" + imgPath + data.backdrop_path + ")";

    } else {
        bgImg.style.backgroundImage = "linear-gradient(90deg, rgba(8, 7, 8, 0.6) 0%, rgba(8, 7, 8, 0.6) 100%), url(" + bgEmpty + ")";
    }

    //Movie poster img
    let moviePoster = modal.querySelector("img");
    moviePoster.src = "";
    moviePoster.alt = data.title;
    if (data.poster_path) {
        moviePoster.src = imgPathSmall + data.poster_path;
    } else {
        moviePoster.src = "img/no_img.jpg";
    }

    //Title of movie
    let movieTitel = modal.querySelector("h2");
    movieTitel.innerHTML = data.title

    //overwiev
    let overview = modal.querySelector("p");
    overview.innerHTML = "";
    overview.innerHTML = data.overview

    //avarage
    let avarageContainer = modal.querySelector(".avarage_container .avarege");
    let avarageContainerHalf = avarageContainer.querySelectorAll(".avarege-half");
    let avarageContainerTop = avarageContainer.querySelector(".avarege-top");
    let avarageContainerValue = avarageContainer.querySelector(".avarege-value");

    let circel = data.vote_average * 36;

    if (data.vote_average >= 8) {
        avarageContainer.classList.add("green");
        avarageContainerHalf[0].style.transform = "rotate(180deg)";
        avarageContainerHalf[1].style.transform = "rotate(" + circel + "deg)";
        avarageContainerTop.style.opacity = "0";
        avarageContainerValue.innerHTML = Number(data.vote_average).toFixed(1);
    }

    if (data.vote_average < 8 && data.vote_average > 5) {
        avarageContainer.classList.add("orange");
        avarageContainerHalf[0].style.transform = "rotate(180deg)";
        avarageContainerHalf[1].style.transform = "rotate(" + circel + "deg)";
        avarageContainerTop.style.opacity = "0";
        avarageContainerValue.innerHTML = Number(data.vote_average).toFixed(1);
    }
    if (data.vote_average < 5) {
        avarageContainer.classList.add("red");
        avarageContainerHalf[0].style.transform = "rotate(180deg)";
        avarageContainerHalf[1].style.transform = "rotate(" + circel + "deg)";
        avarageContainerTop.style.opacity = "0";
        avarageContainerValue.innerHTML = Number(data.vote_average).toFixed(1);
    }

    //Runtime
    let runTime = modal.querySelector("#time span");
    runTime.innerHTML = "";
    runTime.innerHTML = "&nbsp" + data.runtime + "min";

    //Release time
    let released = modal.querySelector("#release span");
    released.innerHTML = "";
    released.innerHTML = "&nbsp" + data.release_date;

    //genres
    let genresElem = modal.querySelector("#genre span");
    genresElem.innerHTML = "";
    for (let i = 0; i < data.genres.length; i++) {
        genresElem.innerHTML += "&nbsp" + data.genres[i].name + " ";
    }

    //Budjet
    let budgetElem = modal.querySelector("#budjet span");
    budgetElem.innerHTML = "";
    budgetElem.innerHTML = "&nbsp" + data.budget + "$"

    //Countries
    let contriesElem = modal.querySelector("#country span");
    contriesElem.innerHTML = "";
    for (let i = 0; i < data.production_countries.length; i++) {
        contriesElem.innerHTML += "&nbsp" + data.production_countries[i].name + " ";
    }

    //actors
    let actorsPart = modal.querySelector(".modal_inner_actors");
    //actorsPart.innerHTML = "";
    actorsPart.innerHTML = "<h2>Actors:</h2>"
    let posterImg;

    if (actorData.cast.length > 9) {
        for (let i = 0; i < 9; i++) {
            //poster
            if (actorData.cast[i].profile_path == null) {
                posterImg = "img/no_img.jpg";
            } else {
                posterImg = imgPathSmall + actorData.cast[i].profile_path;
            }
            let actorsElem = document.createElement("article");
            let actorsImg = document.createElement("img");
            let actorsName = document.createElement("h3");

            actorsImg.src = posterImg;
            actorsName.innerHTML = actorData.cast[i].name;

            actorsElem.appendChild(actorsImg);
            actorsElem.appendChild(actorsName);
            actorsPart.appendChild(actorsElem)
        }
    } if (actorData.cast.length < 9) {
        for (let i = 0; i < actorData.cast.length; i++) {
            if (actorData.cast[i].profile_path == null) {
                posterImg = "img/no_img.jpg";
            } else {
                posterImg = imgPathSmall + actorData.cast[i].profile_path;
            }
            let actorsElem = document.createElement("article");
            let actorsImg = document.createElement("img");
            let actorsName = document.createElement("h3");

            actorsImg.src = posterImg;
            actorsName.innerHTML = actorData.cast[i].name;

            actorsElem.appendChild(actorsImg);
            actorsElem.appendChild(actorsName);
            actorsPart.appendChild(actorsElem)
        }
    }

    //Trailer
    let trailerPart = modal.querySelector(".modal_inner_trailer");
    trailerPart.innerHTML = "";
    if (data.videos.results.length == 0) {
        trailerPart.innerHTML = "";
    }

    if (data.videos.results.length > 0) {
        trailerPart.innerHTML = "";
        if (data.videos.results.length == 1) {
            trailerPart.innerHTML = "<h2>Trailers:</h2>";
            trailerPart.innerHTML += `<iframe src="https://www.youtube.com/embed/${data.videos.results[0].key}" title="YouTube video player"
                           allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowfullscreen></iframe>`;
        }
        if (data.videos.results.length >= 3) {
            trailerPart.innerHTML = "";
            trailerPart.innerHTML = "<h2>Trailers:</h2>";
            for (let i = 0; i < 3; i++) {
                trailerPart.innerHTML += `<iframe src="https://www.youtube.com/embed/${data.videos.results[i].key}" title="YouTube video player"
                           allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowfullscreen></iframe>`;
            }
        }
    }
}
//-------------------------------------------------------
//Hide modal
function hideModal() {
    document.body.style.overflow = "visible";
    modal.removeEventListener("click", hideModal)
    modal.classList.remove("show");
} //End hideModal
//----------------------------------------------------------
//Ripple
function ripple(e) {
    let circle = document.createElement("span");
    circle.classList.add('circle');
    circle.style.top = "50%";
    circle.style.left = "50%";

    this.appendChild(circle);
    setTimeout(() => {
        if (loadBtn) {
            sacrollBack = loadBtn.offsetTop - e.clientY + e.layerY;
            checkUrl();
        }
        circle.remove();
    }, 700);
}