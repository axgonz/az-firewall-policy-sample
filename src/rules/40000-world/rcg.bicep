targetScope = 'resourceGroup'

param name string
param parentPolicyName string
param priority int

resource policy 'Microsoft.Network/firewallPolicies@2023-11-01' existing = {
  name: parentPolicyName
}

resource rcg 'Microsoft.Network/firewallPolicies/ruleCollectionGroups@2023-11-01' = {
  name: name
  parent: policy
  properties: {
    priority: priority
    ruleCollections: [
      rc1000.outputs.rc
      rc2000.outputs.rc
      rc3000.outputs.rc
    ]
  }
}

module rc1000 '1000-foo.bicep' = {
  name: '${deployment().name}_1000-foo'
  params: {
    name: 'foo'
    priority: 1000
  }
}

module rc2000 '2000-bar.bicep' = {
  name: '${deployment().name}_2000-bar'
  params: {
    name: 'bar'
    priority: 2000
  }
}

module rc3000 '3000-baz.bicep' = {
  name: '${deployment().name}_3000-baz'
  params: {
    name: 'baz'
    priority: 3000
  }
}
