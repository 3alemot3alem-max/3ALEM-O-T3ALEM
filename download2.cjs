const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

download('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfn5Yl-KZFjJHICitFmd29kSTNHFeXKUhKcg&s', path.join(process.cwd(), 'public', 'schools', 'ensias.png')).then(() => console.log('Done'));
