 var video = document.getElementById('myVideo');

 
const apiStream = "../json/iptv.json/";
  
function stream(videoSrc) {
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,function(){
       video.play();
            });
  } else if (
    video.canPlayType('application/vnd.apple.mpegurl')
   ) {
            // Fallback cho các trình duyệt hỗ trợ native HLS
  video.src = videoSrc;
  video.play();
  video.autoplay()
  video.muted() = False
  }
     
}  
  
        
 function play(idStream, tag) {
   fetch(`https://lmg159z.github.io/soixamTV/index.html/json/${tag}.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {
    console.log(data[idStream].streamLink);
    stream(data[idStream].streamLink)
     })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });  

 }
 
 
