
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
    })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });
  

}
  
  
const channel = document.getElementById("channel")
function logo(logoChannel, main ) {
  const squaredNumbers = logoChannel.map(num => 
    `
     <div onclick="play('${num.id}','${main}')">
     <img class="logo" alt="${num.id}"  src="${(num.logo.includes("http") ? num.logo : `${GL_domain}wordspage/image/logo/${num.logo}`)}" />
     </div>
    `
    );
  //console.log(squaredNumbers.join(""))
  channel.innerHTML = squaredNumbers.join("")
}
 

