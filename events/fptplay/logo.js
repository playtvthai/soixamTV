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




async function start(logoJ, main) {
  try {
    const response = await fetch(`${GL_domain}json/streamLink/${logoJ}.json`);
    if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
    
    const data = await response.json();
    if (data && typeof data === 'object') {
      await checkStreamLinks(data);
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error.message);
  }
}

async function checkStreamLinks(streams) {
  const entries = Object.values(streams);
  const checks = entries.map(async stream => {
    try {
      const res = await fetch(stream.streamLink, { method: 'HEAD' });
      if (res.status === 200) {
        innerChannel(stream.streamLink, stream.name);
        console.log(`${stream.name} OK: ${stream.streamLink}`);
      } else {
        console.warn(`${stream.name} lỗi: Status ${res.status}`);
      }
    } catch (err) {
      console.error(`${stream.name} lỗi khi kiểm tra:`, err.message);
    }
  });
  
  await Promise.all(checks);
}



function innerChannel(src, name) {
  const container = document.getElementById("video-list");
  if (!container) return;
  
  const html = `
    <div class="video-card" data-src="${src}">
      <div class="thumbnail">
        <video 
          poster="https://iptv.nhadai.org/img/fpt-play.png"
          src="${src}" muted autoplay loop playsinline>
        </video>
        <div class="duration"></div>
      </div>
      <div class="title">${name}</div>
    </div>
  `;
  
  container.insertAdjacentHTML("beforeend", html);
  
  // Gán click handler
  setTimeout(() => {
    const card = container.querySelector(`.video-card[data-src="${src}"]`);
    card.addEventListener("click", () => {
      handleThumbnailPlayback(src);
      stream(src); // Gọi phát kênh chính
    });
  }, 100);
}

function handleThumbnailPlayback(activeSrc) {
  const cards = document.querySelectorAll(".video-card");

  cards.forEach(card => {
    const video = card.querySelector("video");
    const src = card.dataset.src;

    if (src === activeSrc) {
      // Dừng thumbnail, chỉ hiện poster
      video.pause();
      video.removeAttribute("src");
      video.load(); // Chuyển về poster, không phát
    } else {
      // Nếu video không có src (đang dừng trước đó) → gán lại và phát
      if (!video.getAttribute("src")) {
        video.setAttribute("src", src);
        video.load();
        video.play().catch(e => {
          console.warn("Không thể phát lại thumbnail:", e.message);
        });
      }
    }
  });
}