class PuzzleGame {
  constructor() {
    this.levels = [];
    this.categories = [];
    this.numLevels = 16;
    this.levelSize = 3;
    this.sizeUp = 6;
    this.storage = new Storage();
    this.sound = new Sound();

    this.initLevels();
    this.initElements();
    this.initCategories();

    this.input = new Input(this, this.sound);
    this.menu = new Menu(this, this.storage, this.sound);

    this.menu.getCategories();
  }

  initElements() {
    this.gameContainer = document.querySelector('.game');
    this.gameTable = document.getElementById('tiles');
    this.gameStepInfo = document.querySelector('.steps-count_info');
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
      { id: 0, folder: 'assets/levels/minecraft/', name: 'Minecraft' },
      { id: 1, folder: 'assets/levels/fnaf/', name: 'FNAF' },
      { id: 2, folder: 'assets/levels/anime/', name: 'Аниме' },
      { id: 3, folder: 'assets/levels/cats/', name: 'Котики' }
    ];
  }

  newGame(setLevel, setCategory) {
    const levelDetails = this.levels[setLevel];
    const categoryDetails = this.categories[setCategory];

    this.currentLevel = {
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

    image.src = this.currentLevel.gameImage;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);

      this.menu.showGame();
      this.sound.playAmbient();
      this.drawGame(context, image);
      this.input.resizeGame();
    };
  }

  drawGame(context, image) {
    const imageArray = [];
    let cellTile = 0;
    let rowTile = 0;

    for (let index = 1; index <= this.currentLevel.numberOfTiles; index++) {
      const imgTile = document.createElement('img');
      const imgSize = image.width / this.currentLevel.size;
      const imgWidthCut = imgSize * cellTile;
      const imgHeightCut = imgSize * rowTile;

      imgTile.src = this.cutImage(context, imgWidthCut, imgHeightCut, imgSize, imgSize);
      imgTile.number = index;

      if (index === this.currentLevel.numberOfTiles) imgTile.last = true;

      imageArray.push({
        number: imgTile.number,
        image: imgTile
      });

      cellTile = cellTile >= this.currentLevel.size - 1 ? 0 : cellTile + 1;
      rowTile = Math.floor(index / this.currentLevel.size);
    }

    const save = this.storage.loadGame(this.currentLevel);

    if (save) {
      this.currentLevel.start = true;
      this.currentLevel.step = save.steps;
      this.gameStepInfo.textContent = this.currentLevel.step;
      this.createTiles(imageArray, save);
    } else {
      this.currentLevel.start = false;
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

      newTile.style.width = `${100 / this.currentLevel.size}%`;
      newTile.style.height = `${100 / this.currentLevel.size}%`;
      newTile.id = `block${index}`;
      newTile.setAttribute('index', index);
      newTile.setAttribute('number', number);
      newTile.classList.add('block');
      newTile.append(image);

      if (selected) {
        this.currentLevel.highlighted = index;
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
    const totalShuffles = minShuffles + Math.floor(Math.random() * (100 - 50) + 50 * this.currentLevel.size);

    this.gameContainer.style.pointerEvents = "none";

    for (let i = minShuffles; i <= totalShuffles; i++) {
      setTimeout(() => {
        const directionOptions = [
          this.currentLevel.highlighted + 1,
          this.currentLevel.highlighted - 1,
          this.currentLevel.highlighted + this.currentLevel.size,
          this.currentLevel.highlighted - this.currentLevel.size
        ];
        this.swap(directionOptions[Math.floor(Math.random() * 4)]);
        if (i >= totalShuffles) {
          this.gameContainer.style.pointerEvents = "auto";
          this.currentLevel.start = true;
        }
      }, i * 5);
    }
  }

  swap(clicked) {
    if (clicked < 1 || clicked > this.currentLevel.numberOfTiles) return;

    const swapConditions = [
      { condition: clicked === this.currentLevel.highlighted + 1, check: clicked % this.currentLevel.size !== 1 },
      { condition: clicked === this.currentLevel.highlighted - 1, check: clicked % this.currentLevel.size !== 0 },
      { condition: clicked === this.currentLevel.highlighted + this.currentLevel.size, check: true },
      { condition: clicked === this.currentLevel.highlighted - this.currentLevel.size, check: true }
    ];

    swapConditions.forEach(({ condition, check }) => {
      if (condition && check) {
        if (this.currentLevel.start) {
          this.sound.playSound('click');
        }

        this.setSelected(clicked);
      }
    });

    if (this.currentLevel.start) {
      this.storage.setItem(`category_${this.currentLevel.category}_state_${this.currentLevel.level}`, JSON.stringify(this.storage.saveGame(this.currentLevel)));

      if (this.checkWin()) {
        this.storage.saveWin(this.currentLevel);
        this.menu.showNextLevel(this.currentLevel.level + 1);
      }
    }
  }

  setSelected(index) {
    const currentTile = document.getElementById(`block${this.currentLevel.highlighted}`);
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

    this.currentLevel.highlighted = index;
    if (this.currentLevel.start) {
      this.currentLevel.step++;
      this.gameStepInfo.textContent = this.currentLevel.step;
    }
  }

  checkWin() {
    return [...Array(this.currentLevel.numberOfTiles).keys()].every(index => {
      const currentTile = document.getElementById(`block${index + 1}`);
      return parseInt(currentTile.getAttribute('index')) === parseInt(currentTile.getAttribute('number'));
    });
  }
}