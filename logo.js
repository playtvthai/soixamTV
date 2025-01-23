const url = "/xoisamTV/json/logo_G.json";

fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {
  //  console.log(data);
  //  console.log(typeof([]))
    logo(data)
   
     })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });
  
  
  
 const channel = document.getElementById("channel")
// console.log(channel)
  
function logo(logoChannel) {
  const squaredNumbers = logoChannel.map(num => 
    `
     <div
       data-aos="flip-left"
       data-aos-easing="ease-out-cubic"
       data-aos-duration="2000"
       class="logo-item"
       onclick="play('${num.id}','TVLocal')"
     >
     <img class="logo" alt="${num.id}"  src="/xoisamTV/wordspage/image/logo/${num.logo}" />
     <img class="logo_cuntry" alt="${num.id}"  src="/xoisamTV/wordspage/image/flag/${num.nation}.png" />
      </div>
    `
    );
  //console.log(squaredNumbers.join(""))
  channel.innerHTML = squaredNumbers.join("")
}
 


