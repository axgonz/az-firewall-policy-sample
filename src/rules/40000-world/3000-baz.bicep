import {natRuleCollection, networkRuleCollection, applicationRuleCollection} from '../../types/ruleCollections.bicep'

targetScope = 'resourceGroup'

param name string
param priority int

output rc networkRuleCollection = {
  name: name
  priority: priority
  ruleCollectionType: 'FirewallPolicyFilterRuleCollection'
  action: {
    type: 'Allow'
  }
  rules:[
    {
      name: 'test-net-rule'
      ruleType: 'NetworkRule'
      ipProtocols: [
        'Any'
      ]
      destinationPorts: ['*']
      sourceAddresses: ['*']
      destinationAddresses: ['*']
    }
  ]
}
