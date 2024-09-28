class Menu {
    constructor(game, storage, sound) {
        this.game = game;
        this.storage = storage;
        this.sound = sound;

        this.initMenu();
        this.initHandlers();
        this.initSound();
    }

    initMenu() {
        this.menuContainer = document.querySelector('.menu');
        this.gameMessage = document.querySelector('.message');
        this.menuButton = document.querySelector('.menu-button');
        this.restartButton = document.querySelector('.restart-button');
        this.nextButton = document.querySelector('.next-button');
        this.mainmenuButton = document.querySelector('.main-menu-button');
        this.soundIcon = document.querySelector('.sound-button');
        this.downloadLink = document.querySelector('.download-button');
    }

    initHandlers() {
        this.mainmenuButton.addEventListener('click', () => this.getCategories());
        this.soundIcon.addEventListener('click', () => this.toggleSound());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.nextButton.addEventListener('click', () => this.nextLevel());
    }

    initSound() {
        if(this.storage.getSoundStatus() == 'disable'){
            this.toggleSound();
        }
    }

    toggle() {
        this.menuContainer.innerHTML = '';
        this.menuContainer.style.display = 'flex';
        this.game.gameContainer.style.display = 'none';
        this.game.currentLevel = false;
    }

    showGame() {
        this.menuContainer.style.display = "none";
        this.gameMessage.style.display = "none";
        this.game.gameContainer.style.display = 'flex';
        this.game.gameTable.innerHTML = '';
    }

    showNextLevel(level) {
        if (level < this.game.numLevels) {
            this.nextButton.classList.remove('hide-button');
            this.mainmenuButton.classList.add('hide-button');
        } else {
            this.nextButton.classList.add('hide-button');
            this.mainmenuButton.classList.remove('hide-button');
        }

        setTimeout(() => {
            this.game.gameTable.innerHTML = `<img class="original-image" src="${this.game.currentLevel.gameImage}">`;
            this.downloadLink.setAttribute('href', this.game.currentLevel.gameImage);
            this.gameMessage.style.display = "flex";
        }, 500);
    }

    getCategories() {
        this.toggle();
        this.sound.stopAmbient();

        const title = document.createElement('h1');
        title.innerHTML = 'Категории';
        this.menuContainer.append(title);

        const links = document.createElement('div');
        links.classList.add('main-images');

        this.game.categories.forEach(category => {
            const linkCat = document.createElement('a');
            linkCat.innerHTML = `<div class="cat-text">${category.name}</div>`;
            linkCat.addEventListener('click', () => this.getLevels(category.id));
            linkCat.classList.add(`cat${category.id}`);

            const imgCat = document.createElement('img');
            imgCat.src = `${category.folder}1.jpg`;

            linkCat.append(imgCat);
            links.append(linkCat);
        });

        this.menuContainer.append(links);
    }

    getLevels(category) {
        this.toggle();
        this.sound.stopAmbient();

        const title = document.createElement('h1');
        title.innerHTML = 'Уровни';
        this.menuContainer.append(title);

        const links = document.createElement('div');
        links.classList.add('main-images');

        const backButton = document.createElement('a');
        backButton.classList.add('back-button');
        backButton.setAttribute('onclick', 'game.menu.getCategories()');
        backButton.innerHTML = 'Категории';

        this.game.levels.forEach(level => {
            const linkLevel = document.createElement('a');
            const imgLevel = document.createElement('img');
            imgLevel.src = `${this.game.categories[category].folder}${level.image}`;
            linkLevel.addEventListener('click', () => this.game.newGame(level.id, category));
            linkLevel.classList.add('level');
            linkLevel.classList.add(`level${level.id}`);
            linkLevel.append(imgLevel);
            links.append(linkLevel);
        });

        this.menuButton.setAttribute('onclick', `game.menu.getLevels(${category})`);
        this.menuContainer.append(links);
        this.menuContainer.append(backButton);

        const winsJSON = JSON.parse(this.game.storage.getItem(`category_${category}_wins`) || '{}');
        Object.keys(winsJSON).forEach(key => {
            if (winsJSON[key]) {
                const level = document.querySelector(`.level${key}`);
                if (level) level.classList.add("no-blur");
            }
        });
    }

    toggleSound() {
        this.sound.toggleSound();
        this.storage.setSoundStatus(this.sound.muted ? 'disable' : 'enable');
        this.soundIcon.classList.toggle('sound-disable');
    }

    restartGame() {
        if (this.game.currentLevel.start) {
            this.game.currentLevel.start = false;
            this.storage.removeItem(`category_${this.game.currentLevel.category}_state_${this.game.currentLevel.level}`);
            this.game.newGame(this.game.currentLevel.level, this.game.currentLevel.category);
        }
    }

    nextLevel() {
        const nextLevel = this.game.currentLevel.level + 1;

        if(nextLevel < this.game.numLevels){
            this.game.newGame(nextLevel, this.game.currentLevel.category);
        }
    }
}