---
title: UNPKG
---

# UNPKG

<br>
<img class="dark-only" src="../images/unbox-dark.png" alt="waves of reactive signals light up space" width="100%">
<img class="light-only" src="../images/unbox-light2.png" alt="waves of reactive signals light up space" width="100%">

---

Begining in `5.8`, prebuilt versions of ***Warp*Drive** packages can be used via [UNPKG](https://unpkg.com/).

Four builds are provided for each package via the following
[export conditions](https://nodejs.org/api/packages.html#conditional-exports). These builds are unminified and retain source code documentation comments.

| condition | description |
| --------- | ----------- |
| ***default*** `unpkg` | production build with all deprecated features removed |
| `unpkg-dev` | development build with all deprecated features removed |
| `unpkg-deprecated` | production build with all deprecated features available |
| `unpkg-dev-deprecated` | development build with all deprecated features available |

Example using `@warp-drive/core`

| Build | URL |
| ----- | --- |
| Production | [https://unpkg.com/@warp-drive/core@canary](https://unpkg.com/@warp-drive/core@canary) |
| Production + Deprecations | [https://unpkg.com/@warp-drive/core@canary?conditions=unpkg-deprecated](https://unpkg.com/@warp-drive/core@canary?conditions=unpkg-deprecated) |
| Development | [https://unpkg.com/@warp-drive/core@canary?conditions=unpkg-dev](https://unpkg.com/@warp-drive/core@canary?conditions=unpkg-dev) |
| Development + Deprecations | [https://unpkg.com/@warp-drive/core@canary?conditions=unpkg-dev-deprecated](https://unpkg.com/@warp-drive/core@canary?conditions=unpkg-dev-deprecated) |
