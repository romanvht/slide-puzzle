/**** Menu Game ****/
function menuToggle() {
  menuContainer.innerHTML = '';
  menuContainer.style.display = 'flex';
  gameContainer.style.display = 'none';
  game = false;
}

function getCategories() {
  let categories = window.categories;

  menuToggle();

  /*** Create Elements ***/
  let title = document.createElement('h1');
  title.innerHTML = 'Выберите<br>категорию';
  menuContainer.append(title);

  let links = document.createElement('div');
  links.classList.add('main-images');
  /*** /Create Elements ***/

  for (const key in categories) {
    let linkCat = document.createElement('a');
    linkCat.innerHTML = '<div class="cat-text">' + categories[key].name + '</div>';
    linkCat.setAttribute('onclick', 'getLevels(' + categories[key].id + ')');
    linkCat.classList.add('cat' + categories[key].id);

    let imgCat = document.createElement('img');
    imgCat.src = categories[key].folder + '1.jpg';

    linkCat.append(imgCat);

    links.append(linkCat);
  }

  menuContainer.append(links);
}

function getLevels(category) {
  let levels = window.levels;
  let categories = window.categories;

  menuToggle();

  /*** Create Elements ***/
  let title = document.createElement('h1');
  title.innerHTML = 'Выберите<br>изображение';
  menuContainer.append(title);

  let links = document.createElement('div');
  links.classList.add('main-images');

  let backButton = document.createElement('a');
  backButton.classList.add('back-button');
  backButton.setAttribute('onclick', 'getCategories()');
  backButton.innerHTML = 'Категории';
  /*** /Create Elements ***/

  for (const key in levels) {
    let linkLevel = document.createElement('a');
    let imgLevel = document.createElement('img');
    imgLevel.src = categories[category].folder + levels[key].image;
    linkLevel.setAttribute('onclick', 'newGame(' + levels[key].id + ', ' + categories[category].id + ')');
    linkLevel.classList.add('level' + levels[key].id);
    linkLevel.append(imgLevel);
    links.append(linkLevel);
  }

  menuButton.setAttribute('onclick', 'getLevels(' + categories[category].id + ')');
  menuContainer.append(links);
  menuContainer.append(backButton);

  let winsJSON = JSON.parse(storage.getItem('category_' + categories[category].id + '_wins') || '{}');
  for (const key in winsJSON) {
    if (winsJSON[key]) {
      let level = document.querySelector('.level' + key);
      level.classList.add("no-blur");
    }
  }
}
/**** /Menu Game ****/