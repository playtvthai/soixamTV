
/*
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
        innerChannel(stream.streamLink, stream.name , stream.id);
        console.log(`${stream.name} OK: ${stream.streamLink}`);
      } else {
        console.warn(`${stream.name} lỗi: Status ${response.status}`);
      }
    } catch (error) {
      console.error(`${stream.name} lỗi khi kiểm tra:`, error.message);
    }
  }
}

function innerChannel(src, name, id) {
  console.log(name, src, id)
  const videoListContainer = document.getElementById("video-list");
  if (!videoListContainer) return;

  const html = `
    <a class="video-card" href="./channel/index.html?channel=${id}" >
      <div class="thumbnail">
        <video poster="https://iptv.nhadai.org/img/fpt-play.png" src="${src}" muted autoplay loop playsinline></video>
      </div>
      <div class="title">${name}</div>
    </a>
  `;

  videoListContainer.insertAdjacentHTML("beforeend", html);
}

*/

async function start(logoJ, main) {
  try {
    const response = await fetch(`${GL_domain}json/streamLink/${logoJ}.json`);
    if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

    const data = await response.json();
    await checkStreamLinksParallel(data);
  } catch (error) {
    console.error("Lỗi khi gọi API:", error.message);
  }
}

async function checkStreamLinksParallel(streams) {
  const entries = Object.values(streams);

  const tasks = entries.map(async ({ streamLink, name, id }) => {
    try {
      const response = await fetch(streamLink, { method: 'HEAD' });
      if (response.ok) {
        innerChannel(streamLink, name, id);
        console.log(`${name} OK: ${streamLink}`);
      } else {
        console.warn(`${name} lỗi: Status ${response.status}`);
      }
    } catch (error) {
      console.error(`${name} lỗi khi kiểm tra:`, error.message);
    }
  });

  await Promise.allSettled(tasks); // Đợi tất cả hoàn tất (kể cả lỗi)
}

function innerChannel(src, name, id) {
  const videoListContainer = document.getElementById("video-list");
  if (!videoListContainer) return;

  videoListContainer.insertAdjacentHTML("beforeend", `
    <a class="video-card" href="./channel/index.html?channel=${id}">
      <div class="thumbnail">
        <video poster="https://iptv.nhadai.org/img/fpt-play.png" src="${src}" muted autoplay loop playsinline></video>
      </div>
      <div class="title">${name}</div>
    </a>
  `);
}