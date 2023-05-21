import { Link } from "react-router-dom";
import "../assets/css/Auth.css";

export default function Login(props)
{
    function loginUser()
    {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        props.handleLogin(email, password);
    }

    return (
        <form className="authentication-form">
            <h1>Sign in to your account to continue</h1>

            <label htmlFor="email">E-mail</label>
            <input type="text" name="email" id="email"></input>

            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password"></input>

            <button type="button" className="main-button" onClick={loginUser}>Sign in</button>
            <p style={{marginTop: "20px"}}>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </form>
    );
}