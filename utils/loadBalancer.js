const loadbalancer = {}

loadbalancer.ROUND_ROBIN = (service) => {
  const newIndex = ++service.index >= service.instances.length ? 0 : service.index
  service.index = newIndex
  return loadbalancer.isEnabled(service, newIndex, loadbalancer.ROUND_ROBIN)
}

loadbalancer.isEnabled = (service, index, loadbalanceStrategy) => {
  return service.instances[index].enabled ? index : loadbalanceStrategy(service)
}

module.exports = loadbalancer