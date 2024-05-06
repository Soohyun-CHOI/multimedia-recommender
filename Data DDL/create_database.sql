CREATE DATABASE MULTIPLAYLIST_DB;

USE MULTIPLAYLIST_DB;

CREATE TABLE Users (user_id VARCHAR(100) NOT NULL, PRIMARY KEY (user_id));

# CREATE INDEX idx_user_id ON Users(user_id);

CREATE TABLE Playlist (playlist_id INT AUTO_INCREMENT NOT NULL, title VARCHAR(50) NOT NULL, public BOOL NOT NULL,
                     user_id user_id VARCHAR(100)NOT NULL, image VARCHAR(500), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                     PRIMARY KEY (playlist_id),
                     FOREIGN KEY (user_id) REFERENCES Users (user_id));
# CREATE INDEX idx_playlist_id ON Playlist(playlist_id);

ALTER TABLE Playlist AUTO_INCREMENT = 100000;

CREATE TABLE CollaboratesOn (user_id VARCHAR(100), playlist_id INT,
                           PRIMARY KEY (user_id, playlist_id),
                           FOREIGN KEY (user_id) REFERENCES Users (user_id),
                           FOREIGN KEY (playlist_id) REFERENCES Playlist (playlist_id));

CREATE TABLE  PlaylistMedia (playlist_id INT, media_id VARCHAR(15),
                           PRIMARY KEY (playlist_id, media_id),
                           FOREIGN KEY (playlist_id) REFERENCES Playlist (playlist_id),
                           FOREIGN KEY (media_id) REFERENCES MediaMoods (media_id));

# Media
CREATE TABLE MediaMoods (
  media_type VARCHAR(2),
  media_id VARCHAR(15),
  christmas FLOAT,
  halloween FLOAT,
  valentine FLOAT,
  celebration FLOAT,
  relaxing FLOAT,
  nature FLOAT,
  industrial FLOAT,
  sunshine FLOAT,
  sad FLOAT,
  happy FLOAT,
  summer FLOAT,
  winter FLOAT,
  sports FLOAT,
  playful FLOAT,
  energetic FLOAT,
  scary FLOAT,
  anger FLOAT,
  optimistic FLOAT,
  adventurous FLOAT,
  learning FLOAT,
  artistic FLOAT,
  science FLOAT,
  cozy FLOAT,
  colorful FLOAT,
  space FLOAT,
  PRIMARY KEY (media_id),
  CHECK (media_type IN ('bk', 'mu', 'gm', 'mv', 'tv'))
);

# CREATE INDEX idx_media_mood_id ON MediaMoods(media_id);

# Types
# Book (bk), Song (mu), Game (gm), Movie (mv), Show (tv)

# Game
CREATE TABLE Games(app_id VARCHAR(15), name VARCHAR(50), release_date VARCHAR(50), developers VARCHAR(100),
                 about_the_game VARCHAR(500), price FLOAT,
                 metacritic_score FLOAT, screenshot VARCHAR(255),
                 PRIMARY KEY (app_id), FOREIGN KEY (app_id) REFERENCES MediaMoods(media_id));

# CREATE INDEX idx_app_id ON Games(app_id);

CREATE TABLE GameCategories (app_id VARCHAR(15), categories VARCHAR(50),
                           PRIMARY KEY (app_id, categories),
                           FOREIGN KEY (app_id) REFERENCES Games (app_id));

CREATE TABLE GameGenre (app_id VARCHAR(15), genre VARCHAR(50),
                      PRIMARY KEY (app_id, genre),
                      FOREIGN KEY (app_id) REFERENCES Games (app_id));

# Music
CREATE TABLE Music (song_id VARCHAR(15), title VARCHAR(100), tag VARCHAR(50), artist VARCHAR(100),
                  year INT, views LONG, lyrics LONGTEXT,
                  PRIMARY KEY (song_id),
                  FOREIGN KEY (song_id) REFERENCES MediaMoods(media_id));

# TV
CREATE TABLE TVShows (show_id VARCHAR(15), series_title VARCHAR(100), release_year INT,
                    end_year INT, runtime INT, rating FLOAT, synopsis VARCHAR(500),
                    PRIMARY KEY (show_id),
                    FOREIGN KEY (show_id) REFERENCES MediaMoods(media_id));

# CREATE INDEX idx_show_id ON TVShows(show_id);

CREATE TABLE ShowGenre (show_id VARCHAR(15), genre VARCHAR (100),
                      PRIMARY KEY (show_id, genre),
                      FOREIGN KEY (show_id) REFERENCES TVShows (show_id));

CREATE TABLE TVCast (show_id VARCHAR(15), cast VARCHAR(255),
                   PRIMARY KEY (show_id, cast),
                   FOREIGN KEY (show_id) REFERENCES TVShows(show_id));

# Movie
CREATE TABLE Movie (movie_id VARCHAR(15), title VARCHAR(255), release_date VARCHAR(255), overview VARCHAR(1000),
                  PRIMARY KEY (movie_id),
                  FOREIGN KEY (movie_id) REFERENCES MediaMoods (media_id));
# CREATE INDEX idx_movie_id ON Movie(movie_id);

CREATE TABLE MovieGenre (movie_id VARCHAR(15), genre VARCHAR(100),
                       PRIMARY KEY (movie_id, genre),
                       FOREIGN KEY (movie_id) REFERENCES Movie(movie_id));

