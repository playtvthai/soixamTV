function play(league_id) {
  fetch(`https://tv-web.api.vinasports.com.vn/api/v2/publish/see-more/events/2/?page_num=1&page_size=24`)
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

play()

function innerPoster(videos) {
  const videoListContainer = document.getElementById("container");
  if (!videoListContainer) return;
  
  videoListContainer.innerHTML = videos.map(video => {
    const displayTime = time(video.start_time, true); // giả định trả về "hh:mm - dd/mm/yyyy"
    const canWatch = isPastTime(displayTime) ? video.url : "";
    
    return `
      <div  
        class="event-card"
        data-aos="flip-left"
        data-aos-easing="ease-out-cubic"
        data-aos-duration="2000"
        onclick="stream('${canWatch}', '${displayTime}', '${video.status}', '${video.channel_id}')"
      >
        <span
          style="display: ${video.status === "live" ? "block" : "none"}"
          class="live-badge">
          ${video.status === "live" ? "Trực tiếp" : ""}
        </span>
        <img src="${video.thumbnail}" alt="${video.name}">
        <div class="event-info">
          <div class="event-title">${video.name}</div>
          <div class="event-time">Phát sóng: ${time(video.start_time, false)}</div>
          <div class="event-time">${video.league_name}</div>
        </div>
      </div>
    `;
  }).join('');
}





function stream(videoName, time, status, channel_id) { 
  console.log(status)
  
  if (status == "live"){
     if(videoName != ""){
       console.log(videoName.split('/')[4].replace(/^OS_/, ''))
       const video = `https://livecdn.onsports.vn/onplus/${videoName.split('/')[4].replace(/^OS_/, '')}/sc-gaFEAw/v2_index.m3u8`
       const audio = `https://livecdn.onsports.vn/onplus/${videoName.split('/')[4].replace(/^OS_/, '')}/sc-gaFEAw/a0_index.m3u8`
       hls_multi(
        video,
        audio,
        "myVideo",
        "myAudio"
      );} else {
       alert("Không có tín hiệu phát sóng, hãy thử kiểm tra bên trang SCTV hoạt KPLUS") 
       const channelMap = {
            "a595913f-5b14-42ef-9958-74defe1f14ad": "SCTV17",
            "eddd7b89-1a5e-44ca-98f3-d6aa993e0bf9": "SCTV15HD",
            "e5f6db4e-882a-45c8-8d66-139943dd6605": "HTV_THETHAO",
            "2cb268c1-4c82-4079-bb8b-3020808d82a3": "CINE_7777",
            "754d1bba-ecf5-42db-b9e1-21c01b29024d": "ACTION_7777"
          };
         const video = `https://livecdn.onsports.vn/onplus/${channelMap.channel_id}/sc-gaFEAw/v2_index.m3u8`
         const audio = `https://livecdn.onsports.vn/onplus/${channelMap.channel_id}/sc-gaFEAw/a0_index.m3u8`
         hls_multi(
           video,
           audio,
           "myVideo",
           "myAudio"
         )
          
      }
  } else {
    alert(`Chưa tới giờ phát sóng, vui lòng quay lại vào ${time}`)
  }
}



function time(data,out) {
  const utcTime = data

// Tạo đối tượng Date từ chuỗi UTC
const date = new Date(utcTime);

// Chuyển sang giờ địa phương
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const day = date.getDate().toString().padStart(2, '0');
const month = (date.getMonth() + 1).toString().padStart(2, '0');
const year = date.getFullYear();

const full = `${hours}:${minutes} - ${day}/${month}/${year}`;
const lack = `${hours}:${minutes} - ${day}/${month}`;
return out  ? full : lack
}



function isPastTime(input) {
  // Tách thời gian và ngày
  const [timePart, datePart] = input.split(" - ");
  const [hour, minute] = timePart.split(":").map(Number);
  const [day, month, year] = datePart.split("/").map(Number);

  // Tạo đối tượng Date từ input
  const inputDate = new Date(year, month - 1, day, hour, minute);

  // Lấy thời gian hiện tại
  const now = new Date();

  return inputDate < now;
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