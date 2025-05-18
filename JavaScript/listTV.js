
function start() {
  fetch(`${GL_domain}json/listChannelTV.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {
  loop(data)
    })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });
  

}

start()

/*
function loop(list) {
  list.forEach(({ name, logo, stream }) => {
    
   getChannel(name, logo, stream )
  });

}

function getChannel(name, logo, stream ) {
  fetch(`${GL_domain}json/logo/${logo}.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return response.json(); // Chuyển dữ liệu phản hồi thành JSON
  })
  .then(data => {
    innerChannel(data, name, logo, stream )
  })
  .catch(error => {
    console.error("Lỗi khi gọi API:", error.message);
  });
}



function innerChannel(data, name, logo, stream ) {
  const channel = document.getElementById("video-list")
  const listChannel = data.map(c => 
    `
    <a href="${GL_domain}tivi/index.html?groupChannel=${stream}&groupLogo=${logo}&channel=${c.id}">
  <div class="video-item">
    <div class="thumbnail-container">
      <img src="${(c.logo.includes('http') ? c.logo : `${GL_domain}wordspage/image/logo/${c.logo}`)}" alt="${c.name}">
    </div>
    <div class="video-title">${c.name}</div>
  </div>
</a>
    `
    );''
   channel.innerHTML += `
        
    <div class="league-section">
        <h2>${name}</h2>
        <div class="video-row">
        ${listChannel.join("")}
        </div>
      </div>
   ` 
}



/*
<div class="league-section">
    <h2>UEFA EUROPA LEAGUE</h2>
    <div class="video-row">
      
    </div>
  </div>
*/


async function loop(list) {
  for (const { name, logo, stream } of list) {
    await getChannel(name, logo, stream);
  }
}

function getChannel(name, logo, stream) {
  return fetch(`${GL_domain}json/logo/${logo}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      innerChannel(data, name, logo, stream);
    })
    .catch(error => {
      console.error("Lỗi khi gọi API:", error.message);
    });
}

function innerChannel(data, name, logo, stream) {
  const channel = document.getElementById("video-list");
  const listChannel = data.map(c => `
    <a href="${GL_domain}tivi/index.html?groupChannel=${stream}&groupLogo=${logo}&channel=${c.id}">
      <div class="video-item">
        <div class="thumbnail-container">
          <img src="${(c.logo.includes('http') ? c.logo : `${GL_domain}wordspage/image/logo/${c.logo}`)}" alt="${c.name}">
        </div>
        <div class="video-title">${c.name}</div>
      </div>
    </a>
  `);

  channel.innerHTML += `
    <div class="league-section">
      <h2>${name}</h2>
      <div class="video-row">
        ${listChannel.join("")}
      </div>
    </div>
  `;
}