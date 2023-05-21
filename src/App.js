import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Main from "./pages/Main";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import "./assets/css/App.css";

export default function App()
{
    const [jwt, setJwt] = useState(() => {
        const savedValue = localStorage.getItem("jwt");
        return JSON.parse(savedValue) || "";
    });
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        localStorage.setItem("jwt", JSON.stringify(jwt));
    }, [jwt]);

    function addEvent(event)
    {
        if(!event.name || !event.startDate || !event.endDate)
        {
            alert("All fields are required!");
            return;
        }
        
        const bearerToken = localStorage.getItem("jwt").replaceAll("\"", "");
        const tripDetails = {
            "name": event.name,
            "start_date": event.startDate,
            "end_date": event.endDate
        };
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + bearerToken
            },
            body: JSON.stringify(tripDetails)
        };

        fetch("https://cclab4.azurewebsites.net/add-trip", options)
        .then(resp => {
            if(resp.ok)
                return resp.json();
            return resp.json().then(response => { throw new Error(response.message) });
        })
        .then(_ => setTrips((oldTrips) => [...oldTrips, tripDetails]))
        .catch(err => alert(err.message));
    };

    function handleLogin(email, password)
    {
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

        fetch("https://cclab4.azurewebsites.net/login", options)
        .then(resp => {
            if(resp.ok)
                return resp.json();
            return resp.json().then(response => { throw new Error(response.message) });
        })
        .then(resp => {
            setJwt(resp["jwt"]);
            localStorage.setItem("jwt", jwt);
        })
        .catch(err => alert(err.message));
    }

    function handleLogout()
    {
        setJwt("");
        localStorage.removeItem("jwt");
    }

    const navigate = useNavigate(); 
    function redirect(path)
    {
        navigate(path);
    }

    return (
        <>
            <Navbar jwt={jwt} handleLogout={handleLogout} redirect={redirect} />

            <Routes>
                {/* browse services */}
                <Route path="/" element={<Main />} />

                {/* view and create your own trips */}
                <Route path="/home" element={
                    <PrivateRoute type="profile" jwt={jwt}>
                        <Home trips={trips} setTrips={setTrips} addEvent={addEvent} />
                    </PrivateRoute>
                } />

                {/* authenticate */}
                <Route path="/login" element={
                    <PrivateRoute type="auth" jwt={jwt}>
                        <Login handleLogin={handleLogin} />
                    </PrivateRoute>
                } />

                <Route path="/signup" element={
                    <PrivateRoute type="auth" jwt={jwt}>
                        <Signup />
                    </PrivateRoute>
                } />
            </Routes>
        </>
    );
}