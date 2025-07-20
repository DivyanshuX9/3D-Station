const fs = require('fs');
const path = require('path');
const https = require('https');

// Create textures directory if it doesn't exist
const texturesDir = path.join(__dirname, 'public', 'textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
  console.log('Created textures directory');
}

// List of textures to download
const textures = [
  {
    name: 'marble-floor.jpg',
    url: 'https://images.unsplash.com/photo-1518345510189-9e65fba9e4dc?q=80&w=1000&auto=format&fit=crop'
  },
  {
    name: 'concrete.jpg',
    url: 'https://images.unsplash.com/photo-1617298748161-fb52f7384773?q=80&w=1000&auto=format&fit=crop'
  },
  {
    name: 'wood.jpg',
    url: 'https://images.unsplash.com/photo-1595514535215-95918585787b?q=80&w=1000&auto=format&fit=crop'
  },
  {
    name: 'glass.jpg',
    url: 'https://images.unsplash.com/photo-1477615032645-5855d677cdf3?q=80&w=1000&auto=format&fit=crop'
  }
];

// Download each texture
textures.forEach((texture) => {
  const filePath = path.join(texturesDir, texture.name);
  const file = fs.createWriteStream(filePath);
  
  https.get(texture.url, (response) => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${texture.name}`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {}); // Delete the file if there's an error
    console.error(`Error downloading ${texture.name}: ${err.message}`);
  });
}); 