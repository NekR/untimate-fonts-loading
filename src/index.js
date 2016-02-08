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
    const loadingSource = `local('there_is_no_font'), url(data:font/opentype;base64,1) format('opentype')`;
    const customSource = `local('there_is_no_font'), ` + CUSTOM_FONT;

    let family = getFontFamily();
    Fonts.injectFontFace(family, immediateSource, {});

    let fontType = '48px ' + family;
    let elem = Fonts.createLoaderElement(fontType);

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('2d');
    gl.font = fontType;

    const fallbackWidth = gl.measureText(DEFAULT_TEXT).width;

    {
      family = getFontFamily();
      Fonts.injectFontFace(family, loadingSource, {});

      fontType = '48px ' + family;
      // elem = Fonts.createLoaderElement(fontType);
      elem.style.font = fontType;
      gl.font = fontType;
    }

    const loadingWidth = gl.measureText(DEFAULT_TEXT).width;
    const hasLoadingWidth = fallbackWidth !== loadingWidth;
    let customWidth;

    if (!hasLoadingWidth) {
      family = getFontFamily();
      Fonts.injectFontFace(family, customSource, {});

      fontType = '48px ' + family;
      // elem = Fonts.createLoaderElement(fontType);
      elem.style.font = fontType;
      gl.font = fontType;

      customWidth = gl.measureText(DEFAULT_TEXT).width;
    }

    Fonts.browserDefaults = {
      fallbackWidth, loadingWidth, customWidth, hasLoadingWidth
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

    // Loading with is reported only when there is no local font (loading external)
    if (
      Fonts.browserDefaults.hasLoadingWidth &&
      width !== Fonts.browserDefaults.loadingWidth
    ) {
      console.log('Exists because not loading with');
      return true;
    }

    if (
      !Fonts.browserDefaults.hasLoadingWidth &&
      width !== Fonts.browserDefaults.fallbackWidth &&
      width !== Fonts.browserDefaults.customWidth
    ) {
      console.log('Exists because not fallback and not custom');
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

      const check = Fonts.checkFont(font);

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

          console.log('width', width);

          if (width === Fonts.browserDefaults.loadingWidth) {
            // loadingWidth === fallbackWidth and someone loaded
            // default font. It will be shown after timeout
            return;
          }

          // if (width === Fonts.browserDefaults.fallbackWidth) {
            // someone loaded default font, display it
          // }

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

window.Fonts = Fonts;