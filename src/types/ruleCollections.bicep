import {
  natRule
  networkRule
  applicationRule
} from 'rules.bicep'

@export()
type natRuleCollection = {
  name: string
  @minValue(100)
  @maxValue(65000)
  priority: int
  ruleCollectionType: 'FirewallPolicyNatRuleCollection'
  action: {
    type: 'DNAT'
  }
  rules: natRule[]
}

@export()
type networkRuleCollection = {
  name: string
  @minValue(100)
  @maxValue(65000)
  priority: int
  ruleCollectionType: 'FirewallPolicyFilterRuleCollection'
  action: {
    type: 'Allow' | 'Deny'
  }
  rules: networkRule[]
}

@export()
type applicationRuleCollection = {
  name: string
  @minValue(100)
  @maxValue(65000)
  priority: int
  ruleCollectionType: 'FirewallPolicyFilterRuleCollection'
  action: {
    type: 'Allow' | 'Deny'
  }
  rules: applicationRule[]
}
