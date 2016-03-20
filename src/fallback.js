const CUSTOM_FONT = `url(data:font/opentype;base64,AAEAAAAKAIAAAwAgT1MvMgSEBCEAAAEoAAAATmNtYXAADABzAAABgAAAACxnbHlmCAE5AgAAAbQAAAAUaGVhZARxAiIAAACsAAAANmhoZWEIAQQDAAAA5AAAACRobXR4BAAAAAAAAXgAAAAIbG9jYQAKAAAAAAGsAAAABm1heHAABAACAAABCAAAACBuYW1lACMIXgAAAcgAAAAgcG9zdAADAAAAAAHoAAAAIAABAAAAAQAAayoF118PPPUAAgQAAAAAANBme+sAAAAA0PVBQgAAAAAEAAQAAAAAAAACAAAAAAAAAAEAAAQAAAAAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAIAQAAAAAAAQAAAAAAAAAAAAEAAAAAAAAAQADAAEAAAAMAAQAIAAAAAQABAABAAAAQP//AAAAQP///8EAAQAAAAAAAAAAAAoAAAABAAAAAAQABAAAAQAAMQEEAAQAAAAAAgAeAAMAAQQJAAEAAgAAAAMAAQQJAAIAAgAAAEAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('opentype')`;

const R_URL_SRC = /^\s*url\(([\s\S]*?)\)(?:\s+format\(([\s\S]*?)\))?\s*$/;

const mimes = {
  // change font/woff to application/font-woff if there will be any errors
  woff: 'font/woff',
  woff2: 'font/woff2',
  otf: 'font/opentype',
  ttf: 'font/ttf',
  eot: 'font/eot'
};

const NO_FONT = `local('there_is_no_font')`;
const FONT_SIZE = Fonts.FONT_SIZE;

const win = window;
const doc = document;

const IS_IE = doc.documentMode;
const IS_ANDROID_STOCK = 'isApplicationInstalled' in navigator;

let testId = 0;
let defaultsMap = {};

Fonts.loadFonts = loadFonts;

function getFontFamily() {
  return 'font_test' + testId++;
}

function loadFontData(url, callback, errback) {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);

  try {
    xhr.responseType = 'blob';

    if (xhr.responseType !== 'blob') {
      xhr.responseType = 'arraybuffer';

      if (xhr.responseType !== 'arraybuffer') {
        throw 1;
      }
    }
  } catch (e) {
    callback({
      getUrl() {
        return url;
      },
      removeUrl() {}
    });

    return;
  }

  let done = false;
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