CREATE TABLE MovieCast (movie_id VARCHAR(15), cast VARCHAR(255),
                      PRIMARY KEY (movie_id, cast),
                      FOREIGN KEY (movie_id) REFERENCES Movie (movie_id));

# Book
CREATE TABLE Books (book_id VARCHAR(15), title VARCHAR(255), description VARCHAR(500),
                  image VARCHAR(255), preview_link VARCHAR(255),
                  publisher VARCHAR(255), published_date VARCHAR(20),
                  info_link VARCHAR(255), categories VARCHAR(255),
                  PRIMARY KEY (book_id),
                  FOREIGN KEY (book_id) REFERENCES MediaMoods (media_id));
# CREATE INDEX idx_book_id ON Books(book_id);

CREATE TABLE Authors (book_id VARCHAR(15), author VARCHAR(255),
                    PRIMARY KEY (book_id, author),
                    FOREIGN KEY (book_id) REFERENCES Books (book_id));


CREATE TABLE Books_Combined
   SELECT media_id, media_type, title, description, image,
          preview_link, publisher, published_date, info_link, categories, authors,
          christmas, halloween, valentine, celebration, relaxing,
          nature, industrial, sunshine, sad, happy, summer, winter,
          sports, playful, energetic, scary, anger, optimistic,
          adventurous, learning, artistic, science, cozy, colorful,space
   FROM Books b
   LEFT JOIN MediaMoods AS m ON b.book_id = m.media_id
   LEFT JOIN (
     SELECT book_id, GROUP_CONCAT(DISTINCT author SEPARATOR ', ') AS authors
     FROM Authors a
     GROUP BY book_id) AS au ON au.book_id = b.book_id;
CREATE UNIQUE INDEX bk_index ON Books_Combined(media_id);


CREATE TABLE Music_Combined
   SELECT media_id, media_type, title, tag, artist,
          year, views, lyrics, image,
          christmas, halloween, valentine, celebration, relaxing,
          nature, industrial, sunshine, sad, happy, summer, winter,
          sports, playful, energetic, scary, anger, optimistic,
          adventurous, learning, artistic, science, cozy, colorful,space
   FROM Music mu
   LEFT JOIN MediaMoods AS m ON mu.song_id = m.media_id;
CREATE UNIQUE INDEX mu_index ON Music_Combined(media_id);


CREATE TABLE Movie_Combined
   SELECT media_id, media_type, title, release_date, overview,
          image, cast, genres,
          christmas, halloween, valentine, celebration, relaxing,
          nature, industrial, sunshine, sad, happy, summer, winter,
          sports, playful, energetic, scary, anger, optimistic,
          adventurous, learning, artistic, science, cozy, colorful,space
   FROM Movie mv
   LEFT JOIN MediaMoods AS m ON mv.movie_id = m.media_id
   LEFT JOIN (
     SELECT movie_id, GROUP_CONCAT(DISTINCT cast SEPARATOR ', ') AS cast
     FROM MovieCast
     GROUP BY movie_id) AS mc ON mc.movie_id = mv.movie_id
   LEFT JOIN (
     SELECT movie_id, GROUP_CONCAT(DISTINCT genre SEPARATOR ', ') AS genres
     FROM MovieGenre
     GROUP BY movie_id) AS mg ON mg.movie_id = mv.movie_id;
CREATE UNIQUE INDEX mv_index ON Movie_Combined(media_id);


CREATE TABLE TVShows_Combined
   SELECT media_id, media_type, series_title AS title, release_year, end_year,
          runtime, rating, synopsis, image, cast, genres,
          christmas, halloween, valentine, celebration, relaxing,
          nature, industrial, sunshine, sad, happy, summer, winter,
          sports, playful, energetic, scary, anger, optimistic,
          adventurous, learning, artistic, science, cozy, colorful,space
   FROM TVShows tv
   LEFT JOIN MediaMoods AS m ON tv.show_id = m.media_id
   LEFT JOIN (
     SELECT show_id, GROUP_CONCAT(cast SEPARATOR ', ') AS cast
     FROM TVCast
     GROUP BY show_id) AS sc ON sc.show_id = tv.show_id
   LEFT JOIN (
     SELECT show_id, GROUP_CONCAT(genre SEPARATOR ', ') AS genres
     FROM ShowGenre
     GROUP BY show_id) AS sg ON sg.show_id = tv.show_id;
CREATE UNIQUE INDEX tv_index ON TVShows_Combined(media_id);


CREATE TABLE Game_Combined
   SELECT media_id, media_type, name AS title, release_date, developers, about_the_game,
          price, screenshot AS image, metacritic_score, categories, genres,
          christmas, halloween, valentine, celebration, relaxing,
          nature, industrial, sunshine, sad, happy, summer, winter,
          sports, playful, energetic, scary, anger, optimistic,
          adventurous, learning, artistic, science, cozy, colorful,space
   FROM Games g
   LEFT JOIN MediaMoods AS m ON g.app_id = m.media_id
   LEFT JOIN (
     SELECT app_id, GROUP_CONCAT(genre SEPARATOR ', ') AS genres
     FROM GameGenre
     GROUP BY app_id) AS gg ON gg.app_id = g.app_id
   LEFT JOIN (
     SELECT app_id, GROUP_CONCAT(categories SEPARATOR ', ') AS categories
     FROM GameCategories
     GROUP BY app_id) AS gc ON gc.app_id = g.app_id;
CREATE UNIQUE INDEX gm_index ON Game_Combined(media_id);
