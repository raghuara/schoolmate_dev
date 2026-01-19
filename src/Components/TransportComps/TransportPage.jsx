// import React, { useRef, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   Divider,
//   List,
//   ListItem,
//   ListItemText
// } from "@mui/material";
// import {
//   GoogleMap,
//   LoadScript,
//   Autocomplete,
//   DirectionsRenderer,
//   Marker
// } from "@react-google-maps/api";

// const mapContainerStyle = {
//   width: "100%",
//   height: "450px",
// };

// const center = {
//   lat: 10.7905,
//   lng: 79.1378, // Thanjavur default
// };

// export default function TransportPage() {
//   const startRef = useRef(null);
//   const endRef = useRef(null);

//   const [startPoint, setStartPoint] = useState(null);
//   const [endPoint, setEndPoint] = useState(null);
//   const [stops, setStops] = useState([]);
//   const [directionsData, setDirectionsData] = useState(null);

//   const [routeSummary, setRouteSummary] = useState({
//     totalDistanceKm: 0,
//     totalDurationMin: 0,
//     stopWiseDistance: [],
//   });

//   // 📍 Add stop by clicking on map
//   const handleMapClick = (e) => {
//     setStops((prev) => [
//       ...prev,
//       {
//         lat: e.latLng.lat(),
//         lng: e.latLng.lng(),
//       },
//     ]);
//   };

//   const calculateRoute = () => {
//     if (!startPoint || !endPoint) return;

//     const directionsService = new window.google.maps.DirectionsService();

//     directionsService.route(
//       {
//         origin: startPoint,
//         destination: endPoint,
//         waypoints: stops.map((s) => ({
//           location: { lat: s.lat, lng: s.lng },
//           stopover: true,
//         })),
//         travelMode: window.google.maps.TravelMode.DRIVING,
//       },
//       (result, status) => {
//         if (status === "OK") {
//           setDirectionsData(result);
//           calculateSummary(result);
//         }
//       }
//     );
//   };

//   // 📊 Distance & duration summary
//   const calculateSummary = (result) => {
//     let totalKm = 0;
//     let totalMin = 0;
//     let stopWise = [];

//     result.routes[0].legs.forEach((leg, i) => {
//       const km = leg.distance.value / 1000;
//       const min = leg.duration.value / 60;

//       totalKm += km;
//       totalMin += min;

//       stopWise.push({
//         from: leg.start_address,
//         to: leg.end_address,
//         km: km.toFixed(2),
//         min: min.toFixed(1),
//       });
//     });

//     setRouteSummary({
//       totalDistanceKm: totalKm.toFixed(2),
//       totalDurationMin: totalMin.toFixed(1),
//       stopWiseDistance: stopWise,
//     });
//   };

//   return (
//     <LoadScript
//       googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
//       libraries={["places"]}
//     >
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6" mb={2}>
//           Transport Route Planning
//         </Typography>

//         {/* 🔍 Start & End */}
//         <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
//           <Autocomplete
//             onLoad={(ref) => (startRef.current = ref)}
//             onPlaceChanged={() => {
//               const place = startRef.current.getPlace();
//               setStartPoint({
//                 lat: place.geometry.location.lat(),
//                 lng: place.geometry.location.lng(),
//               });
//             }}
//           >
//             <input
//               placeholder="Start Location"
//               style={{ width: 250, height: 36, padding: 8 }}
//             />
//           </Autocomplete>

//           <Autocomplete
//             onLoad={(ref) => (endRef.current = ref)}
//             onPlaceChanged={() => {
//               const place = endRef.current.getPlace();
//               setEndPoint({
//                 lat: place.geometry.location.lat(),
//                 lng: place.geometry.location.lng(),
//               });
//             }}
//           >
//             <input
//               placeholder="End Location"
//               style={{ width: 250, height: 36, padding: 8 }}
//             />
//           </Autocomplete>

//           <Button variant="contained" onClick={calculateRoute}>
//             Route Preview
//           </Button>
//         </Box>

//         {/* 🗺️ Map */}
//         <GoogleMap
//           mapContainerStyle={mapContainerStyle}
//           center={center}
//           zoom={12}
//           onClick={handleMapClick}
//         >
//           {stops.map((s, i) => (
//             <Marker key={i} position={s} label={`${i + 1}`} />
//           ))}

//           {directionsData && (
//             <DirectionsRenderer directions={directionsData} />
//           )}
//         </GoogleMap>

//         {/* 📊 Route Details */}
//         {directionsData && (
//           <Box sx={{ mt: 3, display: "flex", gap: 4 }}>
//             <Box>
//               <Typography fontWeight={600}>Route Details</Typography>
//               <Divider sx={{ my: 1 }} />
//               <Typography>Total KM: {routeSummary.totalDistanceKm}</Typography>
//               <Typography>
//                 Total Duration: {routeSummary.totalDurationMin} mins
//               </Typography>
//               <Typography>Total Stops: {stops.length}</Typography>
//             </Box>

//             <Box>
//               <Typography fontWeight={600}>Stop-wise Distance</Typography>
//               <Divider sx={{ my: 1 }} />
//               <List dense>
//                 {routeSummary.stopWiseDistance.map((s, i) => (
//                   <ListItem key={i}>
//                     <ListItemText
//                       primary={`${s.from} → ${s.to}`}
//                       secondary={`${s.km} km • ${s.min} mins`}
//                     />
//                   </ListItem>
//                 ))}
//               </List>
//             </Box>
//           </Box>
//         )}
//       </Box>
//     </LoadScript>
//   );
// }
import React from 'react'
import SoonPage from '../Soon'
import SubscriptionPage from '../SubscriptionPage'

export default function TransportPage() {
  return (
    <div>
      <SubscriptionPage />
    </div>
  )
}
