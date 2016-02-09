
    (function() {
      var module = { exports: {} };

      (function (exports) {
        /****** code begin *********/

        'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.loadFontData = loadFontData;
exports.loadFile = loadFile;
exports.parseStylesheet = parseStylesheet;
exports.parseUrlSrc = parseUrlSrc;
exports.createLoaderElement = createLoaderElement;
exports.createCanvas = createCanvas;
exports.getBrowserDefaults = getBrowserDefaults;
exports.checkFont = checkFont;
exports.injectFont = injectFont;
exports.injectFontFace = injectFontFace;
exports.load = load;
exports.nativeLoadFonts = nativeLoadFonts;
exports.loadFonts = loadFonts;
exports.loadFont = loadFont;
exports.Font = Font;
var CUSTOM_FONT = 'url(data:font/opentype;base64,AAEAAAAKAIAAAwAgT1MvMgSEBCEAAAEoAAAATmNtYXAADABzAAABgAAAACxnbHlmCAE5AgAAAbQAAAAUaGVhZARxAiIAAACsAAAANmhoZWEIAQQDAAAA5AAAACRobXR4BAAAAAAAAXgAAAAIbG9jYQAKAAAAAAGsAAAABm1heHAABAACAAABCAAAACBuYW1lACMIXgAAAcgAAAAgcG9zdAADAAAAAAHoAAAAIAABAAAAAQAAayoF118PPPUAAgQAAAAAANBme+sAAAAA0PVBQgAAAAAEAAQAAAAAAAACAAAAAAAAAAEAAAQAAAAAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAIAQAAAAAAAQAAAAAAAAAAAAEAAAAAAAAAQADAAEAAAAMAAQAIAAAAAQABAABAAAAQP//AAAAQP///8EAAQAAAAAAAAAAAAoAAAABAAAAAAQABAAAAQAAMQEEAAQAAAAAAgAeAAMAAQQJAAEAAgAAAAMAAQQJAAIAAgAAAEAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format(\'opentype\')';

var R_FONT_FACE = /\@font-face\s+\{([\s\S]*?)\}/g;
var R_CSS_PAIR = /^\s*([a-zA-Z\-]+)\s*:\s*([\s\S]+?)\s*;?$/mg;
var R_URL_SRC = /^\s*url\(([\s\S]*?)\)(?:\s+format\(([\s\S]*?)\))?\s*$/;

var USE_FONTS_API = true;

var mimes = {
  woff: 'application/font-woff',
  woff2: 'application/font-woff2',
  otf: 'font/opentype',
  ttf: 'application/x-font-ttf'
};

var DEFAULT_TEXT = 'test@';
var NO_FONT = 'local(\'there_is_no_font\')';

var win = window;
var doc = document;

var testId = 0;
var browserDefaults = null;

var getFontFamily = function getFontFamily() {
  return 'font_test' + testId++;
};

var getFontType = function getFontType(font, family) {
  return (font.style || '') + ' ' + (font.variant || '') + ' ' + (font.weight || '') + ' ' + (font.stretch || '') + ' 48px ' + (family || font.family);
};

function create() {}

function loadFontData(url, callback, errback) {
  var xhr = new XMLHttpRequest();
  var done = false;

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

  var dotIndex = url.lastIndexOf('.');
  var ext = url.slice(dotIndex + 1);

  xhr.onload = function () {
    if (done) return;
    done = true;

    if (xhr.status !== 200) {
      errback && errback();
      return;
    }

    if (!callback) return;

    var response = xhr.response;

    var blob = undefined;
    var string = undefined;

    if (response instanceof Blob) {
      blob = response;
    } else if (response instanceof ArrayBuffer) {
      try {
        blob = new Blob([response], {
          type: mimes[ext]
        });
      } catch (e) {
        console.log('1', e.message);
        try {
          var BlobBuilder = win.WebKitBlobBuilder || win.MozBlobBuilder || win.MSBlobBuilder;
          var builder = new BlobBuilder();

          builder.append(response);
          blob = builder.getBlob();
          builder = null;
        } catch (e) {
          console.log('2', e.message);
          var arr = new Uint8Array(response);
          string = String.fromCharCode.apply(String, arr);
        }
      }
    } else {
      // Fallback here to browser's default fonts loading
      // e.g. inject font-face as is and call `callback`
      // throw for now

      throw new Error('#2');
    }

    var url = undefined;

    callback({
      getUrl: function getUrl() {
        if (url) {
          // do nothing
        } else if (blob) {
            url = (win.URL || win.webkitURL).createObjectURL(blob);
          } else {
            url = 'data:' + mimes[ext] + ';base64,' + btoa(string);
          }

        return url;
      },
      revokeUrl: function revokeUrl() {
        url = null;
      }
    });
  };

  xhr.onerror = function () {
    if (done) return;
    done = true;

    errback && errback();
  };

  xhr.send();
}

function loadFile(url, callback, errback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = function () {
    if (xhr.status == 200) {
      callback && callback(xhr.response);
    } else {
      errback && errback();
    }
  };

  xhr.onerror = errback;
  xhr.send();
}

function parseStylesheet(content) {
  var fonts = [];

  var face = undefined;

  while (face = R_FONT_FACE.exec(content)) {
    var font = new Font();
    var faceData = face[1];
    var pair = undefined;

    while (pair = R_CSS_PAIR.exec(faceData)) {
      var prop = pair[1].replace('font-', '');
      var val = pair[2];

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

function parseUrlSrc(urlSrc) {
  var match = urlSrc.match(R_URL_SRC);

  if (!match) {
    return [];
  }

  return [match[1].replace(/'|"/g, ''), match[2]];
}

function createLoaderElement(fontType) {
  var elem = doc.createElement('span');

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

function createCanvas(fontType) {
  var gl = doc.createElement('canvas').getContext('2d');
  gl.font = fontType;

  return gl;
}

function getBrowserDefaults() {
  var immediateSource = NO_FONT;
  var loadingSource = NO_FONT + (', url(' + mimes.otf + ';base64,1) format(\'opentype\')');
  var customSource = NO_FONT + ', ' + CUSTOM_FONT;

  var family = getFontFamily();
  injectFontFace(family, immediateSource, {});

  var fontType = '48px ' + family;
  var elem = createLoaderElement(fontType);

  var gl = createCanvas(fontType);
  var fallbackWidth = gl.measureText(DEFAULT_TEXT).width;

  {
    family = getFontFamily();
    injectFontFace(family, loadingSource, {});

    fontType = '48px ' + family;
    // elem = createLoaderElement(fontType);
    elem.style.font = fontType;
    gl.font = fontType;
  }

  var loadingWidth = gl.measureText(DEFAULT_TEXT).width;
  var hasLoadingWidth = fallbackWidth !== loadingWidth;
  var customWidth = undefined;

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
    fallbackWidth: fallbackWidth, loadingWidth: loadingWidth, customWidth: customWidth, hasLoadingWidth: hasLoadingWidth
  };

  console.log(browserDefaults);

  // document.body.removeChild(elem);
}

function checkFont(font) {
  if (!browserDefaults) {
    getBrowserDefaults();
  }

  if (!font.localSrc.length) {
    return false;
  }

  // console.log(font);

  var family = getFontFamily();
  // const source = font.localSrc.join(', ') + `, url(${ BLANK_FONT }) format('opentype')`;
  // const source = `local('there_is_no_font') url(data:font/opentype;base64,1) format('opentype')`;
  // const source = font.localSrc.join(', ');
  // const source = font.localSrc.join(', ') + `, url(data:font/opentype;base64,1) format('opentype')`;
  var source = font.localSrc.join(', ') + ', ' + CUSTOM_FONT;
  // const source = `url(AdobeBlank.otf) format('opentype')`;
  // const source = CUSTOM_FONT;
  var fontType = injectFont(family, source, font);
  var gl = createCanvas(fontType);

  var width = gl.measureText(DEFAULT_TEXT).width;
  console.log('check font', width, browserDefaults);

  // Loading with is reported only when there is no local font (loading external)
  if (browserDefaults.hasLoadingWidth && width !== browserDefaults.loadingWidth && width !== browserDefaults.customWidth) {
    console.log('Exists because not loading with');
    return true;
  }

  if (!browserDefaults.hasLoadingWidth && width !== browserDefaults.fallbackWidth && width !== browserDefaults.customWidth) {
    console.log('Exists because not fallback and not custom');
    return true;
  }

  return false;
}

function injectFont(family, source, font) {
  injectFontFace(family, source, font);

  var fontType = getFontType(font, family);
  createLoaderElement(fontType);

  return fontType;
}

function injectFontFace(family, source, desc) {
  var fields = ['font-family: \'' + family + '\';', 'src: ' + source + ';'];

  if (desc.weight) fields.push('font-weight: ' + desc.weight + ';');
  if (desc.style) fields.push('font-style: ' + desc.style + ';');
  if (desc.stretch) fields.push('font-stretch: ' + desc.stretch + ';');
  if (desc.variant) fields.push('font-variant: ' + desc.variant + ';');
  if (desc.unicodeRange) fields.push('font-unicode-range: ' + desc.unicodeRange + ';');
  if (desc.featureSettings) fields.push('font-feature-settings: ' + desc.featureSettings + ';');

  var code = '@font-face {\n    ' + fields.join('\n') + '\n  }';

  var style = doc.createElement('style');
  style.textContent = code;

  doc.querySelector('head').appendChild(style);
  // IE hack, force apply style
  doc.documentMode && style.appendChild(doc.createTextNode(''));
}

function load(stylesheet, callback, errback) {
  var isURL = /^([a-zA-Z]+:)?\/\//.test(stylesheet);
  var load = function load(content) {
    var fonts = parseStylesheet(content);

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

function nativeLoadFonts(stylesheet, fonts, callback, errback) {
  var style = doc.createElement('style');
  style.textContent = stylesheet;

  doc.querySelector('head').appendChild(style);

  var promises = [];
  var used = {};

  for (var i = 0, len = fonts.length; i < len; i++) {
    var font = fonts[i];
    var fontType = getFontType(font);

    if (used[fontType]) continue;
    used[fontType] = true;

    console.log('Loading font:', fontType);

    promises.push(doc.fonts.load(fontType, DEFAULT_TEXT));
  }

  Promise.all(promises).then(callback, errback);
}

function loadFonts(fonts, callback, errback) {
  var count = fonts.length;
  var hasError = false;

  for (var i = 0, len = fonts.length; i < len; i++) {
    loadFont(fonts[i], function () {
      if (! --count) {
        hasError ? errback && errback() : callback && callback();
      }
    }, function () {
      hasError = true;
      if (! --count) errback && errback();
    });
  }
}

function loadFont(font, callback, errback) {
  if (USE_FONTS_API && doc.fonts && win.FontFace) {
    console.log(font.family, font.src, font);
    var fontFace = new FontFace(font.family, font.src, font);

    fontFace.load().then(function () {
      console.log('Promise success');
      doc.fonts.add(fontFace);

      callback(font);
    }, function (e) {
      console.error('Promise reject', e);
      errback();
    });

    return;
  }

  font.parseSources();

  var check = checkFont(font);

  if (check) {
    // inject with right family
    setTimeout(function () {
      injectFont(font.family, font.localSrc.join(', '), font);
      callback(font);
    });

    return;
  }

  if (font.unicodeRange) {
    setTimeout(function () {
      return errback('Error: #1');
    });
    return;
  }

  if (!font.urlSrc.length) {
    setTimeout(errback);
    return;
  }

  var index = 0;

  var load = function load() {
    if (font.urlSrc.length === index) {
      setTimeout(errback);
      return;
    }

    var fontUrl = parseUrlSrc(font.urlSrc[index++]);

    if (!fontUrl[0]) {
      setTimeout(errback);
      return;
    }

    loadFontData(fontUrl[0], function (fontData) {
      var source = 'url(' + fontData.getUrl() + ')';

      if (fontUrl[1]) {
        source += ' format(' + fontUrl[1] + ')';
      }

      console.log('Loading source:', source);

      source += ', ' + CUSTOM_FONT;

      var fontType = injectFont(font.family, source, font);
      var gl = createCanvas(fontType);

      var clean = function clean() {
        clearTimeout(timeout);
        clearInterval(interval);
        fontData.revokeUrl();
      };

      var interval = setInterval(function () {
        var width = gl.measureText(DEFAULT_TEXT).width;

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

      var timeout = setTimeout(function () {
        clean();
        callback(font);
      }, 500);
    }, function () {
      return load();
    });
  };

  load();
}

function Font(source, family, weight, style) {
  if (!source) return;
  // Save bytes
  var _this = this;

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

Font.prototype.parseSources = function () {
  if (this.localSrc) return;

  var sources = this.src.trim().split(/\s*,\s*/);

  var localSources = [];
  var urlSources = [];

  for (var i = 0, len = sources.length; i < len; i++) {
    var source = sources[i];

    if (source.indexOf('local') === 0) {
      localSources.push(source);
    } else {
      urlSources.push(source);
    }
  }

  this.localSrc = localSources;
  this.urlSrc = urlSources;
};

        /****** code end *********/
      }).call(module.exports, module.exports);

      (window || self)['Fonts'] = module.exports;
    }())
  