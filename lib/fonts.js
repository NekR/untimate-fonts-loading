(function() { 'use strict';

var USE_FONTS_API = false;
var FONT_SIZE = '48px ';
var DEFAULT_TEXT = 'test';

var doc = document;
var textSamples = {};

var Fonts = window.Fonts = {
  FONT_SIZE: FONT_SIZE,

  getFontType: getFontType,
  Font: Font,
  load: load,
  setSample: function setSample(fontType, sample) {
    textSamples[fontType] = sample;
  }
};

function naitveLoadFont(font) {
  var fontFace = new FontFace(font.family, font.src, font);

  return fontFace.load().then(function () {
    doc.fonts.add(fontFace);
  });
}

function nativeLoadFonts(fonts, callback, errback) {
  var promises = [];
  var used = {};

  for (var i = 0, len = fonts.length; i < len; i++) {
    var font = fonts[i];
    var fontType = getFontType(font);

    if (used[fontType]) continue;
    used[fontType] = true;

    console.log('Fonts API: Loading font:', fontType);

    promises.push(doc.fonts.check(fontType, font.text) ? Promise.resolve() : naitveLoadFont(font));
  }

  Promise.all(promises).then(callback, errback);
}

function load(stylesheet, callback, errback) {
  var isURL = undefined;

  var handleFonts = function handleFonts(fonts) {
    if (USE_FONTS_API && doc.fonts) {
      nativeLoadFonts(fonts, callback, errback);
    } else {
      Fonts.loadFonts(fonts, callback, errback);
    }
  };

  if (Array.isArray(stylesheet)) {
    if (Fonts.loadFonts) {
      handleFonts(stylesheet);
    } else {
      loadFallback(handleFonts);
    }

    return;
  }

  var handleContent = function handleContent(content) {
    handleFonts(parseStylesheet(content));
  };

  isURL = /^([a-zA-Z]+:)?\/\//.test(stylesheet);

  if (USE_FONTS_API && doc.fonts || Fonts.loadFonts) {
    if (isURL) {
      loadFile(stylesheet, handleContent, errback);
    } else {
      handleContent(stylesheet);
    }
  } else {
    loadFallback(handleContent);
  }

  function loadFallback(callback) {
    var count = isURL ? 2 : 1;
    var content = stylesheet;

    function onLoad() {
      if (--count === 0) callback(content);
    }

    if (isURL) {
      loadFile(stylesheet, function (_cont) {
        content = _cont;
        onLoad();
      }, errback);
    }

    var script = doc.createElement('script');
    script.src = Fonts.FALLBACK_FILE;
    script.onload = onLoad;
    script.onerror = errback;

    doc.querySelector('head').appendChild(script);
  }
}

function Font(source, family, weight, style, text) {
  if (!(this instanceof Font)) throw new Error('#3');

  if (typeof source === 'string') {
    this.src = source;
    this.family = family;
    this.weight = weight;
    this.style = style;
    this._text = text;
  }
}

function getFontType(font, family) {
  return ((font.style || '') + ' ' + (font.variant || '') + ' ' + (font.weight || '') + ' ' + (font.stretch || '') + ' ' + FONT_SIZE + ' ' + (family || font.family)).trim().replace(/ +/g, ' ');
}

Font.prototype = {
  get text() {
    if (!this._text) {
      this._text = (textSamples[getFontType(this).replace(FONT_SIZE, '')] || textSamples[this.family] || textSamples['*'] || DEFAULT_TEXT) + '@';
    }

    return _this._text;
  },

  set text(val) {
    this._text = val;
  }
}; }());