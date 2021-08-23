# Helper for Solid authentication in Node.js

[![Build status](https://github.com/rubensworks/solid-node-auth-helper.js/workflows/CI/badge.svg)](https://github.com/rubensworks/solid-node-auth-helper.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/solid-node-auth-helper.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/solid-node-auth-helper.js?branch=master)
[![npm version](https://badge.fury.io/js/@rubensworks/solid-node-auth-helper.svg)](https://www.npmjs.com/package/@rubensworks/solid-node-auth-helper)

Easily authenticate Node.js apps with Solid identity servers by opening the user's Web browser.

Internally, this tool will setup a temporary Web server on the localhost
to allow authentication data to be handled easily and safely.

This is to be used as a companyon tool next to [`@inrupt/solid-client-authn-node`](https://www.npmjs.com/package/@inrupt/solid-client-authn-node).

## Installation

```bash
$ npm install @rubensworks/solid-node-auth-helper
```
or
```bash
$ yarn add @rubensworks/solid-node-auth-helper
```

This tool requires [`@inrupt/solid-client-authn-node`](https://www.npmjs.com/package/@inrupt/solid-client-authn-node) as a peer dependency:

```bash
$ npm install @inrupt/solid-client-authn-node
```
or
```bash
$ yarn add @inrupt/solid-client-authn-node
```

## Usage

The following code will trigger the user's Web browser to be opened to trigger the login sequence:
```typescript
import { Session } from '@inrupt/solid-client-authn-node';
import { login } from '@rubensworks/solid-node-auth-helper';

(async function() {
  // Create a new session and log in by opening the Web browser
  const session = new Session();
  await login({
    session,
    oidcIssuer: 'https://solidcommunity.net/',
    tokenType: 'Bearer',
  });

  // Perform operations with this session
  // such as session.fetch()

  // Log out once you're done (avoids hanging Node.js process)
  await session.logout();
})();
```

If you don't have any specific needs for the `Session` object,
you can also just let this tool create one for you:
```typescript
const session = await login({
  oidcIssuer: 'https://solidcommunity.net/',
  tokenType: 'Bearer',
});
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
