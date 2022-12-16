const clientId = `cb8271cbf8f24bf7a048c40b18473b95`;
const clientSecret = `548f8175990b454f8b81a1db6ddf9a53`;

const getToken = async () => {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
  });

  const data = await result.json();
  return data.access_token;
};

const getGenres = async (token) => {
  const result = await fetch(
    `https://api.spotify.com/v1/browse/categories?locale=sv_US`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    }
  );

  const data = await result.json();
  return data.categories.items;
};

const getPlaylistByGenre = async (token, genreId) => {
  const limit = 10;

  const result = await fetch(
    `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    }
  );

  const data = await result.json();
  return data.items;
};

const loadGenres = async () => {
  const token = await getToken();
  const genres = await getGenres(token);
  const list = document.getElementById(`genres`);
  genres.map(async ({ name, icons: [icon], id }) => {
    const playlists = await getPlaylistByGenre(token, id);
    //console.log(playlists);

    if (playlists.length) {
      const playlistsList = Promise.all(
        playlists.map(
          async ({
            name,
            external_urls: { spotify },
            images: [image],
            tracks,
          }) => {
            const tracksInPlaylists = await getTracks(token, tracks.href);
            console.log(tracksInPlaylists);

            if (tracksInPlaylists.length) {
              tracksInPlaylistsList = tracksInPlaylists
                .map(({ track }) => {
                  const artist = track.artists.map(({ name }) => name);
                  return `
                  <li><a href="${track.external_urls.spotify}"> ${track.name}<br>Artist(s): ${artist}<br>Album: ${track.album.name}<br>Popularity: ${track.popularity}</li><br>`;
                })
                .join("");
            }
            return `
              <li><a href="${spotify}"><img src="${image.url}" width="180" height="180" alt="${name}"/><ol id=tracks>${tracksInPlaylistsList}</ol></li>`;
          }
        )
      )
        .then((playlistsList) => playlistsList.join(""))
        .then((playlistsList) => {
          const html = `
            <article class="genre-card">
            <div class="main-image">
              <img class = "cat-img" src="${icon.url}" alt="${name}"/>
              </div>
              <div class="list">
                <h2>${name}</h2>
                <ol>
                  ${playlistsList}
                </ol>
              </div>
            </article>`;

      list.insertAdjacentHTML("beforeend", html);
    });
  }
});
};

loadGenres();