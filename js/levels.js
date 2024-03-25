window.levels = [];
window.categories = [];

let numLevels = 16;
let levelSize = 3;
let sizeUp = 4;

window.categories[1] = {
  "id": 1,
  "folder": 'img/anime/',
  "name": 'Аниме'
}

window.categories[2] = {
  "id": 2,
  "folder": 'img/cats/',
  "name": 'Котики'
}

for (let level = 1; level <= numLevels; level++) {
  window.levels[level] = {
    "id": level,
    "size": levelSize,
    "image": level + ".jpg"
  };

  if (level % sizeUp === 0) {
    levelSize++;
  }
}