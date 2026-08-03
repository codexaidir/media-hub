async function run() {
  try {
    const response = await fetch("https://sex-videos.rodeo/watch-free/bangalore-wifes-hidden-camera-captures-her-cheating.html", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    console.log("Fetch status:", response.status);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}
run();
