async function buscarFilme() {
  const nome = document.getElementById("search").value.trim();
  if (!nome) return;

  window.location.href = `pesquisa.html?q=${encodeURIComponent(nome)}`;
}

function mostrarFilmes(filmes) {
  const div = document.getElementById("resultado");
  div.innerHTML = filmes.map(f => `
    <div class="card" style="margin-bottom:12px;">
      <h3>${f.Title} (${f.Year})</h3>
      <img src="${f.Poster !== 'N/A' ? f.Poster : ''}" width="120" alt="Poster">
      <br>
      <button onclick="buscarDetalhes('${f.imdbID}')">Ver detalhes</button>
    </div>
  `).join('');

  document.getElementById("detalhes").innerHTML = ""; 
}

async function buscarDetalhes(imdbID) {
  const resp = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=f820539f&plot=short`);
  const filme = await resp.json();
  mostrarDetalhes(filme);
}

function mostrarDetalhes(filme) {
  const div = document.getElementById("detalhes");
  if (filme.Response === "False") {
    div.innerHTML = "<p>Detalhes não disponíveis.</p>";
    return;
  }

  div.innerHTML = `
    <h2>${filme.Title} (${filme.Year})</h2>
    <img src="${filme.Poster !== 'N/A' ? filme.Poster : ''}" width="200" alt="Poster">
    <p><strong>Nota IMDb:</strong> ${filme.imdbRating}</p>
    <p><strong>Descrição:</strong> ${filme.Plot}</p>
    <p><strong>Gênero:</strong> ${filme.Genre}</p>
    <p><strong>Diretor:</strong> ${filme.Director}</p>
  `;
}

async function carregarTodosFilmes() {
  const container = document.getElementById('filmes');
  container.innerHTML = '<p>Carregando...</p>';
  try {
    const apiKey = 'f820539f';
    const firstResp = await fetch(`https://www.omdbapi.com/?s=movie&apikey=${apiKey}&type=movie&page=1`);
    const firstData = await firstResp.json();

    if (firstData.Response === 'False' || !firstData.Search) {
      container.innerHTML = '<p>Nenhum filme encontrado.</p>';
      return;
    }

    const total = parseInt(firstData.totalResults, 10) || 0;
    const pages = Math.ceil(total / 10);
    const results = [...firstData.Search];

    if (pages > 1) {
      const promises = [];
      for (let p = 2; p <= pages; p++) {
        promises.push(
          fetch(`https://www.omdbapi.com/?s=movie&apikey=${apiKey}&type=movie&page=${p}`)
            .then(r => r.json())
            .catch(() => null)
        );
      }
      const pagesData = await Promise.all(promises);
      pagesData.forEach(d => { if (d && d.Search) results.push(...d.Search); });
    }

    container.innerHTML = results.map(f => `
      <div class="col">
        <div class="card h-100">
          <img src="${f.Poster !== 'N/A' ? f.Poster : 'https://via.placeholder.com/300x450?text=Sem+Imagem'}" class="card-img-top" alt="Poster">
          <div class="card-body">
            <h5 class="card-title">${f.Title}</h5>
            <p class="card-text">${f.Year}</p>
            <button class="btn btn-primary" onclick="buscarDetalhes('${f.imdbID}')">Ver detalhes</button>
          </div>
        </div>
      </div>
    `).join('') || '<p>Nenhum filme disponível.</p>';
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Erro ao carregar filmes.</p>';
  }
}

async function carregarResultadosPesquisa() {
  const params = new URLSearchParams(window.location.search);
  const nome = params.get('q');
  
  if (!nome) {
    document.getElementById("resultado").innerHTML = "<p>Nenhuma busca realizada.</p>";
    return;
  }

  const container = document.getElementById("resultado");
  container.innerHTML = '<p>Carregando...</p>';
  
  try {
    const resposta = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(nome)}&apikey=f820539f`);
    const dados = await resposta.json();

    if (dados.Response === "False" || !dados.Search) {
      container.innerHTML = "<p>Filme não encontrado.</p>";
      return;
    }

    container.innerHTML = dados.Search.map(f => `
      <div class="col">
        <div class="card h-100">
          <img src="${f.Poster !== 'N/A' ? f.Poster : 'https://via.placeholder.com/300x450?text=Sem+Imagem'}" class="card-img-top" alt="Poster">
          <div class="card-body">
            <h5 class="card-title">${f.Title}</h5>
            <p class="card-text">${f.Year}</p>
            <button class="btn btn-primary" onclick="buscarDetalhes('${f.imdbID}')">Ver detalhes</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Erro ao carregar filmes.</p>';
  }
}