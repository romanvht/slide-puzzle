let level;
let size;
let step;
let gameImage;
let numberOfTiles;
let highlighted;
let storage = window.localStorage;

let gameStart = false;
let gameTable = document.getElementById('tiles');
let audio = document.getElementById('sound');
let gameStepInfo = document.querySelector('.steps-count_info');
let gameSoundIcon = document.querySelector('.sound-button');
let gameMessage = document.querySelector('.message');
let gameNextLink = document.querySelector('.next-button');
let gameDownloadLink = document.querySelector('.download-button');

let soundOff = storage.getItem('soundOff');
if (soundOff == 'yes') gameSoundIcon.classList.add('sound-disable');

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

function newGame(setLevel, setSize, setImage) {
  level = setLevel;
  size = setSize;
  gameImage = setImage;
  numberOfTiles = size ** 2;
  highlighted = numberOfTiles;
  step = 0;

  let image = new Image();
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d', {
    willReadFrequently: true
  });

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
    gameStart = true;
    step = save.steps;
    gameStepInfo.textContent = step;
    createTiles(imageArray, save);
  } else {
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
  return canvasPart.toDataURL("image/jpeg");
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
      swap(direction);
      if (i >= totalShuffles) {
        gameStart = true;
      }
    }, i * 5);
  }
}

function swap(clicked) {
  if (clicked < 1 || clicked > (numberOfTiles)) {
    return;
  }

  if (gameStart && !soundOff) {
    audio.pause();
    audio.currentTime = 0;
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
    storage.setItem('state' + level, JSON.stringify(saveGame()));

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
        gameDownloadLink.setAttribute('href', gameImage);
        if(nextLevel < numLevels){
          gameNextLink.setAttribute('href', '?level=' + nextLevel);
        }else{
          gameNextLink.innerHTML = 'Меню';
        }
      }, 500);

      /**** Ads ****/
      if (storage.getItem('mode') == 'yandex') {
        setTimeout(function () {
          YaGames.init().then(ysdk => ysdk.adv.showFullscreenAdv());
        }, 2000);
      }

      if (storage.getItem('mode') == 'vk') {
        setTimeout(function () {
          vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
            .then((data) => {
              if (data.result) console.log('Реклама показана');
              else console.log('Ошибка при показе');
            })
            .catch((error) => { console.log(error); });
        }, 2000);
      }
      /*** /Ads ****/
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

  let gameState = {};
  gameState.table = saveArray;
  gameState.highlighted = highlighted;
  gameState.gameStart = gameStart;
  gameState.steps = step;

  return gameState;
}

function restartGame() {
  if (gameStart) {
    gameStart = false;
    storage.removeItem('state' + level);

    /**** Ads ****/
    if (storage.getItem('mode') == 'yandex') {
      YaGames.init().then(ysdk => ysdk.adv.showFullscreenAdv());
    }

    if (storage.getItem('mode') == 'vk') {
      vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
        .then((data) => {
          if (data.result) console.log('Реклама показана');
          else console.log('Ошибка при показе');
        })
        .catch((error) => { console.log(error); });
    }
    /*** /Ads ****/

    newGame(level, size, gameImage);
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
  if (gameStart) {
    step++;
    gameStepInfo.textContent = step;
  }
}