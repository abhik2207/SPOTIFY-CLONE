console.log("Helllo");
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
    let a = await fetch(`http://127.0.0.1:5500/${currentFolder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    const anchorTags = div.getElementsByTagName("a");

    let fetchedSongs = [];
    for (let item of anchorTags) {
        if (item.href.endsWith(".mp3")) {
            fetchedSongs.push(item.href.split(`/${currentFolder}/`)[1]);
        }
    }
    return fetchedSongs;
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


// Main Function
async function main() {
    // Fetch all songs
    songs = await fetchSongs("Songs/Therapy");
    playMusic(songs[0], true);

    // Display songs in "Your Library" section
    let songsUnorderedList = document.querySelector("#songs-card > ul");
    for (let song of songs) {
        songsUnorderedList.innerHTML = songsUnorderedList.innerHTML + `<li>
            <div id="song-left">
                <img src="music3.png" alt="Music">
            </div>
            <div id="song-center">
                <h3>${decodeURI(song)}</h3>
                <p>Abhik and Ghostemane</p>
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
    previous.addEventListener("click", () => {
        let currentSongSrc = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentSongSrc);
        if(index-1 >= 0) {
            playMusic(songs[index-1]);
        }
    });

    // Attach event listener to next button
    const next = document.querySelector("#next");
    next.addEventListener("click", () => {
        let currentSongSrc = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentSongSrc);
        if(index+1 < songs.length) {
            playMusic(songs[index+1]);
        }
    });
}
main();


