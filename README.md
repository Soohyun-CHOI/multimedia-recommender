# THEMEDIA

Our application, THEMEDIA,  is a multi-media playlist generator. Unlike traditional playlist generators that focus on a single type of media, our platform suggests a collection of different media consisting of games, music, movies, TV shows, and books. Suggested media are tailored to user-selected keywords or "moods." For example, users can select moods  like "cheerful" and "summer," and our generator will curate a selection of media, such as upbeat music and movies filmed on a sunny day, that reflect the chosen moods.

The main motivation of our product is to provide users with a more dynamic inspiration on how to plan for an event or spend their day. Existing platforms like YouTube and Spotify offer playlist generators that consist of only one type of media. However, a multi-media playlist can be useful for individuals planning a themed event or seeking a multi-sensory experience. 

## Application Features
- Create Playlist
  - Registered users can create, edit, save, and delete personalized playlists
  - Users can set a playlist’s title and add media to their playlist
  - Every playlist has a representative mood tag, which is automatically derived from the mood scores of the included media
    
- Collaborate on Playlist
  - Users can invite others to collaborate on a playlist (playlist creators cannot designate themselves as collaborators)
  - Users can see all the collaborators for a given playlist
  - Collaborators can edit the playlist but cannot delete it
    
- Media Suggestion
  - Users can select one or more moods for their playlist, and our application will auto generate a random selection of media that score high on the specific mood
  - Users can request more media suggestion for each media type
    
- Searchable Media
  - Through a search bar, users can find media using titles and creator names (e.g., movie directors, game developers, book authors, and TV show producers)
  - Users can filter for specific media using:
    - Mood Score Filters: media can be filtered based on mood scores, allowing users to view only media exceeding specific mood score thresholds
    - Additional Filters: users can apply filters based on various criteria, such as movie genres or release years, with the interface tailored to each filter category

- User Authentication
  - Accessibility Control: enforces access restrictions to pages or buttons on login credentials
  - Social Authentication: enables login via social media platforms like Google and Twitter


## Architecture
We host our database in AWS, and use MySQL as our database management system. We use DataGrip to upload, view, and query our database. Our backend is powered by Node.js with Express, and on the frontend, we use React.js and SCSS. We have used Google Colab for data processing and mood score calculation. 

## Data
- Movies Dataset:
  - A dataset containing information on movies released on or before July 2017. Attributes include but are not limited to movie title, release date, overview, and cast.
  - https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset?select=movies_metadata.csv
  - Pre-processing: Filtered initial data files for relevant attribute columns. Created a method to parse the cast and genre information using a combination of regex and json loads. Created 3 files for main movie data, movie cast, and movie genre.
  - Summary statistics:
    - 83.324 mb, 45466 rows x 24 attributes
    - Top five release date: 2014, 2015, 2013, 2012, 2011
    - Top genre: Drama, comedy, documentary, romance

- TV Shows Dataset:
  - Information on TV shows and web series scraped from IMDB. Attributes include series title, release year, synopsis, runtime, rating, genre, and cast.
  - https://www.kaggle.com/datasets/muralidharbhusal/50000-imdb-tv-and-web-series
  - Data pre-processing: Filtered initial data files for relevant attribute columns. Generated an id column for media identification. Split year column into release year and end year columns. Processed runtime column into a number. Created 3 files for main show data, show cast, and show genre.
  - Summary statistics:
    - 33.3 mb, 48,700 rows x 7 attributes
    - Top five genre: action, adventure, drama, crime, mystery
    - Top five release years: 2022, 2023, 2020, 2005, 2019

- Music Dataset:
  - Songs with lyrics scraped from Genius including the native language of the song. Key attributes include tags and lyrics. 
  - https://www.kaggle.com/datasets/carlosgdcj/genius-song-lyrics-with-language-information 
  - Data pre-processing: Filtered initial data files for relevant attribute columns. Removed all non-english songs as specified by the dataset. Filtered songs to include only the top 200,000 songs by views. 
  - Summary statistics:
    - 15,119 mb, ~5 million rows x 11 attributes
    - Top song genre: pop, rap, rock, R&B, miscellaneous
    - Top five languages: English, Spanish, French, Portuguese, Russian

- Book Dataset:
  - Dataset of books sold on Amazon with reviews from 1996 to 2014. Key attributes include description and categories.
  - https://www.kaggle.com/datasets/mohamedbakhet/amazon-books-reviews?select=books_data.csv
  - Data pre-processing: Filtered initial data files for relevant attribute columns. Generated an id column for media identification. Created 2 files for main book data and book authors.
  - Summary statistics:
    - 308 mb, ~212,000 rows x 10 attributes
    - Top five categories: fiction, religion, history, juvenile fiction, biography/autobiography
    - Top five published year: 2000, 1999, 2004, 2002, 2003

- Games Dataset:
  - Parsed data containing information on video games from Steam. Key attributes for categorization analysis are “about the game,” reviews, notes, categories, genres, and tags.
  - https://www.kaggle.com/datasets/fronkongames/steam-games-dataset (genres) https://www.kaggle.com/datasets/danieliusv/steam-games-genres 
  - Data pre-processing: Filtered initial data files for relevant attribute columns. Created 3 files for main games data, game categories, and game genres.
  - Summary statistics
    - 397 mb, 85000 rows x 39 attributes
    - Top five release year: 2023, 2022, 2021, 2020, 2018
    - Top five genre: indie, casual, action, casual, hidden object
