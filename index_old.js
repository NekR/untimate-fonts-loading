/*const BLANK_FONT = `data:application/font-woff;base64,d09GRk9UVE8AAAWMAAoAAAAACRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAEYAAAARsAAAEx3qdZp0RTSUcAAAWEAAAACAAAAAgAAAABT1MvMgAAAVAAAABRAAAAYABfsZtjbWFwAAAD3AAAAG8AAAEAATS0vGhlYWQAAAD0AAAAMgAAADYIOsNZaGhlYQAAASgAAAAeAAAAJAdaA+9obXR4AAAFfAAAAAgAAAAIA+gAfG1heHAAAAFIAAAABgAAAAYAAlAAbmFtZQAAAaQAAAI2AAAFOnNJl1Bwb3N0AAAETAAAABMAAAAg/7gAMnjaY2BkYGBgYnC8yjdJOJ7f5isDM/MLoAjDpbn2C+B0zf8O5hzmAiCXGagWCABP0gvgAAB42mNgZGBgLvjfASRfMNQw1DDnMABFUAATAHAaBFEAAAAAUAAAAgAAeNpjYGZ+wTiBgZWBgamLKYKBgcEbQjPGMRgx3GFAAt//r/v/+/7///wPGOxBfEcXJ38GBwaG//+ZC/53MDAwFzBUJOgz/kfSosDAAAAMpBWaAAAAeNqdk89qE1EUxr+0UZRily5cDa4UZGpjK0VXsVoMhkSSqrjMvyahySTMTKuC+ACuxXdw48K1z+MT+AD+zpkb0xREK8Pc+93z55vvnnNG0oY+al2l8lVJn3gLXNINTgVe06a+BryuPX0PuHwm5pJy/Qz4sq6XRgFf0U7pQ8Ab4G8BX1v7XPoR8KZ2yu+1r5nmeqdUYw01gi/SF96K7mpb93TnN94FVdUnvqsBuE1WRvxAU/ZINSXq4U3hs7Xjvj6eW86bY3+gLZ43/sRELNhiz5ziuw0++5VHmhCX6Nh1tLANdeK2lHOMMtP2kJzHxDYdLbKXuZUQ0cT2RC/xpWgeE5c475LnOfdatYyIyl1folN82+6L6cge3ilfOIbPYo6wTmDtev4u731WY6n8QdX/1PPfa5nDOMeypUOyxs564PfI/XszFOdkWy1NQRFhN+hxTjgV/TsB971mEfGjoLamOnvTv5CsMNdXGGyCzlfcamhvdCFlfd9zn9UuqhbzVXB2fL1JTdtevTbY5qfqWtuu4xXoUE9R/YLdzlVmqsXa4FxjNtp+pxbrPnuDmam5x3DhO/D/oKHX7M/wWIxxD1BVVCf101sqY+oz1z5z65i+zL3Cpjz2uw78hheva0SNZis9yTynR9SRR0Zh0uyP6bAWvZi7wqnXctGRLNSvH/o/9bvYxC39Q9Cp5yZYjTVivmZwpz4jhSbrXKHob12Nz01yhmLr7Bxbhte0TdjtjkP8Vvn6LxeR1NAAAHjaLc87EoAgDIThVR4Kijrj/c9kaesRLGwZ3cim+PMVFAFAB4cMYEaBzYM2e1vnC3uDi6sezfUG3vq7s8o928uOdbJnvRzYIEc2ygM7yCM7yolNsl2Z5Ymd5Nmul+0PRV7YRV7ZVd7YrfkDGnwqfQB42mNgZgCD/1sZjBiwAAAswgHqAHjaY2RgYWJgZGTkcUzJT0p1yknMyzYC8XV/SP+Q6eaR+yHL+EOOqfs3zy+GXyyscloM8jzyvTxK34P5v0cKfg/jUf2+hkeFgZWRkY0vLLkAbIhnSmpeSWZJpXN+QWVRZnpGiYKRgaGxDog0VQCrUAiuLC5JzS1W8MxLzi8qyC9KLElNUdDIKCkpsNLXLy8v10sEKdNLzs/V19SDaAE7TcEIyZm6RgxAwAgimBgZffx+1fzm2f5LZTvjd4HtP3W2M38X+MUi+q/mZ8uvGva/Ef/URX9eYv9+9I8x67INor+P/jBn/fGNbVmS6N9L7ECeMWtBmihQ1pz1zzc2vm4+UBhw/pDnUZv+fafQ775uGVa3bra9XHu5Aac/bTIAA+gAfAAAAAAAAAABAAAAAA==`;
*/

