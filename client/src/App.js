import React from "react";
import {Routes, Route} from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import PlaylistListPage from "./pages/PlaylistListPage";

export default function App() {
    return (
        <div className="App">
            <Header/>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/playlists" element={<PlaylistListPage/>}/>
            </Routes>
        </div>
    );
}