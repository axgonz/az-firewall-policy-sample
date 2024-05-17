targetScope = 'resourceGroup'

param location string = resourceGroup().location

resource policy 'Microsoft.Network/firewallPolicies@2023-11-01' = {
  name: 'firewall-policy-sample'
  location: location
}

// @rcg:30000:hello
module rcg30000_hello '30000-hello/rcg.bicep' = {
  name: '${deployment().name}_30000-hello'
  params: {
    parentPolicyName: policy.name
    name: 'hello'
    priority: 30000
  }
}

// @rcg:40000:world
module rcg40000_world '40000-world/rcg.bicep' = {
  name: '${deployment().name}_40000-world'
  params: {
    parentPolicyName: policy.name
    name: 'world'
    priority: 40000
  }
  dependsOn: [
    rcg30000_hello
  ]
}
