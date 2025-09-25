<p align="center">
  <img
    class="project-logo"
    src="./logos/logo-yellow-slab.svg"
    alt="WarpDrive"
    width="180px"
    title="WarpDrive"
    />
</p>

![NPM Stable Version](https://img.shields.io/npm/v/ember-data/latest?label=version&style=flat&color=fdb155)
![NPM Downloads](https://img.shields.io/npm/dm/ember-data.svg?style=flat&color=fdb155)
![License](https://img.shields.io/github/license/warp-drive-data/warp-drive.svg?style=flat&color=fdb155)
[![EmberJS Discord Community Server](https://img.shields.io/badge/EmberJS-grey?logo=discord&logoColor=fdb155)](https://discord.gg/zT3asNS
)
[![WarpDrive Discord Server](https://img.shields.io/badge/WarpDrive-grey?logo=discord&logoColor=fdb155)](https://discord.gg/PHBbnWJx5S
)

<p align="center">
  <br>
  <a href="https://warp-drive.io">WarpDrive</a> is the lightweight data library for web apps &mdash;
  <br>
  universal, typed, reactive, and ready to scale.
  <br/><br/>
</p>

---

# @ember-data/request-utils

<p align="center">Utilities for Requests</p>

This package provides Simple utility function to assist in url building, query params, and other common request operations.

It's built for [*Ember***Data**](https://github.com/warp-drive-data/warp-drive/) but useful more broadly if you're looking for lightweight functions to assist in working with urls and query params.

## Installation

Install using your javascript package manager of choice. For instance with [pnpm](https://pnpm.io/)

```sh
pnpm add @ember-data/request-utils
```

**Tagged Releases**

- ![NPM Canary Version](https://img.shields.io/npm/v/%40ember-data/request-utils/canary?label=%40canary&color=FFBF00)
- ![NPM Beta Version](https://img.shields.io/npm/v/%40ember-data/request-utils/beta?label=%40beta&color=ff00ff)
- ![NPM Stable Version](https://img.shields.io/npm/v/%40ember-data/request-utils/latest?label=%40latest&color=90EE90)
- ![NPM LTS Version](https://img.shields.io/npm/v/%40ember-data/request-utils/lts?label=%40lts&color=0096FF)
- ![NPM LTS 4.12 Version](https://img.shields.io/npm/v/%40ember-data/request-utils/lts-4-12?label=%40lts-4-12&color=bbbbbb)


## Utils

- [buildBaseUrl]()
- [sortQueryParams]()
- [buildQueryParams]()
- [filterEmpty]()

### As a Library Primitive

These primitives may be used directly or composed by request builders to provide a consistent interface for building requests.

For instance:

```ts
import { buildBaseURL, buildQueryParams } from '@ember-data/request-utils';

const baseURL = buildBaseURL({
  host: 'https://api.example.com',
  namespace: 'api/v1',
  resourcePath: 'emberDevelopers',
  op: 'query',
  identifier: { type: 'ember-developer' }
});
const url = `${baseURL}?${buildQueryParams({ name: 'Chris', include:['pets'] })}`;
// => 'https://api.example.com/api/v1/emberDevelopers?include=pets&name=Chris'
```

This is useful, but not as useful as the REST request builder for query which is sugar over this (and more!):

```ts
import { query } from '@ember-data/rest/request';

const options = query('ember-developer', { name: 'Chris', include:['pets'] });
// => { url: 'https://api.example.com/api/v1/emberDevelopers?include=pets&name=Chris' }
// Note: options will also include other request options like headers, method, etc.
```
