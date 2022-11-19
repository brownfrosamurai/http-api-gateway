const axios = require('axios');
const express = require('express');

const PORT = 8080;
const HOST = "localhost"

const app = express();

app.use(express.json());

app.get('/fakeapi', (req, res, next) => {
  res.send('GET Fake api says hello' + '\n')
});

app.post('/bogusapi', (req, res) => {
  res.send(`POST Bogus API says hello \n`)
})

app.listen(PORT, async () => {
  const response = await axios({
    method: "POST",
    url: `http://localhost:8000/register`,
    headers: { 'Content-Type': 'application/json' },
    data: {
      apiName: "newapi",
      protocol: "http",
      host: HOST,
      port: PORT
    }
  })
  console.log(response.data)
  console.log(`Fake server running on port ${PORT}!!!`)
});