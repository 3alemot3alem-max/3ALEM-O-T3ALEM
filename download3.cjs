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
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlC0dLhH_WguGxnzLOEQuiCP_DuT7ENWQNKQ&s', name: 'ensa.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-8gAATYCsIsCYrpE0bQFQ50psQOq215IyZA&s', name: 'ensem.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBETqRTwuRitB0q-b0bYw0-YY_6hnRjtjtvg&s', name: 'ensam.png' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png', name: 'encg.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUDVL5HqKF3YNfs8MNbmhsL8bpE-FGtErWDw&s', name: 'iscae.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-kM0CodOXM0iDZL2FNKtcrKhmwWVkir0fvQ&s', name: 'insea.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_3-mfO7sYxygeONqkD9pfT45qQ3YYn4RZvQ&s', name: 'ern.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1fz_3LFCESfA_wWrEBmezi-j4YQVnnLz5Fw&s', name: 'arm.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3D-HxICvW3pwQ0okEaj5IPzkRm34XJHdYZg&s', name: 'aiac.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpcoDF8QCwC1ooRENjzJEbfB6O2WywdGXOdA&s', name: 'ispits.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgx6Wf3HLfapHtePu7Mf0RjW8YmDKmfas0eQ&s', name: 'fmp_fmd.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi4N13joSjZISYOIi_bh8lwZDRSktsALRbWQ&s', name: 'fst.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbC6osKBPM-2xLdPlu5OqV_unfaAk8xkmk-g&s', name: 'bts.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRji51fPRA2v1JMydbbkQoisSkSJwUvd7hhQw&s', name: 'cpge.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkZfNDWxbt23DdGzUdpDmsv8fmvWD4zzB2Yg&s', name: 'isic.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8-Kr2kNbHr61FTy6SqZeTN79uAGUi6gf83g&s', name: 'est.png' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ7pefXUppPgJSumNE9TfG3HJqpEs6NfAUkw&s', name: 'ista.png' }
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
