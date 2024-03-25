let storage = window.localStorage;
let gameContainer = document.querySelector('.game');
let gameTable = document.getElementById('tiles');
let gameStepInfo = document.querySelector('.steps-count_info');
let gameSoundIcon = document.querySelector('.sound-button');
let gameMessage = document.querySelector('.message');
let gameNextLink = document.querySelector('.next-button');
let gameDownloadLink = document.querySelector('.download-button');
let menuContainer = document.querySelector('.menu');
let menuButton = document.querySelector('.menu-button');
let audio = document.getElementById('sound');

let soundOff = storage.getItem('soundOff');
if (soundOff == 'yes') gameSoundIcon.classList.add('sound-disable');

const RIGHT_ARROW = 39;
const LEFT_ARROW = 37;
const UP_ARROW = 40;
const DOWN_ARROW = 38;

window.onkeydown = function (event) {
  if (typeof game !== 'undefined' && game.start == true) {
    if (event.keyCode === RIGHT_ARROW) {
      swap(game.highlighted - 1);
    } else if (event.keyCode === LEFT_ARROW) {
      swap(game.highlighted + 1);
    } else if (event.keyCode === UP_ARROW) {
      swap(game.highlighted - game.size);
    } else if (event.keyCode === DOWN_ARROW) {
      swap(game.highlighted + game.size);
    }
  }
}

window.addEventListener("resize", function () {
  resizeGame();
}, false);

function resizeGame() {
  let orient = window.matchMedia("(orientation: portrait)");

  if (orient.matches) {
    let width = gameContainer.clientWidth * 0.9;
    gameTable.style.width = width + "px";
    gameTable.style.height = width + "px";
  } else {
    let height = gameContainer.clientHeight * 0.8;
    gameTable.style.width = height + "px";
    gameTable.style.height = height + "px";
  }
}

/**** Create Game ****/
function newGame(setLevel, setCategory) {
  /*** Create Game Obj ***/
  window.game = {
    level: setLevel,
    category: setCategory,
    size: levels[setLevel].size,
    gameImage: categories[setCategory].folder + levels[setLevel].image,
    numberOfTiles: levels[setLevel].size ** 2,
    highlighted: levels[setLevel].size ** 2,
    start: false,
    step: 0
  }
  /*** /Create Game Obj ***/

  let image = new Image();
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d', {
    willReadFrequently: true
  });

  image.src = game.gameImage;
  image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    menuContainer.style.display = "none";
    gameContainer.style.display = 'flex';
    gameMessage.style.display = "none";
    gameTable.innerHTML = '';

    drawGame(context, image);
    resizeGame();
  }
}

function drawGame(context, image) {
  let imageArray = [];
  let cellTile = 0;
  let rowTile = 0;

  for (let index = 1; index <= game.numberOfTiles; index++) {
    let imgTile = document.createElement('img');
    let imgSize = image.width / game.size;
    let imgWidthCut = image.width / game.size * cellTile;
    let imgHeightCut = image.height / game.size * rowTile;

    imgTile.src = cutImage(context, imgWidthCut, imgHeightCut, imgSize, imgSize);
    imgTile.number = index;

    if (index == game.numberOfTiles) imgTile.last = true;

    imageArray.push({
      'number': imgTile.number,
      'image': imgTile
    });

    if (cellTile >= game.size - 1) cellTile = 0;
    else cellTile++;
    rowTile = Math.floor(index / game.size);
  }

  let save = JSON.parse(storage.getItem('category_' + game.category + '_state_' + game.level));

  if (save) {
    game.start = true;
    game.step = save.steps;
    gameStepInfo.textContent = game.step;
    createTiles(imageArray, save);
  } else {
    game.start = false;
    gameStepInfo.textContent = 0;
    createTiles(imageArray);
    shuffle();
  }
}

