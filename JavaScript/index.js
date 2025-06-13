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
      if (data[idStream].style == "vlc") {
        onVLC(data[idStream].streamLink)
      }
      if (data[idStream].style == "key" || data[idStream].style == "key-hex" ) {
        clearkey(
          data[idStream].streamLink,
          data[idStream].key,
          data[idStream].style
          
        )
      }
      
      
    })
    .catch(error => {
      console.error("Lỗi khi gọi API:", error.message);
    });
  
}




function clearkey(url, key, style) {
  const container = document.getElementById("video");

  // Tạo lại thẻ <video>
  container.innerHTML = `
    <video id="myVideo"
           class="video-section"
           poster="${GL_domain}wordspage/image/poster/TV SHOW_20250120_172203_0000.png"
           controls autoplay loop muted playsinline>
    </video>
  `;

  let clearkeyData;

  if (style === "key") {
    clearkeyData = key;

  } else if (style === "key-hex") {
    if (!key?.keys?.length) {
      console.error("Dữ liệu key không hợp lệ:", key);
      alert("Lỗi: Key không hợp lệ.");
      return;
    }

    const item = key.keys[0];

    clearkeyData = {
      type: "temporary",
      keys: [
        {
          kty: "oct",
          k: hexToBase64(item.k),
          kid: hexToBase64(item.kid)
        }
      ]
    };

    console.log("ClearKey đã chuyển từ hex:", clearkeyData);

  } else {
    console.warn("Style không hợp lệ:", style);
    alert("Style không hợp lệ.");
    return;
  }

  playShakaStream(url, clearkeyData, "myVideo");
}


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
      <audio id="myAudio"  autoplay muted></audio>
     `;
hls_multi(
     videoSrc,
     audioSrc,
     "myVideo",
     "myAudio"
    );
}

function onVLC(url) {
      const idHTML = document.getElementById("video")
  idHTML.innerHTML = `
        <a class="video-section" tagret="_bank"  href="${url}">Click vào đây để xem</a>
        `;
}

function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function convertJWKS(jwks) {
  const result = {};
  jwks.keys.forEach(key => {
    result[base64ToBase64Url(key.kid)] = base64ToBase64Url(key.k);
  });
  return result;
}

function playShakaStream(url, jwks, id) {
  if (!shaka.Player.isBrowserSupported()) {
    alert('Trình duyệt không hỗ trợ Shaka Player!');
    return;
  }

  const video = document.getElementById(id);
  const player = new shaka.Player(video);

  const clearKeyMap = convertJWKS(jwks);

  player.configure({
    drm: {
      clearKeys: clearKeyMap
    }
  });

  player.load(url).then(() => {
    console.log('Phát thành công!');
    video.autoplay = true;
    video.muted = false;
    video.play();
  }).catch(error => {
    console.error('Lỗi phát:', error);
    alert(`Lỗi phát: ${error.code}`);
  });
  
    video.play();
    video.muted = false
    video.autoplay = true
    
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
    video.muted = false
  }
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
               /* console.log((isVideo ? "Video" : "Audio") + " manifest loaded.");*/
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
               /* console.log((isVideo ? "Video" : "Audio") + " loaded natively.");*/
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

function hexToBase64(hexString) {
  // Loại bỏ dấu cách và chữ hoa/thường nếu cần
  hexString = hexString.replace(/\s+/g, '').toLowerCase();

  // Chuyển hex thành một mảng byte
  const byteArray = [];
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substr(i, 2), 16));
  }

  // Tạo chuỗi nhị phân từ mảng byte
  const binaryString = String.fromCharCode(...byteArray);

  // Mã hóa base64
  return btoa(binaryString);
}