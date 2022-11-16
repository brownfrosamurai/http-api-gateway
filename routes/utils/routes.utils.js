const registry = require('../registry.json')

/**
 * Checks for the existence of api instance
 * @param {Object} apiInfo
 * @returns {Boolean}
 */
module.exports.apiInstanceExists = (apiInfo) => {
  let exists = false

  if (registry.services[apiInfo.apiName] != undefined) {
    registry.services[apiInfo.apiName].instances.forEach(instance => {
      if (apiInfo.url === instance.url) {
        exists = true
        return
      }
    });
  }

  return exists
}

