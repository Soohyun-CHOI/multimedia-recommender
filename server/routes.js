const mysql = require("mysql");
const config = require("./config.json");
const { query } = require("express");

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
});
connection.connect((err) => err && console.log(err));

// NEW ROUTES:

// Route 0: GET /media
// About: Gets a media based on media_id
const media = async function (req, res) {
  const media_id = req.query.media_id;
  const type = media_id.substring(0, 2);
  let query = "";

  if (type == "bk") {
    query = `
        SELECT media_type, title, authors, publisher, published_date, description, image, categories 
        FROM Books_Combined WHERE media_id = '${media_id}';
    `;
  } else if (type == "mv") {
    query = `
        SELECT media_type, title, release_date, overview, image, cast, genres
        FROM Movie_Combined WHERE media_id = '${media_id}';
    `;
  } else if (type == "mu") {
    query = `
        SELECT media_type, title, tag, artist, lyrics, image, year, views
        FROM Music_Combined WHERE media_id = '${media_id}';
    `;
  } else if (type == "tv") {
    query = `
        SELECT media_type, title, release_year, runtime, rating, synopsis, image, cast, genres
        FROM TVShows_Combined WHERE media_id = '${media_id}';
    `;
  } else {
    query = `
        SELECT media_type, title, release_date, developers, about_the_game, price, image, metacritic_score, categories, genres
        FROM Game_Combined WHERE media_id = '${media_id}';
    `;
  }

  // image, title, creator, media_type, description
  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json();
    } else {
      // Here, we return results of the query
      res.json(data);
    }
  });
};

// Route A: POST /new_media
// About: Adds a new media item to the playlist
const new_media = async function (req, res) {
  const playlist_id = req.body.playlist_id;
  const media_id = req.body.media_id;

  connection.query(
    `
     INSERT INTO PlaylistMedia VALUES(${playlist_id}, '${media_id}');
      `
  ),
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to add new media to playlist" });
      } else {
        console.log("New media added successfully!");
      }
    };

  //Updates the max_mood of the given playlist
  connection.query(
    `
    UPDATE Playlist Set max_mood = (
      WITH scores AS (SELECT playlist_id, SUM(christmas) AS christmas, SUM(halloween) AS halloween, SUM(valentine) AS valentine,
                      SUM(celebration) AS celebration, SUM(relaxing) AS relaxing, SUM(nature) AS nature, SUM(industrial) AS industrial,
                      SUM(sunshine) AS sunshine, SUM(sad) AS sad, SUM(happy) AS happy, SUM(summer) AS summer, SUM(winter) AS winter,
                      SUM(sports) AS sports, SUM(playful) AS playful, SUM(energetic) AS energetic, SUM(scary) AS scary, SUM(anger) AS anger,
                      SUM(optimistic) AS optimistic, SUM(adventurous) AS adventurous, SUM(learning) AS learning, SUM(artistic) AS artistic,
                      SUM(science) AS science, SUM(cozy) AS cozy, SUM(colorful) AS colorful, SUM(space) AS space
              FROM PlaylistMedia p
              JOIN MediaMoods m ON p.media_id = m.media_id
              WHERE p.playlist_id = ${playlist_id}
              GROUP BY playlist_id)
      SELECT CASE
          WHEN christmas = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "christmas"
          WHEN halloween = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "halloween"
          WHEN valentine = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "valentine"
          WHEN celebration = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "celebration"
          WHEN relaxing = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "relaxing"
          WHEN nature = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "nature"
          WHEN industrial = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "industrial"
          WHEN sunshine = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "sunshine"
          WHEN sad = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "sad"
          WHEN happy = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "happy"
          WHEN summer = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "summer"
          WHEN winter = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "winter"
          WHEN sports = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "sports"
          WHEN playful = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "playful"
          WHEN energetic = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "energetic"
          WHEN scary = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "scary"
          WHEN anger = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "anger"
          WHEN optimistic = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "optimistic"
          WHEN adventurous = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "adventurous"
          WHEN learning = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "learning"
          WHEN artistic = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "artistic"
          WHEN science = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "science"
          WHEN cozy = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "cozy"
          WHEN colorful = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "colorful"
          WHEN space = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "space"
          ELSE "None"
      END AS max_mood
      FROM scores)
      WHERE playlist_id = ${playlist_id};
      `,
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to add new media to playlist" });
      } else {
        console.log("max_mood updated!");
        res.json({ message: "New media added successfully!" });
      }
    }
  );
};

// Route B: POST /new_playlist
// About: Adds a new playlist to the user's playlist
// Request input: user_id, playlist_name, public, image_URL
// Request body should be: 'application/x-www-form-urlencoded'
const new_playlist = async function (req, res) {
  const user_id = req.body.user_id;
  const playlist_name = req.body.playlist_name;
  const public = req.body.public;
  const image_URL = req.body.image_URL ?? "N/A";
  // const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  // let playlist_id = 0;

  // Get max playlist_id and add 1 to get the new playlist_id
  // const first_query = `SELECT MAX(playlist_id) AS max_id FROM Playlist;`;
  // await connection.query(first_query, (err, data) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     playlist_id = data[0].max_id + 1;
  //     console.log(playlist_id);
  //   }
  // });

  connection.query(
    `
      INSERT INTO Playlist (title, public, user_id, image, max_mood) VALUES('${playlist_name}', ${public}, '${user_id}', '${image_URL}', 'None');
      `,
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create playlist" });
      } else {
        console.log("New playlist added successfully!");
        res.json({ message: "New playlist added successfully!" });
      }
    }
  );
};

// Route C: POST /new_collaborator
// About: Adds a new collaborator to the playlist
// Input: playlist_id, collaborator_id
const new_collaborator = async function (req, res) {
  const playlist_id = req.body.playlist_id;
  const collaborator_id = req.body.collaborator_id;

  connection.query(
    `
     INSERT INTO CollaboratesOn VALUES(${collaborator_id}, ${playlist_id});
      `,
    (err) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "Failed to add collaborator to playlist" });
      } else {
        console.log("Collaborator added successfully!");
        res.json({ message: "Collaborator added successfully!" });
      }
    }
  );
};

