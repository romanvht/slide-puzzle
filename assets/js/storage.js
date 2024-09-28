class Storage {
    constructor() {
        this.storage = window.localStorage;
    }

    getItem(key) {
        return this.storage.getItem(key);
    }

    setItem(key, value) {
        this.storage.setItem(key, value);
    }

    removeItem(key) {
        this.storage.removeItem(key);
    }

    saveGame(game) {
        const saveArray = [...Array(game.numberOfTiles).keys()].map(index => {
            const currentTile = document.getElementById(`block${index + 1}`);
            return {
                selected: currentTile.classList.contains('selected'),
                value: parseInt(currentTile.getAttribute('number'))
            };
        });

        return {
            table: saveArray,
            highlighted: game.highlighted,
            start: game.start,
            steps: game.step
        };
    }

    loadGame(game) {
        return JSON.parse(this.getItem(`category_${game.category}_state_${game.level}`));
    }

    saveWin(game) {
        const winsJSON = JSON.parse(this.getItem(`category_${game.category}_wins`) || '{}');
        winsJSON[game.level] = true;
        this.removeItem(`category_${game.category}_state_${game.level}`);
        this.setItem(`category_${game.category}_wins`, JSON.stringify(winsJSON));
    }

    getSoundStatus() {
        return localStorage.getItem('sound') ? localStorage.getItem('sound') : 'enable';
    }

    setSoundStatus(status) {
        localStorage.setItem('sound', status)
    }
}