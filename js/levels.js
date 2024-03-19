var levels = [];

levels[1] = {
  "id": 1,
  "size": 3,
  "image": "img/1.jpg"
};

levels[2] = {
  "id": 2,
  "size": 3,
  "image": "img/2.jpg"
};

levels[3] = {
  "id": 3,
  "size": 3,
  "image": "img/14.jpg"
};

levels[4] = {
  "id": 4,
  "size": 3,
  "image": "img/4.jpg"
};

levels[5] = {
  "id": 5,
  "size": 4,
  "image": "img/15.jpg"
};

levels[6] = {
  "id": 6,
  "size": 4,
  "image": "img/3.jpg"
};

levels[7] = {
  "id": 7,
  "size": 4,
  "image": "img/7.jpg"
};

levels[8] = {
  "id": 8,
  "size": 4,
  "image": "img/8.jpg"
};

levels[9] = {
  "id": 9,
  "size": 5,
  "image": "img/9.jpg"
};

levels[10] = {
  "id": 10,
  "size": 5,
  "image": "img/16.jpg"
};

levels[11] = {
  "id": 11,
  "size": 5,
  "image": "img/11.jpg"
};

levels[12] = {
  "id": 12,
  "size": 5,
  "image": "img/12.jpg"
};

levels[13] = {
  "id": 13,
  "size": 6,
  "image": "img/13.jpg"
};

levels[14] = {
  "id": 14,
  "size": 6,
  "image": "img/6.jpg"
};

levels[15] = {
  "id": 15,
  "size": 6,
  "image": "img/5.jpg"
};

levels[16] = {
  "id": 16,
  "size": 6,
  "image": "img/10.jpg"
};

function $_GET(key) {
  var s = window.location.search;
  s = s.match(new RegExp(key + '=([^&=]+)'));
  return s ? s[1] : false;
}
