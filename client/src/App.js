import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import PlaylistListPage from "./pages/PlaylistListPage";
import LoginPage from "./pages/LoginPage";
import AccountInfoPage from "./pages/AccountInfoPage";

export default function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/playlists" element={<PlaylistListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountInfoPage />} />
      </Routes>
    </div>
  );
}
