const axios = require('axios')
const registry = require('../registry.json')
const fs = require('fs')
const { apiInstanceExists } = require('../utils/routes.utils')
const { response } = require('express')

/**
 * @route (GET '/:apiName/:path')
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const get_RegisteredInstance = async (req, res, next) => {
  try {
    if (registry.services[req.params.apiName]) {
      const response = await axios({
        method: req.method,
        url: registry.services[req.params.apiName].url + req.params.path,
        headers: req.headers,
        data: req.body
      })

      res.send(response.data)
    }
    else res.send(`Api at ${req.params.apiName} does not exist`)

  } catch (error) {
    res.send(`An error occurred`)
  }
}

/**
 * @route (POST '/register')
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const post_RegisterInstance = (req, res, next) => {
  try {
    const registrationInfo = req.body

    registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`

    if (apiInstanceExists(registrationInfo)) {
      res.send(`An instance of ${registrationInfo.apiName} exists at ${registrationInfo.url}`)
    } else {
      if (registry.services[registrationInfo.apiName] == undefined) {
        registry.services[registrationInfo.apiName] = {}
        registry.services[registrationInfo.apiName].instances = []
      }

      registry.services[registrationInfo.apiName].instances.push({ ...registrationInfo })

      fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
        if (err) {
          res.send(`Could not register ${registrationInfo.apiName}: \n ${err}`)
        } else {
          console.log(registrationInfo)
          res.send(`Successfully registered ${registrationInfo.apiName}`)
        }
      })
    }
  } catch (error) {
    console.log(error)
    res.send(`An error occurred while registering`)
  }
}

/**
 * @route (POST '/unregister')
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const post_UnregisterInstance = (req, res, next) => {
  try {
    const registrationInfo = req.body

    registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`

    if (apiInstanceExists(registrationInfo)) {
      const index = registry.services[registrationInfo.apiName].instances
        .findIndex(instance => {
          instance.url === registrationInfo.url
        })

      registry.services[registrationInfo.apiName].instances.splice(index, 1)

      if (registry.services[registrationInfo.apiName].instances.length < 1) {
        registry.services[registrationInfo.apiName] = undefined
      }
      fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
        if (err) {
          res.send(`Could not register ${registrationInfo.apiName}: \n ${err}`)
        } else {
          res.send(`Successfully removed ${registrationInfo.apiName} at ${registrationInfo.url}`)
        }
      })

    } else {
      res.send(`Api ${registrationInfo.apiName} at instance ${registrationInfo.url} does not exist`)
    }
  } catch (error) {
    console.log(error)
    res.send('An error occured')
  }
}


module.exports = {
  get_RegisteredInstance,
  post_RegisterInstance,
  post_UnregisterInstance
}