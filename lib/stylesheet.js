(function() { 'use strict';

var R_FONT_FACE = /\@font-face\s+\{([\s\S]*?)\}/g;
var R_CSS_PAIR = /\s*([a-zA-Z\-]+)\s*:\s*([\s\S]+?)\s*(?:;|$)/g;

Fonts.loadFile = function (url, callback, errback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      callback && callback(xhr.response);
    } else {
      errback && errback();
    }
  };

  xhr.onerror = errback;
  xhr.send();
};

Fonts.parseStylesheet = function (content) {
  var fonts = [];
  var face = undefined;

  while (face = R_FONT_FACE.exec(content)) {
    var font = new Font();
    var faceData = face[1].trim();
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
}; }());