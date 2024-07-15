const axios = require('axios');

const tourism = () => {

return (
const getAudioUrlFromText = async(text) => {

}
const getSummaryFromWikipedia = async (title) => {
  try {
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    return response.data.extract;
  } catch (error) {
    console.error(`Error fetching summary for ${title}:`, error);
    throw new Error('Could not fetch summary from Wikipedia.');
  }
};
)
}
export tourism;
