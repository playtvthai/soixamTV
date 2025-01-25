/*
const url = "./json/logo_G.json";

fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {logo(data,"")})
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });
  
  
*/  
function start(logoJ, main) {
  fetch(`${GL_domain}json/logo/${logoJ}.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {logo(data,main)})
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });
  

}
  
/////////////  
  
  
  
const channel = document.getElementById("channel")
function logo(logoChannel, main ) {
  const squaredNumbers = logoChannel.map(num => 
    `
     <div
       data-aos="flip-left"
       data-aos-easing="ease-out-cubic"
       data-aos-duration="2000"
       class="logo-item"
       onclick="play('${num.id}','${main}')"
     >
     <img class="logo" alt="${num.id}"  src="${(num.logo.includes("http") ? num.logo : `${GL_domain}wordspage/image/logo/${num.logo}`)}" />
     <img class="logo_cuntry" alt="${num.id}"  src="${GL_domain}wordspage/image/flag/${num.nation}.png" />
      </div>
    `
    );
  //console.log(squaredNumbers.join(""))
  channel.innerHTML = squaredNumbers.join("")
}
 


