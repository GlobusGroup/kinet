# Kinet

A reactive data object library for JavaScript.

## Installation

```bash
npm install -s  globusgroup/kinet
```

## Usage

```js
import Kinet from 'kinet';

const data = {
  name: 'John Doe',
  age: 30
};

const reactiveData = new Kinet(data);

```

## Methods


### subscribe(observable, func, deep)

Subscribe to changes to a value in the reactive data object.

- `observable`: the dot-notated path to the value you want to subscribe to.
- `func`: the function you want to be triggered when the value changes.
- `deep`: a boolean indicating whether to subscribe to all values within the object (default: false).

### getByPath(path)

Return the reactive version of the value at a specified path.

- `path`: the dot-notated path to the value you want to get.

### setByPath(path, value)

Set a new value at a specified path.

- `path`: the dot-notated path to the value you want to set.
- `value`: the new value to set.

## Example


```js
import Kinet from 'kinet';

const data = {
  name: 'John Doe',
  age: 30
};

const reactiveData = new Kinet(data);

reactiveData.subscribe('name', () => {
  console.log(`Name changed to ${reactiveData.getByPath('name')}`);
});

reactiveData.setByPath('name', 'Jane Doe');
// Name changed to Jane Doe

```

## Development

[Instructions](https://globusgroup.atlassian.net/wiki/spaces/DEVS/pages/19496961/NPM+Github+packages) on how to create and publish a private NPM package. 
