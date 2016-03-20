const R_FONT_FACE = /\@font-face\s+\{([\s\S]*?)\}/g;
const R_CSS_PAIR = /\s*([a-zA-Z\-]+)\s*:\s*([\s\S]+?)\s*(?:;|$)/g;

Fonts.loadFile = function(url, callback, errback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = () => {
    if (xhr.status === 200) {
      callback && callback(xhr.response);
    } else {
      errback && errback();
    }
  };

  xhr.onerror = errback;
  xhr.send();
}

Fonts.parseStylesheet = function(content) {
  const fonts = [];
  let face;

  while (face = R_FONT_FACE.exec(content)) {
    const font = new Font();
    const faceData = face[1].trim();
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