const BLANK_FONT = 'data:font/opentype;base64,T1RUTwAKAIAAAwAgQ0ZGIN6nWacAAAfMAAABMURTSUcAAAABAAAJCAAAAAhPUy8yAF+xmwAAARAAAABgY21hcAE0tLwAAAasAAABAGhlYWQIOsNZAAAArAAAADZoaGVhB1oD7wAAAOQAAAAkaG10eAPoAHwAAAkAAAAACG1heHAAAlAAAAABCAAAAAZuYW1lc0mXUAAAAXAAAAU6cG9zdP+4ADIAAAesAAAAIAABAAAAAgBB1Q6SE18PPPUAAwPoAAAAANKdP6AAAAAA0p0/oAB8/4gDbANwAAAAAwACAAAAAAAAAAEAAANw/4gAAAPoAHwAfANsAAEAAAAAAAAAAAAAAAAAAAACAABQAAACAAAAAwPoAZAABQAAAooCWAAAAEsCigJYAAABXgAyANwAAAAAAAAAAAAAAAD3/67/+9///w/gAD8AAAAAQURCTwBAAAD//wNw/4gAAANwAHhgLwH/AAAAAAAAAAAAAAAgAAAAAAALAIoAAwABBAkAAACUAAAAAwABBAkAAQAaAJQAAwABBAkAAgAOAK4AAwABBAkAAwA4ALwAAwABBAkABAAaAJQAAwABBAkABQB0APQAAwABBAkABgAWAWgAAwABBAkACAA0AX4AAwABBAkACwA0AbIAAwABBAkADQKWAeYAAwABBAkADgA0BHwAQwBvAHAAeQByAGkAZwBoAHQAIACpACAAMgAwADEAMwAsACAAMgAwADEANQAgAEEAZABvAGIAZQAgAFMAeQBzAHQAZQBtAHMAIABJAG4AYwBvAHIAcABvAHIAYQB0AGUAZAAgACgAaAB0AHQAcAA6AC8ALwB3AHcAdwAuAGEAZABvAGIAZQAuAGMAbwBtAC8AKQAuAEEAZABvAGIAZQAgAEIAbABhAG4AawAgADIAUgBlAGcAdQBsAGEAcgAyAC4AMAAwADEAOwBBAEQAQgBPADsAQQBkAG8AYgBlAEIAbABhAG4AawAyADsAQQBEAE8AQgBFAFYAZQByAHMAaQBvAG4AIAAyAC4AMAAwADEAOwBQAFMAIAAyAC4AMAAwADEAOwBoAG8AdABjAG8AbgB2ACAAMQAuADAALgA4ADgAOwBtAGEAawBlAG8AdABmAC4AbABpAGIAMgAuADUALgA2ADUAMAAxADIAQQBkAG8AYgBlAEIAbABhAG4AawAyAEEAZABvAGIAZQAgAFMAeQBzAHQAZQBtAHMAIABJAG4AYwBvAHIAcABvAHIAYQB0AGUAZABoAHQAdABwADoALwAvAHcAdwB3AC4AYQBkAG8AYgBlAC4AYwBvAG0ALwB0AHkAcABlAC8AVABoAGkAcwAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUAIABpAHMAIABsAGkAYwBlAG4AcwBlAGQAIAB1AG4AZABlAHIAIAB0AGgAZQAgAFMASQBMACAATwBwAGUAbgAgAEYAbwBuAHQAIABMAGkAYwBlAG4AcwBlACwAIABWAGUAcgBzAGkAbwBuACAAMQAuADEALgAgAFQAaABpAHMAIABGAG8AbgB0ACAAUwBvAGYAdAB3AGEAcgBlACAAaQBzACAAZABpAHMAdAByAGkAYgB1AHQAZQBkACAAbwBuACAAYQBuACAAIgBBAFMAIABJAFMAIgAgAEIAQQBTAEkAUwAsACAAVwBJAFQASABPAFUAVAAgAFcAQQBSAFIAQQBOAFQASQBFAFMAIABPAFIAIABDAE8ATgBEAEkAVABJAE8ATgBTACAATwBGACAAQQBOAFkAIABLAEkATgBEACwAIABlAGkAdABoAGUAcgAgAGUAeABwAHIAZQBzAHMAIABvAHIAIABpAG0AcABsAGkAZQBkAC4AIABTAGUAZQAgAHQAaABlACAAUwBJAEwAIABPAHAAZQBuACAARgBvAG4AdAAgAEwAaQBjAGUAbgBzAGUAIABmAG8AcgAgAHQAaABlACAAcwBwAGUAYwBpAGYAaQBjACAAbABhAG4AZwB1AGEAZwBlACwAIABwAGUAcgBtAGkAcwBzAGkAbwBuAHMAIABhAG4AZAAgAGwAaQBtAGkAdABhAHQAaQBvAG4AcwAgAGcAbwB2AGUAcgBuAGkAbgBnACAAeQBvAHUAcgAgAHUAcwBlACAAbwBmACAAdABoAGkAcwAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUALgBoAHQAdABwADoALwAvAHMAYwByAGkAcAB0AHMALgBzAGkAbAAuAG8AcgBnAC8ATwBGAEwAAAAAAAEAAwAKAAAADAANAAAAAAD0AAAAAAAAABMAAAAAAADX/wAAAAEAAOAAAAD9zwAAAAEAAP3wAAD//QAAAAEAAQAAAAH//QAAAAEAAgAAAAL//QAAAAEAAwAAAAP//QAAAAEABAAAAAT//QAAAAEABQAAAAX//QAAAAEABgAAAAb//QAAAAEABwAAAAf//QAAAAEACAAAAAj//QAAAAEACQAAAAn//QAAAAEACgAAAAr//QAAAAEACwAAAAv//QAAAAEADAAAAAz//QAAAAEADQAAAA3//QAAAAEADgAAAA7//QAAAAEADwAAAA///QAAAAEAEAAAABD//QAAAAEAAwAAAAAAAP+1ADIAAAAAAAAAAAAAAAAAAAAAAAAAAAEABAIAAQEBDEFkb2JlQmxhbmsyAAEBAS34G/gciwwe+B0B+B4Ci/sM+gD6BAUeKgAfDB+NDCL3Uw/3WRH3Vgwl96wMJAAFAQEGDlZjcEFkb2JlSWRlbnRpdHlDb3B5cmlnaHQgMjAxMywgMjAxNSBBZG9iZSBTeXN0ZW1zIEluY29ycG9yYXRlZCAoaHR0cDovL3d3dy5hZG9iZS5jb20vKS5BZG9iZSBCbGFuayAyQWRvYmVCbGFuazItMgAAAAABAAAAAAIBAUxO+nz7DLf6JLcB9xC3+Sy3A/cQ+gQV/nz5hPp8B/1Y/icV+dIH98X8MwWmsBX7xfg3Bfj2BqZiFf3SB/vF+DMFcGYV98X8NwX89gYOiw4AAQEBCfgfDCaX97kS+46LHAVGiwa9Cr0LAAAAA+gAfAAAAAAAAAABAAAAAA==';

