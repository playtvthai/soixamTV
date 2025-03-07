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
    
    
  })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });  

 }
 
 
 
 
 
 ///////////
 
 
 function iframe(linkStream){
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
      
      <video src="../../wordspage/video/cho.mp4"  class="video-section" id="myVideo"  poster="../../wordspage/image/poster/TV SHOW_20250120_172203_0000.png"   loop autoplay controls
    </video>`;
  
  hls(videoSrc)
}  
  
  
  
function hls(videoSrc) {
 const  video = document.getElementById('myVideo');

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