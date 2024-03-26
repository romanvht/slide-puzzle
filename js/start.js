let storage = window.localStorage;
let gameContainer = document.querySelector('.game');
let gameTable = document.getElementById('tiles');
let gameStepInfo = document.querySelector('.steps-count_info');
let gameSoundIcon = document.querySelector('.sound-button');
let gameMessage = document.querySelector('.message');
let gameNextLink = document.querySelector('.next-button');
let gameDownloadLink = document.querySelector('.download-button');
let menuContainer = document.querySelector('.menu');
let menuButton = document.querySelector('.menu-button');
let audio = document.getElementById('sound');

let soundOff = storage.getItem('soundOff');
if (soundOff == 'yes') gameSoundIcon.classList.add('sound-disable');

const RIGHT_ARROW = 39;
const LEFT_ARROW = 37;
const UP_ARROW = 40;
const DOWN_ARROW = 38;

window.onkeydown = function (event) {
  if (typeof game !== 'undefined' && game.start == true) {
    if (event.keyCode === RIGHT_ARROW) {
      swap(game.highlighted - 1);
    } else if (event.keyCode === LEFT_ARROW) {
      swap(game.highlighted + 1);
    } else if (event.keyCode === UP_ARROW) {
      swap(game.highlighted - game.size);
    } else if (event.keyCode === DOWN_ARROW) {
      swap(game.highlighted + game.size);
    }
  }
}

window.addEventListener("resize", function () {
  resizeGame();
}, false);

function resizeGame() {
  let orient = window.matchMedia("(orientation: portrait)");

  if (orient.matches) {
    let width = gameContainer.clientWidth * 0.9;
    gameTable.style.width = width + "px";
    gameTable.style.height = width + "px";
  } else {
    let height = gameContainer.clientHeight * 0.8;
    gameTable.style.width = height + "px";
    gameTable.style.height = height + "px";
  }
}