const CUSTOM_FONT = `url(data:font/opentype;base64,AAEAAAAKAIAAAwAgT1MvMgSEBCEAAAEoAAAATmNtYXAADABzAAABgAAAACxnbHlmCAE5AgAAAbQAAAAUaGVhZARxAiIAAACsAAAANmhoZWEIAQQDAAAA5AAAACRobXR4BAAAAAAAAXgAAAAIbG9jYQAKAAAAAAGsAAAABm1heHAABAACAAABCAAAACBuYW1lACMIXgAAAcgAAAAgcG9zdAADAAAAAAHoAAAAIAABAAAAAQAAayoF118PPPUAAgQAAAAAANBme+sAAAAA0PVBQgAAAAAEAAQAAAAAAAACAAAAAAAAAAEAAAQAAAAAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAIAQAAAAAAAQAAAAAAAAAAAAEAAAAAAAAAQADAAEAAAAMAAQAIAAAAAQABAABAAAAQP//AAAAQP///8EAAQAAAAAAAAAAAAoAAAABAAAAAAQABAAAAQAAMQEEAAQAAAAAAgAeAAMAAQQJAAEAAgAAAAMAAQQJAAIAAgAAAEAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('opentype')`

const R_FONT_FACE = /\@font-face\s+\{([\s\S]*?)\}/g;
const R_CSS_PAIR = /^\s*([a-zA-Z\-]+)\s*:\s*([\s\S]+?)\s*;?$/mg;
const R_URL_SRC = /^\s*url\(([\s\S]*?)\)(?:\s+format\(([\s\S]*?)\))?\s*$/;

