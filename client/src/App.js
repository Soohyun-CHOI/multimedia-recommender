import React from "react";
import {Routes, Route} from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import PlaylistListPage from "./pages/PlaylistListPage";
import SearchPage from "./pages/SearchPage";


export default function App() {
    return (
        <div className="App">
            <Header/>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/playlists" element={<PlaylistListPage/>}/>
                <Route path="/search" element={<SearchPage/>}/>
            </Routes>
        </div>
    );
}