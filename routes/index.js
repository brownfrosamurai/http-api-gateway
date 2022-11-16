const express = require('express')
const axios = require('axios')
const registry = require('./registry.json')
const fs = require('fs')
const { 
  get_RegisteredInstance,
  post_RegisterInstance,
  post_UnregisterInstance
} = require('./controller/routes.controller')

const Router = express.Router()

Router.all('/:apiName/:path', get_RegisteredInstance)
Router.post('/register', post_RegisterInstance)
Router.post('/unregister', post_UnregisterInstance)

module.exports = Router