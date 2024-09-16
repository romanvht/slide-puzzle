class Menu {
    constructor(game) {
        this.game = game;
        this.menuContainer = document.querySelector('.menu');
        this.menuButton = document.querySelector('.menu-button');
    }

    toggle() {
        this.menuContainer.innerHTML = '';
        this.menuContainer.style.display = 'flex';
        this.game.gameContainer.style.display = 'none';
        this.game.game = false;
    }

    getCategories() {
        this.toggle();

        const title = document.createElement('h1');
        title.innerHTML = 'Выберите<br>категорию';
        this.menuContainer.append(title);

        const links = document.createElement('div');
        links.classList.add('main-images');

        this.game.categories.forEach(category => {
            const linkCat = document.createElement('a');
            linkCat.innerHTML = `<div class="cat-text">${category.name}</div>`;
            linkCat.setAttribute('onclick', `game.menu.getLevels(${category.id})`);
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

        const title = document.createElement('h1');
        title.innerHTML = 'Выберите<br>изображение';
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
            linkLevel.setAttribute('onclick', `game.newGame(${level.id}, ${category})`);
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
}