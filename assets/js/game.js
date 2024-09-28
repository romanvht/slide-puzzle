class PuzzleGame {
  constructor() {
    this.levels = [];
    this.categories = [];
    this.numLevels = 16;
    this.levelSize = 3;
    this.sizeUp = 4;
    this.storage = new Storage();
    this.sound = new SoundManager(this.storage);

    this.initLevels();
    this.initElements();
    this.initCategories();

    this.menu = new Menu(this);
    this.input = new Input(this);

    this.menu.getCategories();
  }

  initElements() {
    this.gameContainer = document.querySelector('.game');
    this.gameTable = document.getElementById('tiles');
    this.gameStepInfo = document.querySelector('.steps-count_info');
    this.gameMessage = document.querySelector('.message');
    this.gameNextLink = document.querySelector('.next-button');
    this.gameDownloadLink = document.querySelector('.download-button');
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
    this.categories = [
      { id: 0, folder: 'assets/levels/anime/', name: 'Аниме' },
      { id: 1, folder: 'assets/levels/cats/', name: 'Котики' }
    ];
  }

  newGame(setLevel, setCategory) {
    const levelDetails = this.levels[setLevel];
    const categoryDetails = this.categories[setCategory];

    this.game = {
      level: setLevel,
      category: setCategory,
      size: levelDetails.size,
      gameImage: categoryDetails.folder + levelDetails.image,
      numberOfTiles: levelDetails.size ** 2,
      highlighted: levelDetails.size ** 2,
      start: false,
      step: 0
    };

    const image = new Image();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    image.src = this.game.gameImage;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);

      this.menu.menuContainer.style.display = "none";
      this.gameContainer.style.display = 'flex';
      this.gameMessage.style.display = "none";
      this.gameTable.innerHTML = '';

      this.drawGame(context, image);
      this.input.resizeGame();
    };
  }

  drawGame(context, image) {
    const imageArray = [];
    let cellTile = 0;
    let rowTile = 0;

    for (let index = 1; index <= this.game.numberOfTiles; index++) {
      const imgTile = document.createElement('img');
      const imgSize = image.width / this.game.size;
      const imgWidthCut = imgSize * cellTile;
      const imgHeightCut = imgSize * rowTile;

      imgTile.src = this.cutImage(context, imgWidthCut, imgHeightCut, imgSize, imgSize);
      imgTile.number = index;

      if (index === this.game.numberOfTiles) imgTile.last = true;

      imageArray.push({
        number: imgTile.number,
        image: imgTile
      });

      cellTile = cellTile >= this.game.size - 1 ? 0 : cellTile + 1;
      rowTile = Math.floor(index / this.game.size);
    }

    const save = this.storage.loadGame(this.game);

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
      const index = i + 1;
      const newTile = document.createElement('div');
      const { number, image, selected } = save ? {
        number: imageArray[save.table[i].value - 1].number,
        image: imageArray[save.table[i].value - 1].image,
        selected: save.table[i].selected
      } : {
        number: tile.image.number,
        image: tile.image,
        selected: tile.image.last
      };

      newTile.style.width = `${100 / this.game.size}%`;
      newTile.style.height = `${100 / this.game.size}%`;
      newTile.id = `block${index}`;
      newTile.setAttribute('index', index);
      newTile.setAttribute('number', number);
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
    const imageData = context.getImageData(x, y, width, height);
    const canvasPart = document.createElement('canvas');
    const contextPart = canvasPart.getContext('2d');
    canvasPart.width = width;
    canvasPart.height = height;
    contextPart.putImageData(imageData, 0, 0);
    return canvasPart.toDataURL("image/jpeg");
  }

  shuffle() {
    const minShuffles = 100;
    const totalShuffles = minShuffles + Math.floor(Math.random() * (100 - 50) + 50 * this.game.size);

    this.gameContainer.style.pointerEvents = "none";

    for (let i = minShuffles; i <= totalShuffles; i++) {
      setTimeout(() => {
        const directionOptions = [
          this.game.highlighted + 1,
          this.game.highlighted - 1,
          this.game.highlighted + this.game.size,
          this.game.highlighted - this.game.size
        ];
        this.swap(directionOptions[Math.floor(Math.random() * 4)]);
        if (i >= totalShuffles) {
          this.gameContainer.style.pointerEvents = "auto";
          this.game.start = true;
        }
      }, i * 5);
    }
  }

  swap(clicked) {
    if (clicked < 1 || clicked > this.game.numberOfTiles) return;

    const swapConditions = [
      { condition: clicked === this.game.highlighted + 1, check: clicked % this.game.size !== 1 },
      { condition: clicked === this.game.highlighted - 1, check: clicked % this.game.size !== 0 },
      { condition: clicked === this.game.highlighted + this.game.size, check: true },
      { condition: clicked === this.game.highlighted - this.game.size, check: true }
    ];

    swapConditions.forEach(({ condition, check }) => {
      if (condition && check) {
        if (this.game.start) {
          this.sound.playSound();
        }

        this.setSelected(clicked);
      }
    });

    if (this.game.start) {
      this.storage.setItem(`category_${this.game.category}_state_${this.game.level}`, JSON.stringify(this.storage.saveGame(this.game)));

      if (this.checkWin()) {
        this.storage.saveWin(this.game);

        this.gameDownloadLink.setAttribute('href', this.game.gameImage);

        const nextLevel = this.game.level + 1;
        if (nextLevel < this.numLevels) {
          this.gameNextLink.innerHTML = 'Далее';
          const onclickAction = `game.newGame(${nextLevel}, ${this.game.category})`;
          this.gameNextLink.setAttribute('onclick', onclickAction);
        } else {
          this.gameNextLink.innerHTML = 'Меню';
          this.gameNextLink.setAttribute('onclick', 'game.menu.getCategories()');
        }

        setTimeout(() => {
          this.gameTable.innerHTML = `<img class="original-image" src="${this.game.gameImage}">`;
          this.gameMessage.style.display = "flex";
        }, 500);
      }
    }
  }

  setSelected(index) {
    const currentTile = document.getElementById(`block${this.game.highlighted}`);
    const newTile = document.getElementById(`block${index}`);

    const currentTileHtml = currentTile.innerHTML;
    const currentTileNumber = currentTile.getAttribute('number');

    const newTileHtml = newTile.innerHTML;
    const newTileNumber = newTile.getAttribute('number');

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
    return [...Array(this.game.numberOfTiles).keys()].every(index => {
      const currentTile = document.getElementById(`block${index + 1}`);
      return parseInt(currentTile.getAttribute('index')) === parseInt(currentTile.getAttribute('number'));
    });
  }

  restartGame() {
    if (this.game.start) {
      this.game.start = false;
      this.storage.removeItem(`category_${this.game.category}_state_${this.game.level}`);
      this.newGame(this.game.level, this.game.category);
    }
  }
}