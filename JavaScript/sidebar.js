const menu = document.getElementById("menu")


const menuJson = "../json/sidebar.json";

fetch(menuJson)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {
   console.log(data);
   const menuHTML = data.map(num => 
    ` 
    <a data-aos="fade-up"
     data-aos-duration="1000" 
     href="${num.url}"><i><i class="${num.icon}"></i></i>${num.title}</a>
    `
    );
  //console.log(menuHTML.join(""))
  menu.innerHTML =`
                  
                 <div class="menu">
                  ${menuHTML.join("")}
                </div> `
  //  console.log(typeof([]))
  
   
     })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });



/*

   <div class="menu">
     <a data-aos="fade-up"
     data-aos-duration="1000" 
     href="#"><i><i class="fa-solid fa-house"></i></i> Home</a>
  </div>


*/



document.getElementById('menuIcon').addEventListener('click', function () {
    const menu = document.getElementById('menu');
    const icon = this.querySelector('i');

    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-close');
    } else {
        menu.style.display = 'none';
        icon.classList.remove('fa-close');
        icon.classList.add('fa-bars');
    }
});