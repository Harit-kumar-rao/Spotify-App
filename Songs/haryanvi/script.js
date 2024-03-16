console.log("Let's write some javascript");

let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in the playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
        <img class="invert" src="music.svg" alt="music logo">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Harit</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img class="invert" src="play.svg" alt="">
        </div>
      </li>`
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playmusic = (track, pause = false) => {
    // let audio = new Audio("/Songs" + track)
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayalbums() {
    // currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/Songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardcontainer = document.querySelector(".cardcontainer")

    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/Songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            //get the meta data of each folder
            let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="punjabi" class="card ">
            <div class="play">
              <div>
                <svg class="playbutton" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="#000000">
                  <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            </div>
            <img src="/Songs/${folder}/cover.jpg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
          </div>`
        }
    })
    console.log(div)
}

async function main() {

    //get the list of all the songs
    await getsongs("Songs/punjabi")
    playmusic(songs[0], true);

    //display all the albums
    displayalbums();

    //attach an event listener to play , next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })

    //listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    })

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add an event listener for close left
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    })

    //add an event listener to previous 
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        // console.log(index)
        if ((index - 1) >= 0) {
            playmusic(songs[index + 1]);
        }
    })
    //add an event listener to next
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("next clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    })

    //add event listener to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to ", e.target.value, "/100");
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`Songs/${item.currentTarget.dataset.folder}`)
        })
    })
}

main()