function parseUrlSrc(urlSrc) {
  const match = urlSrc.match(R_URL_SRC);

  if (!match) {
    return [];
  }

  return [
    match[1].replace(/'|"/g, ''),
    match[2].replace(/'|"/g, '')
  ];
}

function createLoaderElement(fontType, text) {
  const elem = doc.createElement('div');

  elem.style.font = fontType;
  elem.style.position = 'absolute';
  elem.style.top = '-1000px';
  elem.style.left = '-1000px';
  elem.style.visibility = 'hidden';
  elem.textContent = text;

  doc.body.appendChild(elem);
  return elem;
}

function createCanvas(fontType) {
  const gl = doc.createElement('canvas').getContext('2d');
  gl.font = fontType;

  return gl;
}

function getBrowserDefaults(font) {
  if (defaultsMap[font.text]) {
    return defaultsMap[font.text];
  }

  const immediateSource = NO_FONT;
  const loadingSource   = NO_FONT + `, url(data:${ mimes.otf };base64,1) format('opentype')`;
  const customSource    = NO_FONT + `, ` + CUSTOM_FONT;

  let family = getFontFamily();
  injectFontFace(family, immediateSource);

  let fontType = FONT_SIZE + family;
  let elem = createLoaderElement(fontType, font.text);

  const gl = createCanvas(fontType);
  const fallbackWidth = gl.measureText(font.text).width;
  const fallbackType = fontType;

  {
    family = getFontFamily();
    injectFontFace(family, loadingSource);

    fontType = FONT_SIZE + family;
    // elem = createLoaderElement(fontType, font.text);
    elem.style.font = fontType;
    gl.font = fontType;
  }

  const loadingWidth = gl.measureText(font.text).width;
  const hasLoadingWidth = fallbackWidth !== loadingWidth;
  let customWidth;

  // if (!hasLoadingWidth) {
    family = getFontFamily();
    injectFontFace(family, customSource);

    fontType = FONT_SIZE + family;
    // elem = createLoaderElement(fontType, font.text);
    elem.style.font = fontType;
    gl.font = fontType;

    customWidth = gl.measureText(font.text).width;
  // }

  const defaults = defaultsMap[font.text] = {
    fallbackWidth, loadingWidth,
    customWidth, hasLoadingWidth,
    gl, font: fallbackType
  };

  console.log(defaults);
  // document.body.removeChild(elem);

  return defaults;
}

function drawBrowserDefaults(browserDefaults, text) {
  if (browserDefaults.buffer) return;

  browserDefaults.gl.font = browserDefaults.font;
  browserDefaults.gl.textAlign = 'left';
  browserDefaults.gl.textBaseline = 'bottom';
  browserDefaults.gl.fillText(text, 0, 50);
  browserDefaults.buffer = getVisualBuffer(browserDefaults.gl);
}

function hasFont(font) {
  font.parseSources();

  if (!font.localSrc.length) {
    return false;
  }

  // console.log(font);

  const browserDefaults = getBrowserDefaults(font);
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

  const width = gl.measureText(font.text).width;
  console.log('check font', width, browserDefaults);

  if (
    width === browserDefaults.customWidth ||
    (browserDefaults.hasLoadingWidth && width === browserDefaults.loadingWidth)
  ) {
    return false;
  }

  return true;

  /*// Loading with is reported only when there is no local font (loading external)
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

  return false;*/
}

function injectFont(family, source, font) {
  injectFontFace(family, source, font);

  const fontType = getFontType(font, family);
  createLoaderElement(fontType, font.text);

  return fontType;
}

function injectFontFace(family, source, desc) {
  const fields = [
    `font-family: '${ family }';`,
    `src: ${ source };`,
  ];

  if (desc) {
    if (desc.weight) fields.push(`font-weight: ${ desc.weight };`);
    if (desc.style) fields.push(`font-style: ${ desc.style };`);
    if (desc.stretch) fields.push(`font-stretch: ${ desc.stretch };`);
    if (desc.variant) fields.push(`font-variant: ${ desc.variant };`);
    if (desc.unicodeRange) fields.push(`unicode-range: ${ desc.featureSettings };`);
    if (desc.featureSettings) fields.push(`font-feature-settings: ${ desc.featureSettings };`);
  }

  const code = `@font-face {
    ${ fields.join('\n') }
  }`;

  const style = doc.createElement('style');
  style.textContent = code;

  doc.querySelector('head').appendChild(style);
  // IE hack, force apply style
  // see: https://github.com/typekit/webfontloader/issues/241
  IS_IE && style.appendChild(doc.createTextNode(''));
}

function loadFonts(fonts, callback, errback) {
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

function loadFont(font, callback, errback) {
  const check = hasFont(font);

  if (check) {
    // inject with right family
    setTimeout(() => {
      injectFont(font.family, font.localSrc.join(', '), font);
      callback(font);
    });

    return;
  }

  // Allow unicode-range
  /*if (font.unicodeRange) {
    setTimeout(errback, 0, '#1');
    return;
  }*/

  const urlSrc = font.urlSrc;

  if (!urlSrc.length) {
    setTimeout(errback);
    return;
  }

  let index = 0;

  const load = () => {
    if (urlSrc.length === index) {
      setTimeout(errback)
      return;
    }

    const fontUrl = parseUrlSrc(urlSrc[index++]);

    if (!fontUrl[0]) {
      setTimeout(errback);
      return;
    }

    const format = fontUrl[1];

    if (
      // * eot ignored because IE cannot handle it properly
      // * woff2 ignored because only browsers with Font Loading API support it
      // * woff is ignored in Android Default browser 4.3<=
      format === 'embedded-opentype' ||
      (format === 'woff2' && (IS_IE || urlSrc.length > 1)) ||
      (format === 'woff' && IS_ANDROID_STOCK)
    ) {
      setTimeout(load);
      return;
    }

    loadFontData(fontUrl[0], (fontData) => {
      let source = `url(${ fontData.getUrl() })`;

      if (fontUrl[1]) {
        source += ` format('${ format }')`;
      }

      console.log('Loading source:', source);

      source += ', ' + CUSTOM_FONT

      const fontType = injectFont(font.family, source, font);
      const gl = createCanvas(fontType);
      const browserDefaults = getBrowserDefaults(font);

      let prepareVisualCheck = () => {
        gl.textAlign = 'left';
        gl.textBaseline = 'bottom';
        drawBrowserDefaults(browserDefaults, font.text);
      };

      const clean = () => {
        clearTimeout(timeout)
        clearInterval(interval);
        fontData.revokeUrl();
      };

      var interval = setInterval(() => {
        const width = gl.measureText(font.text).width;

        console.log('Final width', width);

        if (width === browserDefaults.customWidth) {
          clean();
          load();
          return;
        }

        if (
          width === browserDefaults.loadingWidth &&
          browserDefaults.hasLoadingWidth
        ) {
          // loadingWidth === fallbackWidth and someone loaded
          // default font. It will be shown after timeout
          return;
        }

        fallback: if (width === browserDefaults.fallbackWidth) {
          if (prepareVisualCheck) {
            prepareVisualCheck();
            prepareVisualCheck = null;
          }

          gl.clearRect(0, 0, 50, 50);
          gl.fillText(font.text, 0, 50);

          const fallbackBuffer = browserDefaults.buffer;
          const currentBuffer = getVisualBuffer(gl);
          const length = currentBuffer.length;

          for (let i = 3; i < length; i += 4) {
            if (currentBuffer[i] !== fallbackBuffer[i]) {
              console.log('Visually match');
              break fallback;
            }
          }

          console.log(`Didn't match visually`);
          return;
        }

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

function getVisualBuffer(gl) {
  return gl.getImageData(0, 0, 50, 50).data;
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