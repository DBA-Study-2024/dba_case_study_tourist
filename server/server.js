const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());





//// Replace with your MongoDB connection string
//mongoose.connect('mongodb://localhost:27017/touristApp', { useNewUrlParser: true, useUnifiedTopology: true });
//
//const UserSchema = new mongoose.Schema({ qrCodeData: String, sessionToken: String });
//const User = mongoose.model('User', UserSchema);

app.post('/api/login', async (req, res) => {
  const { qrCodeData } = req.body;
  const sessionToken = generateSessionToken();

  console.error("Login SesionToken" + sessionToken)
  const user = new User({ qrCodeData, sessionToken });
  await user.save();
  res.json({ sessionToken });
});

app.get('/api/location', async (req, res) => {
  console.error("Getting Nearby Location")
  const { lat, lng } = req.query;
  const nearbyPlaces = await getNearbyTouristPlaces(lat, lng);
  res.json({ nearbyPlaces });
});

app.get('/api/info', async (req, res) => {
console.error("Get Info")
  const { placeId } = req.query;
  const summary = await getSummaryFromWikipedia(placeId);
  res.json({ summary });
});

app.get('/api/speech', async (req, res) => {
  const { text } = req.query;
  const audioUrl = await getAudioUrlFromText(text);
  res.json({ audioUrl });
});


const getSummaryFromWikipedia = async (topic) => {
console.error("Get Info from wiki")
   try {
     const response = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}');
     return response.data.extract;
   } catch (error) {
     console.error('Error fetching summary for ${topic}:', error);
     throw new Error('Could not fetch summary from Wikipedia.');
   }
 };
 const getNearbyTouristPlaces = async (lat, lng) => {
   console.log("Get nearby tourist places")
   try {
     const response = await axios.get('https://en.wikipedia.org/w/api.php', {
       params: {
         action: 'query',
         list: 'geosearch',
         gscoord: `${lat}|${lng}`,
         gsradius: 10000, // Radius in meters
         gslimit: 10, // Limit the number of results
         format: 'json'
       }
     });
    console.log("Get nearby tourist places" + response)
     const pages = response.data.query.geosearch;
     const placeSummaries = await Promise.all(
       pages.map(async (place) => {
         const summary = await getSummaryFromWikipedia(place.title);
         return {
           id: place.pageid,
           name: place.title,
           lat: place.lat,
           lng: place.lon,
           summary
         };
       })
     );

     return placeSummaries;
   } catch (error) {
     console.error('Error fetching nearby tourist places:', error);
     throw new Error('Could not fetch nearby tourist places.');
   }
 };

const generateSessionToken = () => {
  // Implement token generation logic
  return 'unique-session-token';
};

app.listen(3000, () => console.log('Server is running on port 3000'));
