import {natRuleCollection, networkRuleCollection, applicationRuleCollection} from '../../types/ruleCollections.bicep'

targetScope = 'resourceGroup'

param name string
param priority int

output rc applicationRuleCollection = {
  name: name
  priority: priority
  ruleCollectionType: 'FirewallPolicyFilterRuleCollection'
  action: {
    type: 'Allow'
  }
  rules:[
    {
      name: 'test-app-rule'
      ruleType: 'ApplicationRule'
      protocols: [{port: 80, protocolType: 'Http'}
                  {port: 443, protocolType: 'Https'}]
      sourceAddresses: ['*']
      destinationAddresses: ['*']
      targetFqdns: ['*']
    }
  ]
}
