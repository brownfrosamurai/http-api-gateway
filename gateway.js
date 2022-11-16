const express = require('express');
const routes = require('./routes');

const PORT = 8000;
const app = express();

app.use(express.json());

app.use('/', routes);

app.listen(PORT, () => console.log(`Gateway  running on port ${PORT} !!!`));