function createTiles(imageArray, save) {
  imageArray.forEach(function (tile, i) {
    let index = i + 1;
    let newTile = document.createElement('div');
    let number;
    let image;
    let selected;

    if (save) {
      number = imageArray[save.table[i].value - 1].number;
      image = imageArray[save.table[i].value - 1].image;
      selected = save.table[i].selected;
    } else {
      number = tile.image.number;
      image = tile.image;
      selected = tile.image.last;
    }

    newTile.style.width = 100 / game.size + "%";
    newTile.style.height = 100 / game.size + "%";
    newTile.id = `block${index}`;
    newTile.setAttribute('index', index);
    newTile.setAttribute('number', number);
    newTile.setAttribute('onclick', 'swap(' + index + ')');
    newTile.classList.add('block');
    newTile.append(image);

    if (selected) {
      game.highlighted = index;
      newTile.classList.add("selected");
    }

    gameTable.append(newTile);
  });
}

function cutImage(context, x, y, width, height) {
  let imageData = context.getImageData(x, y, width, height);
  let canvasPart = document.createElement('canvas');
  let contextPart = canvasPart.getContext('2d');
  canvasPart.width = width;
  canvasPart.height = height;
  contextPart.putImageData(imageData, 0, 0);
  return canvasPart.toDataURL("image/jpeg");
}
/**** /Create Game ****/

/**** Control Game ****/
function shuffle() {
  let minShuffles = 100;
  let totalShuffles = minShuffles + Math.floor(Math.random() * (100 - 50) + 50 * game.size);

  gameContainer.style.pointerEvents = "none";

  for (let i = minShuffles; i <= totalShuffles; i++) {
    setTimeout(function timer() {
      let x = Math.floor(Math.random() * 4);
      let direction = 0;
      if (x == 0) {
        direction = game.highlighted + 1;
      } else if (x == 1) {
        direction = game.highlighted - 1;
      } else if (x == 2) {
        direction = game.highlighted + game.size;
      } else if (x == 3) {
        direction = game.highlighted - game.size;
      }
      swap(direction);
      if (i >= totalShuffles) {
        gameContainer.style.pointerEvents = "auto";
        game.start = true;
      }
    }, i * 5);
  }
}

function swap(clicked) {
  if (clicked < 1 || clicked > (game.numberOfTiles)) {
    return;
  }

  if (game.start && !soundOff) {
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  }

  if (clicked == game.highlighted + 1) {
    if (clicked % game.size != 1) {
      setSelected(clicked);
    }
  } else if (clicked == game.highlighted - 1) {
    if (clicked % game.size != 0) {
      setSelected(clicked);
    }
  } else if (clicked == game.highlighted + game.size) {
    setSelected(clicked);
  } else if (clicked == game.highlighted - game.size) {
    setSelected(clicked);
  }

  if (game.start) {
    storage.setItem('category_' + game.category + '_state_' + game.level, JSON.stringify(saveGame()));

    if (checkWin()) {
      let winsJSON = JSON.parse(storage.getItem('category_' + game.category + '_wins') || '{}');

      winsJSON[level] = true;

      storage.removeItem('category_' + game.category + '_state_' + game.level);
      storage.setItem('category_' + game.category + '_wins', JSON.stringify(winsJSON));

      gameDownloadLink.setAttribute('href', game.gameImage);

      let nextLevel = game.level + 1;
      if (nextLevel < numLevels) {
        gameNextLink.innerHTML = 'Далее';
        gameNextLink.setAttribute('onclick', 'newGame(' + nextLevel + ', ' + game.category + ')');
      } else {
        gameNextLink.innerHTML = 'Меню';
        gameNextLink.setAttribute('onclick', 'getCategories()');
      }

      setTimeout(function () {
        gameTable.innerHTML = '<img class="original-image" src="' + game.gameImage + '">';
        gameMessage.style.display = "flex";
      }, 500);

      /**** Ads ****/
      if (storage.getItem('mode') == 'yandex') {
        setTimeout(function () {
          window.ysdk.adv.showFullscreenAdv();
        }, 2500);
      }
      /*** /Ads ****/
    }
  }
}

function saveGame() {
  let saveArray = [];
  for (let index = 1; index <= game.numberOfTiles; index++) {
    currentTile = document.getElementById(`block${index}`);
    currentTileValue = currentTile.getAttribute('number');
    saveArray.push({
      'selected': currentTile.classList.contains('selected'),
      'value': parseInt(currentTileValue)
    });
  }

  let gameState = {};
  gameState.table = saveArray;
  gameState.highlighted = game.highlighted;
  gameState.start = game.start;
  gameState.steps = game.step;

  return gameState;
}

