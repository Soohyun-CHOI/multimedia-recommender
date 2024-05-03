import React from "react";
import {Routes, Route} from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import PlaylistListPage from "./pages/PlaylistListPage";
import LoginPage from "./pages/LoginPage";
import FiltersPage from "./pages/FiltersPage";
import SuggestionPage from "./pages/SuggestionPage";

export default function App() {
    return (
        <div className="App">
            <Header/>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/playlists" element={<PlaylistListPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/filters" element={<FiltersPage/>}/>
                <Route path="/suggestions" element={<SuggestionPage/>}/>
            </Routes>
        </div>
    );
}