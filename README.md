# Kinet Reactivity Engine

Kinet is a lightweight reactivity engine for javascript. It is designed to be used without the need of any framework, but it can be used with any framework if desired.

Kinet uses a modular approach, which means that you can use only the parts you need.

# Kinet is still in development and not ready for production use

## Installation

```bash
npm install kinet
```

## Usage

```javascript
import { Kinet } from "kinet";
```

### Create a new state object
```javascript
const state = new Kinet({
  foo: "bar",
  baz: { qux: 'quux' }
});
```

### subscribe to changes
```javascript
state.subscribe('foo', (newValue, oldValue) => {
  console.log('foo changed from', oldValue, 'to', newValue);
});

//use dot notation to subscribe to nested properties
state.subscribe('baz.qux', (newValue, oldValue) => {
  console.log('baz.qux changed from', oldValue, 'to', newValue);
});

//use `deep` to subscribe to all changes in a nested object
state.subscribe('baz',(newValue, oldValue) => {
  console.log('baz changed from', oldValue, 'to', newValue);
}, true);
```

### Get and set values
#### Dot notation directly on the state object
```javascript
//get value
const valueOfBazQux = state.baz.qux;
//set value
state.foo = 'bar2';
```

#### Use the `byPath` method
```javascript
//get value
const valueOfBazQux = state.byPath('baz.qux');
//set value
state.byPath('baz.qux', 'quux2');
```
#### More explicit methods
`getByPath(path)` and `setByPath(path, value)` are more explicit versions of `byPath(path, value)`. The byPath method is a shorthand for these two methods.
```javascript
//get value
state.getByPath('baz.qux');
//set value
state.setByPath('baz.qux', 'quux2');
```

## Development

[Instructions](https://globusgroup.atlassian.net/wiki/spaces/DEVS/pages/19496961/NPM+Github+packages) on how to create and publish a private NPM package. 
