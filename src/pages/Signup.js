import { Link } from "react-router-dom";
import "../assets/css/Auth.css";

export default function Signup()
{
    function createAccount()
    {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if(!email || !password)
        {
            alert("All fields are required!");
            return;
        }

        const userDetails = {
            "email": email,
            "password": password,
        };
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userDetails)
        };

        fetch("https://cclab4.azurewebsites.net/add-user", options)
        .then(resp => {
            if(resp.ok)
                return resp.json();
            return resp.json().then(response => { throw new Error(response.message) });
        })
        .then(_ => alert("Successfully created account."))
        .catch(err => alert(err.message));
    }

    return (
        <form className="authentication-form">
            <h1>Sign up to get access to the app's features</h1>

            <label htmlFor="email">E-mail</label>
            <input type="text" name="email" id="email"></input>

            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password"></input>

            <button type="button" className="main-button" onClick={createAccount}>Create account</button>
            <p style={{marginTop: "20px"}}>Already have an account? <Link to="/login">Log in</Link></p>
        </form>
    );
}