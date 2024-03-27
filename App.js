import * as React from 'react';
import {useState} from 'react';
import Map,{Marker, Popup}  from 'react-map-gl';
import {Room , Star} from "@material-ui/icons";
import "./app.css";
import axios from "axios";
import {format} from "timeago.js";
import Register from './components/Register';
import Login from './components/Login';


function App() {
  const myStorage =window.localStorage;
  const [currentUser , setCurrentUser] = useState(myStorage.getItem("user"));
  const [pins,setPins] = useState([]);
  const [currentPlaceId ,setCurrentPlaceId] =useState(null);
  const [newPlace ,setNewPlace] =useState(null);
  const [title ,setTitle] =useState(null);
  const [desc ,setDesc] =useState(null);
  const [rating ,setRating] =useState(0);
  const [showRegister, setShowRegister] =useState(false);
  const [showLogin, setShowLogin] =useState(false);
  
  React.useEffect(()=>{
    const getPins = async()=>{
      try{
        const res = await axios.get("/pins");
        setPins(res.data);
      }catch(err){
        console.log(err);
      }
    };
    getPins()
    
  },[]);

  const handleMarkerClick =(id)=>{
    setCurrentPlaceId(id)

  };

  const handleAddClick = (e) => {
    
    if (e.lngLat && typeof e.lngLat === 'object' && 'lat' in e.lngLat && 'lng' in e.lngLat) {
      const { lat, lng: long } = e.lngLat;
      console.log('New Latitude:', lat);
      console.log('New Longitude:', long);
  
      setNewPlace({
        lat,
        long,
      });
    }
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();
    const newPin={
      username:currentUser,
      title,
      desc,
      rating,
      lat:newPlace.lat,
      long:newPlace.long,
    };
    try{
      const res = await axios.post("/pins",newPin);
      setPins([...pins,res.data]);
      setNewPlace(null);

    }catch(err){
      console.log(err);
    }
  };

  const handleLogout = () =>{
    myStorage.removeItem("user");
    setCurrentUser(null);
  }
  
  
  return (
    <Map
      mapboxAccessToken={process.env.REACT_APP_MAPBOX}
      initialViewState={{
        longitude: 17,
        latitude: 46,
        zoom: 4,
      }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      onDblClick={handleAddClick}
    > 
    {pins.map(p=>(
<>
   
      <Marker 
      longitude={p.long}
      latitude={p.lat} 
      offsetLeft={-20}
      offsetTop={-10}>
      <Room  style={{
            fontSize: '24px',  // Adjust the size as needed
            color: p.username === currentUser?"red":"blue",      // Set the color to red
            cursor:"pointer"
          }}
            onClick={()=>handleMarkerClick(p._id)}
          />
      </Marker>
      {p._id === currentPlaceId && (
      <Popup 
      longitude={p.long} 
      latitude={p.lat}
      closeButton={true}
      closeOnClick={false}
      anchor="left"
      onClose={()=>setCurrentPlaceId(null)}
        >
       <div className="card">
        <label>Place</label>
        <h4 className="place">{p.title}</h4>
        <label>Review</label>
        <p className="desc">{p.desc}</p>
        <label>Rating</label>
        <div className="stars">
          {Array(p.rating).fill(<Star className="star" />)}
        </div>
        <label>Information</label>
        <span className="username">Created by <b>{p.username}</b></span>
        <span className="date">{format(p.createdAt)}</span>
       </div> 
      </Popup>
    )}
      </>
      ))}
     {newPlace &&(
      <Popup 
      longitude={newPlace.long} 
      latitude={newPlace.lat}
      closeButton={true}
      closeOnClick={false}
      anchor="left"
      onClose={() => setNewPlace(null)}
      >
      <div>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input placeholder="Enter a title"
            onChange={(e)=>setTitle(e.target.value)}
          />
          <label>Review</label>
          <textarea placeholder="Say us something about this place"
            onChange={(e)=>setDesc(e.target.value)}
          />
          <label>Rating</label>
          <select onChange={(e)=>setRating(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <button className="submitButton" type="submit">Add Pin</button>
        </form>
      </div>
      </Popup> 
      )} 
      {currentUser ?(<button className="button logout" onClick={handleLogout}>Log Out</button>):(<div className="buttons">
      <button className="button login" onClick={()=>setShowLogin(true)}>Login</button>
      <button className="button register" onClick={()=>setShowRegister(true)}>Register</button>
      </div>)}

      {showRegister && <Register setShowRegister={setShowRegister}/> }
      {showLogin && 
      <Login setShowLogin={setShowLogin}
       myStorage={myStorage}
       setCurrentUser={setCurrentUser}
       />}
      
    </Map>
  );
}

export default App;
