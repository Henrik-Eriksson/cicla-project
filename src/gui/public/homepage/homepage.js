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
  
  // Legend container
  let legend = createDiv();
  legend.addClass("legend-box");
  legend.parent(homeCard);

  // Add legend items
  legend.html(`
    <div class="legend-item">
      <span class="legend-dot legend-green"></span>
      <span class="legend-label">&gt;50% available</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot legend-orange"></span>
      <span class="legend-label">20-50% available</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot legend-red"></span>
      <span class="legend-label">&lt;20% available</span>
    </div>
  `);

  // Add three pins (positions are relative within map-area)
  addPin(18, 38, "green", "Rossio", 8, 15);
  addPin(43, 25, "orange", "Avenida", 4, 15);
  addPin(47, 63, "red", "Commerce Sq.", 2, 15); 
  

  // Find nearest station
  findNearestBtn = createButton('Find nearest station').addClass('find-nearest-btn').parent(homeCard);

  // Help button
  helpBtn = createButton("?").addClass('help-btn').parent(homeCard);

  // --- Account Drawer ---
  accountDrawer = createDiv().addClass('account-drawer').parent(homeCard);

  // Account drawer header
  let header = createDiv().addClass('account-header').parent(accountDrawer);
  createDiv('👤').addClass('account-avatar').parent(header);
  let headerText = createDiv().parent(header);
  createElement('div', 'My Account').addClass('account-title').parent(headerText);
  createElement('div', 'Manage your profile and bikes').addClass('account-subtitle').parent(headerText);
  let closeBtn = createButton('×').addClass('account-close-btn').parent(header);
  closeBtn.mousePressed(closeDrawer);

  // Tabs
  let tabs = createDiv().addClass('account-tabs').parent(accountDrawer);
  tabBtns = [
    createButton('Info').addClass('account-tab-btn active').parent(tabs),
    createButton('Password').addClass('account-tab-btn').parent(tabs),
    createButton('My Bikes').addClass('account-tab-btn').parent(tabs)
  ];
  tabBtns[0].mousePressed(() => showTab(0));
  tabBtns[1].mousePressed(() => showTab(1));
  tabBtns[2].mousePressed(() => showTab(2));

    // Info Tab
  infoTab = createDiv().addClass('account-tab').parent(accountDrawer);
  createElement('label', 'Full Name').parent(infoTab);
  createInput('John Doe').parent(infoTab).attribute('readonly', true);
  createElement('label', 'Email').parent(infoTab);
  createInput('john.doe@example.com').parent(infoTab).attribute('readonly', true);
  createElement('label', 'Phone Number').parent(infoTab);
  createInput('+351 912 345 678').parent(infoTab).attribute('readonly', true);
  createButton('Save Changes').addClass('account-save-btn').parent(infoTab);

  // Password Tab
  pwTab = createDiv().addClass('account-tab').parent(accountDrawer).style('display', 'none');
  createElement('label', 'Current Password').parent(pwTab);
  createInput('').attribute('type','password').parent(pwTab);
  createElement('label', 'New Password').parent(pwTab);
  createInput('').attribute('type','password').parent(pwTab);
  createElement('label', 'Confirm New Password').parent(pwTab);
  createInput('').attribute('type','password').parent(pwTab);
  createButton('Change Password').addClass('account-save-btn').parent(pwTab);

   // Bikes Tab
  bikesTab = createDiv().addClass('account-tab').parent(accountDrawer).style('display', 'none');
  let bikesAdd = createDiv().addClass('account-bikes-add').parent(bikesTab);
  let bikeInput = createInput().attribute('placeholder','Bike name').parent(bikesAdd);
  createButton('Add').addClass('bike-add-btn').parent(bikesAdd).mousePressed(()=>alert('Added: '+bikeInput.value()));

  let bikesList = createDiv().addClass('account-bikes-list').parent(bikesTab);
  addBikeCard('My Mountain Bike','MTB-2824-8471','15/01/2024', bikesList);
  addBikeCard('City Cruiser','CTY-2824-3392','20/02/2024', bikesList);
  addBikeCard('Electric Bike','ELB-2824-5618','10/03/2024', bikesList);

    // --- Account Button Show/Hide ---
  accountBtn.mousePressed(() => {
    accountDrawer.addClass('open');
    drawerOpen = true;
  });

  function closeDrawer() {
    accountDrawer.removeClass('open');
    drawerOpen = false;
  }

  function showTab(index) {
    [infoTab, pwTab, bikesTab].forEach((tab, i) => {
      tab.style('display', i === index ? '' : 'none');
      tabBtns[i].removeClass('active');
      if(i === index) tabBtns[i].addClass('active');
    });
  }
}

function addBikeCard(name, id, date, parent) {
  let card = createDiv().addClass('bike-card').parent(parent);
  createSpan('🚲').addClass('bike-icon').parent(card);
  createSpan(name).parent(card);
  createElement('div', id).addClass('bike-id').parent(card);
  createElement('div', 'Added on '+date).addClass('bike-date').parent(card);
}

function addPin(xPercent, yPercent, color, stationName, bikes, total) {
  let pinDiv = createDiv();
  pinDiv.addClass("station-pin " + color);
  pinDiv.parent(homeCard);
  pinDiv.style('position', 'absolute');
  pinDiv.style('left', xPercent + '%');
  pinDiv.style('top', yPercent + '%');

  // Attach click event for popup
  pinDiv.mousePressed(() => showStationPopup(xPercent, yPercent, color, stationName, bikes, total));
}

let currentPopup = null;

function showStationPopup(xPercent, yPercent, color, stationName, bikes, total) {
  if (currentPopup) currentPopup.remove();

  currentPopup = createDiv().addClass("station-popup").parent(homeCard);
  currentPopup.style('position', 'absolute');
  currentPopup.style('left', `calc(${xPercent}% - 70px)`);
  currentPopup.style('top', `calc(${yPercent}% - 110px)`);

  // Close button (p5.js)
  let closeBtn = createButton("×").addClass("popup-close-btn").parent(currentPopup);
  closeBtn.mousePressed(() => {
    currentPopup.remove();
    currentPopup = null;
  });

  // Title and info
  createElement('b', stationName).parent(currentPopup);
  createDiv(`🚴‍♂️ <b>${bikes}/${total}</b> bikes available`)
    .style('font-size', '22px')
    .style('margin-bottom', '9px')
    .parent(currentPopup);

  // "Navigate" button (p5.js)
  let navBtn = createButton("Navigate").addClass("navigate-btn").parent(currentPopup);
  navBtn.mousePressed(() => alert('Navigation not implemented.'));
}