import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import Banner from "../components/Banner";

function MediaDetailPage() {
    const params = useParams();
    const mediaId = params.mediaId;

    return (
        <>
            <Banner/>
            <div>{mediaId}</div>

        </>
    )
}

export default MediaDetailPage;