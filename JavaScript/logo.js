const url = "../json/logo.json";

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
       onclick="play('${num.id}')"
     >
       <img class="logo" alt="${num.id}"  src="./wordspage/image/logo/${num.logo}" /> <br />
       
       <img class="logo_cuntry" alt="${num.id}"  src="./wordspage/image/logo/${num.logo}" />
      </div>
    `
    );
  //console.log(squaredNumbers.join(""))
  channel.innerHTML = squaredNumbers.join("")
}
 


