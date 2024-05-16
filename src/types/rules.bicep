type httpHeader = {
  headerName: string
  headerValue: string
}

type protocol = {
  @minValue(0)
  @maxValue(64000)
  port: int
  protocolType: 'Http' | 'Https'
}

@export()
type natRule = {
  name: string
  description: string?
  ruleType: 'NatRule'
  destinationAddresses: string[]?
  destinationPorts: string[]?
  ipProtocols: ('Any' | 'ICMP' | 'TCP' | 'UDP')[]
  sourceAddresses: string[]?
  sourceIpGroups: string[]?
  translatedAddress: string?
  translatedFqdn: string?
  translatedPort: string?
}

@export()
type networkRule = {
  name: string
  description: string?
  ruleType: 'NetworkRule'
  destinationAddresses: string[]?
  destinationFqdns: string[]?
  destinationIpGroups: string[]?
  destinationPorts: string[]
  ipProtocols: ('Any' | 'ICMP' | 'TCP' | 'UDP')[]
  sourceAddresses: string[]?
  sourceIpGroups: string[]?
}

@export()
type applicationRule = {
  name: string
  description: string?
  ruleType: 'ApplicationRule'
  destinationAddresses: string[]?
  fqdnTags: string[]?
  httpHeadersToInsert: httpHeader[]?
  protocols: protocol[]
  sourceAddresses: string[]?
  sourceIpGroups: string[]?
  targetFqdns: string[]?
  targetUrls: string[]?
  terminateTLS: bool?
  webCategories: string[]?
}
