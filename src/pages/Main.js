import News from "../components/News";
import "../assets/css/Main.css";

export default function Main()
{
    return (
        <div className="main-content">
            <h1>🌍 Welcome to Trip Planner! ✈️</h1>
            <p>Our goal is to make trip planning easier for you.</p>
            <p>Feel free to browse the services we offer.</p>

            {/* Maps + time zone */}

            {/* Translator + text-to-speech */}

            <News />
            
            {/* Video search */}
        </div>
    );
}