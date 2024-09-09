class PuzzleGame {
  constructor() {
    this.levels = [];
    this.categories = [];
    this.numLevels = 16;
    this.levelSize = 3;
    this.sizeUp = 4;
    this.storage = window.localStorage;
    this.soundOff = this.storage.getItem('soundOff');

    this.RIGHT_ARROW = 39;
    this.LEFT_ARROW = 37;
    this.UP_ARROW = 40;
    this.DOWN_ARROW = 38;

    this.initLevels();
    this.initElements();
    this.initCategories();
    this.setupEventListeners();
  }

  initElements() {
    this.gameContainer = document.querySelector('.game');
    this.gameTable = document.getElementById('tiles');
    this.gameStepInfo = document.querySelector('.steps-count_info');
    this.gameSoundIcon = document.querySelector('.sound-button');
    this.gameMessage = document.querySelector('.message');
    this.gameNextLink = document.querySelector('.next-button');
    this.gameDownloadLink = document.querySelector('.download-button');
    this.menuContainer = document.querySelector('.menu');
    this.menuButton = document.querySelector('.menu-button');
    this.audio = document.getElementById('sound');
    if (this.soundOff === 'yes') this.gameSoundIcon.classList.add('sound-disable');
  }

  initLevels() {
    for (let level = 1; level <= this.numLevels; level++) {
      this.levels[level] = {
        id: level,
        size: this.levelSize,
        image: `${level}.jpg`
      };
      if (level % this.sizeUp === 0) {
        this.levelSize++;
      }
    }
  }

  initCategories() {
    this.categories[1] = {
      id: 1,
      folder: 'img/anime/',
      name: 'Аниме'
    };
    this.categories[2] = {
      id: 2,
      folder: 'img/cats/',
      name: 'Котики'
    };
  }

  setupEventListeners() {
    window.onkeydown = (event) => {
      if (typeof this.game !== 'undefined' && this.game.start) {
        if (event.keyCode === this.RIGHT_ARROW) {
          this.swap(this.game.highlighted - 1);
        } else if (event.keyCode === this.LEFT_ARROW) {
          this.swap(this.game.highlighted + 1);
        } else if (event.keyCode === this.UP_ARROW) {
          this.swap(this.game.highlighted - this.game.size);
        } else if (event.keyCode === this.DOWN_ARROW) {
          this.swap(this.game.highlighted + this.game.size);
        }
      }
    };

    window.addEventListener("resize", () => {
      this.resizeGame();
    }, false);
  }

  newGame(setLevel, setCategory) {
    this.game = {
      level: setLevel,
      category: setCategory,
      size: this.levels[setLevel].size,
      gameImage: this.categories[setCategory].folder + this.levels[setLevel].image,
      numberOfTiles: this.levels[setLevel].size ** 2,
      highlighted: this.levels[setLevel].size ** 2,
      start: false,
      step: 0
    };

    let image = new Image();
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d', { willReadFrequently: true });

    image.src = this.game.gameImage;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);

      this.menuContainer.style.display = "none";
      this.gameContainer.style.display = 'flex';
      this.gameMessage.style.display = "none";
      this.gameTable.innerHTML = '';

      this.drawGame(context, image);
      this.resizeGame();
    }
  }

  drawGame(context, image) {
    let imageArray = [];
    let cellTile = 0;
    let rowTile = 0;

    for (let index = 1; index <= this.game.numberOfTiles; index++) {
      let imgTile = document.createElement('img');
      let imgSize = image.width / this.game.size;
      let imgWidthCut = image.width / this.game.size * cellTile;
      let imgHeightCut = image.height / this.game.size * rowTile;

      imgTile.src = this.cutImage(context, imgWidthCut, imgHeightCut, imgSize, imgSize);
      imgTile.number = index;

      if (index === this.game.numberOfTiles) imgTile.last = true;

      imageArray.push({
        number: imgTile.number,
        image: imgTile
      });

      if (cellTile >= this.game.size - 1) cellTile = 0;
      else cellTile++;
      rowTile = Math.floor(index / this.game.size);
    }

    let save = JSON.parse(this.storage.getItem(`category_${this.game.category}_state_${this.game.level}`));

    if (save) {
      this.game.start = true;
      this.game.step = save.steps;
      this.gameStepInfo.textContent = this.game.step;
      this.createTiles(imageArray, save);
    } else {
      this.game.start = false;
      this.gameStepInfo.textContent = 0;
      this.createTiles(imageArray);
      this.shuffle();
    }
  }

  createTiles(imageArray, save) {
    imageArray.forEach((tile, i) => {
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

      newTile.style.width = 100 / this.game.size + "%";
      newTile.style.height = 100 / this.game.size + "%";
      newTile.id = `block${index}`;
      newTile.setAttribute('index', index);
      newTile.setAttribute('number', number);
      newTile.setAttribute('onclick', `game.swap(${index})`);
      newTile.classList.add('block');
      newTile.append(image);

      if (selected) {
        this.game.highlighted = index;
        newTile.classList.add("selected");
      }

      this.gameTable.append(newTile);
    });
  }

  cutImage(context, x, y, width, height) {
    let imageData = context.getImageData(x, y, width, height);
    let canvasPart = document.createElement('canvas');
    let contextPart = canvasPart.getContext('2d');
    canvasPart.width = width;
    canvasPart.height = height;
    contextPart.putImageData(imageData, 0, 0);
    return canvasPart.toDataURL("image/jpeg");
  }

  shuffle() {
    let minShuffles = 100;
    let totalShuffles = minShuffles + Math.floor(Math.random() * (100 - 50) + 50 * this.game.size);

    this.gameContainer.style.pointerEvents = "none";

    for (let i = minShuffles; i <= totalShuffles; i++) {
      setTimeout(() => {
        let x = Math.floor(Math.random() * 4);
        let direction = 0;
        if (x === 0) {
          direction = this.game.highlighted + 1;
        } else if (x === 1) {
          direction = this.game.highlighted - 1;
        } else if (x === 2) {
          direction = this.game.highlighted + this.game.size;
        } else if (x === 3) {
          direction = this.game.highlighted - this.game.size;
        }
        this.swap(direction);
        if (i >= totalShuffles) {
          this.gameContainer.style.pointerEvents = "auto";
          this.game.start = true;
        }
      }, i * 5);
    }
  }

  swap(clicked) {
    if (clicked < 1 || clicked > (this.game.numberOfTiles)) {
      return;
    }

    if (this.game.start && !this.soundOff) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.play();
    }

    if (clicked === this.game.highlighted + 1) {
      if (clicked % this.game.size !== 1) {
        this.setSelected(clicked);
      }
    } else if (clicked === this.game.highlighted - 1) {
      if (clicked % this.game.size !== 0) {
        this.setSelected(clicked);
      }
    } else if (clicked === this.game.highlighted + this.game.size) {
      this.setSelected(clicked);
    } else if (clicked === this.game.highlighted - this.game.size) {
      this.setSelected(clicked);
    }

    if (this.game.start) {
      this.storage.setItem(`category_${this.game.category}_state_${this.game.level}`, JSON.stringify(this.saveGame()));

      if (this.checkWin()) {
        let winsJSON = JSON.parse(this.storage.getItem(`category_${this.game.category}_wins`) || '{}');

        winsJSON[this.game.level] = true;

        this.storage.removeItem(`category_${this.game.category}_state_${this.game.level}`);
        this.storage.setItem(`category_${this.game.category}_wins`, JSON.stringify(winsJSON));

        this.gameDownloadLink.setAttribute('href', this.game.gameImage);

        let nextLevel = this.game.level + 1;
        if (nextLevel < this.numLevels) {
          this.gameNextLink.innerHTML = 'Далее';
          if (this.storage.getItem('mode') === 'yandex') {
            this.gameNextLink.setAttribute('onclick', `window.ysdk.adv.showFullscreenAdv();game.newGame(${nextLevel}, ${this.game.category})`);
          } else {
            this.gameNextLink.setAttribute('onclick', `game.newGame(${nextLevel}, ${this.game.category})`);
          }
        } else {
          this.gameNextLink.innerHTML = 'Меню';
          this.gameNextLink.setAttribute('onclick', 'game.getCategories()');
        }

        setTimeout(() => {
          this.gameTable.innerHTML = `<img class="original-image" src="${this.game.gameImage}">`;
          this.gameMessage.style.display = "flex";
        }, 500);
      }
    }
  }

  setSelected(index) {
    let currentTile = document.getElementById(`block${this.game.highlighted}`);
    let newTile = document.getElementById(`block${index}`);

    let currentTileHtml = currentTile.innerHTML;
    let currentTileNumber = currentTile.getAttribute('number');

    let newTileHtml = newTile.innerHTML;
    let newTileNumber = newTile.getAttribute('number');

    currentTile.classList.remove('selected');
    currentTile.innerHTML = newTileHtml;
    currentTile.setAttribute('number', newTileNumber);

    newTile.classList.add("selected");
    newTile.innerHTML = currentTileHtml;
    newTile.setAttribute('number', currentTileNumber);

    this.game.highlighted = index;
    if (this.game.start) {
      this.game.step++;
      this.gameStepInfo.textContent = this.game.step;
    }
  }

  checkWin() {
    for (let index = 1; index <= this.game.numberOfTiles; index++) {
      let currentTile = document.getElementById(`block${index}`);
      let currentTileIndex = currentTile.getAttribute('index');
      let currentTileValue = currentTile.getAttribute('number');
      if (parseInt(currentTileIndex) !== parseInt(currentTileValue)) {
        return false;
      }
    }
    return true;
  }

  saveGame() {
    let saveArray = [];
    for (let index = 1; index <= this.game.numberOfTiles; index++) {
      let currentTile = document.getElementById(`block${index}`);
      let currentTileValue = currentTile.getAttribute('number');
      saveArray.push({
        selected: currentTile.classList.contains('selected'),
        value: parseInt(currentTileValue)
      });
    }

    let gameState = {
      table: saveArray,
      highlighted: this.game.highlighted,
      start: this.game.start,
      steps: this.game.step
    };

    return gameState;
  }

  restartGame() {
    if (this.game.start) {
      this.game.start = false;
      this.storage.removeItem(`category_${this.game.category}_state_${this.game.level}`);
      this.newGame(this.game.level, this.game.category);
    }
  }

  muteGame() {
    if (this.soundOff) {
      this.gameSoundIcon.classList.remove('sound-disable');
      this.storage.removeItem('soundOff', false);
      this.soundOff = false;
    } else {
      this.gameSoundIcon.classList.add('sound-disable');
      this.storage.setItem('soundOff', 'yes');
      this.soundOff = true;
    }
  }

  menuToggle() {
    this.menuContainer.innerHTML = '';
    this.menuContainer.style.display = 'flex';
    this.gameContainer.style.display = 'none';
    this.game = false;
  }

  getCategories() {
    this.menuToggle();

    let title = document.createElement('h1');
    title.innerHTML = 'Выберите<br>категорию';
    this.menuContainer.append(title);

    let links = document.createElement('div');
    links.classList.add('main-images');

    for (const key in this.categories) {
      let linkCat = document.createElement('a');
      linkCat.innerHTML = `<div class="cat-text">${this.categories[key].name}</div>`;
      linkCat.setAttribute('onclick', `game.getLevels(${this.categories[key].id})`);
      linkCat.classList.add(`cat${this.categories[key].id}`);

      let imgCat = document.createElement('img');
      imgCat.src = `${this.categories[key].folder}1.jpg`;

      linkCat.append(imgCat);
      links.append(linkCat);
    }

    this.menuContainer.append(links);
  }

  getLevels(category) {
    this.menuToggle();

    let title = document.createElement('h1');
    title.innerHTML = 'Выберите<br>изображение';
    this.menuContainer.append(title);

    let links = document.createElement('div');
    links.classList.add('main-images');

    let backButton = document.createElement('a');
    backButton.classList.add('back-button');
    backButton.setAttribute('onclick', 'game.getCategories()');
    backButton.innerHTML = 'Категории';

    for (const key in this.levels) {
      let linkLevel = document.createElement('a');
      let imgLevel = document.createElement('img');
      imgLevel.src = `${this.categories[category].folder}${this.levels[key].image}`;
      linkLevel.setAttribute('onclick', `game.newGame(${this.levels[key].id}, ${this.categories[category].id})`);
      linkLevel.classList.add(`level${this.levels[key].id}`);
      linkLevel.append(imgLevel);
      links.append(linkLevel);
    }

    this.menuButton.setAttribute('onclick', `game.getLevels(${this.categories[category].id})`);
    this.menuContainer.append(links);
    this.menuContainer.append(backButton);

    let winsJSON = JSON.parse(this.storage.getItem(`category_${this.categories[category].id}_wins`) || '{}');
    for (const key in winsJSON) {
      if (winsJSON[key]) {
        let level = document.querySelector(`.level${key}`);
        level.classList.add("no-blur");
      }
    }
  }

  resizeGame() {
    let orient = window.matchMedia("(orientation: portrait)");

    if (orient.matches) {
      let width = this.gameContainer.clientWidth * 0.9;
      this.gameTable.style.width = `${width}px`;
      this.gameTable.style.height = `${width}px`;
    } else {
      let height = this.gameContainer.clientHeight * 0.8;
      this.gameTable.style.width = `${height}px`;
      this.gameTable.style.height = `${height}px`;
    }
  }
}