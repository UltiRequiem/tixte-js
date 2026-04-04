# Tixte Wrapper

> The best Tixte wrapper around

This package was done because I wanted to use the Tixte API in a hackathon,
there were already 2 packages that do the same, but any of them were working
correctly 😔

At the end this package ended up with more features, better documentation and
examples!

Install

```sh
npm i @ultirequiem/tixte # yarn add @ultirequiem/tixte
```

Usage

```ts
const tixteClient = new TixteClient(process.env.TIXTE_API_KEY, {
  defaultURL: "sergif.likes.cash",
});

const upload = async (event) => {
  const { data } = await tixteClient.uploadFile(
    Buffer.from(event.body!, "base64"),
    {
      extension: "gif",
    },
  );

  return data;
};
```

[Check a real word example!](https://github.com/UltiRequiem/sergif/tree/main/src/api)

## Docs

Auto generated documentation using TypeDoc :two_hearts:

For examples check the next section 🚀

https://tixte-wrapper.netlify.app

## Using `@ultirequiem/tixte`

Are you using this package? Add it here!

- [Sergif](https://sergif.ultirequiem.com) - Netlify Functions - **Netlify x
  Hashnode 2022 Hackathon**

## Licence

Licenses under the MIT Licence.
