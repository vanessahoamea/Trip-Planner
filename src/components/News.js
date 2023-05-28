import { useRef, useState } from "react";

export default function News()
{
    const refSearchParam = useRef(null);
    const [news, setNews] = useState(null);

    function getNews()
    {
        fetch(`https://cclab4.azurewebsites.net/news?term=${refSearchParam.current.value}`)
        .then(resp => {
            if(resp.ok)
                return resp.json();
            return resp.json().then(response => { throw new Error(response.message) });
        })
        .then(resp => setNews(resp.data))
        .catch(err => console.log(err));
    }

    return (
        <>
            <div className="container">
                <h2>Check out recent news in your area of interest</h2>
                <div>
                    <input
                        ref={refSearchParam}
                        type="text"
                        placeholder="Enter place name"
                    />
                    <button className="main-button" onClick={getNews}>Search</button>
                </div>
            </div>

            {news && 
            <div className="news">
                {news.map((article, index) => 
                    <div className="article" key={index}>
                        <h3><a href={`${article.url}`}>{article.title}</a></h3>
                        <p>{article.description} ...</p>
                    </div>
                )}
                {news.length == 0 && "Could not find any relevant news articles."}
            </div>}
        </>
    );
}