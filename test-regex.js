const fs = require('fs');
const html = fs.readFileSync('yt.html', 'utf8');
const urlRegex = /(https?:\/\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp|gif)(?:[?&#][^"'\s\\]*)?)/gi;
const matches = html.match(urlRegex);
if (matches) {
  const uniqueUrls = [...new Set(matches)];
  console.log(uniqueUrls.slice(0, 10));
}
