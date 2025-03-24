var video = document.getElementById('myVideo');

////////////////////////////

function play(idStream, tag) {
  fetch(`${GL_domain}json/streamLink/${tag}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      return response.json(); // Chuyển dữ liệu phản hồi thành JSON
    })
    .then(data => {
      if (data[idStream].style == "iframe") {
        iframe(data[idStream].streamLink)
      }
      if (data[idStream].style == "m3u8") {
        stream(data[idStream].streamLink)
      }
      if (data[idStream].style == "hls_multi") {
        hls_creat_multi(data[idStream].streamLink,data[idStream].audio )
      }
      
      
    })
    .catch(error => {
      console.error("Lỗi khi gọi API:", error.message);
    });
  
}





///////////


function iframe(linkStream) {
  const idHTML = document.getElementById("video")
  idHTML.innerHTML = `
    <iframe src="${linkStream}" 
    class="ifvideo"
    width="100%"
    allow="autoplay"  
    muted
   allowfullscreen
   ></iframe>
   `
}


///////
function stream(videoSrc) {
  const idHTML = document.getElementById("video")
  idHTML.innerHTML = `
      
      <video src="${GL_domain}wordspage/video/cho.mp4"  class="video-section" id="myVideo"  poster="${GL_domain}wordspage/image/poster/TV SHOW_20250120_172203_0000.png"   loop autoplay controls
    </video>`;
  
  hls(videoSrc)
}

function hls_creat_multi(videoSrc, audioSrc) {
  const idHTML = document.getElementById("video")
  idHTML.innerHTML = `
      
      <video src="${GL_domain}wordspage/video/cho.mp4"  class="video-section" id="myVideo"  poster="${GL_domain}wordspage/image/poster/TV SHOW_20250120_172203_0000.png"  autoplay controls>
      </video>
      <audio id="separate-audio"  autoplay muted></audio>
     `;
  console.log(audioSrc, videoSrc)
hls_multi(
      'myVideo',videoSrc,
      'separate-audio',audioSrc
    );
}


function hls(videoSrc) {
  const video = document.getElementById('myVideo');
  
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      video.play();
    });
  } else if (
    video.canPlayType('application/vnd.apple.mpegurl')
  )
  {
    video.src = videoSrc;
    video.play();
    video.autoplay = true
    video.muted = true
  }
}

/*function hls_multi(videoElementId, videoSrc, audioElementId, audioSrc) {
      const video = document.getElementById(videoElementId);
      const audio = document.getElementById(audioElementId);

      // Load video with HLS.js
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          console.log("HLS manifest parsed, playback started.");
          video.play().catch(error => console.error("Video autoplay prevented:", error));
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          console.error("HLS error:", event, data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Fatal network error, trying to recover...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Fatal media error, trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                console.error("Unrecoverable fatal error");
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(error => console.error("Video autoplay prevented (native):", error));
        });
      } else {
        console.error("HLS is not supported in this browser.");
      }

      // Load audio
      audio.src = audioSrc;
      audio.addEventListener('loadedmetadata', () => console.log("Audio loaded."));

      // Sync audio with video
      video.addEventListener('play', () => {
        audio.muted = false;
        audio.play().catch(error => console.error("Audio autoplay prevented:", error));
      });

      video.addEventListener('pause', () => audio.pause());

      video.addEventListener('timeupdate', () => {
        try {
          audio.currentTime = video.currentTime;
        } catch (e) {
          console.warn("Audio sync failed:", e);
        }
      });

      audio.addEventListener('error', (e) => console.error("Audio error:", e));
    }
*/

function hls_multi(videoElementId, videoSrc, audioElementId, audioSrc) {
    const video = document.getElementById(videoElementId);
    const audio = document.getElementById(audioElementId);

    let initialSyncDone = false;
    let learnedOffset = 0; // Estimated offset between video and audio
    let videoStartTimestamp = null; // Timestamp when video actually starts playing

    const startPlayback = () => {
        console.log("Starting playback: Audio loaded, video ready.");
        video.play().catch(error => console.error("Video play error:", error));
        audio.play().catch(error => console.error("Audio play error:", error));
        videoStartTimestamp = performance.now(); // Record the exact start time of the video

    };

    audio.src = audioSrc;
    audio.preload = "auto";
    audio.muted = true;

    audio.addEventListener('loadedmetadata', () => {
        console.log("Audio loaded metadata.");
    });

    audio.addEventListener('canplaythrough', () => {
        console.log("Audio canplaythrough.");

        if (video.readyState >= 3 && !initialSyncDone) {
            // Delay the video slightly to allow audio to catch up
            console.log("Delaying video start for initial sync...");
            setTimeout(() => {
                startPlayback();
            }, 1000); // Delay 1 second
        }
    });

    audio.addEventListener('error', (e) => console.error("Audio error:", e));

    // Load video with HLS.js
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            console.log("HLS manifest parsed.");
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            console.error("HLS error:", event, data);
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error("Fatal network error, trying to recover...");
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error("Fatal media error, trying to recover...");
                        hls.recoverMediaError();
                        break;
                    default:
                        console.error("Unrecoverable fatal error");
                        hls.destroy();
                        break;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
        video.addEventListener('loadedmetadata', () => {
        });
    } else {
        console.error("HLS is not supported in this browser.");
    }

    let audioSyncInterval = null;
    let lastVideoTime = 0;

    const syncAudio = () => {
        if (video.paused || video.seeking || audio.paused || videoStartTimestamp === null || !initialSyncDone) return;

        const videoTime = video.currentTime;
        const audioTime = audio.currentTime;

        // Calculate the *real* time elapsed since the video started playing
        const realVideoTime = (performance.now() - videoStartTimestamp) / 1000;

        // Calculate the difference between expected and actual audio time
        const diff = realVideoTime - audioTime - learnedOffset; //Include learnedOffset

        const threshold = 0.05; // Tighter threshold
        const maxCorrection = 0.02; // Limit correction to avoid artifacts

        if (Math.abs(diff) > threshold) {
            let correction = Math.max(-maxCorrection, Math.min(maxCorrection, diff));
            learnedOffset += correction * 0.1; // Slowly adjust learned offset

            //Apply learnedOffset
            audio.currentTime = realVideoTime - learnedOffset;

            console.warn(`Correcting audio time. Diff: ${diff.toFixed(3)}, Correction: ${correction.toFixed(3)}, Learned Offset: ${learnedOffset.toFixed(3)}, Video Time: ${videoTime.toFixed(3)}, Audio Time: ${audioTime.toFixed(3)}, Real Video Time: ${realVideoTime.toFixed(3)}`);
        }

        lastVideoTime = videoTime;
    };

    video.addEventListener('play', () => {
        if(!initialSyncDone){ //Force initial sync after first play
            console.log("Forcing initial sync after video play...");
             if (audio.readyState >= 3) {
                audio.muted = false;
                startPlayback();
                initialSyncDone = true; //Mark sync as done
             }
        } else{
            audio.muted = false;
            audio.play().catch(error => console.error("Audio play error on video play:", error));
        }

        lastVideoTime = video.currentTime;
        audioSyncInterval = setInterval(syncAudio, 20);
    });

    video.addEventListener('pause', () => {
        audio.pause();
        clearInterval(audioSyncInterval);
    });

    video.addEventListener('seeking', () => {
        // On seeking, reset the learned offset and re-sync
        learnedOffset = 0;
        initialSyncDone = false; //reset initialSync
        audio.currentTime = video.currentTime;
        lastVideoTime = video.currentTime;

        //Restart sync
         if (audio.readyState >= 3) {
                audio.muted = false;
                startPlayback();
                initialSyncDone = true; //Mark sync as done
             }
    });

    video.addEventListener('ended', () => {
        audio.pause();
        audio.currentTime = 0;
        clearInterval(audioSyncInterval);
    });
}