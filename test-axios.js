const axios = require('axios');
async function test() {
  try {
    const response = await axios.get("https://sex-videos.rodeo/watch-free/bangalore-wifes-hidden-camera-captures-her-cheating.html", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
    });
    console.log("Success, status:", response.status);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
