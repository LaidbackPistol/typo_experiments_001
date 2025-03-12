const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const util = require('util');
const fsExists = util.promisify(fs.exists);
const fsMkdir = util.promisify(fs.mkdir);

// Create cache directories if they don't exist
async function ensureCacheDirectories() {
  const cacheDir = path.join(__dirname, 'public', 'cache');
  const thumbsDir = path.join(cacheDir, 'thumbnails');
  
  if (!await fsExists(cacheDir)) {
    await fsMkdir(cacheDir);
  }
  
  if (!await fsExists(thumbsDir)) {
    await fsMkdir(thumbsDir);
  }
  
  return thumbsDir;
}

// Generate a thumbnail for an image
async function generateThumbnail(imagePath, thumbPath, width) {
  try {
    await sharp(imagePath)
      .resize(width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .toFormat('webp', { quality: 80 })
      .toFile(thumbPath);
    
    return true;
  } catch (error) {
    console.error(`Error generating thumbnail for ${imagePath}:`, error);
    return false;
  }
}

// Modify the existing API endpoint to include thumbnails
app.get('/api/archives', async (req, res) => {
  const archivePath = path.join(__dirname, 'public', 'archive_assets');
  
  if (!fs.existsSync(archivePath)) {
    return res.json({ albums: [] });
  }
  
  try {
    // Ensure cache directories exist
    const thumbsDir = await ensureCacheDirectories();
    
    // Read all directories (albums) in the archive_assets folder
    const albums = await Promise.all(fs.readdirSync(archivePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(async dirent => {
        const albumName = dirent.name;
        const albumPath = path.join(archivePath, albumName);
        
        // Get all image files in the album directory
        const imageFiles = await Promise.all(fs.readdirSync(albumPath)
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
          })
          .map(async file => {
            const filePath = path.join(albumPath, file);
            const fileExt = path.extname(file);
            const fileName = path.basename(file, fileExt);
            
            // Create thumbnail paths for different sizes
            const thumbSmallPath = path.join(thumbsDir, `${albumName}_${fileName}_200${fileExt}.webp`);
            const thumbMediumPath = path.join(thumbsDir, `${albumName}_${fileName}_600${fileExt}.webp`);
            
            // URLs for the thumbnails
            const thumbSmallUrl = `/cache/thumbnails/${albumName}_${fileName}_200${fileExt}.webp`;
            const thumbMediumUrl = `/cache/thumbnails/${albumName}_${fileName}_600${fileExt}.webp`;
            
            // Generate thumbnails if they don't exist
            if (!fs.existsSync(thumbSmallPath)) {
              await generateThumbnail(filePath, thumbSmallPath, 200);
            }
            
            if (!fs.existsSync(thumbMediumPath)) {
              await generateThumbnail(filePath, thumbMediumPath, 600);
            }
            
            return {
              src: `/archive_assets/${encodeURIComponent(albumName)}/${encodeURIComponent(file)}`,
              thumbs: {
                small: thumbSmallUrl,
                medium: thumbMediumUrl
              },
              alt: fileName, // Use filename without extension as alt text
              width: 0, // We'll leave these as 0 for now, could add metadata extraction
              height: 0
            };
          }));
        
        return {
          title: albumName,
          images: imageFiles
        };
      }));
    
    res.json({ albums });
  } catch (error) {
    console.error('Error reading archive directories:', error);
    res.status(500).json({ error: 'Failed to read archive directories' });
  }
});

// Add a route to serve cached thumbnails
app.use('/cache/thumbnails', express.static(path.join(__dirname, 'public', 'cache', 'thumbnails')));

// Serve static files from the public directory
app.use(express.static('public'));

// Serve files from archive_assets directory
// Change this to look inside the public folder
app.use('/archive_assets', express.static(path.join(__dirname, 'public', 'archive_assets')));

// API endpoint to get all archive albums
app.get('/api/archives', (req, res) => {
  // Update the path to look in public/archive_assets
  const archivePath = path.join(__dirname, 'public', 'archive_assets');
  
  // Check if archive_assets directory exists
  if (!fs.existsSync(archivePath)) {
    return res.json({ albums: [] });
  }
  
  try {
    // Read all directories (albums) in the archive_assets folder
    const albums = fs.readdirSync(archivePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const albumName = dirent.name;
        const albumPath = path.join(archivePath, albumName);
        
        // Get all image files in the album directory
        const imageFiles = fs.readdirSync(albumPath)
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
          })
          .map(file => ({
            src: `/archive_assets/${encodeURIComponent(albumName)}/${encodeURIComponent(file)}`,
            alt: file.split('.')[0] // Use filename without extension as alt text
          }));
        
        return {
          title: albumName,
          images: imageFiles
        };
      });
    
    res.json({ albums });
  } catch (error) {
    console.error('Error reading archive directories:', error);
    res.status(500).json({ error: 'Failed to read archive directories' });
  }
});

// NEW API endpoint to get all mixes
app.get('/api/mixes', (req, res) => {
  const mixesPath = path.join(__dirname, 'public', 'mixes.json');
  
  // Check if mixes.json file exists
  if (!fs.existsSync(mixesPath)) {
    return res.json({ mixes: [] });
  }
  
  try {
    // Read the mixes JSON file
    const mixesData = fs.readFileSync(mixesPath, 'utf8');
    const mixes = JSON.parse(mixesData);
    
    res.json(mixes);
  } catch (error) {
    console.error('Error reading mixes data:', error);
    res.status(500).json({ error: 'Failed to read mixes data' });
  }
});

// For Vercel, we need to export the Express app
if (process.env.VERCEL) {
  // Handle all other routes by redirecting to index.html for SPA behavior
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
  // Export the Express app for Vercel serverless deployment
  module.exports = app;
} else {
  // Start the server normally in development
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}