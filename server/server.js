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

app.get("/add_media", routes.add_media);
app.get("/search_games", routes.search_games);
app.get("/search_books", routes.search_books);
app.get("/get_playlist/:playlist_id", routes.get_playlist);
app.get("/get_user_playlist/:user_id", routes.get_user_playlist);

app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
});

module.exports = app;
