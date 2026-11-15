# @lucy/vite

A [Vite](https://vite.dev/) plugin for [Lucy](https://lucy.spooky.click/). It compiles `.lucy` files to JavaScript modules, so you can import state machines straight from your source.

## Install

```shell
npm install @lucy/vite --save-dev
```

## Usage

Add the plugin to your Vite config:

__vite.config.js__

```js
import { defineConfig } from 'vite';
import lucy from '@lucy/vite';

export default defineConfig({
  plugins: [lucy()]
});
```

Then import a `.lucy` file. Each machine in it is exported as a function that creates the machine:

__toggle.lucy__

```lucy
machine toggle {
  initial state off {
    flip => on
  }

  state on {
    flip => off
  }
}
```

```js
import { createToggle } from './toggle.lucy';

const toggle = createToggle().start();
toggle.send('flip');
console.log(toggle.state); // 'on'
```

It works in the dev server and in builds. A file that doesn't compile fails the build, with the error's file and line.

## Options

### dts

```js
lucy({ dts: true })
```

Writes TypeScript declarations beside each `.lucy` file as it is compiled: `toggle.lucy` gets `toggle.d.lucy.ts`. Turn on TypeScript's [`allowArbitraryExtensions`](https://www.typescriptlang.org/tsconfig/#allowArbitraryExtensions) option and imports of `.lucy` files are typed. The declarations are experimental. You may want `*.d.lucy.ts` in your `.gitignore`.

## Requirements

Vite 6.3 or later. The plugin uses [hook filters](https://rolldown.rs/apis/plugin-api/hook-filters), so with Vite 8 (Rolldown) only `.lucy` files ever reach it.

## Releasing

Bump the version in `package.json`, then push a tag named `v<version>`. The Release workflow publishes to npm with trusted publishing.

## License

BSD-2-Clause
