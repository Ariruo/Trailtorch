import React, { useState, useEffect } from "react";
import Map, { Marker, Popup, Source, Layer, NavigationControl,GeolocateControl } from "react-map-gl";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Coordinatecabin from "./Coordinatescabin";
import getUserCoordinates from "../service/getUserCoordinates";
import SearchBar from "./Searchbar";
import SearchResultList from "./SearchResultList";
import Button from "./Button";
import axios from "axios";




export default function Mapp() {

const [originalData , setOriginaldata] = useState([]);
const [FilteredData, setFilteredData] = useState([]);  
const [selectedPark, setSelectedPark] = useState(null);
const [input, setInput] = useState("");
const [showSearchResults, setShowSearchResults] = useState(false);
const [hoveredPark, setHoveredPark] = useState(null);
const [viewState, setViewState] = useState({
  longitude: 23.72018736381,
  latitude: 68.342938678895,
  zoom: 10,
})

useEffect(() => {
  axios.get("http://localhost:9000/api/allcabinspoints")
    .then((response) => {
      // Assuming the fetched data is in GeoJSON format and contains features
      const parks = response.data.features || [];
      setFilteredData(parks);
      setOriginaldata(parks);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}, []);


// useEffect(() => {
//   if (selectedPark) {
//     setViewState({
//       longitude: selectedPark.geometry.coordinates[1],
//       latitude: selectedPark.geometry.coordinates[0],
//       zoom: 10,
//     });
//   }
// }, [selectedPark]);
useEffect(() => {
  console.log("Updated viewState:", viewState);
}, [viewState]);

useEffect(() => {
  getUserCoordinates().then((coordinates) => {
    setViewState({
      longitude: coordinates.longitude,
      latitude: coordinates.latitude,
      zoom: 13,
    });
  });
}, []);

const handleMarkerHover = (event, park) => {
  event.preventDefault();
  setHoveredPark(park);
};

const handleMarkerLeave = () => {
  setHoveredPark(null);
};

const handleFindClosestPark = () => {
  if (FilteredData.length > 0) {
    const closestPark = FilteredData[0]; // Assuming results are sorted by proximity
    setSelectedPark(closestPark);
    setInput("");
    setShowSearchResults(false);
    setViewState({
      longitude: closestPark.geometry.coordinates[1], // Update view state only on search
      latitude: closestPark.geometry.coordinates[0],
      zoom: 10,
    });
   console.log(viewState)
  }
};



  const closePopup = () => {
    setSelectedPark(null);
  };

  const handleResultClick = (park) => {
    
    
    console.log(park);
    setSelectedPark(park);
    setInput("");
    setShowSearchResults(false);
    setViewState({
      longitude: park.geometry.coordinates[1],
      latitude: park.geometry.coordinates[0],
      zoom: 10,
    });
  };

 
  return (
    <div>
 


      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        style={{ width: "99vw", height: "90vh", position: "relative", top: 0, left: 0 }}
        >


<SearchBar setResults={setFilteredData} setInput={setInput} input={input} setShowSearchResults={setShowSearchResults} />
<Button onClick={handleFindClosestPark}>Hae</Button>
 {showSearchResults && FilteredData && FilteredData.length > 0 && <SearchResultList results={FilteredData} onResultClick={handleResultClick} />}
 
  {originalData.map((park, index) => (
  <Marker
  key={index}
    latitude={park.geometry.coordinates[0]}
    longitude={park.geometry.coordinates[1]}
    offsetTop={-20}
  >
     <button
            className=""
            onMouseEnter={(e) => handleMarkerHover(e, park)}
            onMouseLeave={handleMarkerLeave}
            onClick={(e) => {
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

       {hoveredPark && (
        <div className="custom-popup absolute z-10 bg-white border p-4">
   
          <div>{hoveredPark.properties.name}</div>
          <div>{hoveredPark.properties.tyyppi}</div>
       </div>
      )}
 
 {selectedPark && (
            <Popup 
            latitude={selectedPark.geometry.coordinates[0]}
            longitude={selectedPark.geometry.coordinates[1]}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => {
              setSelectedPark(null);
            
            }}
          
            >
           <h2 className="text-lg font-semibold">{selectedPark.properties.name}</h2>
            <p className="mt-1"> {selectedPark.properties.tyyppi}</p>
            <p className="mt-1"> Maakunta: {selectedPark.properties.maakunta}</p>
            <Coordinatecabin
            latitude={selectedPark.geometry.coordinates[0]}
            longitude={selectedPark.geometry.coordinates[1]}
            />
          </Popup>)}


    
       
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