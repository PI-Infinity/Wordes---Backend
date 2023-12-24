const sharp = require('sharp');

app.get('/api/v1/image', (req, res) => {
  const width = parseInt(req.query.width, 10) || 200;
  const height = parseInt(req.query.height, 10) || 200;
  const imagePath =
    'https://res.cloudinary.com/mimino/image/upload/v1676543810/ELAN/diana/IMG_3760_1_1_sbohyj.jpg';
  sharp(imagePath)
    .resize(width, height)
    .toBuffer((err, buffer) => {
      if (err) return res.status(500).send('Error resizing image');
      res.set('Content-Type', 'image/jpeg');
      res.send(buffer);
    });
});
