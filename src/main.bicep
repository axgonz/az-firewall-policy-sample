targetScope = 'subscription'

param location string = deployment().location

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'firewall-policy-sample'
  location: location
}

module policy 'rules/policy.bicep' = {
  name: '${deployment().name}_policy'
  scope: rg
  params: {
     location: location
  }
}
