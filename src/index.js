const CUSTOM_FONT = `url(data:font/opentype;base64,AAEAAAAKAIAAAwAgT1MvMgSEBCEAAAEoAAAATmNtYXAADABzAAABgAAAACxnbHlmCAE5AgAAAbQAAAAUaGVhZARxAiIAAACsAAAANmhoZWEIAQQDAAAA5AAAACRobXR4BAAAAAAAAXgAAAAIbG9jYQAKAAAAAAGsAAAABm1heHAABAACAAABCAAAACBuYW1lACMIXgAAAcgAAAAgcG9zdAADAAAAAAHoAAAAIAABAAAAAQAAayoF118PPPUAAgQAAAAAANBme+sAAAAA0PVBQgAAAAAEAAQAAAAAAAACAAAAAAAAAAEAAAQAAAAAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAIAQAAAAAAAQAAAAAAAAAAAAEAAAAAAAAAQADAAEAAAAMAAQAIAAAAAQABAABAAAAQP//AAAAQP///8EAAQAAAAAAAAAAAAoAAAABAAAAAAQABAAAAQAAMQEEAAQAAAAAAgAeAAMAAQQJAAEAAgAAAAMAAQQJAAIAAgAAAEAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('opentype')`;

const R_FONT_FACE = /\@font-face\s+\{([\s\S]*?)\}/g;
const R_CSS_PAIR = /^\s*([a-zA-Z\-]+)\s*:\s*([\s\S]+?)\s*;?$/mg;
const R_URL_SRC = /^\s*url\(([\s\S]*?)\)(?:\s+format\(([\s\S]*?)\))?\s*$/;

const USE_FONTS_API = true;

const mimes = {
  woff: 'application/font-woff',
  woff2: 'application/font-woff2',
  otf: 'font/opentype',
  ttf: 'application/x-font-ttf'
};

const DEFAULT_TEXT = 'test@';
const NO_FONT = `local('there_is_no_font')`;


const win = window;
const doc = document;

let testId = 0;
let browserDefaults = null;

const getFontFamily = () => {
  return 'font_test' + testId++;
};

const getFontType = (font, family) => {
  return `${ font.style || '' } ${ font.variant || '' } ${ font.weight || '' } ${ font.stretch || '' } 48px ${ family || font.family }`
};

export function create() {
  
}

