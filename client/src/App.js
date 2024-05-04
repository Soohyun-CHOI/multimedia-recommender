import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import PlaylistListPage from "./pages/PlaylistListPage";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";
import FiltersPage from "./pages/FiltersPage";
import SuggestionPage from "./pages/SuggestionPage";
import AccountInfoPage from "./pages/AccountInfoPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";

export default function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/playlists" element={<PlaylistListPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/filters" element={<FiltersPage />} />
        <Route path="/suggestions" element={<SuggestionPage />} />
        <Route path="/account" element={<AccountInfoPage />} />
        <Route path="/playlist/:playlist_id" element={<PlaylistDetailPage/>}/>
      </Routes>
    </div>
  );
}
