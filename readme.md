# Tixte Wrapper

[![CI](https://github.com/UltiRequiem/tixte-js/actions/workflows/ci.yaml/badge.svg)](https://github.com/UltiRequiem/tixte-js/actions/workflows/ci.yaml)
[![npm](https://img.shields.io/npm/v/@ultirequiem/tixte)](https://www.npmjs.com/package/@ultirequiem/tixte)

> A typed, dependency-free client for the [Tixte](https://tixte.com) API.

I wrote this package because I wanted to use the Tixte API in a hackathon.
There were already two packages that did the same, but neither of them worked
correctly 😔

It ended up with more features, better documentation and examples!

## Install

```sh
npm i @ultirequiem/tixte # or: pnpm add / yarn add / bun add
```

Requires Node.js 20 or newer (it uses the built-in `fetch`, `FormData` and
`Blob`), and also works in Bun and modern browsers.

## Usage

```ts
import { TixteClient } from "@ultirequiem/tixte";

const tixte = new TixteClient(process.env.TIXTE_API_KEY!, {
  defaultURL: "sergif.likes.cash",
});

// Upload a file (Uint8Array, ArrayBuffer or Blob)
const { data } = await tixte.uploadFile(Buffer.from(base64, "base64"), {
  extension: "gif",
});
console.log(data.direct_url);
```

### API

| Method                                | Description                           |
| ------------------------------------- | ------------------------------------- |
| `accountInfo()`                       | Account details of the current user   |
| `domains()`                           | Domains registered by the user        |
| `size()`                              | Total size of uploads and the limit   |
| `uploadFile(data, options?)`          | Upload a file                         |
| `uploads(page = 1, amount = 3)`       | List uploaded files (paginated)       |
| `updateFile(id, { name, extension })` | Rename a file or change its extension |
| `deleteFile(id)`                      | Delete a file                         |

`uploadFile` options: `extension` (default `png`), `filename` (random if
omitted) and `domain` (defaults to the client's `defaultURL`).

### Error handling

Non-2xx responses throw a `TixteApiError` with the HTTP `status`, `statusText`
and the parsed API error `body`, when there is one.

```ts
import { TixteApiError } from "@ultirequiem/tixte";

try {
  await tixte.accountInfo();
} catch (error) {
  if (error instanceof TixteApiError && error.status === 401) {
    console.error("Invalid API key:", error.body?.error.message);
  }
}
```

[Check a real world example!](https://github.com/UltiRequiem/sergif/tree/main/src/api)

## Docs

Auto-generated with TypeDoc: https://ulti.js.org/tixte-js

## Development

```sh
pnpm install
pnpm lint   # ESLint + Prettier
pnpm test   # Vitest
pnpm build  # compile to lib/
```

Releases are fully automatic: every push to `main` publishes a new version to
npm and creates a GitHub Release. The version in `package.json` is a
placeholder (`0.0.0-development`) and is set at publish time from the latest
npm version plus a bump taken from the commit message (`:boom:` or `!:` is
major, `:sparkles:` or `feat` is minor, anything else is patch). Add
`[skip release]` to a commit message to skip a release.

Dependabot patch and minor updates are merged automatically once CI passes.

## License

Licensed under the MIT License.
