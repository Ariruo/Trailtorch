import React, { useState, useEffect } from "react";
import Map, { Marker, Popup, Source, Layer, NavigationControl,GeolocateControl } from "react-map-gl";
import * as tupaData from '../../assets/tupadata.json';
import hetta from '../../assets/hetta'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Coordinatecabin from "./Coordinatescabin";
import 'mapbox-gl/dist/mapbox-gl.css';
import iso_karhunkierros from "../../assets/iso_karhunkierros";

import getUserCoordinates from "../service/getUserCoordinates";
import SearchBar from "./Searchbar";
import SearchResultList from "./SearchResultList";
import Button from "./Button";



export default function Mapp() {

const [results, setResults] = useState([]);  
const [selectedPark, setSelectedPark] = useState(null);

const [viewState, setViewState] = useState({
  longitude: 23.72018736381,
  latitude: 68.342938678895,
  zoom: 10,
})


useEffect(() => {
  if (selectedPark) {
    setViewState({
      longitude: selectedPark.geometry.coordinates[0],
      latitude: selectedPark.geometry.coordinates[1],
      zoom: 10,
    });
  }
}, [selectedPark]);

useEffect(() => {
  getUserCoordinates().then((coordinates) => {
    setViewState({
      longitude: coordinates.longitude,
      latitude: coordinates.latitude,
      zoom: 13,
    });
  });
}, []);

const handleFindClosestPark = () => {
  if (results.length > 0) {
    const closestPark = results[0]; // Assuming results are sorted by proximity
    setSelectedPark(closestPark);
    console.log(closestPark);
  }
};



  const closePopup = () => {
    setSelectedPark(null);
  };

  const handleResultClick = (park) => {
    setSelectedPark(park);
  };

 
  return (
    <div>
 


      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        
        mapStyle="mapbox://styles/ariru/cll6qcd1o00nd01pd9r1x0bwi"
        style={{ width: "99vw", height: "90vh", position: "relative", top: 0, left: 0 }}
        >


<SearchBar setResults={setResults} />
 <Button onClick={handleFindClosestPark}>Hae</Button>
 {results && results.length > 0 && <SearchResultList results={results} onResultClick={handleResultClick} />}
 
 

<Source id="hettadata" type="geojson" data={hetta}>
         <Layer
          id="hettapoint"
          type="circle"
          paint={{
            'circle-radius': 2,
            'circle-color': 'black'
          }}/>
      </Source>

      <Source id="karhunkierrosdata" type="geojson" data={iso_karhunkierros}>
         <Layer
          id="karhunkierrospoint"
          type="circle"
          paint={{
            'circle-radius': 2,
            'circle-color': '#007cbf'
          }}/>
      </Source>

{tupaData.features.map(park => (
  <Marker
    key={park.properties.TUPA_ID}
    latitude={park.geometry.coordinates[1]}
    longitude={park.geometry.coordinates[0]}
    offsetTop={-20}
  >
     <button
    className=""
  
    onClick={e => {
      e.preventDefault();
      setSelectedPark(park);
    }}
  >
    <img
      src="/cottage.svg"
      alt="cottage icon"
      className={`w-4 h-4 `}
    />
   
    </button>
    
    </Marker>
    ))}
 
 {selectedPark && (
          <div className="custom-popup absolute z-10 bg-white border p-4">
            <button className="close-button" onClick={closePopup}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
            <h2 className="text-lg font-semibold">{selectedPark.properties.NAME}</h2>
            <p className="mt-1">Varusteet: {selectedPark.properties.ACCESSORIES}</p>
          
            <Coordinatecabin 
            latitude={selectedPark.geometry.coordinates[1]} 
            longitude={selectedPark.geometry.coordinates[0]}
          />
          </div>
        )}
        <NavigationControl 
        position="bottom-right"
        showCompass={true}
        visualizePitch={true}
        showZoom={true}
        
         />
        <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        showUserHeading={true}
        showAccuracyCircle={false}
        showUserLocation={true}
        
        
      />
  </Map>
  

  

    </div>
  );
}