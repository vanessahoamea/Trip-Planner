import { Link } from "react-router-dom";
import "../assets/css/Navbar.css";

export default function Navbar(props)
{
    return (
        <nav className="navbar">
            <h1><Link to="/" className="navbar-link">Trip Planner</Link></h1>

            <div className="navbar-right">
                {props.jwt && 
                <>
                    <Link to="/home" className="navbar-link">My Trips</Link>
                    <button className="navbar-button" onClick={props.handleLogout}>Log out</button>
                </>
                }
                {!props.jwt && 
                    <button className="navbar-button" onClick={() => props.redirect("/login")}>
                        Sign in
                    </button>
                }
            </div>
        </nav>
    );
}