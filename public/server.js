const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// API endpoint to get all archive albums
app.get('/api/archives', (req, res) => {
  const archivePath = path.join(__dirname, 'archive_assets');
  
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});