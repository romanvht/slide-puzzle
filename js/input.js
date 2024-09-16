class Input {
    constructor(game) {
        this.game = game;
        this.draggedTile = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.isDragging = false;
        this.allowedDirection = null;

        this.RIGHT_ARROW = 39;
        this.LEFT_ARROW = 37;
        this.UP_ARROW = 40;
        this.DOWN_ARROW = 38;

        this.setupEventListeners();
    }

    setupEventListeners() {
        window.onkeydown = (event) => {
            if (this.game.game?.start) {
                const { highlighted, size } = this.game.game;
                switch (event.keyCode) {
                    case this.RIGHT_ARROW: this.game.swap(highlighted - 1); break;
                    case this.LEFT_ARROW: this.game.swap(highlighted + 1); break;
                    case this.UP_ARROW: this.game.swap(highlighted - size); break;
                    case this.DOWN_ARROW: this.game.swap(highlighted + size); break;
                }
            }
        };

        window.addEventListener("resize", this.resizeGame.bind(this), false);

        this.game.gameTable.addEventListener('mousedown', this.initiateDrag.bind(this));
        this.game.gameTable.addEventListener('touchstart', this.initiateDrag.bind(this));
    }

    resizeGame() {
        const orient = window.matchMedia("(orientation: portrait)");
        const size = orient.matches ? this.game.gameContainer.clientWidth * 0.9 : this.game.gameContainer.clientHeight * 0.8;
        this.game.gameTable.style.width = `${size}px`;
        this.game.gameTable.style.height = `${size}px`;
    }

    initiateDrag(event) {
        event.preventDefault();

        const isTouch = event.type === 'touchstart';
        const position = isTouch ? event.touches[0] : event;
        const tile = event.target.closest('.block');

        if (tile) {
            this.prepareForDrag(tile, position.clientX, position.clientY);
            const moveEvent = isTouch ? 'touchmove' : 'mousemove';
            const endEvent = isTouch ? 'touchend' : 'mouseup';

            this.game.gameTable.addEventListener(moveEvent, this.trackDragMovement.bind(this));
            this.game.gameTable.addEventListener(endEvent, this.finalizeDrag.bind(this));
        }
    }

    prepareForDrag(tile, startX, startY) {
        this.draggedTile = tile;
        this.dragStartX = startX;
        this.dragStartY = startY;
        this.isDragging = true;
        this.draggedTile.style.transition = 'none';

        const currentTileIndex = parseInt(tile.getAttribute('index'));
        const emptyIndex = this.game.game.highlighted;
        const size = this.game.game.size;

        this.allowedDirection = null;

        if (emptyIndex === currentTileIndex + 1) this.allowedDirection = 'right';
        else if (emptyIndex === currentTileIndex - 1) this.allowedDirection = 'left';
        else if (emptyIndex === currentTileIndex + size) this.allowedDirection = 'down';
        else if (emptyIndex === currentTileIndex - size) this.allowedDirection = 'up';
    }

    trackDragMovement(event) {
        if (!this.isDragging) return;

        event.preventDefault();
        const position = event.type.includes('touch') ? event.touches[0] : event;
        this.updateTilePosition(position.clientX, position.clientY);
    }

    updateTilePosition(currentX, currentY) {
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

    finalizeDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.draggedTile.style.transition = '';
        this.draggedTile.style.transform = '';

        const targetTileIndex = this.getTargetTileIndex();
        
        if (targetTileIndex !== null) {
            this.game.swap(targetTileIndex + 1);
        }

        this.game.gameTable.removeEventListener('mousemove', this.trackDragMovement.bind(this));
        this.game.gameTable.removeEventListener('mouseup', this.finalizeDrag.bind(this));
        this.game.gameTable.removeEventListener('touchmove', this.trackDragMovement.bind(this));
        this.game.gameTable.removeEventListener('touchend', this.finalizeDrag.bind(this));
    }

    getTargetTileIndex() {
        const rect = this.draggedTile.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const tiles = Array.from(this.game.gameTable.children);
        return tiles.findIndex(tile => {
            const tileRect = tile.getBoundingClientRect();
            return tileRect.left < centerX && centerX < tileRect.right &&
                tileRect.top < centerY && centerY < tileRect.bottom;
        });
    }
}