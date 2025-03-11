const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

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