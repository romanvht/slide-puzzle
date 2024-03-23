let levels = [];
let numLevels = 16;
let levelSize = 2;
let sizeUp = 0;

let categories = [];

categories[1] = {
  "id": 1,
  "folder": 'anime',
  "name": 'Аниме'
}

categories[2] = {
  "id": 2,
  "folder": 'cats',
  "name": 'Котики'
}

for (let level = 1; level <= numLevels; level++) {
  levels[level] = {
    "id": level,
    "size": levelSize,
    "image": level + ".jpg"
  };

  if (level % sizeUp === 0) {
    levelSize++;
  }
}

function $_GET(key) {
  let s = window.location.search;
  s = s.match(new RegExp(key + '=([^&=]+)'));
  return s ? parseInt(s[1]) : false;
}

function getLinks() {
  let storage = window.localStorage;
  let linksContainer = document.querySelector('.menu');
  
  let title = document.createElement('h1');
  title.innerHTML = 'Выберите<br>категорию';
  linksContainer.append(title);

  let links = document.createElement('div');
  links.classList.add('main-images');

  for (const key in categories) {
    let linkCat = document.createElement('a');
    linkCat.innerHTML = '<div class="cat-text">' + categories[key].name + '</div>';
    linkCat.href = '?cat=' + categories[key].id;
    linkCat.classList.add('cat' + categories[key].id);

    let imgCat = document.createElement('img');
    imgCat.src =  'img/' + categories[key].folder + '/1.jpg';

    linkCat.append(imgCat);

    links.append(linkCat);
  }

  linksContainer.append(links);

  /*let winsJSON = JSON.parse(storage.getItem('wins') || '{}');

  for (const key in winsJSON) {
    if (winsJSON[key].win) {
      let level = document.querySelector('.' + key);
      level.classList.add("no-blur");
    }
  }*/
}

function getLevels(category) {
  let storage = window.localStorage;
  let linksContainer = document.querySelector('.menu');
  
  let title = document.createElement('h1');
  title.innerHTML = 'Выберите<br>изображение';
  linksContainer.append(title);

  let links = document.createElement('div');
  links.classList.add('main-images');

  for (const key in levels) {
    let linkLevel = document.createElement('a');
    linkLevel.href = '?level=' + levels[key].id;
    linkLevel.classList.add('level' + levels[key].id);

    let imgLevel = document.createElement('img');
    imgLevel.src =  'img/' + categories[category].folder + '/' + levels[key].image;

    linkLevel.append(imgLevel);

    links.append(linkLevel);
  }

  linksContainer.append(links);

  let winsJSON = JSON.parse(storage.getItem('category_' + category + '_wins') || '{}');

  for (const key in winsJSON) {
    console.log(key);
    if (winsJSON[key]) {
      let level = document.querySelector('.level' + key);
      level.classList.add("no-blur");
    }
  }

  storage.setItem('category', category);
}

function getLevel(level) {
  let storage = window.localStorage;
  let category = storage.getItem('category');

  let menu = document.querySelector('.menu');
  menu.style.display = "none";

  let game = document.querySelector('.game');
  game.style.display = "flex";

  size = levels[level].size;
  gameImage = 'img/' + categories[category].folder + '/' + levels[level].image;

  newGame(level, size, gameImage);
}
