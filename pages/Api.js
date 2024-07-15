import axios from 'axios';
import  wiki  from 'wikipedia';

const GOOGLE_API_KEY = 'AIzaSyB6Vm3HPqHmvvBhpwGbw3Bkxeu_grj6F90';

const Api = {
  getNearbyPlaces: async (latitude, longitude) => {
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius=15000&type=tourist_attraction&key='+GOOGLE_API_KEY;
    try {
      const response = await axios.get(url);
      return response.data.results;

    } catch (error) {
      console.error('Error fetching nearby places', error);
      throw error;
    }
  },



  getWikiSummary: async (title) => {
    console.log("Searching for wiki page:" + title)
    try {
       const page = await wiki.page(title);
      if(page){
         const summary = await page.summary();
        return summary.extract;
      }
    } catch (error) {
      console.error('Error fetching Wikipedia summary for ' + title, error);
      throw error;
    }
  }
};

export default Api;