export function loadFontData(url, callback, errback) {
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

  const dotIndex = url.lastIndexOf('.');
  const ext = url.slice(dotIndex + 1);

  xhr.onload = () => {
    if (done) return;
    done = true;

    if (xhr.status !== 200) {
      errback && errback();
      return;
    }

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
          type: mimes[ext]
        });
      } catch (e) {
        console.log('1', e.message);
        try {
          const BlobBuilder = win.WebKitBlobBuilder || win.MozBlobBuilder || win.MSBlobBuilder;
          let builder = new BlobBuilder();

          builder.append(response);
          blob = builder.getBlob();
          builder = null;
        } catch (e) {
          console.log('2', e.message);
          const arr = new Uint8Array(response);
          string = String.fromCharCode.apply(String, arr);
        }
      }
    }

    else {
      // Fallback here to browser's default fonts loading
      // e.g. inject font-face as is and call `callback`
      // throw for now

      throw new Error('#2');
    }

    let url;

    callback({
      getUrl() {
        if (url) {
          // do nothing
        } else if (blob) {
          url = (win.URL || win.webkitURL).createObjectURL(blob);
        } else {
          url = `data:${ mimes[ext] };base64,` + btoa(string);
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

export function loadFile(url, callback, errback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = () => {
    if (xhr.status == 200) {
      callback && callback(xhr.response);
    } else {
      errback && errback();
    }
  };

  xhr.onerror = errback;
  xhr.send();
}

export function parseStylesheet(content) {
  const fonts = [];

  let face;

  while (face = R_FONT_FACE.exec(content)) {
    const font = new Font();
    const faceData = face[1];
    let pair;

    while (pair = R_CSS_PAIR.exec(faceData)) {
      const prop = pair[1].replace('font-', '');
      const val = pair[2];

      if (prop === 'unicode-range') {
        font.unicodeRange = val;
      } else if (prop === 'feature-settings') {
        font.featureSettings = val;
      } else {
        font[prop] = prop === 'family' ? val.replace(/'|"/g, '') : val;
      }
    }

    fonts.push(font);
  }

  return fonts;
}

export function parseUrlSrc(urlSrc) {
  const match = urlSrc.match(R_URL_SRC);

  if (!match) {
    return [];
  }

  return [
    match[1].replace(/'|"/g, ''),
    match[2]
  ];
}

export function createLoaderElement(fontType) {
  const elem = doc.createElement('span');

  elem.style.display = 'inline';
  elem.style.font = fontType;
  elem.style.position = 'absolute';
  // elem.style.top = '-1000px';
  // elem.style.left = '-1000px';
  // elem.style.visibility = 'hidden';
  elem.textContent = DEFAULT_TEXT;

  doc.body.appendChild(elem);
  return elem;
}

export function createCanvas(fontType) {
  const gl = doc.createElement('canvas').getContext('2d');
  gl.font = fontType;

  return gl;
}

export function getBrowserDefaults() {
  const immediateSource = NO_FONT;
  const loadingSource   = NO_FONT + `, url(${ mimes.otf };base64,1) format('opentype')`;
  const customSource    = NO_FONT + `, ` + CUSTOM_FONT;

  let family = getFontFamily();
  injectFontFace(family, immediateSource, {});

  let fontType = '48px ' + family;
  let elem = createLoaderElement(fontType);

  const gl = createCanvas(fontType);
  const fallbackWidth = gl.measureText(DEFAULT_TEXT).width;

  {
    family = getFontFamily();
    injectFontFace(family, loadingSource, {});

    fontType = '48px ' + family;
    // elem = createLoaderElement(fontType);
    elem.style.font = fontType;
    gl.font = fontType;
  }

  const loadingWidth = gl.measureText(DEFAULT_TEXT).width;
  const hasLoadingWidth = fallbackWidth !== loadingWidth;
  let customWidth;

  // if (!hasLoadingWidth) {
    family = getFontFamily();
    injectFontFace(family, customSource, {});

    fontType = '48px ' + family;
    // elem = createLoaderElement(fontType);
    elem.style.font = fontType;
    gl.font = fontType;

    customWidth = gl.measureText(DEFAULT_TEXT).width;
  // }

  browserDefaults = {
    fallbackWidth, loadingWidth, customWidth, hasLoadingWidth
  };

  console.log(browserDefaults);

  // document.body.removeChild(elem);
}

export function checkFont(font) {
  if (!browserDefaults) {
    getBrowserDefaults();
  }

  if (!font.localSrc.length) {
    return false;
  }

  // console.log(font);

  const family = getFontFamily();
  // const source = font.localSrc.join(', ') + `, url(${ BLANK_FONT }) format('opentype')`;
  // const source = `local('there_is_no_font') url(data:font/opentype;base64,1) format('opentype')`;
  // const source = font.localSrc.join(', ');
  // const source = font.localSrc.join(', ') + `, url(data:font/opentype;base64,1) format('opentype')`;
  const source = font.localSrc.join(', ') + ', ' + CUSTOM_FONT;
  // const source = `url(AdobeBlank.otf) format('opentype')`;
  // const source = CUSTOM_FONT;
  const fontType = injectFont(family, source, font);
  const gl = createCanvas(fontType);

  const width = gl.measureText(DEFAULT_TEXT).width;
  console.log('check font', width, browserDefaults);

  // Loading with is reported only when there is no local font (loading external)
  if (
    browserDefaults.hasLoadingWidth &&
    width !== browserDefaults.loadingWidth &&
    width !== browserDefaults.customWidth
  ) {
    console.log('Exists because not loading with');
    return true;
  }

  if (
    !browserDefaults.hasLoadingWidth &&
    width !== browserDefaults.fallbackWidth &&
    width !== browserDefaults.customWidth
  ) {
    console.log('Exists because not fallback and not custom');
    return true;
  }

  return false;
}

export function injectFont(family, source, font) {
  injectFontFace(family, source, font);

  const fontType = getFontType(font, family);
  createLoaderElement(fontType);

  return fontType;
}

export function injectFontFace(family, source, desc) {
  const fields = [
    `font-family: '${ family }';`,
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

  const style = doc.createElement('style');
  style.textContent = code;

  doc.querySelector('head').appendChild(style);
  // IE hack, force apply style
  doc.documentMode && style.appendChild(doc.createTextNode(''));
}

export function load(stylesheet, callback, errback) {
  const isURL = /^([a-zA-Z]+:)?\/\//.test(stylesheet);
  const load = (content) => {
    const fonts = parseStylesheet(content);

    if (USE_FONTS_API && doc.fonts) {
      nativeLoadFonts(content, fonts, callback, errback);
    } else {
      loadFonts(fonts, callback, errback);
    }
  };

  if (isURL) {
    loadFile(stylesheet, load, errback);
  } else {
    load(stylesheet);
  }
}

export function nativeLoadFonts(stylesheet, fonts, callback, errback) {
  const style = doc.createElement('style');
  style.textContent = stylesheet;

  doc.querySelector('head').appendChild(style);

  const promises = [];
  const used = {};

  for (let i = 0, len = fonts.length; i < len; i++) {
    const font = fonts[i];
    const fontType = getFontType(font);

    if (used[fontType]) continue;
    used[fontType] = true;

    console.log('Loading font:', fontType);

    promises.push(
      doc.fonts.load(fontType, DEFAULT_TEXT)
    );
  }

  Promise.all(promises).then(callback, errback);
}

export function loadFonts(fonts, callback, errback) {
  let count = fonts.length;
  let hasError = false;

  for (let i = 0, len = fonts.length; i < len; i++) {
    loadFont(fonts[i], () => {
      if (!--count) {
        hasError ? errback && errback() : callback && callback();
      }
    }, () => {
      hasError = true;
      if (!--count) errback && errback();
    });
  }
}

export function loadFont(font, callback, errback) {
  if (USE_FONTS_API && doc.fonts && win.FontFace) {
    console.log(font.family, font.src, font);
    var fontFace = new FontFace(font.family, font.src, font);

    fontFace.load().then(() => {
      console.log('Promise success');
      doc.fonts.add(fontFace);

      callback(font);
    }, (e) => {
      console.error('Promise reject', e);
      errback()
    });

    return;
  }

  font.parseSources();

  const check = checkFont(font);

  if (check) {
    // inject with right family
    setTimeout(() => {
      injectFont(font.family, font.localSrc.join(', '), font);
      callback(font);
    });

    return;
  }

  if (font.unicodeRange) {
    setTimeout(() => errback('Error: #1'));
    return;
  }

  if (!font.urlSrc.length) {
    setTimeout(errback);
    return;
  }

  let index = 0;

  const load = () => {
    if (font.urlSrc.length === index) {
      setTimeout(errback)
      return;
    }

    const fontUrl = parseUrlSrc(font.urlSrc[index++]);

    if (!fontUrl[0]) {
      setTimeout(errback);
      return;
    }

    loadFontData(fontUrl[0], (fontData) => {
      let source = `url(${ fontData.getUrl() })`;

      if (fontUrl[1]) {
        source += ` format(${ fontUrl[1] })`;
      }

      console.log('Loading source:', source);

      source += ', ' + CUSTOM_FONT

      const fontType = injectFont(font.family, source, font);
      const gl = createCanvas(fontType);

      const clean = () => {
        clearTimeout(timeout)
        clearInterval(interval);
        fontData.revokeUrl();
      };

      var interval = setInterval(() => {
        const width = gl.measureText(DEFAULT_TEXT).width;

        console.log('Final width', width);

        if (width === browserDefaults.customWidth) {
          clean();
          load();
        }

        if (width === browserDefaults.loadingWidth) {
          // loadingWidth === fallbackWidth and someone loaded
          // default font. It will be shown after timeout
          return;
        }

        // if (width === browserDefaults.fallbackWidth) {
          // someone loaded default font, display it
        // }

        clean();
        callback(font);
      }, 50);

      var timeout = setTimeout(() => {
        clean();
        callback(font);
      }, 500);
    }, () => load());
  };

  load();
}


export function Font(source, family, weight, style) {
  if (!source) return;
  // Save bytes
  const _this = this;

  if (!(_this instanceof Font)) throw new Error('#3');

  if (typeof family === 'string') {
    _this.src = source;
    _this.family = family;
    _this.weight = weight;
    _this.style = style;
  } else {
    _this.src = source.src;
    _this.family = source.family;
    _this.weight = source.weight;
    _this.style = source.style;
    _this.stretch = source.stretch;
    _this.variant = source.variant;
    _this.unicodeRange = source.unicodeRange;
    _this.featureSettings = source.featureSettings;
  }
}

Font.prototype.parseSources = function() {
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