var levels = [];
var numLevels = 16;
var levelSize = 3;
var sizeUp = 4;

for (let level = 1; level <= numLevels; level++) {
  levels[level] = {
    "id": level,
    "size": levelSize,
    "image": "img/" + level + ".jpg"
  };

  if(level % sizeUp === 0){
    levelSize++;
  }
}

function $_GET(key) {
  var s = window.location.search;
  s = s.match(new RegExp(key + '=([^&=]+)'));
  return s ? s[1] : false;
}
