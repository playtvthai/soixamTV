
function start(logoJ, main) {
  fetch(`${GL_domain}json/logo/${logoJ}.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {
       //logo(data,main)
    //console.log(data)
   const name = checkStreamLinks(data, main);
  //  console.log(name)
    
  })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });
  

}
  
/////////////  
  
  
 /*

async function checkStreamLinks(logoArray, stream) {
  const streamLinkUrl = `${GL_domain}json/streamLink/${stream}.json`
    try {
        // Tải streamLink.json từ URL
        const streamLinkResponse = await fetch(streamLinkUrl).then(res => res.json());

        const validChannels = [];

        for (const item of logoArray) {
            const id = item.id;
            if (streamLinkResponse[id]) {
                const url = streamLinkResponse[id].streamLink;

                try {
                    const response = await fetch(url, { method: 'HEAD' }); // Kiểm tra request mà không tải toàn bộ dữ liệu
                    if (response.status === 200) {
                        validChannels.push(item);
                    }
                } catch (error) {
                  //  console.error(`Lỗi khi kiểm tra ${id}:`, error.message);
                }
            }
        }

        // Lưu kết quả vào biến
        window.validChannels = validChannels;
       logo(validChannels, stream) 
       // console.log("Danh sách kênh hợp lệ:", validChannels);
    } catch (error) {
       // console.error("Lỗi khi tải JSON:", error.message);
    }
    
  return validChannels
}




  
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
     </div>
    `
    );
  //console.log(squaredNumbers.join(""))
  channel.innerHTML = squaredNumbers.join("")
}
 
*/


async function start(logoJ, main) {
    try {
        const [logoResponse, streamLinkResponse] = await Promise.all([
            fetch(`${GL_domain}json/logo/${logoJ}.json`).then(res => res.json()),
            fetch(`${GL_domain}json/streamLink/${main}.json`).then(res => res.json())
        ]);

        // Kiểm tra luồng hợp lệ
        const validChannels = await checkStreamLinks(logoResponse, streamLinkResponse);

        // Hiển thị logo nếu có kênh hợp lệ
        if (validChannels.length > 0) {
            logo(validChannels, main);
        }
    } catch (error) {
       // console.error("Lỗi khi tải dữ liệu:", error.message);
    }
}

async function checkStreamLinks(logoArray, streamLinkData) {
    const validChannels = [];

    // Danh sách các request kiểm tra streamLink
    const requests = logoArray.map(async (item) => {
        const id = item.id;
        if (streamLinkData[id]) {
            const url = streamLinkData[id].streamLink;
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.status === 200) {
                    validChannels.push(item);
                }
            } catch (error) {
                // Bỏ qua lỗi request
            }
        }
    });

    // Chạy tất cả request song song
    await Promise.allSettled(requests);
    return validChannels;
}

// Hàm hiển thị logo
function logo(logoChannel, main) {
    channel.innerHTML = logoChannel.map(num =>
        `<div
            data-aos="flip-left"
            data-aos-easing="ease-out-cubic"
            data-aos-duration="2000"
            class="logo-item"
            onclick="play('${num.id}','${main}')"
        >
            <img class="logo" alt="${num.id}" 
                 src="${num.logo.includes("http") ? num.logo : `${GL_domain}wordspage/image/logo/${num.logo}`}" />
        </div>`
    ).join("");
}