const USE_FONTS_API = false;

const mimes = {
  woff: 'application/font-woff',
  woff2: 'application/font-woff2',
  otf: 'font/opentype',
  ttf: 'application/x-font-ttf'
};

const DEFAULT_TEXT = 'test@';

let testId = 0;

const getFontFamily = () => {
  return 'font_test' + testId++;
};

const getFontType = (font, family) => {
  return `${ font.style || '' } ${ font.variant || '' } ${ font.weight || '' } ${ font.stretch || '' } 48px ${ family || font.family }`
};

const wrap = (obj) => {
  return JSON.stringify(obj, null, '  ');
}

class Fonts {
  static create(family, source, descriptor) {
    if (USE_FONTS_API && document.fonts && window.FontFace) {
      return new FontAPI(
        new FontFace(family, source, descriptor)
      );
    }

    return new FontShim(family, source, descriptor);
  }

  static loadFontData(url, callback, errback) {
    const xhr = new XMLHttpRequest();
    let done = false;

    xhr.open('GET', url, true);

    xhr.responseType = 'blob';

    if (xhr.responseType !== 'blob') {
      xhr.responseType = 'arraybuffer';

      // This is only needed for IE<10, but it also doesn't support btoa()
      // there there is not point support it.
      // if (xhr.responseType !== 'arraybuffer') {
      //   xhr.overrideMimeType('text/plain; charset=x-user-defined');
      // }
    }

    xhr.onload = () => {
      if (done) return;
      done = true;

      if (!callback) return;

      const response = xhr.response;

      let blob;
      let string;

      if (response instanceof Blob) {
        blob = response;
      }

      else if (response instanceof ArrayBuffer) {
        try {
          blob = new Blob([response], {
            type: mimes['woff']
          });
        } catch (e) {
          try {
            const BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            let builder = new BlobBuilder();

            builder.append(content);
            blob = builder.getBlob();
            builder = null;
          } catch (e) {
            const arr = new Uint8Array(response);
            string = String.fromCharCode.apply(String, arr);
          }
        }
      }

      else {
        string = response
      }

      let url;

      callback({
        getUrl() {
          if (url) return url;

          if (blob) {
            url = (window.URL || window.webkitURL).createObjectURL(blob);
          } else {
            url = `data:${ mimes['woff'] };base64,` + btoa(string);
          }

          return url;
        },

        revokeUrl() {
          url = null;
        }
      });
    };

    xhr.onerror = function() {
      if (done) return;
      done = true;

      errback && errback();
    };

    xhr.send();
  }