// Route C2: POST /new_user
// About: Adds a new user
// Input: email
const new_user = async function (req, res) {
  const email = req.body.email;

  connection.query(
    `
     INSERT INTO Users VALUES('${email}');
      `,
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to add new user" });
      } else {
        console.log("User added successfully!");
        res.json({ message: "User added successfully!" });
      }
    }
  );
};

// Route D: POST /user_playlist_search
// About: Search playlist by name for the user
// Input: user_id, search
// Return: playlist_id, image, title, creator, timestamp, public, collab
const user_playlist_search = async function (req, res) {
  const user_id = req.query.user_id ?? 0;
  const search = req.query.search ?? "";

  connection.query(
    `
    WITH personal_playlists AS (
      SELECT playlist_id, image, title, timestamp, public
      FROM Playlist p
      LEFT JOIN Users u ON p.user_id = u.user_id
      WHERE p.user_id = '${user_id}'
    ), my_collabs AS (
      SELECT playlist_id
      FROM CollaboratesOn c
      WHERE user_id = '${user_id}'
    ), collab_playlists AS (
      SELECT p.playlist_id, image, title, timestamp, public
      FROM my_collabs m
      LEFT JOIN Playlist p ON p.playlist_id = m.playlist_id
      LEFT JOIN Users u ON p.user_id = u.user_id
      WHERE p.playlist_id NOT IN (SELECT playlist_id FROM personal_playlists) 
    )
    SELECT playlist_id, image, title, timestamp, public, collab
    FROM (
      SELECT playlist_id, image, title, timestamp, public, 0 AS collab
      FROM personal_playlists
      UNION
      SELECT playlist_id, image, title, timestamp, public, 1 AS collab
      FROM collab_playlists
    ) AS subquery
    WHERE title LIKE '%${search}%'
    ORDER BY subquery.timestamp DESC
    `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route E: POST /all_playlist_search
// About: Search across all playlist by name
// Input: search
// Return: playlist_id, image, title, creator, timestamp, public
const all_playlist_search = async function (req, res) {
  const search = req.query.search ?? "";

  connection.query(
    `
    SELECT playlist_id, image, title, timestamp, public
    FROM Playlist
    LEFT JOIN Users ON Playlist.user_id = Users.user_id
    WHERE title LIKE '%${search}%' AND public = 1
    ORDER BY timestamp DESC
    `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route F: Remove playlist
const delete_playlist = async function (req, res) {
  const playlist_id = req.body.playlist_id;

  connection.query(
    `
     DELETE FROM Playlist WHERE playlist_id = ${playlist_id};
      `,
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete playlist" });
      } else {
        console.log("Playlist deleted successfully!");
        res.json({ message: "Playlist deleted successfully!" });
      }
    }
  );
};

// Route G: Remove collaborator
const delete_collaborator = async function (req, res) {
  const playlist_id = req.body.playlist_id;
  const user_id = req.body.user_id;

  connection.query(
    `
     DELETE FROM CollabortesOn WHERE playlist_id = ${playlist_id} AND user_id = '${user_id}';
      `,
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete collaborator" });
      } else {
        console.log("Collaborator deleted successfully!");
        res.json({ message: "Collaborator deleted successfully!" });
      }
    }
  );
};

// Route H: Remove media from playlist
const delete_media = async function (req, res) {
  const playlist_id = req.body.playlist_id;
  const media_id = req.body.media_id;

  connection.query(
    `
     DELETE FROM PlaylistMedia WHERE playlist_id = ${playlist_id} AND media_id = '${media_id}';
      `,
    (err) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "Failed to delete media from playlist." });
      } else {
        console.log("Media deleted successfully!");
      }
    }
  );

  //Updates the max_mood of the given playlist
  connection.query(
    `
    UPDATE Playlist Set max_mood = (
      WITH scores AS (SELECT playlist_id, SUM(christmas) AS christmas, SUM(halloween) AS halloween, SUM(valentine) AS valentine,
                      SUM(celebration) AS celebration, SUM(relaxing) AS relaxing, SUM(nature) AS nature, SUM(industrial) AS industrial,
                      SUM(sunshine) AS sunshine, SUM(sad) AS sad, SUM(happy) AS happy, SUM(summer) AS summer, SUM(winter) AS winter,
                      SUM(sports) AS sports, SUM(playful) AS playful, SUM(energetic) AS energetic, SUM(scary) AS scary, SUM(anger) AS anger,
                      SUM(optimistic) AS optimistic, SUM(adventurous) AS adventurous, SUM(learning) AS learning, SUM(artistic) AS artistic,
                      SUM(science) AS science, SUM(cozy) AS cozy, SUM(colorful) AS colorful, SUM(space) AS space
              FROM PlaylistMedia p
              JOIN MediaMoods m ON p.media_id = m.media_id
              WHERE p.playlist_id = ${playlist_id}
              GROUP BY playlist_id)
      SELECT CASE
          WHEN christmas = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "christmas"
          WHEN halloween = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "halloween"
          WHEN valentine = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "valentine"
          WHEN celebration = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "celebration"
          WHEN relaxing = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "relaxing"
          WHEN nature = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "nature"
          WHEN industrial = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "industrial"
          WHEN sunshine = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "sunshine"
          WHEN sad = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "sad"
          WHEN happy = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "happy"
          WHEN summer = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "summer"
          WHEN winter = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "winter"
          WHEN sports = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "sports"
          WHEN playful = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "playful"
          WHEN energetic = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "energetic"
          WHEN scary = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "scary"
          WHEN anger = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "anger"
          WHEN optimistic = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "optimistic"
          WHEN adventurous = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "adventurous"
          WHEN learning = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "learning"
          WHEN artistic = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "artistic"
          WHEN science = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "science"
          WHEN cozy = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "cozy"
          WHEN colorful = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "colorful"
          WHEN space = GREATEST(christmas, halloween, valentine, celebration, relaxing, nature, industrial, sunshine, sad,
                                    happy, summer, winter, sports, playful, energetic, scary, anger, optimistic, adventurous,
                                    learning, artistic, science, cozy, colorful, space) THEN "space"
          ELSE "None"
      END AS max_mood
      FROM scores)
      WHERE playlist_id = ${playlist_id};
      `,
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update max_mood" });
      } else {
        console.log("Playlist max_mood updated successfully!");
      }
    }
  );

  //IF we removed all data from a playlist, we will get a null value, so we handle that.
  connection.query(
    `
    UPDATE Playlist Set max_mood = IFNULL(max_mood, "None") WHERE playlist_id = ${playlist_id};
      `,
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to handle null max_mood" });
      } else {
        console.log("Handled null max_mood");
        res.json({ message: "Media deleted successfully!" });
      }
    }
  );
};

