const fs = require('fs')
const axios = require('axios')
const registry = require('../registry.json')
const loadbalancer = require('../utils/loadBalancer')
const {
  apiInstanceExists
} = require('../services/routes.service')

/**
 * @route (POST '/enable/:apiName')
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const post_ToggleApiInstance = (req, res, next) => {
  try {
    const requestBody = req.body
    const apiName = req.params.apiName
    const instances = registry.services[apiName].instances

    // Check for existence of url 
    const index = instances
      .findIndex(instance =>
        instance.url === requestBody.url
      );
    if (index < 0) {
      res.send(`Configuration for ${apiName} does not exist at ${requestBody.url}`)
    } else {
      instances[index].enabled = requestBody.enabled

      fs.writeFile('./registry.json', JSON.stringify(registry), (err) => {
        if (err) {
          res.send(`Could not enable/disable ${apiName} at ${requestBody.url}: ${err}`)
        } else {
          res.send(`Successfully enable/disable instance of ${apiName} at ${requestBody.url}`)
        }
      })
    }
  } catch (error) {
    console.log(error)
    res.send('An error occured while toggle API instance')
  }
}

/**
 * @route (GET '/:apiName/:path')
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const get_ApiInstance = async (req, res, next) => {
  const service = registry.services[req.params.apiName]
  try {
    if (service) {
      // create loadbalancer strategy 
      if (!service.loadbalanceStrategy) {
        service.loadbalanceStrategy = "ROUND_ROBIN"
        fs.writeFile('./registry.json', JSON.stringify(registry), (err) => {
          if (err) {
            res.send(`Could not update registry \n ${err}`)
          }
        })
      }

      // create next index 
      const newIndex = loadbalancer[service.loadbalanceStrategy](service)
      console.log(newIndex)
      const url = service.instances[newIndex].url
      console.log(req.method)
      console.log(url + req.params.path)
      // send axios call to api instance 
      const response = await axios({
        method: req.method,
        url: url + req.params.path,
        headers: req.headers,
        data: req.body
      })
      console.log(response.data)

      res.send(response.data)
    }
  } catch (error) {
    console.log(error.stack)
    res.send('An error occured while fetching API instance')
  }
}

/**
 * @route (POST '/register')
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const post_RegisterApiInstance = (req, res, next) => {
  try {
    const registrationInfo = req.body

    // create url 
    registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`

    registrationInfo.enabled = true

    if (apiInstanceExists(registrationInfo)) {
      res.send(`An instance of ${registrationInfo.apiName} exists at ${registrationInfo.url}`)
    } else {
      if (registry.services[registrationInfo.apiName] == undefined) {
        registry.services[registrationInfo.apiName] = {}
        registry.services[registrationInfo.apiName].instances = []
      }

      if (registry.services[registrationInfo.apiName].index == undefined) {
        registry.services[registrationInfo.apiName].index = 0
      }

      // update instances with new instance 
      registry.services[registrationInfo.apiName].instances.push({ ...registrationInfo })

      console.log(registry.services[registrationInfo.apiName].instances)

      // update registry json file
      fs.writeFile('./registry.json', JSON.stringify(registry), (err) => {
        if (err) {
          res.send(`Could not register ${registrationInfo.apiName}: \n ${err}`)
        } else {
          res.send(`Successfully registered ${registrationInfo.apiName}`)
        }
      })
    }
  } catch (error) {
    console.log(error)
    res.send('An error occured while registering api instance')
  }
}

/**
 * @route (POST '/unregister')
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const post_UnregisterApiInstance = (req, res, next) => {
  try {
    const registrationInfo = req.body

    // create url 
    registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`

    // validate api existence 
    if (apiInstanceExists(registrationInfo)) {
      const index = registry.services[registrationInfo.apiName].instances
        .findIndex(instance => {
          instance.url === registrationInfo.url
        })

      // remove api instance 
      registry.services[registrationInfo.apiName].instances.splice(index, 1)

      if (registry.services[registrationInfo.apiName].instances.length < 1) {
        registry.services[registrationInfo.apiName] = undefined
      }
      // update registry json file 
      fs.writeFile('./registry.json', JSON.stringify(registry), (err) => {
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
    res.send('An error occured while unregistering api instance')
  }
}


module.exports = {
  post_ToggleApiInstance,
  get_ApiInstance,
  post_RegisterApiInstance,
  post_UnregisterApiInstance
}