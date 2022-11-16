const loadbalancer = {}

loadbalancer.ROUND_ROBIN = (service) => {
  const index = ++service.index >= service.instances.length ? 0 : service.index
  return index
}

module.exports = loadbalancer