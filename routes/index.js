const express = require('express')

const {
  get_ApiInstance,
  post_RegisterApiInstance,
  post_UnregisterApiInstance,
  post_ToggleApiInstance
} = require('../controller')

const Router = express.Router()

Router.post('/enable/:apiName', post_ToggleApiInstance)
Router.all('/:apiName/:path', get_ApiInstance)
Router.post('/register', post_RegisterApiInstance)
Router.post('/unregister', post_UnregisterApiInstance)

module.exports = Router