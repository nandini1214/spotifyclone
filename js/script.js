let currentSong = new Audio();
var songUL, playbarsong;
var songs;
var currfolder = "English";

function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds)) {
    return "00:00";
  }
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);
  var timeFormat =
    (minutes < 10 ? "0" : "") +
    minutes +
    ":" +
    (remainingSeconds < 10 ? "0" : "") +
    remainingSeconds;
  return timeFormat;
}

async function getSongs(folder) {
  let a = await fetch(`/songs/${folder}`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < anchor.length; index++) {
    const element = anchor[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songsList = document
    .querySelector(".songslist")
    .getElementsByTagName("ul")[0];
  songsList.innerHTML = "";
  for (const song of songs) {
    songUL = song.replaceAll("%20", " ")

    songsList.innerHTML =
      songsList.innerHTML +
      `<li class="flex songcard align-item bg-light-grey">
      <div class="aboutsong flex align-item">   
      <img src="assests/music.png" alt="music">
      <div class="info">
          <div class="Song">${songUL.split("-")[0]}</div>
          <div class="SongArtist color-off-white">${songUL.split("-")[1]}</div>
      </div>
  </div>
  <div class="playnow">
      <img class="invert" src="assests/palycircle.svg" alt="" srcset="">
  </div>
</li>`;
  }
  let defaultsong = songs[0].replaceAll("%20", " ").replaceAll(".mp3", "");
  Playmusic(
    defaultsong.split("-")[0],
    defaultsong.split("-")[1],
    `${folder}`,
    true
  );

  Array.from(
    document.querySelector(".songslist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      Playmusic(
        e.querySelector(".Song").innerHTML,
        e.querySelector(".SongArtist").innerHTML,
        `${folder}`
      );
    });
  });

  document.querySelector(".prevsong").addEventListener("click", () => {
    let findsong = currentSong.src.split(`/${folder}/`)[1];

    for (const key in songs) {
      if (findsong == songs[key]) {
        let previous = songs[parseInt(key) - 1]
          .replaceAll("%20", " ")
          .replace(".mp3", "");

        Playmusic(previous.split("-")[0], previous.split("-")[1], `${folder}`);
        document.querySelector(".playbar-song").innerHTML = `${
          previous.split("-")[0]
        }`;
      }
    }
  });

  document.querySelector(".nextsong").addEventListener("click", () => {
    let findsong = currentSong.src.split(`${folder}/`)[1];

    for (const key in songs) {
      if (findsong == songs[key]) {
        let previous = songs[parseInt(key) + 1]
          .replaceAll("%20", " ")
          .replace(".mp3", "");
        Playmusic(previous.split("-")[0], previous.split("-")[1], `${folder}`);
        document.querySelector(".playbar-song").innerHTML = `${
          previous.split("-")[0]
        }`;
      }
    }
  });
  return songs
}
let play = document.querySelector(".play-circle");

// play music

function Playmusic(song, songartist, folder, pause = false) {
  currentSong.src =
    "/songs/" + `${folder}` + "/" + song + "-" + songartist + ".mp3";
  if (!pause) {
    currentSong.play();
    play.src = "assests/pausecircle.svg";
  }
  document.querySelector(
    ".song-name"
  ).innerHTML = `<div class="playbar-song-card flex align-item">   
  <img src="assests/music.png" alt="music">
  <div class="playbar-info">
    <div class="playbar-song color-white">${song}</div>
  </div>
  </div>`;
  let volume = document.querySelector(".volume");
  volume.src = "assests/volume.svg";
}

// display album

async function display_album() {
  let cardConatiner = document.querySelector(".cardConatier");
  let a = await fetch(`/songs`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchor = div.getElementsByTagName("a");
  Array.from(anchor).forEach(async (e) => {
    let foldername = e.href.split("/songs/")[1];

    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let a = await fetch( `/songs/${foldername}/info.json`);
      let response = await a.json();

      cardConatiner.innerHTML =
        cardConatiner.innerHTML +
        ` <div class="card bg-light-grey cursor " data-folder = "${response.foldername}" >

<div class="card-images">
    <div class="play-bg-green flex justify-content align-item" >
        <img class="card-playcircle" src="assests/playgreencircle.svg" alt="">
    </div>
    <img class="card-img" src="songs/${response.foldername}/cover.jpeg" alt="img">
</div>
<div class="text ">
    <h2 class="color-white">${response.title}</h2>
    <p class="color-light-grey">${response.Description} </p>
</div>
</div>`;
    }
  });
}

async function main() {
  await display_album();
  await getSongs(currfolder);

  // Select song by album
  Array.from(document.querySelectorAll(".card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      if (play.src = "assests/pausecircle.svg") {
        play.src = "assests/palycircle.svg";
      }
      else{
        play.src = "assests/pausecircle.svg"
      }
      await getSongs(`${item.currentTarget.dataset.folder}`);
     

    });
  });

  // songbutton chanes
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "assests/pausecircle.svg";
    } else {
      currentSong.pause();
      play.src = "assests/palycircle.svg";
    }
  });
  // time update and duration
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".duration").innerHTML = `${convertSecondsToMinutes(
      currentSong.currentTime
    )}/ ${convertSecondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    if (currentSong.currentTime == currentSong.duration) {
      play.src = "assests/palycircle.svg";
    }
  });
  // seekbar control
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = `${percent}` + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  // Hamburger
  let hamburger = document
    .querySelector(".hamburger")
    .getElementsByTagName("img")[0];
  hamburger.addEventListener("click", () => {
    let left = document.querySelector(".left");
    left.style.left = "0%";
  });
  // cross
  let cross = document.querySelector(".cancle");
  cross.addEventListener("click", () => {
    let left = document.querySelector(".left");
    left.style.left = "-100%";
  });
  // volume seekabr display
  document.querySelector(".volume").addEventListener("click", () => {
    document.querySelector(".volume-seekbar").style.display = "block";
  });
  // volume seekbar display none
  document.querySelector(".volume").addEventListener("dblclick", () => {
    document.querySelector(".volume-seekbar").style.display = "none";
  });
  // volume seekbar control
  document.querySelector(".volume-seekbar").addEventListener("click", (e) => {
    let volumeperc = Math.ceil(
      (e.offsetY / e.target.getBoundingClientRect().height) * 100
    );
    document.querySelector(".volume-circle").style.top = `${volumeperc}` + "%";
    currentSong.volume = 1 - volumeperc / 100;
    let volume = document.querySelector(".volume");
  if(currentSong.volume == 0){
    
    volume.src = "assests/mutevolume.svg";
  }
  else{
    volume.src = "assests/volume.svg";
  }
  });
}
main();
