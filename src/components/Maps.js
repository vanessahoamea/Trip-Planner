import React, { Component } from "react";

class PlacesMap extends Component {
    constructor(props) {
        super(props);

        this.state = {
            place: null,
            map: null,
            searchBox: null,
            markers: [],
            timeZone: null,
            currentTime: 0
        };

        this.handleSearchBoxMounted = this.handleSearchBoxMounted.bind(this);
        this.handlePlacesChanged = this.handlePlacesChanged.bind(this);
    }

    componentDidMount() {
        const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.onload = () => {
            this.initMap();
        };

        document.body.appendChild(script);
    }

    initMap() {
        const map = new window.google.maps.Map(document.getElementById('map'), {
            center: { lat: 37.7749, lng: -122.4194 },
            zoom: 13,
        });

        const searchBox = new window.google.maps.places.SearchBox(
            document.getElementById('search-box')
        );

        searchBox.addListener('places_changed', () =>
            this.handlePlacesChanged(searchBox, map)
        );

        this.setState({ map, searchBox });
    }

    handleSearchBoxMounted(searchBox) {
        this.setState({ searchBox });
    }

    handlePlacesChanged(searchBox, map) {
        const places = searchBox.getPlaces();
        const markers = [];

        places.forEach((place) => {
            markers.push(
                new window.google.maps.Marker({
                    map,
                    position: place.geometry.location,
                })
            );
        });

        this.setState({ markers });

        // Get the first result and center the map on it
        if (places.length > 0) {
            const firstPlace = places[0];
            map.setCenter(firstPlace.geometry.location);
            map.setZoom(15);
            this.setState({ place: places[0] });
        }
    }

    componentDidUpdate(_, prevState) {
        // Get current location's time zone
        if(this.state.place == null)
            return;

        const lat = this.state.place.geometry.location.lat();
        const lng = this.state.place.geometry.location.lng();

        if (prevState.place == null || lat != prevState.place.geometry.location.lat() || lng != prevState.place.geometry.location.lng()) {
            fetch(`https://cclab3-381904.ew.r.appspot.com/timeZone?lat=${lat}&lon=${lng}`)
            .then((res) => res.json())
            .then((res) => {
                const today = new Date();
                const timestamp = today.getTime() / 1000 + today.getTimezoneOffset() * 60;
                const placeTime = timestamp * 1000 + res.dstOffset * 1000 + res.rawOffset * 1000;

                this.setState({ currentTime: placeTime, timeZone: res.timeZoneName });
            })
            .catch((err) => console.log(err));
        }
    }
    
    getFormattedDate()
    {
        const date = new Date(this.state.currentTime);
        const hours = date.getHours();
        const minutes = "0" + date.getMinutes();
        const seconds = "0" + date.getSeconds();

        const formattedTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
        return formattedTime;
    }

    render() {
        return (
            <>
                <div className="container">
                    <h2>Look up a place on Google Maps</h2>
                    <input
                        id="search-box"
                        type="text"
                        placeholder="Enter place name"
                        style={{
                            width: "70vw",
                            marginBottom: "5px"
                        }}
                    />
                </div>
                
                <div id="map"></div>

                {
                    this.state.place && this.state.timeZone &&
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                        <p>Viewing: <b>{this.state.place.name}</b></p>
                        <p>Using {this.state.timeZone}</p>
                        <p>Current time is {this.getFormattedDate()}</p>
                    </div>
                }
            </>
        );
    }
}

export default PlacesMap;