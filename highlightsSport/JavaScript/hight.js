
function play() {
  fetch(`${GL_domain}json/tournament.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      return response.json(); // Chuyển dữ liệu phản hồi thành JSON
    })
    .then(data => {
     console.log(generateGolfHTML(data))
    })
    .catch(error => {
      console.error("Lỗi khi gọi API:", error.message);
    });
  }

play()


function generateGolfHTML(data) {
    const list = data.map(group => {
        return `
        <div class="category">
            <h2>${group.nameGroup}</h2>
            <div class="icon-grid">
                ${group.ttournament.map(tournament => `
                    <a href="${GL_domain}highlightsSport/highlights/index.html?data=${tournament.league_id}">
                        <div class="icon">
                            <img src="${tournament.logo}" alt="Golf">
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
        `;
    }).join('');
    
    const container = document.getElementById("container") 
    container.innerHTML = list
}

