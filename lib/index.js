'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CUSTOM_FONT = 'url(data:font/opentype;base64,AAEAAAAKAIAAAwAgT1MvMgSEBCEAAAEoAAAATmNtYXAADABzAAABgAAAACxnbHlmCAE5AgAAAbQAAAAUaGVhZARxAiIAAACsAAAANmhoZWEIAQQDAAAA5AAAACRobXR4BAAAAAAAAXgAAAAIbG9jYQAKAAAAAAGsAAAABm1heHAABAACAAABCAAAACBuYW1lACMIXgAAAcgAAAAgcG9zdAADAAAAAAHoAAAAIAABAAAAAQAAayoF118PPPUAAgQAAAAAANBme+sAAAAA0PVBQgAAAAAEAAQAAAAAAAACAAAAAAAAAAEAAAQAAAAAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAIAQAAAAAAAQAAAAAAAAAAAAEAAAAAAAAAQADAAEAAAAMAAQAIAAAAAQABAABAAAAQP//AAAAQP///8EAAQAAAAAAAAAAAAoAAAABAAAAAAQABAAAAQAAMQEEAAQAAAAAAgAeAAMAAQQJAAEAAgAAAAMAAQQJAAIAAgAAAEAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format(\'opentype\')';

var R_FONT_FACE = /\@font-face\s+\{([\s\S]*?)\}/g;
var R_CSS_PAIR = /^\s*([a-zA-Z\-]+)\s*:\s*([\s\S]+?)\s*;?$/mg;
var R_URL_SRC = /^\s*url\(([\s\S]*?)\)(?:\s+format\(([\s\S]*?)\))?\s*$/;

var USE_FONTS_API = false;

var mimes = {
  woff: 'application/font-woff',
  woff2: 'application/font-woff2',
  otf: 'font/opentype',
  ttf: 'application/x-font-ttf'
};

var DEFAULT_TEXT = 'test@';

var testId = 0;

var getFontFamily = function getFontFamily() {
  return 'font_test' + testId++;
};

var getFontType = function getFontType(font, family) {
  return (font.style || '') + ' ' + (font.variant || '') + ' ' + (font.weight || '') + ' ' + (font.stretch || '') + ' 48px ' + (family || font.family);
};

var wrap = function wrap(obj) {
  return JSON.stringify(obj, null, '  ');
};

var Fonts = (function () {
  function Fonts() {
    _classCallCheck(this, Fonts);
  }

  _createClass(Fonts, null, [{
    key: 'create',
    value: function create(family, source, descriptor) {
      if (USE_FONTS_API && document.fonts && window.FontFace) {
        return new FontAPI(new FontFace(family, source, descriptor));
      }

      return new FontShim(family, source, descriptor);
    }
  }, {
    key: 'loadFontData',
    value: function loadFontData(url, callback, errback) {
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

      xhr.onload = function () {
        if (done) return;
        done = true;

        if (!callback) return;

        var response = xhr.response;

        var blob = undefined;
        var string = undefined;

        if (response instanceof Blob) {
          blob = response;
        } else if (response instanceof ArrayBuffer) {
          try {
            blob = new Blob([response], {
              type: mimes['woff']
            });
          } catch (e) {
            try {
              var BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
              var builder = new BlobBuilder();

              builder.append(content);
              blob = builder.getBlob();
              builder = null;
            } catch (e) {
              var arr = new Uint8Array(response);
              string = String.fromCharCode.apply(String, arr);
            }
          }
        } else {
          string = response;
        }

        var url = undefined;

        callback({
          getUrl: function getUrl() {
            if (url) return url;

            if (blob) {
              url = (window.URL || window.webkitURL).createObjectURL(blob);
            } else {
              url = 'data:' + mimes['woff'] + ';base64,' + btoa(string);
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
  }, {
    key: 'parseStylesheet',
    value: function parseStylesheet(content) {
      var fonts = [];

      var face = undefined;

      while (face = R_FONT_FACE.exec(content)) {
        var font = new Font();
        var faceData = face[1];
        var pair = undefined;

        while (pair = R_CSS_PAIR.exec(faceData)) {
          var prop = pair[1].replace('font-', '');

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
  }, {
    key: 'parseUrlSrc',
    value: function parseUrlSrc(urlSrc) {
      var match = urlSrc.match(R_URL_SRC);

      if (!match) {
        return [];
      }

      return [match[1].replace(/'|"/g, ''), match[2]];
    }
  }, {
    key: 'createLoaderElement',
    value: function createLoaderElement(fontType) {
      var elem = document.createElement('span');

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
  }, {
    key: 'getBrowserDefaults',
    value: function getBrowserDefaults() {
      var immediateSource = 'local(\'there_is_no_font\')';
      var loadingSource = 'local(\'there_is_no_font\'), url(data:font/opentype;base64,1) format(\'opentype\')';
      var customSource = 'local(\'there_is_no_font\'), ' + CUSTOM_FONT;

      var family = getFontFamily();
      Fonts.injectFontFace(family, immediateSource, {});

      var fontType = '48px ' + family;
      var elem = Fonts.createLoaderElement(fontType);

      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('2d');
      gl.font = fontType;

      var fallbackWidth = gl.measureText(DEFAULT_TEXT).width;

      {
        family = getFontFamily();
        Fonts.injectFontFace(family, loadingSource, {});

        fontType = '48px ' + family;
        // elem = Fonts.createLoaderElement(fontType);
        elem.style.font = fontType;
        gl.font = fontType;
      }

      var loadingWidth = gl.measureText(DEFAULT_TEXT).width;
      var hasLoadingWidth = fallbackWidth !== loadingWidth;
      var customWidth = undefined;

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
        fallbackWidth: fallbackWidth, loadingWidth: loadingWidth, customWidth: customWidth, hasLoadingWidth: hasLoadingWidth
      };

      console.log(Fonts.browserDefaults);

      // document.body.removeChild(elem);
    }
  }, {
    key: 'checkFont',
    value: function checkFont(font, callback) {
      if (!Fonts.browserDefaults) {
        Fonts.getBrowserDefaults();
      }

      console.log(font);

      var family = getFontFamily();
      // const source = font.localSrc.join(', ') + `, url(${ BLANK_FONT }) format('opentype')`;
      // const source = `local('there_is_no_font') url(data:font/opentype;base64,1) format('opentype')`;
      // const source = font.localSrc.join(', ');
      // const source = font.localSrc.join(', ') + `, url(data:font/opentype;base64,1) format('opentype')`;
      var source = font.localSrc.join(', ') + ', ' + CUSTOM_FONT;
      // const source = `url(AdobeBlank.otf) format('opentype')`;
      // const source = CUSTOM_FONT;
      var fontType = Fonts.injectFont(family, source, font);

      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('2d');
      gl.font = fontType;

      var width = gl.measureText(DEFAULT_TEXT).width;
      console.log('check font', width, Fonts.browserDefaults);

      var measure = function measure() {
        var newWidth = gl.measureText(DEFAULT_TEXT).width;

        console.log({ newWidth: newWidth, width: width }, Fonts.browserDefaults);
      };

      // measure();
      setTimeout(measure, 500);

      // Loading with is reported only when there is no local font (loading external)
      if (Fonts.browserDefaults.hasLoadingWidth && width !== Fonts.browserDefaults.loadingWidth) {
        console.log('Exists because not loading with');
        return true;
      }

      if (!Fonts.browserDefaults.hasLoadingWidth && width !== Fonts.browserDefaults.fallbackWidth && width !== Fonts.browserDefaults.customWidth) {
        console.log('Exists because not fallback and not custom');
        return true;
      }

      return false;
    }
  }, {
    key: 'injectFont',
    value: function injectFont(family, source, font) {
      Fonts.injectFontFace(family, source, font);

      var fontType = getFontType(font, family);
      var elem = Fonts.createLoaderElement(fontType);

      return fontType;
    }
  }, {
    key: 'injectFontFace',
    value: function injectFontFace(family, source, desc) {
      var fields = ['font-family: ' + family + ';', 'src: ' + source + ';'];

      if (desc.weight) fields.push('font-weight: ' + desc.weight + ';');
      if (desc.style) fields.push('font-style: ' + desc.style + ';');
      if (desc.stretch) fields.push('font-stretch: ' + desc.stretch + ';');
      if (desc.variant) fields.push('font-variant: ' + desc.variant + ';');
      if (desc.unicodeRange) fields.push('font-unicode-range: ' + desc.unicodeRange + ';');
      if (desc.featureSettings) fields.push('font-feature-settings: ' + desc.featureSettings + ';');

      var code = '@font-face {\n      ' + fields.join('\n') + '\n    }';

      var style = document.createElement('style');
      style.textContent = code;

      document.querySelector('head').appendChild(style);
    }
  }, {
    key: 'load',
    value: function load(stylesheet, callback, errback) {
      var isURL = /^([a-zA-Z]+:)?\/\//.test(stylesheet);
      var load = function load(content) {
        var fonts = Fonts.parseStylesheet(content);

        Fonts.loadFonts(fonts, callback, errback);
      };

      if (isURL) {
        Fonts.loadFile(stylesheet, load, errback());
      } else {
        load(stylesheet);
      }
    }
  }, {
    key: 'loadFonts',
    value: function loadFonts(fonts, callback, errback) {
      Fonts.loadFont(fonts[0], callback, errback);
    }
  }, {
    key: 'loadFont',
    value: function loadFont(font, callback, errback) {
      if (USE_FONTS_API && document.fonts && window.FontFace) {
        var fontFace = new FontFace(font.family, font.src, font);

        font.load().then(function () {
          return callback(font);
        }, function () {
          return errback(font);
        });
      } else {
        var _ret = (function () {
          font.parseSources();

          var check = Fonts.checkFont(font);

          if (check) {
            // inject with right family
            setTimeout(function () {
              Fonts.injectFont(font.family, font.localSrc.join(', '), font);
              callback(font);
            });

            return {
              v: undefined
            };
          }

          if (!font.urlSrc.length) {
            setTimeout(errback);
            return {
              v: undefined
            };
          }

          var fontUrl = Fonts.parseUrlSrc(font.urlSrc[0]);

          if (!fontUrl[0]) {
            setTimeout(errback);
            return {
              v: undefined
            };
          }

          Fonts.loadFontData(fontUrl[0], function (fontData) {
            var source = 'url(' + fontData.getUrl() + ')';

            if (fontUrl[1]) {
              source += ' format(' + fontUrl[1] + ')';
            }

            var fontType = Fonts.injectFont(font.family, source, font);

            var canvas = document.createElement('canvas');
            var gl = canvas.getContext('2d');
            gl.font = fontType;

            var interval = setInterval(function () {
              var width = gl.measureText(DEFAULT_TEXT).width;

              console.log('width', width);

              if (width === Fonts.browserDefaults.loadingWidth) {
                // loadingWidth === fallbackWidth and someone loaded
                // default font. It will be shown after timeout
                return;
              }

              // if (width === Fonts.browserDefaults.fallbackWidth) {
              // someone loaded default font, display it
              // }

              clearTimeout(timeout);
              clearInterval(interval);
              callback(font);
            }, 50);

            var timeout = setTimeout(function () {
              clearInterval(interval);
              callback(font);
            }, 500);
          }, errback);
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
    }
  }]);

  return Fonts;
})();

var Font = (function () {
  function Font(source, family, weight, style) {
    _classCallCheck(this, Font);

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

  _createClass(Font, [{
    key: 'parseSources',
    value: function parseSources() {
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
    }
  }]);

  return Font;
})();

window.Fonts = Fonts;