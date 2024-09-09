class PuzzleGame {
  constructor() {
    this.levels = [];
    this.categories = [];
    this.numLevels = 16;
    this.levelSize = 3;
    this.sizeUp = 4;
    this.storage = window.localStorage;
    this.soundOff = this.storage.getItem('soundOff') === 'yes';

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
    if (this.soundOff) this.gameSoundIcon.classList.add('sound-disable');
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
      { id: 0, folder: 'img/anime/', name: 'Аниме' },
      { id: 1, folder: 'img/cats/', name: 'Котики' }
    ];
  }

  setupEventListeners() {
    window.onkeydown = (event) => {
      if (this.game?.start) {
        const { highlighted, size } = this.game;
        switch (event.keyCode) {
          case this.RIGHT_ARROW: this.swap(highlighted - 1); break;
          case this.LEFT_ARROW: this.swap(highlighted + 1); break;
          case this.UP_ARROW: this.swap(highlighted - size); break;
          case this.DOWN_ARROW: this.swap(highlighted + size); break;
        }
      }
    };

    window.addEventListener("resize", this.resizeGame.bind(this), false);

    this.gameTable.addEventListener('mousedown', this.handleStart.bind(this));
    this.gameTable.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
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

      this.menuContainer.style.display = "none";
      this.gameContainer.style.display = 'flex';
      this.gameMessage.style.display = "none";
      this.gameTable.innerHTML = '';

      this.drawGame(context, image);
      this.resizeGame();
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

    const save = JSON.parse(this.storage.getItem(`category_${this.game.category}_state_${this.game.level}`));

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
        if (this.game.start && !this.soundOff) {
          this.audio.currentTime = 0;
          this.audio.play();
        }

        this.setSelected(clicked);
      }
    });

    if (this.game.start) {
      this.storage.setItem(`category_${this.game.category}_state_${this.game.level}`, JSON.stringify(this.saveGame()));

      if (this.checkWin()) {
        const winsJSON = JSON.parse(this.storage.getItem(`category_${this.game.category}_wins`) || '{}');
        winsJSON[this.game.level] = true;
        this.storage.removeItem(`category_${this.game.category}_state_${this.game.level}`);
        this.storage.setItem(`category_${this.game.category}_wins`, JSON.stringify(winsJSON));

        this.gameDownloadLink.setAttribute('href', this.game.gameImage);

        const nextLevel = this.game.level + 1;
        if (nextLevel < this.numLevels) {
          this.gameNextLink.innerHTML = 'Далее';
          const onclickAction = `game.newGame(${nextLevel}, ${this.game.category})`;
          this.gameNextLink.setAttribute('onclick', onclickAction);
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

  handleStart(event) {
    event.preventDefault();
    const isTouch = event.type === 'touchstart';
    const position = isTouch ? event.touches[0] : event;
    const tile = event.target.closest('.block');

    if (tile) {
      this.startDrag(tile, position.clientX, position.clientY);
      const moveEvent = isTouch ? 'touchmove' : 'mousemove';
      const endEvent = isTouch ? 'touchend' : 'mouseup';

      document.addEventListener(moveEvent, this.handleMove.bind(this), { passive: false });
      document.addEventListener(endEvent, this.endDrag.bind(this));
    }
  }

  startDrag(tile, startX, startY) {
    this.draggedTile = tile;
    this.dragStartX = startX;
    this.dragStartY = startY;
    this.isDragging = true;
    this.draggedTile.style.transition = 'none';

    const currentTileIndex = parseInt(tile.getAttribute('index'));
    const emptyIndex = this.game.highlighted;
    const size = this.game.size;

    this.allowedDirection = null;

    if (emptyIndex === currentTileIndex + 1) this.allowedDirection = 'right';
    else if (emptyIndex === currentTileIndex - 1) this.allowedDirection = 'left';
    else if (emptyIndex === currentTileIndex + size) this.allowedDirection = 'down';
    else if (emptyIndex === currentTileIndex - size) this.allowedDirection = 'up';
  }

  handleMove(event) {
    event.preventDefault();
    if (this.isDragging) {
      const position = event.type.includes('touch') ? event.touches[0] : event;
      this.dragMove(position.clientX, position.clientY);
    }
  }

  dragMove(currentX, currentY) {
    if (!this.allowedDirection) return;
  
    const deltaX = currentX - this.dragStartX;
    const deltaY = currentY - this.dragStartY;
  
    let translateX = 0;
    let translateY = 0;
  
    const tileRect = this.draggedTile.getBoundingClientRect();
    const tileSize = tileRect.width;
  
    if (this.allowedDirection === 'right' && deltaX > 0) {
      translateX = Math.min(deltaX, tileSize);
    } else if (this.allowedDirection === 'left' && deltaX < 0) {
      translateX = Math.max(deltaX, -tileSize);
    } else if (this.allowedDirection === 'down' && deltaY > 0) {
      translateY = Math.min(deltaY, tileSize);
    } else if (this.allowedDirection === 'up' && deltaY < 0) {
      translateY = Math.max(deltaY, -tileSize);
    }
  
    this.draggedTile.style.transform = `translate(${translateX}px, ${translateY}px)`;
  }

  endDrag() {
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedTile.style.transition = '';
      this.draggedTile.style.transform = '';

      const targetTileIndex = this.getTargetTileIndex();
      if (targetTileIndex !== null) {
        this.swap(targetTileIndex + 1);
      }

      document.removeEventListener('mousemove', this.handleMove.bind(this));
      document.removeEventListener('mouseup', this.endDrag.bind(this));
      document.removeEventListener('touchmove', this.handleMove.bind(this));
      document.removeEventListener('touchend', this.endDrag.bind(this));
    }
  }

  getTargetTileIndex() {
    const rect = this.draggedTile.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const tiles = Array.from(this.gameTable.children);
    return tiles.findIndex(tile => {
      const tileRect = tile.getBoundingClientRect();
      return tileRect.left < centerX && centerX < tileRect.right &&
        tileRect.top < centerY && centerY < tileRect.bottom;
    });
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

  saveGame() {
    const saveArray = [...Array(this.game.numberOfTiles).keys()].map(index => {
      const currentTile = document.getElementById(`block${index + 1}`);
      return {
        selected: currentTile.classList.contains('selected'),
        value: parseInt(currentTile.getAttribute('number'))
      };
    });

    return {
      table: saveArray,
      highlighted: this.game.highlighted,
      start: this.game.start,
      steps: this.game.step
    };
  }

  restartGame() {
    if (this.game.start) {
      this.game.start = false;
      this.storage.removeItem(`category_${this.game.category}_state_${this.game.level}`);
      this.newGame(this.game.level, this.game.category);
    }
  }

  muteGame() {
    this.soundOff = !this.soundOff;
    this.gameSoundIcon.classList.toggle('sound-disable', this.soundOff);
    this.storage.setItem('soundOff', this.soundOff ? 'yes' : 'no');
  }

  menuToggle() {
    this.menuContainer.innerHTML = '';
    this.menuContainer.style.display = 'flex';
    this.gameContainer.style.display = 'none';
    this.game = false;
  }

  getCategories() {
    this.menuToggle();

    const title = document.createElement('h1');
    title.innerHTML = 'Выберите<br>категорию';
    this.menuContainer.append(title);

    const links = document.createElement('div');
    links.classList.add('main-images');

    this.categories.forEach(category => {
      const linkCat = document.createElement('a');
      linkCat.innerHTML = `<div class="cat-text">${category.name}</div>`;
      linkCat.setAttribute('onclick', `game.getLevels(${category.id})`);
      linkCat.classList.add(`cat${category.id}`);

      const imgCat = document.createElement('img');
      imgCat.src = `${category.folder}1.jpg`;

      linkCat.append(imgCat);
      links.append(linkCat);
    });

    this.menuContainer.append(links);
  }

  getLevels(category) {
    this.menuToggle();

    const title = document.createElement('h1');
    title.innerHTML = 'Выберите<br>изображение';
    this.menuContainer.append(title);

    const links = document.createElement('div');
    links.classList.add('main-images');

    const backButton = document.createElement('a');
    backButton.classList.add('back-button');
    backButton.setAttribute('onclick', 'game.getCategories()');
    backButton.innerHTML = 'Категории';

    this.levels.forEach(level => {
      const linkLevel = document.createElement('a');
      const imgLevel = document.createElement('img');
      imgLevel.src = `${this.categories[category].folder}${level.image}`;
      linkLevel.setAttribute('onclick', `game.newGame(${level.id}, ${category})`);
      linkLevel.classList.add(`level${level.id}`);
      linkLevel.append(imgLevel);
      links.append(linkLevel);
    });

    this.menuButton.setAttribute('onclick', `game.getLevels(${category})`);
    this.menuContainer.append(links);
    this.menuContainer.append(backButton);

    const winsJSON = JSON.parse(this.storage.getItem(`category_${category}_wins`) || '{}');
    Object.keys(winsJSON).forEach(key => {
      if (winsJSON[key]) {
        const level = document.querySelector(`.level${key}`);
        if (level) level.classList.add("no-blur");
      }
    });
  }

  resizeGame() {
    const orient = window.matchMedia("(orientation: portrait)");
    const size = orient.matches ? this.gameContainer.clientWidth * 0.9 : this.gameContainer.clientHeight * 0.8;
    this.gameTable.style.width = `${size}px`;
    this.gameTable.style.height = `${size}px`;
  }
}