const https = require('node:https');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(process.cwd(), 'public', 'schools');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const images = [
  { url: 'https://uploads.9rayti.com/2012/07/logo-era-marrakech.png', name: 'era.png' },
  { url: 'https://upload.wikimedia.org/wikipedia/fr/0/05/EMI.PNG', name: 'emi.png' },
  { url: 'https://www.ehtp.ac.ma/wp-content/uploads/2025/02/logo-wide.jpg', name: 'ehtp.jpg' }
];

async function run() {
  for (const img of images) {
    try {
      await download(img.url, path.join(dir, img.name));
      console.log('Downloaded ' + img.name);
    } catch (e) {
      console.error('Failed to download ' + img.name, e.message);
    }
  }
}
run();
