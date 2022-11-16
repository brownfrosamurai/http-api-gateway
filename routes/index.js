const express = require('express')
const axios = require('axios')
const registry = require('./registry.json')
const fs = require('fs')

const Router = express.Router()

Router.all('/:apiName/:path', async (req, res) => { 
  if (registry.services[req.params.apiName]) {

    const response = await axios({
      method: req.method,
      url: registry.services[req.params.apiName].url + req.params.path,
      headers: req.headers,
      data: req.body
    })

    res.send(response.data)
  } else {
    res.send('API Name does not exist')
  }
})

Router.post('/register', (req, res, next) => {
  const registrationInfo = req.body

  registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`

  registry.services[registrationInfo.apiName] = { ...registrationInfo }

  fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
    if (err) {
      res.send(`Could not register ${registrationInfo.apiName}: \n ${err}`)
    } else {
      console.log(registrationInfo)
      res.send(`Successfully registered ${registrationInfo.apiName}`)
    }
  })
})

module.exports = Router