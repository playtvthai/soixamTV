function play(league_id) {
  fetch(`https://tv-web.api.vinasports.com.vn/api/v2/publish/video/?league_id=${league_id}&page_num=1`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      return response.json(); // Chuyển dữ liệu phản hồi thành JSON
    })
    .then(data => {
     innerPoster(data.data)
    })
    .catch(error => {
      console.error("Lỗi khi gọi API:", error.message);
    });
  }



function innerPoster(videos) {
  const videoListContainer = document.getElementById("video-list");
  if (!videoListContainer) return;
  
  videoListContainer.innerHTML = videos.map(video => `
    <div class="video-card" onclick="stream('${video.url}')">
        <img src="${video.thumbnail}" alt="${video.name}">
        <div class="video-title">${video.name}</div>
        <div class="video-duration">${video.duration}</div>
    </div>
`).join('');
  
}

function stream(videoName) { 
 console.log(videoName)
 const video = `https://livevlive.vtvcab.vn/hls/vod/newonsports/DISTRIBUTE/${videoName}/sc-gaFEAQ/v2_index.m3u8`
 const audio = `https://livevlive.vtvcab.vn/hls/vod/newonsports/DISTRIBUTE/${videoName}/sc-gaFEAQ/a0_index.m3u8`
 hls_multi(
  video,
  audio,
  "myVideo",
  "myAudio"
);
}

function hls_multi(videoSrc, audioSrc, idV, idA, tolerance = 0.1, syncTime = 2000) { // syncTime is now a parameter
    const videoPlayer = document.getElementById(idV);
    const audioPlayer = document.getElementById(idA);

    let videoHls = null;
    let audioHls = null;
    let videoManifestLoaded = false;
    let audioManifestLoaded = false;
    let syncInterval;

    function loadHlsStream(player, src, isVideo) {
        if (Hls.isSupported()) {
            const hls = new Hls();

            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                console.log((isVideo ? "Video" : "Audio") + " manifest loaded.");
                if (isVideo) {
                    videoManifestLoaded = true;
                } else {
                    audioManifestLoaded = true;
                }

                if (videoManifestLoaded && audioManifestLoaded) {
                    // Cả hai luồng đã tải, tiến hành đồng bộ hóa và phát
                    console.log("Both manifests loaded, starting sync process.");
                    startSyncProcess();
                } else {
                  player.muted = true;
                }
            });

            hls.on(Hls.Events.ERROR, function(event, data) {
                const errorType = data.type;
                const errorDetails = data.details;
                const errorMessage = `HLS error: ${errorType} - ${errorDetails}`;
                console.error(errorMessage, data);
            });

            hls.loadSource(src);
            hls.attachMedia(player);
            return hls;

        } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = src;
            player.addEventListener('loadedmetadata', function() {
                console.log((isVideo ? "Video" : "Audio") + " loaded natively.");
                if (isVideo) {
                    videoManifestLoaded = true;
                } else {
                    audioManifestLoaded = true;
                }
                if (videoManifestLoaded && audioManifestLoaded) {
                    console.log("Both manifests loaded, starting sync process.");
                    startSyncProcess();
                } else {
                  player.muted = true;
                }
            });
        } else {
            console.error("HLS is not supported on this browser.");
        }
        return null;
    }

    function startSyncProcess() {
        // Start synchronizing
        videoPlayer.muted = true;
        audioPlayer.muted = true;
        videoPlayer.play(); // Starts playback muted
        syncInterval = setInterval(synchronizeStreams, 50); // Sync more frequently at start

        // After a certain time, enable audio
        setTimeout(() => {
            console.log("Sync process finished, enabling audio.");
            clearInterval(syncInterval); // Stop frequent syncing
            videoPlayer.muted = false;
            audioPlayer.muted = false;
            setInterval(synchronizeStreams, 100); // Normal sync frequency
        }, syncTime);
    }



    videoHls = loadHlsStream(videoPlayer, videoSrc, true);
    audioHls = loadHlsStream(audioPlayer, audioSrc, false);

    function synchronizeStreams() {
        const videoTime = videoPlayer.currentTime;
        const audioTime = audioPlayer.currentTime;

        const diff = videoTime - audioTime;

        if (Math.abs(diff) > tolerance) {
            if (diff > tolerance) {
                audioPlayer.currentTime = videoTime;
            } else {
                videoPlayer.currentTime = audioTime;
            }
        }
    }

    videoPlayer.addEventListener('play', function() {
        audioPlayer.play();
       // videoPlayer.muted = false;  // Removed from here. Muting handled in startSyncProcess
       // audioPlayer.muted = false; // Removed from here. Muting handled in startSyncProcess
      //  setInterval(synchronizeStreams, 100); // Removed because syncing starts in startSyncProcess
    });

    videoPlayer.addEventListener('pause', function() {
        audioPlayer.pause();
    });

    videoPlayer.addEventListener('seeking', function() {
        audioPlayer.currentTime = videoPlayer.currentTime;
    });

}