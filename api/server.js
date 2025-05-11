const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
const cors = require('cors');
app.use(cors());


app.get('/hello', (req, res) => {
  res.json({ 
    message: 'Hello, api de PAUL D !' 
  });
});

app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}`);
});
