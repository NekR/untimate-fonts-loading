
    (function() {
      var module = { exports: {} };

      (function (exports) {
        /****** code begin *********/

        'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setSample = setSample;
exports.loadFontData = loadFontData;
exports.loadFile = loadFile;
exports.parseStylesheet = parseStylesheet;
exports.parseUrlSrc = parseUrlSrc;
exports.createLoaderElement = createLoaderElement;
exports.createCanvas = createCanvas;
exports.getBrowserDefaults = getBrowserDefaults;
exports.drawBrowserDefaults = drawBrowserDefaults;
exports.checkFont = checkFont;
exports.injectFont = injectFont;
exports.injectFontFace = injectFontFace;
exports.load = load;
exports.nativeLoadFonts = nativeLoadFonts;
exports.loadFonts = loadFonts;
exports.loadFont = loadFont;
exports.getVisualBuffer = getVisualBuffer;
exports.Font = Font;
var CUSTOM_FONT = 'url(data:font/opentype;base64,AAEAAAAKAIAAAwAgT1MvMgSEBCEAAAEoAAAATmNtYXAADABzAAABgAAAACxnbHlmCAE5AgAAAbQAAAAUaGVhZARxAiIAAACsAAAANmhoZWEIAQQDAAAA5AAAACRobXR4BAAAAAAAAXgAAAAIbG9jYQAKAAAAAAGsAAAABm1heHAABAACAAABCAAAACBuYW1lACMIXgAAAcgAAAAgcG9zdAADAAAAAAHoAAAAIAABAAAAAQAAayoF118PPPUAAgQAAAAAANBme+sAAAAA0PVBQgAAAAAEAAQAAAAAAAACAAAAAAAAAAEAAAQAAAAAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAIAQAAAAAAAQAAAAAAAAAAAAEAAAAAAAAAQADAAEAAAAMAAQAIAAAAAQABAABAAAAQP//AAAAQP///8EAAQAAAAAAAAAAAAoAAAABAAAAAAQABAAAAQAAMQEEAAQAAAAAAgAeAAMAAQQJAAEAAgAAAAMAAQQJAAIAAgAAAEAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format(\'opentype\')';

var R_FONT_FACE = /\@font-face\s+\{([\s\S]*?)\}/g;
var R_CSS_PAIR = /\s*([a-zA-Z\-]+)\s*:\s*([\s\S]+?)\s*(?:;|$)/g;
var R_URL_SRC = /^\s*url\(([\s\S]*?)\)(?:\s+format\(([\s\S]*?)\))?\s*$/;

var USE_FONTS_API = false;

var mimes = {
  // change font/woff to application/font-woff if there will be any errors
  woff: 'font/woff',
  woff2: 'font/woff2',
  otf: 'font/opentype',
  ttf: 'font/ttf',
  eot: 'font/eot'
};

var DEFAULT_TEXT = 'test';
var NO_FONT = 'local(\'there_is_no_font\')';
var FONT_SIZE = '48px ';

var FEATURE_SETTINGS = 'featureSettings';
var UNICODE_RANGE = 'unicodeRange';

var CSS_FEATURE_SETTINGS = 'feature-settings';
var CSS_UNICODE_RANGE = 'unicode-range';
var CSS_FONT = 'font-';

var win = window;
var doc = document;

var IS_IE = doc.documentMode;
var IS_ANDROID_STOCK = 'isApplicationInstalled' in navigator;

var testId = 0;
var defaultsMap = {};
var textSamples = {};

var getFontFamily = function getFontFamily() {
  return 'font_test' + testId++;
};

var getFontType = function getFontType(font, family) {
  return ((font.style || '') + ' ' + (font.variant || '') + ' ' + (font.weight || '') + ' ' + (font.stretch || '') + ' ' + FONT_SIZE + ' ' + (family || font.family)).trim().replace(/ +/g, ' ');
};

function setSample(fontType, sample) {
  textSamples[fontType] = sample;
}

function loadFontData(url, callback, errback) {
  var xhr = new XMLHttpRequest();
  var done = false;

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
      getUrl: function getUrl() {
        return url;
      },
      removeUrl: function removeUrl() {}
    });

    return;
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
  var unicodeRange = undefined;

  var face = undefined;

  while (face = R_FONT_FACE.exec(content)) {
    var font = new Font();
    var faceData = face[1].trim();
    var pair = undefined;

    while (pair = R_CSS_PAIR.exec(faceData)) {
      var prop = pair[1].replace(CSS_FONT, '');
      var val = pair[2];

      if (prop === CSS_UNICODE_RANGE) {
        font[UNICODE_RANGE] = val;
        unicodeRange = true;
      } else if (prop === CSS_FEATURE_SETTINGS) {
        font[FEATURE_SETTINGS] = val;
      } else {
        font[prop] = prop === 'family' ? val.replace(/'|"/g, '') : val;
      }
    }

    fonts.push(font);
  }

  return { fonts: fonts, unicodeRange: unicodeRange };
}

function parseUrlSrc(urlSrc) {
  var match = urlSrc.match(R_URL_SRC);

  if (!match) {
    return [];
  }

  return [match[1].replace(/'|"/g, ''), match[2].replace(/'|"/g, '')];
}

function createLoaderElement(fontType, text) {
  var elem = doc.createElement('div');

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
  var gl = doc.createElement('canvas').getContext('2d');
  gl.font = fontType;

  return gl;
}

function getBrowserDefaults(font) {
  if (defaultsMap[font.text]) {
    return defaultsMap[font.text];
  }

  var immediateSource = NO_FONT;
  var loadingSource = NO_FONT + (', url(data:' + mimes.otf + ';base64,1) format(\'opentype\')');
  var customSource = NO_FONT + ', ' + CUSTOM_FONT;

  var family = getFontFamily();
  injectFontFace(family, immediateSource, {});

  var fontType = FONT_SIZE + family;
  var elem = createLoaderElement(fontType, font.text);

  var gl = createCanvas(fontType);
  var fallbackWidth = gl.measureText(font.text).width;
  var fallbackType = fontType;

  {
    family = getFontFamily();
    injectFontFace(family, loadingSource, {});

    fontType = FONT_SIZE + family;
    // elem = createLoaderElement(fontType, font.text);
    elem.style.font = fontType;
    gl.font = fontType;
  }

  var loadingWidth = gl.measureText(font.text).width;
  var hasLoadingWidth = fallbackWidth !== loadingWidth;
  var customWidth = undefined;

  // if (!hasLoadingWidth) {
  family = getFontFamily();
  injectFontFace(family, customSource, {});

  fontType = FONT_SIZE + family;
  // elem = createLoaderElement(fontType, font.text);
  elem.style.font = fontType;
  gl.font = fontType;

  customWidth = gl.measureText(font.text).width;
  // }

  var defaults = defaultsMap[font.text] = {
    fallbackWidth: fallbackWidth, loadingWidth: loadingWidth,
    customWidth: customWidth, hasLoadingWidth: hasLoadingWidth,
    gl: gl, font: fallbackType
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

function checkFont(font) {
  var browserDefaults = getBrowserDefaults(font);

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

  var width = gl.measureText(font.text).width;
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
  createLoaderElement(fontType, font.text);

  return fontType;
}

function injectFontFace(family, source, desc) {
  var fields = [CSS_FONT + 'family: \'' + family + '\';', 'src: ' + source + ';'];

  if (desc.weight) fields.push(CSS_FONT + 'weight: ' + desc.weight + ';');
  if (desc.style) fields.push(CSS_FONT + 'style: ' + desc.style + ';');
  if (desc.stretch) fields.push(CSS_FONT + 'stretch: ' + desc.stretch + ';');
  if (desc.variant) fields.push(CSS_FONT + 'variant: ' + desc.variant + ';');
  if (desc[UNICODE_RANGE]) fields.push('' + CSS_FONT + CSS_UNICODE_RANGE + ': ' + desc[UNICODE_RANGE] + ';');
  if (desc[FEATURE_SETTINGS]) fields.push('' + CSS_FONT + CSS_FEATURE_SETTINGS + ': ' + desc[FEATURE_SETTINGS] + ';');

  var code = '@' + CSS_FONT + 'face {\n    ' + fields.join('\n') + '\n  }';

  var style = doc.createElement('style');
  style.textContent = code;

  doc.querySelector('head').appendChild(style);
  // IE hack, force apply style
  IS_IE && style.appendChild(doc.createTextNode(''));
}

function load(stylesheet, callback, errback) {
  var isURL = /^([a-zA-Z]+:)?\/\//.test(stylesheet);
  var load = function load(content) {
    var _parseStylesheet = parseStylesheet(content);

    var fonts = _parseStylesheet.fonts;
    var unicodeRange = _parseStylesheet.unicodeRange;


    console.log(fonts);

    if ((USE_FONTS_API || unicodeRange) && doc.fonts) {
      nativeLoadFonts(content, fonts, callback, errback);
    } else if (!unicodeRange) {
      loadFonts(fonts, callback, errback);
    } else {
      setTimeout(errback, 0, '#4');
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

    promises.push(doc.fonts.load(fontType, font.text));
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
    setTimeout(errback, 0, '#1');
    return;
  }

  var urlSrc = font.urlSrc;

  if (!urlSrc.length) {
    setTimeout(errback);
    return;
  }

  var index = 0;

  var load = function load() {
    if (urlSrc.length === index) {
      setTimeout(errback);
      return;
    }

    var fontUrl = parseUrlSrc(urlSrc[index++]);

    if (!fontUrl[0]) {
      setTimeout(errback);
      return;
    }

    var format = fontUrl[1];

    if (
    // eot ignored because IE cannot handle it properly
    // woff2 ignored because only browsers with Font Loading API support it
    format === 'embedded-opentype' || format === 'woff2' && (IS_IE || urlSrc.length > 1) || format === 'woff' && IS_ANDROID_STOCK) {
      setTimeout(load);
      return;
    }

    loadFontData(fontUrl[0], function (fontData) {
      var source = 'url(' + fontData.getUrl() + ')';

      if (fontUrl[1]) {
        source += ' format(\'' + format + '\')';
      }

      console.log('Loading source:', source);

      source += ', ' + CUSTOM_FONT;

      var fontType = injectFont(font.family, source, font);
      var gl = createCanvas(fontType);
      var browserDefaults = getBrowserDefaults(font);

      var prepareVisualCheck = function prepareVisualCheck() {
        gl.textAlign = 'left';
        gl.textBaseline = 'bottom';
        drawBrowserDefaults(browserDefaults, font.text);
      };

      var clean = function clean() {
        clearTimeout(timeout);
        clearInterval(interval);
        fontData.revokeUrl();
      };

      var interval = setInterval(function () {
        var width = gl.measureText(font.text).width;

        console.log('Final width', width);

        if (width === browserDefaults.customWidth) {
          clean();
          load();
          return;
        }

        if (width === browserDefaults.loadingWidth && browserDefaults.hasLoadingWidth) {
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

          var fallbackBuffer = browserDefaults.buffer;
          var currentBuffer = getVisualBuffer(gl);
          var length = currentBuffer.length;

          for (var i = 3; i < length; i += 4) {
            if (currentBuffer[i] !== fallbackBuffer[i]) {
              console.log('Visually match');
              break fallback;
            }
          }

          console.log('Didn\'t match visually');
          return;
        }

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

function getVisualBuffer(gl) {
  return gl.getImageData(0, 0, 50, 50).data;
}

function Font(source, family, weight, style) {
  // Save bytes
  var _this = this;

  if (!(_this instanceof Font)) throw new Error('#3');

  if (typeof source === 'string') {
    _this.src = source;
    _this.family = family;
    _this.weight = weight;
    _this.style = style;
  }

  Object.defineProperty(_this, 'text', {
    get: function get() {
      if (!_this._text) {
        _this._text = (textSamples[getFontType(_this).replace(FONT_SIZE, '')] || textSamples['*'] || DEFAULT_TEXT) + '@';
      }

      return _this._text;
    },
    set: function set(val) {
      _this._text = val;
    }
  });
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
  