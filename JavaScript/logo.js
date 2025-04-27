
function start(logoJ, main) {
  fetch(`${GL_domain}json/logo/${logoJ}.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {
    logo(data,main)
    console.log(data)
    })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });

}

  
const channel = document.getElementById("video-list")
function logo(logoChannel, main ) {
  const squaredNumbers = logoChannel.map(num => 
    `
     <div class="video-item"  onclick="play('${num.id}','${main}'); updateURL('${num.id}')" >
            <div class="thumbnail-container">
                <img alt="${num.id}"  src="${(num.logo.includes("http") ? num.logo : `${GL_domain}wordspage/image/logo/${num.logo}`)}">
                
            </div>
            <div class="video-title">${num.name}</div>
        </div>
        
     
     
     
     
    `
    );
  //console.log(squaredNumbers.join(""))
  channel.innerHTML = squaredNumbers.join("")
}
 



function updateURL(id) {
  const params = new URLSearchParams(window.location.search);
  params.set('channel', id);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  history.pushState(null, '', newUrl);
}

