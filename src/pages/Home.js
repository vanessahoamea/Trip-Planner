import { useEffect, useState } from "react";
import Trip from "../components/Trip";
import "../assets/css/Home.css";

export default function Home(props)
{
    const [tripDetails, setTripDetails] = useState({});

    useEffect(() => {
        const bearerToken = localStorage.getItem("jwt").replaceAll("\"", "");
        const options = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + bearerToken
            }
        };

        fetch("https://cclab4.azurewebsites.net/trips", options)
        .then(resp => {
            if(resp.ok)
                return resp.json();
            return resp.json().then(response => { throw new Error(response.message) });
        })
        .then(resp => props.setTrips(resp["data"]))
        .catch(err => alert(err));
    }, []);

    function handleChange(event) {
        setTripDetails((oldTripDetails) => {
            return { ...oldTripDetails, [event.target.id]: event.target.value }
        });
    }

    function saveEvent() {
        props.addEvent(tripDetails);
        alert("Saved trip details to profile.");
    }

    return (
        <div className="main-content">
            <h2>Plan a trip</h2>
            <form className="trip-form">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Event name" onChange={handleChange} />

                <label htmlFor="startDate">Start date</label>
                <input type="date" id="startDate" onChange={handleChange} />

                <label htmlFor="endDate">End date</label>
                <input type="date" id="endDate" onChange={handleChange} />
            </form>
            <button className="main-button" onClick={saveEvent}>Save trip</button>

            <h2>Trips you've planned</h2>
            <div className="trips-container">
            {
                props.trips.length > 0 ? props.trips.map((trip, index) => <Trip 
                    key={index}
                    name={trip.name}
                    startDate={trip.start_date}
                    endDate={trip.end_date}
                    class={index % 5 + 1}
                    />
                ) : <p>You have not planned any trips yet.</p>
            }
            </div>
        </div>
    );
}