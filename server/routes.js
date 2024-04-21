const mysql = require("mysql");
const config = require("./config.json");

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

// Route 1: GET /add_media/ (ALLY)
// About: Adds 5 additional media items of specified type to the suggested_media table
// Input param: media type
// Return: media_id, media_type, title, creator, image
const pool_size = 50;
const add_media = async function (req, res) {
  const type = req.query.type;
  pool_size = pool_size + 5; // increment pool size by 5 every time we add media

  connection.query(
    `
    CREATE TEMPORARY TABLE IF NOT EXISTS suggested_ids (
      media_id INT,
      media_type VARCHAR(255)
    );

    INSERT INTO suggested_ids (media_id, media_type)
    SELECT media_id, media_type
    FROM suggested_media;

    INSERT INTO suggested_media
    WITH suggest_rand AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY media_type ORDER BY RAND()) AS row_num2
        FROM all_media
        WHERE row_num <= ${pool_size} 
        AND (media_id, media_type) NOT IN (
            SELECT media_id, media_type
        FROM suggested_ids))
    SELECT media_id, media_type,
      LEFT(COALESCE (book_table.title, music_table.title, game_table.title, movie_table.title, show_table.series_title), 100) AS title,
      LEFT(COALESCE (book_table.creator, music_table.creator, game_table.creator), 100) AS creator, image
    FROM suggest_rand s
    LEFT JOIN (
        SELECT a.book_id, title, GROUP_CONCAT(author SEPARATOR ', ') AS creator
        FROM Books b
        JOIN Authors a ON b.book_id = a.book_id
        GROUP BY book_id) book_table ON s.media_id = book_table.book_id AND s.media_type LIKE 'book'
    LEFT JOIN (
        SELECT song_id, title, artist AS creator
        FROM Music) music_table ON s.media_id = music_table.song_id AND s.media_type LIKE 'song'
    LEFT JOIN (
        SELECT app_id, name AS title, developers AS creator
        FROM Games) game_table ON s.media_id = game_table.app_id AND s.media_type LIKE 'game'
    LEFT JOIN (
        SELECT movie_id, title
        FROM Movie) movie_table ON s.media_id = movie_table.movie_id AND s.media_type LIKE 'movie'
    LEFT JOIN (
        SELECT show_id, series_title
        FROM TVShows) show_table ON s.media_id = show_table.show_id AND s.media_type LIKE 'show'
    WHERE row_num2 <= 5 AND media_type LIKE '${type}';
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

// Route 2: GET /get_user_playlist/:user_id (ALLY)
// About: return all of user's playlist & collab playlists
// Input param: user_id
// Return: playlist_id, image, title, creator, timestamp
const get_user_playlist = async function (req, res) {
  const user_id = req.params.user_id;

  connection.query(
    `
    WITH personal_playlists AS (
      SELECT playlist_id, image, title, username AS creator, timestamp
      FROM Playlist p
      LEFT JOIN Users u ON p.user_id = u.user_id
      WHERE p.user_id = ${user_id}
    ), my_collabs AS (
      SELECT playlist_id
      FROM CollaboratesOn c
      WHERE user_id = ${user_id}
    ), collab_playlists AS (
      SELECT p.playlist_id, image, title, username AS creator, timestamp
      FROM my_collabs m
      LEFT JOIN Playlist p ON p.playlist_id = m.playlist_id
      LEFT JOIN Users u ON p.user_id = u.user_id
      WHERE p.playlist_id NOT IN (SELECT playlist_id FROM personal_playlists) 
    )
    SELECT *
    FROM (
      SELECT playlist_id, image, title, creator, timestamp
      FROM personal_playlists
      UNION
      SELECT playlist_id, image, title, creator, timestamp
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

// Route 3: GET /get_playlist/:playlist_id (ALLY)
// About: return all media items in the given playlist
// Input param: playlist_id
// Return: media_id, title, creator, image
const get_playlist = async function (req, res) {
  const playlist_id = req.params.playlist_id;

  connection.query(
    `
      SELECT 
        s.media_id, 
        COALESCE (book_table.title, music_table.title, game_table.title, movie_table.title, show_table.series_title) AS title,
        COALESCE (book_table.creator, music_table.creator, game_table.creator) AS creator,
        image
      FROM Playlist AS p
      LEFT JOIN PlaylistMedia AS s ON s.playlist_id = p.playlist_id
      LEFT JOIN (
        SELECT b.book_id, title, GROUP_CONCAT(author ORDER BY author SEPARATOR ',') AS creator
        FROM Books b
        LEFT JOIN Authors a ON b.book_id = a.book_id
        GROUP BY b.book_id
      ) book_table ON s.media_id = book_table.book_id
      LEFT JOIN (
        SELECT song_id, title, artist AS creator 
        FROM Music
      ) music_table ON s.media_id = music_table.song_id
      LEFT JOIN (
        SELECT app_id, name AS title, developers AS creator 
        FROM Games
      ) game_table ON s.media_id = game_table.app_id
      LEFT JOIN (
        SELECT movie_id, title 
        FROM Movie
      ) movie_table ON s.media_id = movie_table.movie_id
      LEFT JOIN (
        SELECT show_id, series_title 
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

// Route 4: GET /search_games (ALLY)
// About: return all games that match the given search query
// Optional param: title, developer, game_score, year_min, year_max, game category, game genre
// Return: media_id, title, developer, image link
// Category and genre should be a list of strings concatenated by '|'
const search_games = async function (req, res) {
  const title = req.query.title ?? "";
  const developer = req.query.developer ?? "";
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
    SELECT media_id, name AS title, developers, screenshot AS image
    FROM Games g
    LEFT JOIN MediaMoods AS m ON g.app_id = m.media_id
    LEFT JOIN (
      SELECT app_id, GROUP_CONCAT(genre SEPARATOR ', ') AS genres
      FROM GameGenre
      GROUP BY app_id) AS gg ON gg.app_id = g.app_id
    LEFT JOIN (
      SELECT app_id, GROUP_CONCAT(categories SEPARATOR ', ') AS categories
      FROM GameCategories
      GROUP BY app_id) AS gc ON gc.app_id = g.app_id
    WHERE 
        name LIKE '%${title}%'
        AND developers LIKE '%${developer}%'
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

// Route 5: GET /search_books (ALLY)
// About: return all books that match the given search query
// Input param: title, author, publisher, year_min, year_max
// Return: book_id, title, authors, image link
// Category should be a list of strings concatenated by '|'
const search_books = async function (req, res) {
  const title = req.query.title ?? "";
  const author = req.query.author ?? "";
  const publisher = req.query.publisher ?? "";
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
    SELECT media_id, title, GROUP_CONCAT(author ORDER BY author SEPARATOR ',') AS authors, image
    FROM Books b
    LEFT JOIN Authors a ON b.book_id = a.book_id
    LEFT JOIN MediaMoods AS m ON b.book_id = m.media_id
    WHERE title LIKE '%${title}%'
        AND author LIKE '%${author}%'
        AND publisher LIKE '%${publisher}%'
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
        GROUP BY b.book_id, title, image;
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
      WHERE media_type = 'show'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT *
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
      WHERE media_type = 'book'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT *
    FROM Books b JOIN mm ON b.book_id = mm.media_id
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
      WHERE media_type = 'game'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT *
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

// Route 6.4: GET /random_games/:num/:selected_mood
const random_movies = async function (req, res) {
  const num = req.params.num;
  const selectedMood = req.params.selected_mood;

  // We get a number of random movies from the database which have a high value of the given mood
  connection.query(
    `
    WITH mm AS (SELECT media_id
      FROM MediaMoods
      WHERE media_type = 'movie'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT *
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

// Route 6.5: GET /random_games/:num/:selected_mood
const random_songs = async function (req, res) {
  const num = req.params.num;
  const selectedMood = req.params.selected_mood;

  // We get a number of random songs from the database which have a high value of the given mood
  connection.query(
    `
    WITH mm AS (SELECT media_id
      FROM MediaMoods
      WHERE media_type = 'song'
        AND ${selectedMood} > 65
      ORDER BY RAND()
      LIMIT ${num})
    SELECT *
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

// Route 7: GET /ordered_suggestion/:selected_mood/:mood_list
const ordered_suggestion = async function (req, res) {
  const selectedMood = req.params.selected_mood;
  var moodList = req.params.mood_list.split(",");

  const christmas = moodList.includes("christmas");
  const halloween = moodList.includes("halloween");
  const valentine = moodList.includes("valentine");
  const celebration = moodList.includes("celebration");
  const relaxing = moodList.includes("relaxing");
  const nature = moodList.includes("nature");
  const industrial = moodList.includes("industrial");
  const sunshine = moodList.includes("sunshine");
  const sad = moodList.includes("sad");
  const happy = moodList.includes("happy");
  const summer = moodList.includes("summer");
  const winter = moodList.includes("winter");
  const sports = moodList.includes("sports");
  const playful = moodList.includes("playful");
  const energetic = moodList.includes("energetic");
  const scary = moodList.includes("scary");
  const anger = moodList.includes("anger");
  const optimistic = moodList.includes("optimistic");
  const adventurous = moodList.includes("adventurous");
  const learning = moodList.includes("learning");
  const artistic = moodList.includes("artistic");
  const science = moodList.includes("science");
  const cozy = moodList.includes("cozy");
  const colorful = moodList.includes("colorful");
  const space = moodList.includes("space");

  // Create the temporary table if it does not exist already
  connection.query(`
    CREATE TEMPORARY TABLE IF NOT EXISTS all_media SELECT media_id, media_type, 0 AS row_num FROM MediaMoods LIMIT 0
  `);

  // Empty the temporary table
  connection.query(`
    TRUNCATE all_media
  `);

  // Creates a temporary table of all media that filters for moods in the mood list
  // Orders each media within type from best to least matching media of specified selected mood
  connection.query(`
    REPLACE INTO all_media
    SELECT media_id, media_type, ROW_NUMBER() OVER (PARTITION BY media_type ORDER BY ${selectedMood} DESC) AS row_num
    FROM MediaMoods
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
    AND space > IF(${space}, 50, 0)
  `);

  connection.query(
    `
    SELECT * FROM all_media LIMIT 10
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
  ordered_suggestion,
  search_books,
  search_games,
  get_playlist,
  get_user_playlist,
  add_media,
};

/*
// Route 1: GET /author/:type
const author = async function(req, res) {
  // TODO (TASK 1): replace the values of name and pennkey with your own
  const name = 'Reed Kienzle';
  const pennkey = 'rkienzle';

  // checks the value of type in the request parameters
  // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
  if (req.params.type === 'name') {
    // res.send returns data back to the requester via an HTTP response
    res.json({ name: name });
  } else if (req.params.type === 'pennkey') {
    // TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back a JSON response with the pennkey
    res.json({ pennkey: pennkey });
  } else {
    res.status(400).json({});
  }
}

// Route 2: GET /random
const random = async function(req, res) {
  // you can use a ternary operator to check the value of request query values
  // which can be particularly useful for setting the default value of queries
  // note if users do not provide a value for the query it will be undefined, which is falsey
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  // Here is a complete example of how to query the database in JavaScript.
  // Only a small change (unrelated to querying) is required for TASK 3 in this route.
  connection.query(`
    SELECT *
    FROM Songs
    WHERE explicit <= ${explicit}
    ORDER BY RAND()
    LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      // If there is an error for some reason, or if the query is empty (this should not be possible)
      // print the error message and return an empty object instead
      console.log(err);
      // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
      // return type you may need to return an empty array [] instead.
      res.json({});
    } else {
      // Here, we return results of the query as an object, keeping only relevant data
      // being song_id and title which you will add. In this case, there is only one song
      // so we just directly access the first element of the query results array (data)
      // TODO (TASK 3): also return the song title in the response
      res.json({
        song_id: data[0].song_id,
        title: data[0].title
      });
    }
  });
}

// Route 3: GET /song/:song_id
const song = async function(req, res) {
  // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
  // Hint: unlike route 2, you can directly SELECT * and just return data[0]
  // Most of the code is already written for you, you just need to fill in the query
  const songId = req.params.song_id;

  connection.query(`
    SELECT *
    FROM Songs
    WHERE song_id = '${songId}'
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 4: GET /album/:album_id
const album = async function(req, res) {
  // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
  const albumId = req.params.album_id;

  connection.query(`
    SELECT *
    FROM Albums
    WHERE album_id = '${albumId}'
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 5: GET /albums
const albums = async function(req, res) {
  // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
  // Note that in this case you will need to return multiple albums, so you will need to return an array of objects

  connection.query(`
    SELECT *
    FROM Albums
    ORDER BY release_date DESC
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 6: GET /album_songs/:album_id
const album_songs = async function(req, res) {
  // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
  const albumId = req.params.album_id;

  connection.query(`
    SELECT song_id, title, number, duration, plays
    FROM Songs
    WHERE album_id = '${albumId}'
    ORDER BY number ASC
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 7: GET /top_songs
const top_songs = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
    connection.query(`
      SELECT s.song_id, s.title, s.album_id, a.title as album, s.plays
      FROM Songs s JOIN Albums a ON s.album_id = a.album_id
      ORDER BY s.plays DESC
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  } else {
    const pageOffset = (page-1) * pageSize
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
    connection.query(`
      SELECT s.song_id, s.title, s.album_id, a.title as album, s.plays
      FROM Songs s JOIN Albums a ON s.album_id = a.album_id
      ORDER BY s.plays DESC
      LIMIT ${pageSize} OFFSET ${pageOffset}
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}

// Route 8: GET /top_albums
const top_albums = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
  // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      SELECT a.album_id, a.title, SUM(s.plays) AS plays
      FROM Songs s JOIN Albums a ON s.album_id = a.album_id
      GROUP BY a.album_id, a.title
      ORDER BY plays DESC
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  } else {
    const pageOffset = (page-1) * pageSize
    connection.query(`
      SELECT a.album_id, a.title, SUM(s.plays) AS plays
      FROM Songs s JOIN Albums a ON s.album_id = a.album_id
      GROUP BY a.album_id, a.title
      ORDER BY plays DESC
      LIMIT ${pageSize} OFFSET ${pageOffset}
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}

// Route 9: GET /search_albums
const search_songs = async function(req, res) {
  // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
  // Some default parameters have been provided for you, but you will need to fill in the rest       
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;
  const playsLow = req.query.plays_low ?? 0;
  const playsHigh = req.query.plays_high ?? 1100000000;
  const danceabilityLow = req.query.danceability_low ?? 0;
  const danceabilityHigh = req.query.danceability_high ?? 1;  
  const energyLow = req.query.energy_low ?? 0;
  const energyHigh = req.query.energy_high ?? 1;  
  const valenceLow = req.query.valence_low ?? 0;
  const valenceHigh = req.query.valence_high ?? 1;  
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  connection.query(`
    SELECT *
    FROM Songs
    WHERE title LIKE '%${title}%'
      AND duration >= ${durationLow}
      AND duration <= ${durationHigh}
      AND plays >= ${playsLow}
      AND plays <= ${playsHigh}
      AND danceability >= ${danceabilityLow}
      AND danceability <= ${danceabilityHigh}
      AND energy >= ${energyLow}
      AND energy <= ${energyHigh}
      AND valence >= ${valenceLow}
      AND valence <= ${valenceHigh}      
      AND explicit <= ${explicit}
    ORDER BY title ASC
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

module.exports = {
  author,
  random,
  song,
  album,
  albums,
  album_songs,
  top_songs,
  top_albums,
  search_songs,
}
*/
