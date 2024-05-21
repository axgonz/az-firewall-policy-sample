# Azure Firewall Bicep Macros

This extension accompanies [axgonz/az-firewall-policy-sample (github.com)](https://github.com/axgonz/az-firewall-policy-sample).

Provides decorators for quickly authoring code snippets that align with the module file tree used in the above sample.

![az-fw-bicep-macros.gif](docs/az-fw-bicep-macros.gif)

## Usage

### Firewall rule collection groups

Use `// @rcg:<port>:<name>` + `Ctrl+.` to generate a rule collection group code snippet.

Decorator:

``` bicep
// @rcg:30000:hello-world
```

Generates:

``` bicep
// @rcg:30000:hello-world
module rcg30000_hello_world '30000-hello-world/rcg.bicep' = {
  name: '${deployment().name}_30000-hello-world'
  params: {
    parentPolicyName: policy.name
    name: 'hello-world'
    priority: 30000
  }
  dependsOn: [
  ]
}
```

### Firewall rule collections

Use `// @rc:<port>:<name>` + `Ctrl+.` to generate a rule collection code snippet.

Decorator:

``` bicep
// @rc:100:foo
```

Generates:

``` bicep
// @rc:100:foo
module rc100_foo '100-foo.bicep' = {
  name: '${deployment().name}_100-foo'
  params: {
    name: 'foo'
    priority: 100
  }
}
```
