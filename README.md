# Fonts loading

## Overview

There is two main files, `fonts.js` and `fallback.js`. First is a core file, it contains main methods and code to load fonts with Fonts Loading API. Second is a fallback which is used when Fonts Loading API is not available. You can inline both files in page's html or just inline `fonts.js` and load `fallback.js` when needed.

* `fonts.min.js` is `1.36 KB`
* `fallback.min.js` is `5.3 KB`

## Usage

Basic example:

```html
<script>
  // Inline contents of fonts.js
  <%= fonts_js_file %>

  var fontSrc = 'local('Roboto'), local('Roboto-Regular'), url(https://fonts.gstatic.com/s/roboto/v15/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2) format('woff2'), url(https://fonts.gstatic.com/s/roboto/v15/CrYjSnGjrRCn0pd9VQsnFOvvDin1pK8aKteLpeZ5c0A.woff) format('woff')';

  // Set url of a fallback file to be loaded when Fonts Loading API is not available
  Fonts.FALLBACK_FILE = 'fallback.js';
  Fonts.load([
    new Fonts.Font(fontSrc, 'Roboto', 700, 'normal'),
  ], function onLoad() {
    // Add class which uses loaded font
    document.body.className += ' fonts';
  }, function onError() {
    // ...
  });
</script>
```

## API

```ts
Fonts.load(fonts: Array<Fonts.Font>, onLoad?: Function, onError?: Function);
```

Loads passed `Font`s.
___________________________
```ts
new Fonts.Font(source: string, family: string, weight?: number, style?: string, text?: string);
```

Creates `Font` object which can be used by Fonts Loading API or `fallback.js`.
___________________________

```ts
Fonts.setSample(fontType: string, text: string);
```

Sets text samples to test fonts existence.

Example 1: `Fonts.setSample('16px Roboto', 'тест')` to test cyrilic text

Example 2:

```js
var font = new Fonts.Font('...', 'Roboto');

Fonts.setSample(Fonts.getFontType(font), 'тест');

Fonts.load([font], ...);
```

Does same as _Example 1_, but uses `getFontType(font: Fonts.Font)` method to stringify `Font` to `font` (CSS's `font` property value) and then re-uses same `Font` to load it.
___________________________
```ts
Fonts.USE_FONTS_API: boolean;
```
Set to `false` before calling `load()` to prevent usage of Fonts Loading API.

Example: `Fonts.USE_FONTS_API = false;`
___________________________


## Hot it works

Description about `fallback.js` implementation will be added later. Still may have bugs, of course.

## License

[MIT](LICENSE.md)