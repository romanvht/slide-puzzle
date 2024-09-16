class SoundManager {
    constructor(storage) {
        this.storage = storage;
        this.audioElement = document.getElementById('sound');
        this.soundOff = this.storage.getItem('soundOff') === 'yes';
        this.updateSoundIcon();
    }

    playSound() {
        if (!this.soundOff) {
            this.audioElement.currentTime = 0;
            this.audioElement.play();
        }
    }

    toggleSound() {
        this.soundOff = !this.soundOff;
        this.storage.setItem('soundOff', this.soundOff ? 'yes' : 'no');
        this.updateSoundIcon();
    }

    updateSoundIcon() {
        const soundIcon = document.querySelector('.sound-button');
        soundIcon.classList.toggle('sound-disable', this.soundOff);
    }
}
