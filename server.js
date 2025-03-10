const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('public'));

// Get all albums
app.get('/api/gallery/albums', async (req, res) => {
  try {
    const baseDir = path.join(__dirname, 'public', 'archive_assets');
    const folders = await fs.readdir(baseDir, { withFileTypes: true });
    
    const albums = [];
    for (const folder of folders) {
      if (folder.isDirectory()) {
        const folderPath = path.join(baseDir, folder.name);
        const files = await fs.readdir(folderPath);
        
        // Find first image to use as thumbnail
        let thumbnail = null;
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            thumbnail = `/archive_assets/${folder.name}/${file}`;
            break;
          }
        }
        
        albums.push({
          id: folder.name.toLowerCase().replace(/\s+/g, '-'),
          name: folder.name,
          thumbnail,
          path: `/archive_assets/${folder.name}/`
        });
      }
    }
    
    res.json(albums);
  } catch (error) {
    console.error('Error getting albums:', error);
    res.status(500).json({ error: 'Failed to get albums' });
  }
});

// Get images for a specific album
app.get('/api/gallery/album/:id', async (req, res) => {
  try {
    const albumId = req.params.id;
    const baseDir = path.join(__dirname, 'public', 'archive_assets');
    
    // Find the directory matching the album ID
    const folders = await fs.readdir(baseDir, { withFileTypes: true });
    let targetFolder = null;
    
    for (const folder of folders) {
      if (folder.isDirectory()) {
        const folderId = folder.name.toLowerCase().replace(/\s+/g, '-');
        if (folderId === albumId) {
          targetFolder = folder.name;
          break;
        }
      }
    }
    
    if (!targetFolder) {
      return res.status(404).json({ error: 'Album not found' });
    }
    
    const folderPath = path.join(baseDir, targetFolder);
    const files = await fs.readdir(folderPath);
    
    const images = [];
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        images.push({
          src: `/archive_assets/${targetFolder}/${file}`,
          alt: file.replace(/\.[^/.]+$/, '')
        });
      }
    }
    
    res.json(images);
  } catch (error) {
    console.error('Error getting album images:', error);
    res.status(500).json({ error: 'Failed to get album images' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});