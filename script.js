console.log("Hello There! Welcome to Console :)");
let currentSong = new Audio();
let songs;
let currentFolder;


// Function for showing and hiding hamburger menu on phones
function hamburgerMenu() {
    const hamburger = document.querySelector("#hamburger > i");
    const menu = document.querySelector("#left");
    const close = document.querySelector("#close");

    // Changing the style of left element, on click
    hamburger.addEventListener("click", () => {
        menu.style.left = "0%";
    });
    close.addEventListener("click", () => {
        menu.style.left = "-100%";
    });
}
hamburgerMenu();


// Function for converting seconds to minutes
function secondsToMinutes(durationInSeconds) {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    let answer = `${formattedMinutes}:${formattedSeconds}`;

    // Condition for not returning NaN
    if(answer == "NaN:NaN"){
        return "00:00";
    }
    else {
        return answer;
    }
}


async function fetchSongs(folder) {
    currentFolder = folder;
    let x = await fetch(`/${currentFolder}/`);
    let response = await x.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchorTags = div.getElementsByTagName("a");

    let songs = [];
    for (let item of anchorTags) {
        if (item.href.endsWith(".mp3")) {
            songs.push(item.href.split(`/${currentFolder}/`)[1]);
        }
    }
    
    // Display songs in "Your Library" section
    let songsUnorderedList = document.querySelector("#songs-card > ul");
    songsUnorderedList.innerHTML = "";
    for (let song of songs) {
        songsUnorderedList.innerHTML = songsUnorderedList.innerHTML + `<li>
            <div id="song-left">
                <img src="Images/music3.png" alt="Music">
            </div>
            <div id="song-center">
                <h3>${decodeURI(song)}</h3>
                <p>${currentFolder.split("/")[1]}</p>
            </div>
            <div id="song-right">
                <i class="fa-solid fa-play"></i>
            </div>
        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelectorAll("#songs-card li")).forEach((e) => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector("#song-center > h3").innerHTML, false);
        });
    });

    return songs;
}


// Function for playing the music
function playMusic(audio, paused) {
    currentSong.src = `/${currentFolder}/` + audio;
    if(!paused) {
        // Playing the music
        currentSong.play();

        // Changing play button to pause and vice versa
        document.querySelector("#play").classList.remove("fa-play");
        document.querySelector("#play").classList.add("fa-pause");
    }
    // Setting time and name of song
    document.querySelector("#song-info > p").innerHTML = decodeURI(audio);
    document.querySelector("#song-time > p").innerHTML = "00:00 / 00:00";
}


// Funtion for fetching albums dynamically
async function fetchAlbums() {
    let y = await fetch(`/Songs/`);
    let response = await y.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchorTags = div.getElementsByTagName("a");

    const cardContainer = document.querySelector("#cards");

    // Iterating iver the collection and displaying Cards
    let array = Array.from(anchorTags);
    for(let i=0; i<array.length; i++){
        const e = array[i];
        if(e.href.includes("/Songs/")){
            let folder = e.href.split("/").slice(-1)[0];
            let z = await fetch(`/Songs/${folder}/info.json`);
            let response = await z.json();
            
            cardContainer.innerHTML = cardContainer.innerHTML + `
                <div data-folder="${folder}" class="card">
                    <div class="card-image">
                        <img src="/Songs/${folder}/cover.jpg" alt="Playlist">
                        <div class="playCircle"><i class="fa-solid fa-play"></i></div>
                    </div>
                    <div class="card-data">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
                </div>
            `;
        }
    }

    // Load the songs whenever a playlist is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            songs = await fetchSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0], false);
        });
    });
}


// Main Function
async function main() {
    // Fetch all songs
    songs = await fetchSongs("Songs/Open_Letter");
    playMusic(songs[0], true);

    // Fetching all albums in playlists section
    fetchAlbums();

    // Attach an event listener to play/pause, next and previous buttons
    const playButton =  document.querySelector("#play");
    playButton.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            playButton.classList.remove("fa-play");
            playButton.classList.add("fa-pause");
        }
        else{
            currentSong.pause();
            playButton.classList.remove("fa-pause");
            playButton.classList.add("fa-play");
        }
    });

    // Event for updating song time and seekbar
    currentSong.addEventListener("timeupdate", () => {
        // Updating song time
        const songTime = document.querySelector("#song-time > p");
        songTime.innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
        
        // Updating seekbar
        const seekbarCircle = document.querySelector("#seekbarCircle");
        const progress = (currentSong.currentTime / currentSong.duration) * 100;
        seekbarCircle.style.left = `${progress}%`;
    });

    // Adding event listener to seekbar
    const seekbar = document.querySelector("#seekbar");
    seekbar.addEventListener("click", (e) => {
        const offset = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        const seekbarCircle = document.querySelector("#seekbarCircle");
        seekbarCircle.style.left = `${offset}%`;
        currentSong.currentTime = (currentSong.duration * offset) / 100;
    });

    // Attach event listener to previous button
    const previous = document.querySelector("#previous");
    previous.addEventListener("click", async () => {
        let currentSongSrc = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentSongSrc);
        if(index-1 >= 0) {
            songs = await fetchSongs(currentFolder);
            playMusic(songs[index-1], false);
        }
    });

    // Attach event listener to next button
    const next = document.querySelector("#next");
    next.addEventListener("click", async () => {
        let currentSongSrc = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentSongSrc);
        if(index+1 < songs.length) {
            songs = await fetchSongs(currentFolder);
            playMusic(songs[index+1], false);
        }
    });
}
main();
