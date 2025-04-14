

function play() {
  fetch(`${GL_domain}json/tournament.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      return response.json(); // Chuyển dữ liệu phản hồi thành JSON
    })
    .then(data => {
      processLeagues(layTatCaGiaiDau(data))
    })
    .catch(error => {
      console.error("Lỗi khi gọi API:", error.message);
    });
}

play()

function layTatCaGiaiDau(data) {
  // Kiểm tra xem data có phải là mảng không
  if (!Array.isArray(data)) {
    console.error("Đầu vào phải là một mảng.");
    return [];
  }

  const tatCaGiaiDau = []; // Mảng để chứa kết quả cuối cùng

  // Lặp qua từng nhóm trong mảng data
  for (const nhom of data) {
    // Kiểm tra xem nhóm có tồn tại và có thuộc tính 'ttournament' là một mảng không
    if (nhom && Array.isArray(nhom.ttournament)) {
      // Lặp qua từng giải đấu trong mảng 'ttournament' của nhóm hiện tại
      for (const giaiDau of nhom.ttournament) {
        // Tạo đối tượng mới chỉ chứa các thuộc tính mong muốn
        const giaiDauDonGian = {
          name: giaiDau.name,
          league_id: giaiDau.league_id,
          logo: giaiDau.logo
        };
        // Thêm đối tượng đã đơn giản hóa vào mảng kết quả
        tatCaGiaiDau.push(giaiDauDonGian);
      }
    }
  }

  return tatCaGiaiDau; // Trả về mảng kết quả đã được làm phẳng
}


function processLeagues(leagues) {
  leagues.forEach(({ league_id, name, logo }) => {
    channel(league_id, name, logo);
   
  });
}





const img = document.createElement("img");
img.src = video.thumbnail;
img.alt = video.name;
img.loading = "lazy"; // <- Chỉ dòng này là đủ
  






function channel(league_id, name, logo) {
  fetch(`https://tv-web.api.vinasports.com.vn/api/v2/publish/video/?league_id=${league_id}&page_num=1&page_size=24`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      return response.json(); // Chuyển dữ liệu phản hồi thành JSON
    })
    .then(data => {
     innerPoster(data.data, name)
    })
    .catch(error => {
      console.error("Lỗi khi gọi API:", error.message);
    });
  }

function innerPoster(videos, name) {
  const videoListContainer = document.getElementById("video-list");
  if (!videoListContainer) return;
  
  const section = document.createElement("section");
  section.className = "league-section";
  
  const heading = document.createElement("h2");
  heading.textContent = name;
  section.appendChild(heading);
  
  const videoRow = document.createElement("div");
  videoRow.className = "video-row";
  
  videos.forEach(video => {
    const item = document.createElement("div");
    item.className = "video-item";
    item.onclick = () => streamH(video.url);
    
    const thumbContainer = document.createElement("div");
    thumbContainer.className = "thumbnail-container";
    
    const img = document.createElement("img");
    img.src = video.thumbnail;
    img.alt = video.name;
    
    const timeSpan = document.createElement("span");
    timeSpan.className = "timestamp";
    timeSpan.textContent = formatTime(video.duration);
    
    thumbContainer.appendChild(img);
    thumbContainer.appendChild(timeSpan);
    
    const title = document.createElement("p");
    title.className = "video-title";
    title.textContent = video.name;
    
    item.appendChild(thumbContainer);
    item.appendChild(title);
    videoRow.appendChild(item);
  });
  
  section.appendChild(videoRow);
  videoListContainer.appendChild(section);
}
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const paddedHrs = String(hrs).padStart(2, '0');
    return `${paddedHrs}:${paddedMins}:${paddedSecs}`;
  } else {
    return `${paddedMins}:${paddedSecs}`;
  }
}

function streamH(videoName) { 
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


function fpt(idStream) {
  console.log(idStream)
  fetch(`${GL_domain}json/streamLink/TV_e_fptplay.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      return response.json(); // Chuyển dữ liệu phản hồi thành JSON
    })
    .then(data => {
      console.log(data[idStream])
     hls_multi(
      data[idStream].streamLink,
      typeof data[idStream].audio  !== 'undefined' ? data[idStream].audio : "",
      "myVideo",
      "myAudio"
    );
    })
    .catch(error => {
      console.error("Lỗi khi gọi API:", error.message);
    });
  
}

