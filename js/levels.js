let levels = [];
let numLevels = 16;
let levelSize = 3;
let sizeUp = 4;

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

function viewportToggle(type) {
  let linksContainer = document.querySelector('.menu');
  let gameContainer = document.querySelector('.game');
  let gameMessage = document.querySelector('.message');
  
  if(type == 'menu'){
    linksContainer.style.display = 'flex';
    linksContainer.innerHTML = '';
    gameContainer.style.display = 'none';
  }else{
    linksContainer.style.display = 'none';
    linksContainer.innerHTML = '';
    gameContainer.style.display = 'flex';
    gameMessage.style.display = "none";
  }
}

function getLinks() {
  let linksContainer = document.querySelector('.menu');

  viewportToggle('menu');
  
  let title = document.createElement('h1');
  title.innerHTML = 'Выберите<br>категорию';
  linksContainer.append(title);

  let links = document.createElement('div');
  links.classList.add('main-images');

  for (const key in categories) {
    let linkCat = document.createElement('a');
    linkCat.innerHTML = '<div class="cat-text">' + categories[key].name + '</div>';
    linkCat.setAttribute('onclick', 'getLevels(' + categories[key].id + ')');
    linkCat.classList.add('cat' + categories[key].id);

    let imgCat = document.createElement('img');
    imgCat.src =  'img/' + categories[key].folder + '/1.jpg';

    linkCat.append(imgCat);

    links.append(linkCat);
  }

  linksContainer.append(links);
}

function getLevels(category) {
  let storage = window.localStorage;
  let linksContainer = document.querySelector('.menu');

  viewportToggle('menu');
  
  let title = document.createElement('h1');
  title.innerHTML = 'Выберите<br>изображение';
  linksContainer.append(title);

  let links = document.createElement('div');
  links.classList.add('main-images');

  for (const key in levels) {
    let linkLevel = document.createElement('a');
    linkLevel.setAttribute('onclick', 'getLevel(' + levels[key].id + ', ' +  categories[category].id + ')');
    linkLevel.classList.add('level' + levels[key].id);

    let imgLevel = document.createElement('img');
    imgLevel.src =  'img/' + categories[category].folder + '/' + levels[key].image;

    linkLevel.append(imgLevel);

    links.append(linkLevel);
  }

  linksContainer.append(links);

  let backButton = document.createElement('a');
  backButton.classList.add('back-button');
  backButton.setAttribute('onclick', 'getLinks()');
  backButton.innerHTML = 'Категории';

  linksContainer.append(backButton);

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

function getLevel(level, category) {
  viewportToggle('game');

  let menuButton = document.querySelector('.menu-button');
  menuButton.setAttribute('onclick', 'getLevels(' + categories[category].id + ')');

  size = levels[level].size;
  gameImage = 'img/' + categories[category].folder + '/' + levels[level].image;

  newGame(level, category, size, gameImage);
}