// Route 1: GET /additional_media/ (ALLY)
// About: Adds 5 additional media items of specified type to the suggested_media table
// Input param: media type
// Return: media_id, media_type, title, creator, image
let pool_size = 50;
const additional_media = async function (req, res) {
  let type = req.query.type ?? "";
  pool_size = pool_size + 5; // increment pool size by 5 every time we add media

  connection.query(`
    CREATE TEMPORARY TABLE IF NOT EXISTS suggested_ids (media_id VARCHAR(100));
  `);

  connection.query(
    `
    REPLACE INTO suggested_ids (media_id)
    SELECT media_id
    FROM suggested_media;
    `
  );

  connection.query(`
    INSERT INTO suggested_media
    SELECT s.media_id,
      COALESCE (book_table.media_type, music_table.media_type, game_table.media_type, movie_table.media_type, show_table.media_type) AS media_type,
      COALESCE (book_table.image, music_table.image, game_table.image, show_table.image) AS image,
      COALESCE (book_table.title, music_table.title, game_table.title, movie_table.title, show_table.series_title) AS title,
      COALESCE (book_table.creator, music_table.creator, game_table.creator) AS creator
    FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY media_type ORDER BY RAND()) AS row_num2
      FROM all_media
      WHERE row_num <= ${pool_size}
      AND media_id NOT IN (SELECT media_id FROM suggested_ids)
    ) AS s
    LEFT JOIN (
      SELECT media_id, media_type, image, title, authors AS creator
      FROM Books_Combined) book_table ON s.media_id = book_table.media_id
    LEFT JOIN (
        SELECT song_id, 'mu' as media_type, image, title, artist AS creator
        FROM Music) music_table ON s.media_id = music_table.song_id
    LEFT JOIN (
        SELECT app_id, 'gm' as media_type, screenshot AS image, name AS title, developers AS creator
        FROM Games) game_table ON s.media_id = game_table.app_id
    LEFT JOIN (
        SELECT movie_id, 'mv' as media_type, title, image
        FROM Movie) movie_table ON s.media_id = movie_table.movie_id
    LEFT JOIN (
        SELECT show_id, 'tv' as media_type, image, series_title
        FROM TVShows) show_table ON s.media_id = show_table.show_id
    WHERE row_num2 <= 5 AND (
        book_table.media_type LIKE '${type}' OR
        music_table.media_type LIKE '${type}' OR
        game_table.media_type LIKE '${type}' OR
        movie_table.media_type LIKE '${type}' OR
        show_table.media_type LIKE '${type}');
    `);

  //query = `SELECT * FROM suggested_media;`;
  connection.query(`SELECT * FROM suggested_media;`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 2: GET /user_playlist/:user_id (ALLY)
// About: return all of user's playlist & collab playlists
// Input param: user_id
// Return: playlist_id, image, title, creator, timestamp, public, collab
const user_playlist = async function (req, res) {
  const user_id = req.params.user_id;

  connection.query(
    `
    WITH personal_playlists AS (
      SELECT playlist_id, image, title, timestamp, public
      FROM Playlist p
      LEFT JOIN Users u ON p.user_id = u.user_id
      WHERE p.user_id = '${user_id}'
    ), my_collabs AS (
      SELECT playlist_id
      FROM CollaboratesOn c
      WHERE user_id = '${user_id}'
    ), collab_playlists AS (
      SELECT p.playlist_id, image, title, timestamp, public
      FROM my_collabs m
      LEFT JOIN Playlist p ON p.playlist_id = m.playlist_id
      LEFT JOIN Users u ON p.user_id = u.user_id
      WHERE p.playlist_id NOT IN (SELECT playlist_id FROM personal_playlists) 
    )
    SELECT playlist_id, image, title, timestamp, public, collab
    FROM (
      SELECT playlist_id, image, title, timestamp, public, 0 AS collab
      FROM personal_playlists
      UNION
      SELECT playlist_id, image, title, timestamp, public, 1 AS collab
      FROM collab_playlists
    ) AS subquery
    ORDER BY subquery.timestamp DESC
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
};

// Route 3: GET /playlist/:playlist_id (ALLY)
// About: return all media items in the given playlist
// Input param: playlist_id
// Return: media_id, title, creator, image
const playlist = async function (req, res) {
  const playlist_id = req.params.playlist_id;

  connection.query(
    `
      SELECT
      s.media_id,
      COALESCE (book_table.title, music_table.title, game_table.title, movie_table.title, show_table.series_title) AS title,
      COALESCE (book_table.creator, music_table.creator, game_table.creator) AS creator,
      COALESCE (book_table.image, music_table.image, game_table.image, movie_table.image, show_table.image) AS image
    FROM Playlist AS p
    LEFT JOIN PlaylistMedia AS s ON s.playlist_id = p.playlist_id
    LEFT JOIN (
      SELECT media_id, title, authors AS creator, image
      FROM Books_Combined
    ) book_table ON s.media_id = book_table.media_id
    LEFT JOIN (
      SELECT song_id, title, artist AS creator, image
      FROM Music
    ) music_table ON s.media_id = music_table.song_id
    LEFT JOIN (
      SELECT app_id, name AS title, developers AS creator, screenshot as image
      FROM Games
    ) game_table ON s.media_id = game_table.app_id
    LEFT JOIN (
      SELECT movie_id, title, image
      FROM Movie
    ) movie_table ON s.media_id = movie_table.movie_id
    LEFT JOIN (
      SELECT show_id, series_title, image
      FROM TVShows
    ) show_table ON s.media_id = show_table.show_id
    WHERE p.playlist_id = ${playlist_id};
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
};

// Route 4: GET /games (ALLY)
// About: return all games that match the given search query
// Optional param: title, developer, game_score, year_min, year_max, game category, game genre
// Return: media_id, title, developer, image link
// Category and genre should be a list of strings concatenated by '|'
const games = async function (req, res) {
  const searchInput = req.query.search_input ?? "";
  const game_score = req.query.game_score ?? 0;
  const year_min = req.query.year_min ?? 0;
  const year_max = req.query.year_max ?? 2030;
  const category = req.query.category ?? ".*";
  const genre = req.query.genre ?? ".*";

  const christmas = req.query.christmas ?? false;
  const halloween = req.query.halloween ?? false;
  const valentine = req.query.valentine ?? false;
  const celebration = req.query.celebration ?? false;
  const relaxing = req.query.relaxing ?? false;
  const nature = req.query.nature ?? false;
  const industrial = req.query.industrial ?? false;
  const sunshine = req.query.sunshine ?? false;
  const sad = req.query.sad ?? false;
  const happy = req.query.happy ?? false;
  const summer = req.query.summer ?? false;
  const winter = req.query.winter ?? false;
  const sports = req.query.sports ?? false;
  const playful = req.query.playful ?? false;
  const energetic = req.query.energetic ?? false;
  const scary = req.query.scary ?? false;
  const anger = req.query.anger ?? false;
  const optimistic = req.query.optimistic ?? false;
  const adventurous = req.query.adventurous ?? false;
  const learning = req.query.learning ?? false;
  const artistic = req.query.artistic ?? false;
  const science = req.query.science ?? false;
  const cozy = req.query.cozy ?? false;
  const colorful = req.query.colorful ?? false;
  const space = req.query.space ?? false;

  connection.query(
    `
    SELECT media_id, media_type, title, developers, image
    FROM Game_Combined
    WHERE (title LIKE '%${searchInput}%' OR developers LIKE '%${searchInput}%')
        AND christmas > IF(${christmas}, 50, 0)
        AND halloween > IF(${halloween}, 50, 0)
        AND valentine > IF(${valentine}, 50, 0)
        AND celebration > IF(${celebration}, 50, 0)
        AND relaxing > IF(${relaxing}, 50, 0)
        AND nature > IF(${nature}, 50, 0)
        AND industrial > IF(${industrial}, 50, 0)
        AND sunshine > IF(${sunshine}, 50, 0)
        AND sad > IF(${sad}, 50, 0)
        AND happy > IF(${happy}, 50, 0)
        AND summer > IF(${summer}, 50, 0)
        AND winter > IF(${winter}, 50, 0)
        AND sports > IF(${sports}, 50, 0)
        AND playful > IF(${playful}, 50, 0)
        AND energetic > IF(${energetic}, 50, 0)
        AND scary > IF(${scary}, 50, 0)
        AND anger > IF(${anger}, 50, 0)
        AND optimistic > IF(${optimistic}, 50, 0)
        AND adventurous > IF(${adventurous}, 50, 0)
        AND learning > IF(${learning}, 50, 0)
        AND artistic > IF(${artistic}, 50, 0)
        AND science > IF(${science}, 50, 0)
        AND cozy > IF(${cozy}, 50, 0)
        AND colorful > IF(${colorful}, 50, 0)
        AND space > IF(${space}, 50, 0)
        AND CAST(RIGHT(release_date, 4) AS UNSIGNED) BETWEEN ${year_min} AND ${year_max}
        AND metacritic_score >= ${game_score}
        AND categories REGEXP '${category}'
        AND genres REGEXP '${genre}'
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
};

// Route 5: GET /books (ALLY)
// About: return all books that match the given search query
// Input param: title, author, publisher, year_min, year_max
// Return: book_id, title, authors, image link
// Category should be a list of strings concatenated by '|'
const books = async function (req, res) {
  const searchInput = req.query.search_input ?? "";
  const year_min = req.query.year_min ?? 0;
  const year_max = req.query.year_max ?? 2030;
  const category = req.query.category ?? ".*";

  const christmas = req.query.christmas ?? false;
  const halloween = req.query.halloween ?? false;
  const valentine = req.query.valentine ?? false;
  const celebration = req.query.celebration ?? false;
  const relaxing = req.query.relaxing ?? false;
  const nature = req.query.nature ?? false;
  const industrial = req.query.industrial ? 1 : 0;
  const sunshine = req.query.sunshine ?? false;
  const sad = req.query.sad ?? false;
  const happy = req.query.happy ?? false;
  const summer = req.query.summer ?? false;
  const winter = req.query.winter ?? false;
  const sports = req.query.sports ?? false;
  const playful = req.query.playful ?? false;
  const energetic = req.query.energetic ?? false;
  const scary = req.query.scary ?? false;
  const anger = req.query.anger ?? false;
  const optimistic = req.query.optimistic ?? false;
  const adventurous = req.query.adventurous ?? false;
  const learning = req.query.learning ?? false;
  const artistic = req.query.artistic ?? false;
  const science = req.query.science ?? false;
  const cozy = req.query.cozy ?? false;
  const colorful = req.query.colorful ?? false;
  const space = req.query.space ?? false;

  connection.query(
    `
    SELECT media_id, media_type, title, authors, image
    FROM Books_Combined
    WHERE (title LIKE '%${searchInput}%' OR authors LIKE '%${searchInput}%' OR publisher LIKE '%${searchInput}%')
        AND christmas > IF(${christmas}, 50, 0)
        AND halloween > IF(${halloween}, 50, 0)
        AND valentine > IF(${valentine}, 50, 0)
        AND celebration > IF(${celebration}, 50, 0)
        AND relaxing > IF(${relaxing}, 50, 0)
        AND nature > IF(${nature}, 50, 0)
        AND industrial > IF(${industrial}, 50, 0)
        AND sunshine > IF(${sunshine}, 50, 0)
        AND sad > IF(${sad}, 50, 0)
        AND happy > IF(${happy}, 50, 0)
        AND summer > IF(${summer}, 50, 0)
        AND winter > IF(${winter}, 50, 0)
        AND sports > IF(${sports}, 50, 0)
        AND playful > IF(${playful}, 50, 0)
        AND energetic > IF(${energetic}, 50, 0)
        AND scary > IF(${scary}, 50, 0)
        AND anger > IF(${anger}, 50, 0)
        AND optimistic > IF(${optimistic}, 50, 0)
        AND adventurous > IF(${adventurous}, 50, 0)
        AND learning > IF(${learning}, 50, 0)
        AND artistic > IF(${artistic}, 50, 0)
        AND science > IF(${science}, 50, 0)
        AND cozy > IF(${cozy}, 50, 0)
        AND colorful > IF(${colorful}, 50, 0)
        AND space > IF(${space}, 50, 0)
        AND CAST(LEFT(published_date, 4) AS UNSIGNED) BETWEEN ${year_min} AND ${year_max}
        AND categories REGEXP '${category}'
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
};

// Route 6.1: GET /random_shows/:num/:selected_mood
const random_shows = async function (req, res) {
  const num = req.params.num;
  const selectedMood = req.params.selected_mood;

  // We get a number of random shows from the database which have a high value of the given mood
  connection.query(
    `
    WITH mm AS (SELECT media_id
      FROM MediaMoods
      WHERE media_type = 'tv'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT media_id, series_title AS title, image
    FROM TVShows tv JOIN mm ON tv.show_id = mm.media_id
  `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route 6.2: GET /random_books/:num/:selected_mood
const random_books = async function (req, res) {
  const num = req.params.num;
  const selectedMood = req.params.selected_mood;

  // We get a number of random books from the database which have a high value of the given mood
  connection.query(
    `
    WITH mm AS (SELECT media_id
      FROM MediaMoods
      WHERE media_type = 'bk'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT media_id, title, GROUP_CONCAT(author ORDER BY author SEPARATOR ',') AS authors, image
    FROM Books b 
      JOIN mm ON b.book_id = mm.media_id
      JOIN Authors a ON b.book_id = a.book_id
    GROUP BY b.book_id, title, image;
  `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route 6.3: GET /random_games/:num/:selected_mood
const random_games = async function (req, res) {
  const num = req.params.num;
  const selectedMood = req.params.selected_mood;

  // We get a number of random games from the database which have a high value of the given mood
  connection.query(
    `
    WITH mm AS (SELECT media_id
      FROM MediaMoods
      WHERE media_type = 'gm'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
      SELECT media_id, name AS title, developers, screenshot AS image
    FROM Games g JOIN mm ON g.app_id = mm.media_id
  `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route 6.4: GET /random_movies/:num/:selected_mood
const random_movies = async function (req, res) {
  const num = req.params.num;
  const selectedMood = req.params.selected_mood;

  // We get a number of random movies from the database which have a high value of the given mood
  connection.query(
    `
    WITH mm AS (SELECT media_id
      FROM MediaMoods
      WHERE media_type = 'mv'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT media_id, title, image
    FROM Movie mv JOIN mm ON mv.movie_id = mm.media_id
  `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route 6.5: GET /random_songs/:num/:selected_mood
const random_songs = async function (req, res) {
  const num = req.params.num;
  const selectedMood = req.params.selected_mood;

  // We get a number of random songs from the database which have a high value of the given mood
  connection.query(
    `
    WITH mm AS (SELECT media_id
      FROM MediaMoods
      WHERE media_type = 'mu'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT media_id, title, image
    FROM Music mu JOIN mm ON mu.song_id = mm.media_id
  `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route 6.6: GET /random_all/:num/:selected_mood
const random_all = async function (req, res) {
  const num = req.params.num;
  const selectedMood = req.params.selected_mood;

  // We get a number of random songs from the database which have a high value of the given mood
  connection.query(
    `
    WITH mm AS (SELECT media_id, media_type
     FROM MediaMoods
     WHERE ${selectedMood} > 65)
    (SELECT media_id, media_type, mv.title, mv.image
       FROM (SELECT * FROM mm WHERE media_type = 'mv' ORDER BY RAND() LIMIT ${num}) AS mv_mm
       LEFT JOIN Movie mv ON mv.movie_id = mv_mm.media_id )
    UNION
    (SELECT tv_mm.media_id, tv_mm.media_type, tv.series_title AS title, tv.image
       FROM (SELECT * FROM mm WHERE media_type = 'tv' ORDER BY RAND() LIMIT ${num}) AS tv_mm
       LEFT JOIN TVShows tv ON tv.show_id = tv_mm.media_id )
    UNION
    (SELECT bk_mm.media_id, bk_mm.media_type, b.title, b.image
       FROM (SELECT * FROM mm WHERE media_type = 'bk' ORDER BY RAND() LIMIT ${num}) AS bk_mm
       LEFT JOIN Books b ON b.book_id = bk_mm.media_id )
    UNION
    (SELECT gm_mm.media_id, gm_mm.media_type, g.name AS title, g.screenshot
       FROM (SELECT * FROM mm WHERE media_type = 'gm' ORDER BY RAND() LIMIT ${num}) AS gm_mm
       LEFT JOIN Games g ON g.app_id = gm_mm.media_id )
    UNION
    (SELECT mu_mm.media_id, mu_mm.media_type, mu.title, mu.image
       FROM (SELECT * FROM mm WHERE media_type = 'mu' ORDER BY RAND() LIMIT ${num}) AS mu_mm
      LEFT JOIN Music mu on mu.song_id = mu_mm.media_id )
    ORDER BY RAND();
  `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route 7: GET /ordered_suggestion
const ordered_suggestion = async function (req, res) {
  const christmas = req.body.christmas ?? false;
  const halloween = req.body.halloween ?? false;
  const valentine = req.body.valentine ?? false;
  const celebration = req.body.celebration ?? false;
  const relaxing = req.body.relaxing ?? false;
  const nature = req.body.nature ?? false;
  const industrial = req.body.industrial ?? false;
  const sunshine = req.body.sunshine ?? false;
  const sad = req.body.sad ?? false;
  const happy = req.body.happy ?? false;
  const summer = req.body.summer ?? false;
  const winter = req.body.winter ?? false;
  const sports = req.body.sports ?? false;
  const playful = req.body.playful ?? false;
  const energetic = req.body.energetic ?? false;
  const scary = req.body.scary ?? false;
  const anger = req.body.anger ?? false;
  const optimistic = req.body.optimistic ?? false;
  const adventurous = req.body.adventurous ?? false;
  const learning = req.body.learning ?? false;
  const artistic = req.body.artistic ?? false;
  const science = req.body.science ?? false;
  const cozy = req.body.cozy ?? false;
  const colorful = req.body.colorful ?? false;
  const space = req.body.space ?? false;

  // Create the temporary table if it does not exist already
  connection.query(`
    CREATE TEMPORARY TABLE IF NOT EXISTS all_media SELECT media_id, media_type, 0 AS row_num FROM MediaMoods LIMIT 0
  `);

  connection.query(
    `
    CREATE UNIQUE INDEX am_index ON all_media(media_id);
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log("all_media already has an index.");
      }
    }
  );

  // Empty the temporary table
  connection.query(`
    TRUNCATE all_media
  `);

  // Creates a temporary table of all media that filters for moods in the mood list
  // Orders each media within type from best to least matching media of specified selected mood
  connection.query(
    `
  REPLACE INTO all_media
  WITH MediaSum AS(
      SELECT media_id, media_type, christmas, halloween, valentine, celebration, relaxing, nature, industrial,
             sunshine, sad, happy, summer, winter, sports, playful, energetic, scary, anger, optimistic,
             adventurous, learning, artistic, science, cozy, colorful, space,
      (IF(${christmas}, christmas, 0)+
      IF(${halloween}, halloween, 0)+
      IF(${valentine}, valentine, 0)+
      IF(${celebration}, celebration, 0)+
      IF(${relaxing}, relaxing, 0)+
      IF(${nature}, nature, 0)+
      IF(${industrial}, industrial, 0)+
      IF(${sunshine}, sunshine, 0)+
      IF(${sad}, sad, 0)+
      IF(${happy}, happy, 0)+
      IF(${summer}, summer, 0)+
      IF(${winter}, winter, 0)+
      IF(${sports}, sports, 0)+
      IF(${playful}, playful, 0)+
      IF(${energetic}, energetic, 0)+
      IF(${scary}, scary, 0)+
      IF(${anger}, anger, 0)+
      IF(${optimistic}, optimistic, 0)+
      IF(${adventurous}, adventurous, 0)+
      IF(${learning}, learning, 0)+
      IF(${artistic}, artistic, 0)+
      IF(${science}, science, 0)+
      IF(${cozy}, cozy, 0)+
      IF(${colorful}, colorful, 0)+
      IF(${space}, space, 0)) AS mood_sum
  FROM MediaMoods
  )
      SELECT media_id, media_type, ROW_NUMBER() OVER (PARTITION BY media_type ORDER BY mood_sum DESC) AS row_num
      FROM MediaSum
      WHERE christmas > IF(${christmas}, 50, 0)
        AND halloween > IF(${halloween}, 50, 0)
        AND valentine > IF(${valentine}, 50, 0)
        AND celebration > IF(${celebration}, 50, 0)
        AND relaxing > IF(${relaxing}, 50, 0)
        AND nature > IF(${nature}, 50, 0)
        AND industrial > IF(${industrial}, 50, 0)
        AND sunshine > IF(${sunshine}, 50, 0)
        AND sad > IF(${sad}, 50, 0)
        AND happy > IF(${happy}, 50, 0)
        AND summer > IF(${summer}, 50, 0)
        AND winter > IF(${winter}, 50, 0)
        AND sports > IF(${sports}, 50, 0)
        AND playful > IF(${playful}, 50, 0)
        AND energetic > IF(${energetic}, 50, 0)
        AND scary > IF(${scary}, 50, 0)
        AND anger > IF(${anger}, 50, 0)
        AND optimistic > IF(${optimistic}, 50, 0)
        AND adventurous > IF(${adventurous}, 50, 0)
        AND learning > IF(${learning}, 50, 0)
        AND artistic > IF(${artistic}, 50, 0)
        AND science > IF(${science}, 50, 0)
        AND cozy > IF(${cozy}, 50, 0)
        AND colorful > IF(${colorful}, 50, 0)
      AND space > IF(${space}, 50, 0);
  `,
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to generate all_media" });
      } else {
        console.log("all_media generated successfully!");
        res.json({ message: "all_media generated successfully!" });
      }
    }
  );
};

// Route 8: GET /suggested_media
const suggested_media = async function (req, res) {
  const numMedia = req.body.num_media ?? 1;

  // Create the temporary table if it does not exist already
  connection.query(`
    CREATE TEMPORARY TABLE IF NOT EXISTS suggested_media (
      media_id VARCHAR(15),
      media_type VARCHAR(2),
      image VARCHAR(255),
      title VARCHAR(255),
      creator VARCHAR(255)
    )
  `);

  connection.query(
    `
    CREATE UNIQUE INDEX sm_index ON suggested_media(media_id);
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log("suggested_media already has an index.");
      }
    }
  );

  // Empty the temporary table
  connection.query(`
    TRUNCATE suggested_media
  `);

  // Creates a temporary table of all media that filters for moods in the mood list
  // Orders each media within type from best to least matching media of specified selected mood
  connection.query(`
    REPLACE INTO suggested_media
    WITH suggest_rand AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY media_type
    ORDER BY RAND()) AS row_num2
    FROM all_media
    WHERE row_num <= 50
    )
    SELECT s.media_id, s.media_type,
    CASE
        WHEN s.media_type = 'bk' THEN book_table.image
        WHEN s.media_type = 'mu' THEN music_table.image
        WHEN s.media_type = 'gm' THEN game_table.image
        WHEN s.media_type = 'mv' THEN movie_table.image
        WHEN s.media_type = 'tv' THEN show_table.image
    END AS image,
    CASE
        WHEN s.media_type = 'bk' THEN book_table.title
        WHEN s.media_type = 'mu' THEN music_table.title
        WHEN s.media_type = 'gm' THEN game_table.title
        WHEN s.media_type = 'mv' THEN movie_table.title
        WHEN s.media_type = 'tv' THEN show_table.title
    END AS title,
    CASE
        WHEN s.media_type = 'bk' THEN book_table.creator
        WHEN s.media_type = 'mu' THEN music_table.creator
        WHEN s.media_type = 'gm' THEN game_table.creator
        WHEN s.media_type = 'mv' THEN NULL
        WHEN s.media_type = 'tv' THEN NULL
    END AS creator
    FROM suggest_rand s
    LEFT JOIN (SELECT media_id, title, authors AS creator, image  FROM Books_Combined) book_table
    ON s.media_id = book_table.media_id AND s.media_type = 'bk'
    LEFT JOIN (SELECT song_id, title, artist AS creator, image  FROM Music) music_table
    ON s.media_id = music_table.song_id AND s.media_type = 'mu'
    LEFT JOIN (SELECT app_id, name AS title, developers AS creator, screenshot AS image FROM Games) game_table
    ON s.media_id = game_table.app_id AND s.media_type = 'gm'
    LEFT JOIN (SELECT movie_id, title, image FROM Movie) movie_table
    ON s.media_id = movie_table.movie_id AND s.media_type = 'mv'
    LEFT JOIN (SELECT show_id, series_title AS title, image FROM TVShows) show_table
    ON s.media_id = show_table.show_id AND s.media_type = 'tv'
    WHERE row_num2 <= ${numMedia};
  `);

  connection.query(
    `
    SELECT * FROM suggested_media
  `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

// Route 9: GET /shows
// About: return all shows that match the given search query
// Input param: title, year_min, year_max, genre
// Return: show_id, title, image link
// Genre should be a list of strings concatenated by '|'
const shows = async function (req, res) {
  const searchInput = req.query.search_input ?? "";
  const yearMin = req.query.year_min ?? 0;
  const yearMax = req.query.year_max ?? 2030;
  const genre = req.query.genre ?? ".*";
  const ratingNum = req.query.rating_num ?? 0;

  const christmas = req.query.christmas ?? false;
  const halloween = req.query.halloween ?? false;
  const valentine = req.query.valentine ?? false;
  const celebration = req.query.celebration ?? false;
  const relaxing = req.query.relaxing ?? false;
  const nature = req.query.nature ?? false;
  const industrial = req.query.industrial ? 1 : 0;
  const sunshine = req.query.sunshine ?? false;
  const sad = req.query.sad ?? false;
  const happy = req.query.happy ?? false;
  const summer = req.query.summer ?? false;
  const winter = req.query.winter ?? false;
  const sports = req.query.sports ?? false;
  const playful = req.query.playful ?? false;
  const energetic = req.query.energetic ?? false;
  const scary = req.query.scary ?? false;
  const anger = req.query.anger ?? false;
  const optimistic = req.query.optimistic ?? false;
  const adventurous = req.query.adventurous ?? false;
  const learning = req.query.learning ?? false;
  const artistic = req.query.artistic ?? false;
  const science = req.query.science ?? false;
  const cozy = req.query.cozy ?? false;
  const colorful = req.query.colorful ?? false;
  const space = req.query.space ?? false;

  connection.query(
    `
      WITH shows_in AS (
        SELECT show_id
        FROM TVCast
        WHERE cast LIKE '%${searchInput}%'
      )
      SELECT DISTINCT media_id, media_type, series_title AS title, image
      FROM TVShows s
      JOIN ShowGenre sg On s.show_id = sg.show_id
      JOIN MediaMoods AS m ON s.show_id = m.media_id
      WHERE (s.series_title LIKE '%${searchInput}%' OR s.show_id IN (SELECT * FROM shows_in))
              AND christmas > IF(${christmas}, 50, 0)
              AND halloween > IF(${halloween}, 50, 0)
              AND valentine > IF(${valentine}, 50, 0)
              AND celebration > IF(${celebration}, 50, 0)
              AND relaxing > IF(${relaxing}, 50, 0)
              AND nature > IF(${nature}, 50, 0)
              AND industrial > IF(${industrial}, 50, 0)
              AND sunshine > IF(${sunshine}, 50, 0)
              AND sad > IF(${sad}, 50, 0)
              AND happy > IF(${happy}, 50, 0)
              AND summer > IF(${summer}, 50, 0)
              AND winter > IF(${winter}, 50, 0)
              AND sports > IF(${sports}, 50, 0)
              AND playful > IF(${playful}, 50, 0)
              AND energetic > IF(${energetic}, 50, 0)
              AND scary > IF(${scary}, 50, 0)
              AND anger > IF(${anger}, 50, 0)
              AND optimistic > IF(${optimistic}, 50, 0)
              AND adventurous > IF(${adventurous}, 50, 0)
              AND learning > IF(${learning}, 50, 0)
              AND artistic > IF(${artistic}, 50, 0)
              AND science > IF(${science}, 50, 0)
              AND cozy > IF(${cozy}, 50, 0)
              AND colorful > IF(${colorful}, 50, 0)
              AND space > IF(${space}, 50, 0)
        AND release_year BETWEEN ${yearMin} AND ${yearMax}
        AND sg.genre REGEXP '${genre}'
        AND rating >= ${ratingNum}
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
};

// Route 10: GET /movies
// About: return all movies that match the given search query
// Input param: title, year_min, year_max, genre
// Return: show_id, title
// Genre should be a list of strings concatenated by '|'
const movies = async function (req, res) {
  const searchInput = req.query.search_input ?? "";
  const yearMin = req.query.year_min ?? 0;
  const yearMax = req.query.year_max ?? 2030;
  const genre = req.query.genre ?? ".*";

  const christmas = req.query.christmas ?? false;
  const halloween = req.query.halloween ?? false;
  const valentine = req.query.valentine ?? false;
  const celebration = req.query.celebration ?? false;
  const relaxing = req.query.relaxing ?? false;
  const nature = req.query.nature ?? false;
  const industrial = req.query.industrial ? 1 : 0;
  const sunshine = req.query.sunshine ?? false;
  const sad = req.query.sad ?? false;
  const happy = req.query.happy ?? false;
  const summer = req.query.summer ?? false;
  const winter = req.query.winter ?? false;
  const sports = req.query.sports ?? false;
  const playful = req.query.playful ?? false;
  const energetic = req.query.energetic ?? false;
  const scary = req.query.scary ?? false;
  const anger = req.query.anger ?? false;
  const optimistic = req.query.optimistic ?? false;
  const adventurous = req.query.adventurous ?? false;
  const learning = req.query.learning ?? false;
  const artistic = req.query.artistic ?? false;
  const science = req.query.science ?? false;
  const cozy = req.query.cozy ?? false;
  const colorful = req.query.colorful ?? false;
  const space = req.query.space ?? false;

  connection.query(
    `
      WITH movies_in AS (
        SELECT movie_id
        FROM MovieCast
        WHERE cast LIKE '%${searchInput}%'
      )
      SELECT DISTINCT m.media_id, media_type, title, image
      FROM Movie mv 
      JOIN MovieGenre mg On mv.movie_id = mg.movie_id
      JOIN MediaMoods AS m ON mv.movie_id = m.media_id
      WHERE (mv.title LIKE '%${searchInput}%' OR mv.movie_id IN (SELECT * FROM movies_in))
              AND christmas > IF(${christmas}, 50, 0)
              AND halloween > IF(${halloween}, 50, 0)
              AND valentine > IF(${valentine}, 50, 0)
              AND celebration > IF(${celebration}, 50, 0)
              AND relaxing > IF(${relaxing}, 50, 0)
              AND nature > IF(${nature}, 50, 0)
              AND industrial > IF(${industrial}, 50, 0)
              AND sunshine > IF(${sunshine}, 50, 0)
              AND sad > IF(${sad}, 50, 0)
              AND happy > IF(${happy}, 50, 0)
              AND summer > IF(${summer}, 50, 0)
              AND winter > IF(${winter}, 50, 0)
              AND sports > IF(${sports}, 50, 0)
              AND playful > IF(${playful}, 50, 0)
              AND energetic > IF(${energetic}, 50, 0)
              AND scary > IF(${scary}, 50, 0)
              AND anger > IF(${anger}, 50, 0)
              AND optimistic > IF(${optimistic}, 50, 0)
              AND adventurous > IF(${adventurous}, 50, 0)
              AND learning > IF(${learning}, 50, 0)
              AND artistic > IF(${artistic}, 50, 0)
              AND science > IF(${science}, 50, 0)
              AND cozy > IF(${cozy}, 50, 0)
              AND colorful > IF(${colorful}, 50, 0)
              AND space > IF(${space}, 50, 0)
        AND release_date BETWEEN '${yearMin}-01-01' AND '${yearMax}-01-01'
        AND mg.genre REGEXP '${genre}'
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
};

// Route 11: GET /songs
// About: return all songs that match the given search query
// Input param: title, year_min, year_max, genre
// Return: show_id, title, image
// tag_list should be a list of strings concatenated by '|'
const songs = async function (req, res) {
  const searchInput = req.query.search_input ?? "";
  const yearMin = req.query.year_min ?? 0;
  const yearMax = req.query.year_max ?? 2030;
  const tagList = req.query.tag_list ?? ".*";

  const christmas = req.query.christmas ?? false;
  const halloween = req.query.halloween ?? false;
  const valentine = req.query.valentine ?? false;
  const celebration = req.query.celebration ?? false;
  const relaxing = req.query.relaxing ?? false;
  const nature = req.query.nature ?? false;
  const industrial = req.query.industrial ? 1 : 0;
  const sunshine = req.query.sunshine ?? false;
  const sad = req.query.sad ?? false;
  const happy = req.query.happy ?? false;
  const summer = req.query.summer ?? false;
  const winter = req.query.winter ?? false;
  const sports = req.query.sports ?? false;
  const playful = req.query.playful ?? false;
  const energetic = req.query.energetic ?? false;
  const scary = req.query.scary ?? false;
  const anger = req.query.anger ?? false;
  const optimistic = req.query.optimistic ?? false;
  const adventurous = req.query.adventurous ?? false;
  const learning = req.query.learning ?? false;
  const artistic = req.query.artistic ?? false;
  const science = req.query.science ?? false;
  const cozy = req.query.cozy ?? false;
  const colorful = req.query.colorful ?? false;
  const space = req.query.space ?? false;

  connection.query(
    `
    SELECT media_id, media_type, title, image
    FROM Music_Combined
    WHERE (title LIKE '%${searchInput}%' OR artist LIKE '%${searchInput}%')
            AND christmas > IF(${christmas}, 50, 0)
            AND halloween > IF(${halloween}, 50, 0)
            AND valentine > IF(${valentine}, 50, 0)
            AND celebration > IF(${celebration}, 50, 0)
            AND relaxing > IF(${relaxing}, 50, 0)
            AND nature > IF(${nature}, 50, 0)
            AND industrial > IF(${industrial}, 50, 0)
            AND sunshine > IF(${sunshine}, 50, 0)
            AND sad > IF(${sad}, 50, 0)
            AND happy > IF(${happy}, 50, 0)
            AND summer > IF(${summer}, 50, 0)
            AND winter > IF(${winter}, 50, 0)
            AND sports > IF(${sports}, 50, 0)
            AND playful > IF(${playful}, 50, 0)
            AND energetic > IF(${energetic}, 50, 0)
            AND scary > IF(${scary}, 50, 0)
            AND anger > IF(${anger}, 50, 0)
            AND optimistic > IF(${optimistic}, 50, 0)
            AND adventurous > IF(${adventurous}, 50, 0)
            AND learning > IF(${learning}, 50, 0)
            AND artistic > IF(${artistic}, 50, 0)
            AND science > IF(${science}, 50, 0)
            AND cozy > IF(${cozy}, 50, 0)
            AND colorful > IF(${colorful}, 50, 0)
            AND space > IF(${space}, 50, 0)
      AND year BETWEEN ${yearMin} AND ${yearMax}
      AND tag REGEXP '${tagList}'
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
};

// Route 12: GET /user/:user_id
const user = async function (req, res) {
  const userID = req.params.user_id;

  // We get a number of random songs from the database which have a high value of the given mood
  connection.query(
    `
        SELECT * FROM Users WHERE user_id='${userID}';
    `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty array [].
        res.json([]);
      } else {
        // Here, we return results of the query
        res.json(data);
      }
    }
  );
};

module.exports = {
  random_shows,
  random_books,
  random_games,
  random_movies,
  random_songs,
  random_all,
  ordered_suggestion,
  books,
  games,
  playlist,
  user_playlist,
  additional_media,
  suggested_media,
  shows,
  movies,
  songs,
  user,
  new_playlist,
  new_collaborator,
  new_user,
  new_media,
  user_playlist_search,
  all_playlist_search,
  delete_collaborator,
  delete_media,
  delete_playlist,
  media,
};
