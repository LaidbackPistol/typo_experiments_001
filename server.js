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

app.get('/api/floating-heads', (req, res) => {
  try {
    // Pour les déploiements Vercel, utiliser une approche différente
    if (process.env.VERCEL) {
      // Puisque nous ne pouvons pas accéder au système de fichiers directement dans les fonctions Vercel,
      // nous pouvons lister manuellement les images qui devraient être disponibles
      const imageFiles = [
        '/5_heads/head1.png',
        '/5_heads/head2.png',
        '/5_heads/head3.png',
        '/5_heads/head4.png',
        '/5_heads/head5.png'
        // Ajoutez tous vos noms de fichiers ici
      ];
      
      return res.json({ images: imageFiles });
    }
    
    // Approche normale pour le développement local
    const headsPath = path.join(__dirname, 'public', '5_heads');
    
    // Check if 5_heads directory exists
    if (!fs.existsSync(headsPath)) {
      console.log('5_heads directory not found');
      return res.json({ images: [] });
    }
    
    // Read all image files in the 5_heads folder
    const imageFiles = fs.readdirSync(headsPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => `/5_heads/${file}`);
    
    res.json({ images: imageFiles });
  } catch (error) {
    console.error('Error reading 5_heads directory:', error);
    // Retourner un tableau vide au lieu d'une erreur 500
    res.json({ images: [] });
  }
});

// API endpoint to get future events
app.get('/api/events', (req, res) => {
  const eventsPath = path.join(__dirname, 'public', 'future_events.json');
  
  // Check if future_events.json file exists
  if (!fs.existsSync(eventsPath)) {
    return res.json({ status: "coming_soon", events: [] });
  }
  
  try {
    // Read the events JSON file
    const eventsData = fs.readFileSync(eventsPath, 'utf8');
    const events = JSON.parse(eventsData);
    
    res.json(events);
  } catch (error) {
    console.error('Error reading events data:', error);
    res.status(500).json({ error: 'Failed to read events data' });
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
