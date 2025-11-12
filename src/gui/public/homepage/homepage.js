let homeCard, navbar, menuBtn, logo, accountBtn, mapArea, findNearestBtn, helpBtn;

function setup() {
  noCanvas();

  // Main Card
  homeCard = createDiv();
  homeCard.addClass('home-card');

  // Navbar
  navbar = createDiv();
  navbar.addClass('navbar');
  navbar.parent(homeCard);

  menuBtn = createDiv("&#9776;").addClass('nav-btn').parent(navbar);
  logo = createDiv('<img src="assets/cicla_logo.png" style="height:45px;vertical-align:middle;">').addClass('nav-logo').parent(navbar);
  accountBtn = createDiv("&#128100;").addClass('nav-btn').parent(navbar);

  // Map Area (Inside the card)
  mapArea = createDiv();
  mapArea.addClass('map-area');
  mapArea.parent(homeCard);

  // Add three pins (positions are relative within map-area)
  addPin(18, 38, "green");
  addPin(43, 25, "orange");
  addPin(47, 63, "red");


  // Find nearest station
  findNearestBtn = createButton('Find nearest station').addClass('find-nearest-btn').parent(homeCard);

  // Help button
  helpBtn = createButton("?").addClass('help-btn').parent(homeCard);
}

function addPin(xPercent, yPercent, color) {
  let pinDiv = createDiv();
  pinDiv.addClass("station-pin " + color);
  pinDiv.parent(homeCard);
  pinDiv.style('position', 'absolute');
  pinDiv.style('left', xPercent + '%');
  pinDiv.style('top', yPercent + '%');
}

