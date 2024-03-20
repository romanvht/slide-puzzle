let level;
let size;
let gameImage;
let numberOfTiles;
let highlighted;
let storage;

let gameStart = false;
let gameTable = document.getElementById('tiles');
let gameMessage = document.querySelector('.message');
let gameNextLink = document.querySelector('.next-button');
let gameDownloadLink = document.querySelector('.download-button');
let audio = new Audio("mp3/click.mp3");

const RIGHT_ARROW = 39;
const LEFT_ARROW = 37;
const UP_ARROW = 40;
const DOWN_ARROW = 38;

window.onkeydown = function (event) {
  if (event.keyCode === RIGHT_ARROW) {
    swap(highlighted - 1);
  } else if (event.keyCode === LEFT_ARROW) {
    swap(highlighted + 1);
  } else if (event.keyCode === UP_ARROW) {
    swap(highlighted - size);
  } else if (event.keyCode === DOWN_ARROW) {
    swap(highlighted + size);
  }
};

window.addEventListener("resize", function () {
  resizeGame();
}, false);

function newGame(level, size, gameImage) {
  level = level;
  size = size;
  gameImage = gameImage;
  numberOfTiles = size ** 2;
  highlighted = numberOfTiles;
  storage = window.localStorage;

  let image = new Image();
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');

  image.src = gameImage;
  image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    gameTable.innerHTML = '';
    drawGame(context, image);
    resizeGame();
  };
}

function drawGame(context, image) {
  let imageArray = [];
  let cellTile = 0;
  let rowTile = 0;

  for (let index = 1; index <= numberOfTiles; index++) {
    let imgTile = document.createElement('img');
    let imgSize = image.width / size;
    let imgWidthCut = image.width / size * cellTile;
    let imgHeightCut = image.height / size * rowTile;

    imgTile.src = cutImage(context, imgWidthCut, imgHeightCut, imgSize, imgSize);
    imgTile.number = index;

    if (index == numberOfTiles) imgTile.last = true;

    imageArray.push({
      'number': imgTile.number,
      'image': imgTile
    });

    if (cellTile >= size - 1) cellTile = 0;
    else cellTile++;
    rowTile = Math.floor(index / size);
  }

  let save = JSON.parse(storage.getItem('state' + level));

  if (save) {
    createTiles(imageArray, save);
  } else {
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
      gameStart = true;
    } else {
      number = tile.image.number;
      image = tile.image;
      selected = tile.image.last;
    }

    newTile.style.width = 100 / size + "%";
    newTile.style.height = 100 / size + "%";
    newTile.id = `block${index}`;
    newTile.setAttribute('index', index);
    newTile.setAttribute('number', number);
    newTile.setAttribute('onclick', 'swap(' + index + ')');
    newTile.classList.add('block');
    newTile.append(image);

    if (selected) {
      highlighted = index;
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
  return canvasPart.toDataURL();
}

function resizeGame() {
  let orient = window.matchMedia("(orientation: portrait)");

  if (orient.matches) {
    gameTable.style.height = gameTable.offsetWidth + "px";
    gameTable.style.width = null;
  } else {
    gameTable.style.width = gameTable.offsetHeight + "px";
    gameTable.style.height = null;
  }
}

function shuffle() {
  let minShuffles = 100;
  let totalShuffles = minShuffles + Math.floor(Math.random() * (100 - 50) + 50 * size);

  for (let i = minShuffles; i <= totalShuffles; i++) {
    setTimeout(function timer() {
      let x = Math.floor(Math.random() * 4);
      let direction = 0;
      if (x == 0) {
        direction = highlighted + 1;
      } else if (x == 1) {
        direction = highlighted - 1;
      } else if (x == 2) {
        direction = highlighted + size;
      } else if (x == 3) {
        direction = highlighted - size;
      }
      swap(direction, true);
      if (i >= totalShuffles) {
        gameStart = true;
      }
    }, i * 5);
  }
}

function swap(clicked, no_audio) {
  if (clicked < 1 || clicked > (numberOfTiles)) {
    return;
  }

  if(!no_audio){
    audio.pause();
    audio.currentTime=0;
    audio.play();
  }

  if (clicked == highlighted + 1) {
    if (clicked % size != 1) {
      setSelected(clicked);
    }
  } else if (clicked == highlighted - 1) {
    if (clicked % size != 0) {
      setSelected(clicked);
    }
  } else if (clicked == highlighted + size) {
    setSelected(clicked);
  } else if (clicked == highlighted - size) {
    setSelected(clicked);
  }

  if (gameStart) {
    let gameState = {};
    gameState.table = saveGame();
    gameState.highlighted = highlighted;
    gameState.gameStart = gameStart;
    storage.setItem('state' + level, JSON.stringify(gameState));

    if (checkWin()) {
      let winsJSON = JSON.parse(storage.getItem('wins') || '{}');

      winsJSON['level' + level] = {
        'id': level,
        'win': true
      };

      storage.setItem('wins', JSON.stringify(winsJSON));
      storage.removeItem('state' + level);

      setTimeout(function () {
        let nextLevel = level + 1;
        gameTable.innerHTML = '<img class="original-image" src="' + gameImage + '">';
        gameMessage.style.display = "flex";
        gameNextLink.setAttribute('href', '?level=' + nextLevel);
        gameDownloadLink.setAttribute('href', gameImage);
      }, 500);

      /**** Yandex Ads ****/
      if(domain.indexOf("yandex") !== -1){
        setTimeout(function () {
          YaGames.init().then(ysdk => ysdk.adv.showFullscreenAdv());
        }, 2000);
      }
      /*** /Yandex Ads ****/
    }
  }
}

function saveGame() {
  let saveArray = [];
  for (let index = 1; index <= numberOfTiles; index++) {
    currentTile = document.getElementById(`block${index}`);
    currentTileValue = currentTile.getAttribute('number');
    saveArray.push({
      'selected': currentTile.classList.contains('selected'),
      'value': parseInt(currentTileValue)
    });
  }
  return saveArray;
}

function restartGame() {
  gameStart = false;
  storage.removeItem('state' + level);

  /**** Yandex Ads ****/
  if(domain.indexOf("yandex") !== -1){
    YaGames.init().then(ysdk => ysdk.adv.showFullscreenAdv());
  }
  /*** /Yandex Ads ****/

  newGame(level, size, gameImage);
}

function checkWin() {
  for (let index = 1; index <= numberOfTiles; index++) {
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
  currentTile = document.getElementById(`block${highlighted}`);
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

  highlighted = index;
}