function restartGame() {
  if (game.start) {
    game.start = false;
    storage.removeItem('category_' + game.category + '_state_' + game.level);

    /**** Ads ****/
    if (storage.getItem('mode') == 'yandex') {
      window.ysdk.adv.showFullscreenAdv();
    }
    /*** /Ads ****/

    newGame(game.level, game.category);
  }
}

function muteGame() {
  if (soundOff) {
    gameSoundIcon.classList.remove('sound-disable');
    storage.removeItem('soundOff', false);
    soundOff = false;
  } else {
    gameSoundIcon.classList.add('sound-disable');
    storage.setItem('soundOff', 'yes');
    soundOff = true;
  }
}

function checkWin() {
  for (let index = 1; index <= game.numberOfTiles; index++) {
    currentTile = document.getElementById(`block${index}`);
    currentTileIndex = currentTile.getAttribute('index');
    currentTileValue = currentTile.getAttribute('number');
    if (parseInt(currentTileIndex) != parseInt(currentTileValue)) {
      return false;
    }
  }
  return true;
}

function setSelected(index) {
  currentTile = document.getElementById(`block${game.highlighted}`);
  newTile = document.getElementById(`block${index}`);

  currentTileHtml = currentTile.innerHTML;
  currentTileNumber = currentTile.getAttribute('number');

  newTileHtml = newTile.innerHTML;
  newTileNumber = newTile.getAttribute('number');

  currentTile.classList.remove('selected');
  currentTile.innerHTML = newTileHtml;
  currentTile.setAttribute('number', newTileNumber);

  newTile.classList.add("selected");
  newTile.innerHTML = currentTileHtml;
  newTile.setAttribute('number', currentTileNumber);

  game.highlighted = index;
  if (game.start) {
    game.step++;
    gameStepInfo.textContent = game.step;
  }
}
/**** /Control Game ****/

/**** Menu Game ****/
function menuToggle() {
  menuContainer.innerHTML = '';
  menuContainer.style.display = 'flex';
  gameContainer.style.display = 'none';
  game = false;
}

function getCategories() {
  let categories = window.categories;

  menuToggle();

  /*** Create Elements ***/
  let title = document.createElement('h1');
  title.innerHTML = 'Выберите<br>категорию';
  menuContainer.append(title);

  let links = document.createElement('div');
  links.classList.add('main-images');
  /*** /Create Elements ***/

  for (const key in categories) {
    let linkCat = document.createElement('a');
    linkCat.innerHTML = '<div class="cat-text">' + categories[key].name + '</div>';
    linkCat.setAttribute('onclick', 'getLevels(' + categories[key].id + ')');
    linkCat.classList.add('cat' + categories[key].id);

    let imgCat = document.createElement('img');
    imgCat.src = categories[key].folder + '1.jpg';

    linkCat.append(imgCat);

    links.append(linkCat);
  }

  menuContainer.append(links);
}

function getLevels(category) {
  let levels = window.levels;
  let categories = window.categories;

  menuToggle();

  /*** Create Elements ***/
  let title = document.createElement('h1');
  title.innerHTML = 'Выберите<br>изображение';
  menuContainer.append(title);

  let links = document.createElement('div');
  links.classList.add('main-images');

  let backButton = document.createElement('a');
  backButton.classList.add('back-button');
  backButton.setAttribute('onclick', 'getCategories()');
  backButton.innerHTML = 'Категории';
  /*** /Create Elements ***/

  for (const key in levels) {
    let linkLevel = document.createElement('a');
    let imgLevel = document.createElement('img');
    imgLevel.src = categories[category].folder + levels[key].image;
    linkLevel.setAttribute('onclick', 'newGame(' + levels[key].id + ', ' + categories[category].id + ')');
    linkLevel.classList.add('level' + levels[key].id);
    linkLevel.append(imgLevel);
    links.append(linkLevel);
  }

  menuButton.setAttribute('onclick', 'getLevels(' + categories[category].id + ')');
  menuContainer.append(links);
  menuContainer.append(backButton);

  let winsJSON = JSON.parse(storage.getItem('category_' + categories[category].id + '_wins') || '{}');
  for (const key in winsJSON) {
    if (winsJSON[key]) {
      let level = document.querySelector('.level' + key);
      level.classList.add("no-blur");
    }
  }
}
/**** /Menu Game ****/