  static parseStylesheet(content) {
    const fonts = [];

    let face;

    while (face = R_FONT_FACE.exec(content)) {
      const font = new Font();
      const faceData = face[1];
      let pair;

      while (pair = R_CSS_PAIR.exec(faceData)) {
        const prop = pair[1].replace('font-', '');

        if (prop === 'unicode-range') {
          font.unicodeRange = pair[2];
        } else if (prop === 'feature-settings') {
          font.featureSettings = pair[2];
        } else {
          font[prop] = prop === 'family' ? pair[2].replace(/'|"/g, '') : pair[2];
        }
      }

      fonts.push(font);
    }

    return fonts;
  }

  static parseUrlSrc(urlSrc) {
    const match = urlSrc.match(R_URL_SRC);

    if (!match) {
      return [];
    }

    return [
      match[1].replace(/'|"/g, ''),
      match[2]
    ];
  }

  static createLoaderElement(fontType) {
    const elem = document.createElement('span');

    elem.style.display = 'inline';
    elem.style.font = fontType;
    elem.style.position = 'absolute';
    elem.style.top = '-1000px';
    elem.style.left = '-1000px';
    elem.style.visibility = 'hidden';
    elem.textContent = DEFAULT_TEXT;

    document.body.appendChild(elem);

    return elem;
  }

  static getBrowserDefaults() {
    const immediateSource = `local('there_is_no_font')`;
    const loadingSource = `url(data:font/opentype;base64,1) format('opentype')`;

    let family = getFontFamily();
    Fonts.injectFontFace(family, immediateSource, {});

    let fontType = '48px ' + family;
    let elem = Fonts.createLoaderElement(fontType);

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('2d');
    gl.font = fontType;

    const fallbackWidth = gl.measureText(DEFAULT_TEXT).width;

    family = getFontFamily();
    Fonts.injectFontFace(family, loadingSource, {});

    fontType = '48px ' + family;
    // elem = Fonts.createLoaderElement(fontType);
    elem.style.font = fontType;
    gl.font = fontType;

    const loadingWidth = gl.measureText(DEFAULT_TEXT).width;

    Fonts.browserDefaults = {
      fallbackWidth, loadingWidth
    };

    console.log(Fonts.browserDefaults);

    // document.body.removeChild(elem);
  }

  static checkFont(font, callback) {
    if (!Fonts.browserDefaults) {
      Fonts.getBrowserDefaults();
    }

    console.log(font);

    const family = getFontFamily();
    // const source = font.localSrc.join(', ') + `, url(${ BLANK_FONT }) format('opentype')`;
    // const source = `local('there_is_no_font') url(data:font/opentype;base64,1) format('opentype')`;
    // const source = font.localSrc.join(', ');
    // const source = font.localSrc.join(', ') + `, url(data:font/opentype;base64,1) format('opentype')`;
    const source = font.localSrc.join(', ') + ', ' + CUSTOM_FONT;
    // const source = `url(AdobeBlank.otf) format('opentype')`;
    // const source = CUSTOM_FONT;
    const fontType = Fonts.injectFont(family, source, font);

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('2d');
    gl.font = fontType;

    const width = gl.measureText(DEFAULT_TEXT).width;
    console.log('check font', width, Fonts.browserDefaults);

    const measure = () => {
      const newWidth = gl.measureText(DEFAULT_TEXT).width;

      console.log({ newWidth, width }, Fonts.browserDefaults);
    };

    // measure();
    setTimeout(measure, 500);

    if (
      width !== Fonts.browserDefaults.loadingWidth &&
      Fonts.browserDefaults.loadingWidth !== Fonts.browserDefaults.fallbackWidth
    ) {
      return true;
    }

    if (
      width !== Fonts.browserDefaults.fallbackWidth &&
      Fonts.browserDefaults.loadingWidth === Fonts.browserDefaults.fallbackWidth
    ) {
      return true;
    }

    return false;
  }

  static injectFont(family, source, font) {
    Fonts.injectFontFace(family, source, font);

    let fontType = getFontType(font, family);
    let elem = Fonts.createLoaderElement(fontType);

    return fontType;
  }

  static injectFontFace(family, source, desc) {
    const fields = [
      `font-family: ${ family };`,
      `src: ${ source };`,
    ];

    if (desc.weight) fields.push(`font-weight: ${ desc.weight };`);
    if (desc.style) fields.push(`font-style: ${ desc.style };`);
    if (desc.stretch) fields.push(`font-stretch: ${ desc.stretch };`);
    if (desc.variant) fields.push(`font-variant: ${ desc.variant };`);
    if (desc.unicodeRange) fields.push(`font-unicode-range: ${ desc.unicodeRange };`);
    if (desc.featureSettings) fields.push(`font-feature-settings: ${ desc.featureSettings };`);

    const code = `@font-face {
      ${ fields.join('\n') }
    }`;

    const style = document.createElement('style');
    style.textContent = code;

    document.querySelector('head').appendChild(style);
  }

  static load(stylesheet, callback, errback) {
    const isURL = /^([a-zA-Z]+:)?\/\//.test(stylesheet);
    const load = (content) => {
      const fonts = Fonts.parseStylesheet(content);

      Fonts.loadFonts(fonts, callback, errback);
    };

    if (isURL) {
      Fonts.loadFile(stylesheet, load, errback());
    } else {
      load(stylesheet);
    }
  }

  static loadFonts(fonts, callback, errback) {
    Fonts.loadFont(fonts[0], callback, errback);
  }

  static loadFont(font, callback, errback) {
    if (USE_FONTS_API && document.fonts && window.FontFace) {
      var fontFace = new FontFace(font.family, font.src, font);

      font.load().then(() => callback(font), () => errback(font));
    } else {
      font.parseSources();

      // Fonts.checkFont(font)
      // return;

      const check = Fonts.checkFont(font);

      console.log('check', check);

      if (check) {
        // inject with right family
        setTimeout(() => {
          Fonts.injectFont(font.family, font.localSrc.join(', '), font);
          callback(font);
        });

        return;
      }

      if (!font.urlSrc.length) {
        setTimeout(errback);
        return;
      }

      const fontUrl = Fonts.parseUrlSrc(font.urlSrc[0]);

      if (!fontUrl[0]) {
        setTimeout(errback);
        return;
      }

      Fonts.loadFontData(fontUrl[0], (fontData) => {
        let source = `url(${ fontData.getUrl() })`;

        if (fontUrl[1]) {
          source += ` format(${ fontUrl[1] })`;
        }

        const fontType = Fonts.injectFont(font.family, source, font);

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('2d');
        gl.font = fontType;

        var interval = setInterval(() => {
          const width = gl.measureText(DEFAULT_TEXT).width;

          if (width === Fonts.browserDefaults.loadingWidth) {
            // loadingWidth === fallbackWidth and someone loaded
            // Times New Roman, then it i will shown after timeout
            return;
          }

          if (width === Fonts.browserDefaults.fallbackWidth) {
            // someone loaded Times New Roman, ready
          }

          clearTimeout(timeout)
          clearInterval(interval);
          callback(font);
        }, 50);

        var timeout = setTimeout(() => {
          clearInterval(interval);
          callback(font);
        }, 500);
      }, errback);
    }
  }

  static add(font) {
    font.addToDocument(document);
  }
}

class Font {
  constructor(source, family, weight, style) {
    if (!source) return;

    if (typeof family === 'string') {
      this.src = source;
      this.family = family;
      this.weight = weight;
      this.style = style;
    } else {
      this.src = source.src;
      this.family = source.family;
      this.weight = source.weight;
      this.style = source.style;
      this.stretch = source.stretch;
      this.variant = source.variant;
      this.unicodeRange = source.unicodeRange;
      this.featureSettings = source.featureSettings;
    }
  }

  parseSources() {
    if (this.localSrc) return;

    const sources = this.src.trim().split(/\s*,\s*/);

    const localSources = [];
    const urlSources = [];

    for (let i = 0, len = sources.length; i < len; i++) {
      const source = sources[i];

      if (source.indexOf('local') === 0) {
        localSources.push(source);
      } else {
        urlSources.push(source);
      }
    }

    this.localSrc = localSources;
    this.urlSrc = urlSources;
  }
}

class FontShim {
  constructor(family, source, descriptor) {
    this.family = family;
    this.source = source;
    this.descriptor = descriptor;
  }

  load(callback, errback) {
    Fonts.loadFont(this.source, (fontData) => {
      this.loaded = true;
      this.fontData = fontData;
    }, () => errback())
  }
}

class FontAPI {
  constructor(fontFace) {
    this.fontFace = fontFace;
  }

  load(callback, errback) {
    this.fontFace.load().then(() => {
      this.loaded = true;
      callback()
    }, () => errback());
  }
}

window.Fonts = Fonts;