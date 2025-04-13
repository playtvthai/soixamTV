/*
async function start(logoJ, main) {
    try {
        const [logoResponse, streamLinkResponse] = await Promise.all([
            fetch(`${GL_domain}json/logo/${logoJ}.json`).then(res => res.json()),
            fetch(`${GL_domain}json/streamLink/${main}.json`).then(res => res.json())
        ]);

        const validChannels = await checkStreamLinks(logoResponse, streamLinkResponse);

        if (validChannels.length > 0) {
            logo(validChannels, main);
        }
    } catch (error) {
        // console.warn("Lỗi tải dữ liệu:", error.message);
    }
}

// Hàm fetch với timeout
function fetchWithTimeout(url, options = {}, timeout = 5000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeout)
        )
    ]);
}

async function checkStreamLinks(logoArray, streamLinkData) {
    const batchSize = 10;
    const validChannels = [];

    for (let i = 0; i < logoArray.length; i += batchSize) {
        const batch = logoArray.slice(i, i + batchSize);

        const results = await Promise.allSettled(
            batch.map(async (item) => {
                const streamInfo = streamLinkData[item.id];
                if (streamInfo && streamInfo.streamLink) {
                    try {
                        const response = await fetchWithTimeout(streamInfo.streamLink, { method: 'HEAD' }, 5000);
                        if (response.ok) {
                            return item;
                        }
                    } catch (e) {
                        // Bỏ qua lỗi (timeout, network...)
                    }
                }
                return null;
            })
        );

        for (const res of results) {
            if (res.status === "fulfilled" && res.value) {
                validChannels.push(res.value);
            }
        }
    }

    return validChannels;
}

// Hiển thị logo
function logo(logoChannel, main) {
    const channel = document.getElementById("channel");
    if (!channel) return;

    channel.innerHTML = logoChannel.map(num => `
        <div
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

*/




function start(logoJ, main) {
  fetch(`${GL_domain}json/streamLink/${logoJ}.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {
       //logo(data,main)
    //console.log(data)
   const name = checkStreamLinks(data);
  //  console.log(name)
    
  })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });
  
}
  
  
async function checkStreamLinks(streams) {
  for (const key in streams) {
    const stream = streams[key];
    try {
      const response = await fetch(stream.streamLink, { method: 'HEAD' });
      if (response.status === 200) {
        innerChannel(stream.streamLink, stream.name);
        console.log(`${stream.name} OK: ${stream.streamLink}`);
      } else {
        console.warn(`${stream.name} lỗi: Status ${response.status}`);
      }
    } catch (error) {
      console.error(`${stream.name} lỗi khi kiểm tra:`, error.message);
    }
  }
}

function innerChannel(src, name) {
  const videoListContainer = document.getElementById("video-list");
  if (!videoListContainer) return;

  const html = `
    <div class="video-card" onclick="stream('${src}')">
      <div class="thumbnail">
        <video poster="https://iptv.nhadai.org/img/fpt-play.png" src="${src}" muted autoplay loop playsinline></video>
        <div class="duration"></div>
      </div>
      <div class="title">${name}</div>
    </div>
  `;

  videoListContainer.insertAdjacentHTML("beforeend", html);
}

