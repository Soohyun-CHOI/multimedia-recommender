const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");

const app = express();
app.use(
    cors({
        origin: "*",
    })
);

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get("/random_shows/:num/:selected_mood", routes.random_shows);
app.get("/random_books/:num/:selected_mood", routes.random_books);
app.get("/random_games/:num/:selected_mood", routes.random_games);
app.get("/random_movies/:num/:selected_mood", routes.random_movies);
app.get("/random_songs/:num/:selected_mood", routes.random_songs);
app.get("/random_all/:num/:selected_mood", routes.random_all);
app.get("/ordered_suggestion", routes.ordered_suggestion);
app.get("/additional_media", routes.additional_media);
app.get("/games", routes.games);
app.get("/books", routes.books);
app.get("/playlist/:playlist_id", routes.playlist);
app.get("/user_playlist/:user_id", routes.user_playlist);
app.get("/suggested_media", routes.suggested_media);
app.get("/shows", routes.shows);
app.get("/movies", routes.movies);
app.get("/songs", routes.songs);

app.listen(config.server_port, () => {
    console.log(
        `Server running at http://${config.server_host}:${config.server_port}/`
    );
});

module.exports = app;
