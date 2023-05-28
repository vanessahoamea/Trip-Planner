import { useRef, useState } from "react";

export default function Videos()
{
    const refVideoParam = useRef(null);
    const [videoData, setVideoData] = useState([]);

    function getVideos()
    {
        fetch(`https://cclab4.azurewebsites.net/videoSearch?term=${refVideoParam.current.value}`)
        .then(resp => {
            if(resp.ok)
                return resp.json();
            return resp.json().then(response => { throw new Error(response.message) });
        })
        .then(resp => setVideoData(resp.data))
        .catch(err => console.log(err));
    };

    return (
        <>
            <div className="container">
                <h2>Look up videos about your area of interest</h2>
                <div>
                    <input
                        ref={refVideoParam}
                        type="text"
                        placeholder="Enter keywords"
                    />
                    <button className="main-button" onClick={getVideos}>Search</button>
                </div>
            </div>

            {videoData &&
            <div className="videos">
                {
                    videoData.map((url, index) => {
                        return (
                            <iframe className="singularVideo" width="420" height="230"
                                key={index}
                                sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-presentation"
                                src={`https://www.youtube.com/embed/${url}`}>
                            </iframe>
                        );
                    })
                }
            </div>}
        </>
    );
}