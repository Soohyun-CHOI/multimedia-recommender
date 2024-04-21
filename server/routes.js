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

// Route 1: GET /additional_media/ (ALLY)
// About: Adds 5 additional media items of specified type to the suggested_media table
// Input param: media type
// Return: media_id, media_type, title, creator, image
let pool_size = 50;
const additional_media = async function (req, res) {
  let type = req.query.type ?? "";
  pool_size = pool_size + 5; // increment pool size by 5 every time we add media

  connection.query(`
    CREATE TEMPORARY TABLE IF NOT EXISTS suggested_ids (media_id INT);
  `);

  connection.query(
    `
    REPLACE INTO suggested_ids (media_id)
    SELECT media_id
    FROM suggested_media;
    `
  );

  let query2 = `
      SELECT media_id FROM suggested_ids;
    `;

  let query = `
    SELECT media_id,
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
        SELECT a.book_id,'bk' as media_type, image, title, GROUP_CONCAT(author SEPARATOR ', ') AS creator
        FROM Books b
        JOIN Authors a ON b.book_id = a.book_id
        GROUP BY book_id) book_table ON s.media_id = book_table.book_id
    LEFT JOIN (
        SELECT song_id, 'mu' as media_type, image, title, artist AS creator
        FROM Music) music_table ON s.media_id = music_table.song_id
    LEFT JOIN (
        SELECT app_id, 'gm' as media_type, screenshot AS image, name AS title, developers AS creator
        FROM Games) game_table ON s.media_id = game_table.app_id
    LEFT JOIN (
        SELECT movie_id, 'mv' as media_type, title
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
    `;

  console.log(query2);

  connection.query(query2, (err, data) => {
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
// Return: playlist_id, image, title, creator, timestamp
const user_playlist = async function (req, res) {
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

// Route 4: GET /games (ALLY)
// About: return all games that match the given search query
// Optional param: title, developer, game_score, year_min, year_max, game category, game genre
// Return: media_id, title, developer, image link
// Category and genre should be a list of strings concatenated by '|'
const games = async function (req, res) {
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

// Route 5: GET /books (ALLY)
// About: return all books that match the given search query
// Input param: title, author, publisher, year_min, year_max
// Return: book_id, title, authors, image link
// Category should be a list of strings concatenated by '|'
const books = async function (req, res) {
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
    SELECT media_id, title
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

// Route 7: GET /ordered_suggestion
const ordered_suggestion = async function (req, res) {
  const selectedMood = req.query.selected_mood ?? "";

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
    SELECT * FROM all_media
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

// Route 8: GET /suggested_media
const suggested_media = async function (req, res) {
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
    SELECT media_id, media_type,
    CASE
        WHEN media_type = 'bk' THEN book_table.image
        WHEN media_type = 'mu' THEN music_table.image
        WHEN media_type = 'gm' THEN game_table.image
        WHEN media_type = 'mv' THEN NULL
        WHEN media_type = 'tv' THEN show_table.image
    END AS image,
    CASE
        WHEN media_type = 'bk' THEN book_table.title
        WHEN media_type = 'mu' THEN music_table.title
        WHEN media_type = 'gm' THEN game_table.title
        WHEN media_type = 'mv' THEN movie_table.title
        WHEN media_type = 'tv' THEN show_table.title
    END AS title,
    CASE
        WHEN media_type = 'bk' THEN book_table.creator
        WHEN media_type = 'mu' THEN music_table.creator
        WHEN media_type = 'gm' THEN game_table.creator
        WHEN media_type = 'mv' THEN NULL
        WHEN media_type = 'tv' THEN NULL
    END AS creator
    FROM suggest_rand s
    LEFT JOIN (SELECT b.book_id, title, GROUP_CONCAT(author, ' , ') AS creator, image
    FROM Books b
    JOIN Authors a ON b.book_id=a.book_id
    GROUP BY b.book_id) book_table
    ON s.media_id = book_table.book_id AND s.media_type = 'bk'
    LEFT JOIN (SELECT song_id, title, artist AS creator, image  FROM Music) music_table
    ON s.media_id = music_table.song_id AND s.media_type = 'mu'
    LEFT JOIN (SELECT app_id, name AS title, developers AS creator, screenshot AS image FROM Games) game_table
    ON s.media_id = game_table.app_id AND s.media_type = 'gm'
    LEFT JOIN (SELECT movie_id, title FROM Movie) movie_table
    ON s.media_id = movie_table.movie_id AND s.media_type = 'mv'
    LEFT JOIN (SELECT show_id, series_title AS title, image FROM TVShows) show_table
    ON s.media_id = show_table.show_id AND s.media_type = 'tv'
    WHERE row_num2 <= 1
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
  const title = req.query.title ?? "";
  const cast = req.query.cast ?? "";
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
        WHERE cast LIKE '%${cast}%'
      )
      SELECT DISTINCT s.show_id, series_title, image
      FROM TVShows s
      JOIN ShowGenre sg On s.show_id = sg.show_id
      JOIN MediaMoods AS m ON s.show_id = m.media_id
      WHERE s.series_title LIKE '%${title}%'
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

// Route 10: GET /moives
// About: return all movies that match the given search query
// Input param: title, year_min, year_max, genre
// Return: show_id, title
// Genre should be a list of strings concatenated by '|'
const movies = async function (req, res) {
  const title = req.query.title ?? "";
  const cast = req.query.cast ?? "";
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
        WHERE cast LIKE '%${cast}%'
      )
      SELECT m.media_id, title
      FROM Movie mv 
      JOIN MovieGenre mg On mv.movie_id = mg.movie_id
      JOIN MediaMoods AS m ON mv.movie_id = m.media_id
      WHERE mv.title LIKE '%${title}%'
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
      SELECT m.media_id, title, image
      FROM Music mu 
      JOIN MediaMoods AS m ON mu.song_id = m.media_id
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
        AND mu.tag REGEXP '${tagList}'
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

module.exports = {
  random_shows,
  random_books,
  random_games,
  random_movies,
  random_songs,
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
};
