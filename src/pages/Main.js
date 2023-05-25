import { useEffect } from "react";
import News from "../components/News";
import "../assets/css/Main.css";

export default function Main()
{
    useEffect(() => {
        document.getElementsByClassName("default")[0].click();
    }, []);

    function switchTab(event, tabId)
    {
        [...document.querySelectorAll(".tab-content")].map((element) => {
            element.style.display = "none";
        });
        document.getElementById(tabId).style.display = "block";

        [...document.querySelectorAll(".tab-button")].map((element) => {
            element.className = element.className.split(" active")[0];
        })
        event.target.className += " active";
    }

    return (
        <div className="main-content">
            <div className="top-text">
                <h1>🌍 Welcome to Trip Planner! ✈️</h1>
                <p>Our goal is to make trip planning easier for you.</p>
                <p>Feel free to browse the services we offer.</p>
            </div>

            <div className="tab">
                <button className="tab-button default" onClick={(e) => switchTab(e, "maps")}>Maps</button>
                <button className="tab-button" onClick={(e) => switchTab(e, "translator")}>Translator</button>
                <button className="tab-button" onClick={(e) => switchTab(e, "news")}>News</button>
                <button className="tab-button" onClick={(e) => switchTab(e, "videos")}>Videos</button>
            </div>

            <div id="maps" className="tab-content">
                {/* Maps + time zone */}
                TBA 1
            </div>

            <div id="translator" className="tab-content">
                {/* Translator + text-to-speech */}
                TBA 2
            </div>

            <div id="news" className="tab-content">
                <News />
            </div>
            
            <div id="videos" className="tab-content">
                {/* Video search */}
                TBA 4
            </div>
        </div>
    );
}