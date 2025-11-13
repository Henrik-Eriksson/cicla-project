import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyAYJwO4MKFSCfM4iHUTuJTzTzGRkBKrtTI",
  authDomain: "cicla-project.firebaseapp.com",
  projectId: "cicla-project",
  storageBucket: "cicla-project.firebasestorage.app",
  messagingSenderId: "943033387656",
  appId: "1:943033387656:web:c08795f4eed3a73279ad3d"
};

//Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//Auth gate: delay setup so p5 is ready
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.email);
    //Schedule setup so p5 has fully initialized its globals
    requestAnimationFrame(() => setup());
  } else {
    console.log("No user logged in — redirecting to login.");
    window.open("/", "_self");
  }
});

//p5.js setup and UI logic (global mode)
let homeCard, navbar, menuBtn, logo, accountBtn, mapArea, findNearestBtn, helpBtn;
let currentPopup = null;

function setup() {
  noCanvas();

  //Main Card
  homeCard = createDiv();
  homeCard.addClass('home-card');

  //Navbar
  navbar = createDiv();
  navbar.addClass('navbar');
  navbar.parent(homeCard);

  menuBtn = createDiv("&#9776;").addClass('nav-btn').parent(navbar);
  logo = createDiv('<img src="assets/cicla_logo.png" style="height:45px;vertical-align:middle;">').addClass('nav-logo').parent(navbar);
  accountBtn = createDiv("&#128100;").addClass('nav-btn').parent(navbar);

  //Map Area
  mapArea = createDiv();
  mapArea.addClass('map-area');
  mapArea.parent(homeCard);

  //Legend
  let legend = createDiv();
  legend.addClass("legend-box");
  legend.parent(homeCard);
  legend.html(`
    <div class="legend-item"><span class="legend-dot legend-green"></span><span class="legend-label">&gt;50% available</span></div>
    <div class="legend-item"><span class="legend-dot legend-orange"></span><span class="legend-label">20-50% available</span></div>
    <div class="legend-item"><span class="legend-dot legend-red"></span><span class="legend-label">&lt;20% available</span></div>
  `);

  //Add sample stations
  addPin(18, 38, "green", "Rossio", 8, 15);
  addPin(43, 25, "orange", "Avenida", 4, 15);
  addPin(47, 63, "red", "Commerce Sq.", 2, 15);

  //Buttons
  findNearestBtn = createButton('Find nearest station').addClass('find-nearest-btn').parent(homeCard);
  helpBtn = createButton("?").addClass('help-btn').parent(homeCard);

  //Build account drawer before wiring the button (so the handler exists)
  createAccountDrawer();

  //Now that window.toggleAccountDrawer exists, wire the button
  accountBtn.mousePressed(() => window.toggleAccountDrawer());
}

function createAccountDrawer() {
  const accountDrawer = createDiv().addClass('account-drawer').parent(homeCard);

  const header = createDiv().addClass('account-header').parent(accountDrawer);
  createDiv('👤').addClass('account-avatar').parent(header);

  const headerText = createDiv().parent(header);
  createElement('div', 'My Account').addClass('account-title').parent(headerText);
  createElement('div', 'Manage your profile and bikes').addClass('account-subtitle').parent(headerText);

  const closeBtn = createButton('×').addClass('account-close-btn').parent(header);
  closeBtn.mousePressed(() => accountDrawer.removeClass('open'));

  const signOutBtn = createButton('Sign Out').addClass('account-signout-btn').parent(header);
  signOutBtn.mousePressed(async () => {
    await signOut(auth);
    localStorage.clear();
    window.open("/", "_self");
  });

  //Tabs
  const tabs = createDiv().addClass('account-tabs').parent(accountDrawer);
  const tabBtns = [
    createButton('Info').addClass('account-tab-btn active').parent(tabs),
    createButton('Password').addClass('account-tab-btn').parent(tabs),
    createButton('My Bikes').addClass('account-tab-btn').parent(tabs)
  ];

  const infoTab = createDiv().addClass('account-tab').parent(accountDrawer);
  const pwTab = createDiv().addClass('account-tab').style('display', 'none').parent(accountDrawer);
  const bikesTab = createDiv().addClass('account-tab').style('display', 'none').parent(accountDrawer);

  //Info tab
  createElement('label', 'Full Name').parent(infoTab);
  createInput(localStorage.getItem('userName') || 'John Doe').attribute('readonly', true).parent(infoTab);
  createElement('label', 'Email').parent(infoTab);
  createInput(localStorage.getItem('userEmail') || '').attribute('readonly', true).parent(infoTab);

  //Password Tab
  createElement('label', 'Current Password').parent(pwTab);
  const currentPwInput = createInput('').attribute('type', 'password').parent(pwTab);

  createElement('label', 'New Password').parent(pwTab);
  const newPwInput = createInput('').attribute('type', 'password').parent(pwTab);

  createElement('label', 'Confirm New Password').parent(pwTab);
  const confirmPwInput = createInput('').attribute('type', 'password').parent(pwTab);

  const changePwBtn = createButton('Change Password').addClass('account-save-btn').parent(pwTab);
  changePwBtn.mousePressed(() => changePassword(currentPwInput.value(), newPwInput.value(), confirmPwInput.value()));

  //Bikes Tab
  createElement('div', 'Your bikes will appear here.').parent(bikesTab);

  //Tab switching
  tabBtns.forEach((btn, i) => {
    btn.mousePressed(() => {
      [infoTab, pwTab, bikesTab].forEach((tab, j) => {
        tab.style('display', j === i ? '' : 'none');
        tabBtns[j].removeClass('active');
        if (i === j) tabBtns[j].addClass('active');
      });
    });
  });

  //Expose drawer toggler globally for the navbar button
  window.toggleAccountDrawer = () => {
    accountDrawer.toggleClass('open');
  };
}

function addPin(xPercent, yPercent, color, stationName, bikes, total) {
  const pinDiv = createDiv().addClass("station-pin " + color).parent(homeCard);
  pinDiv.style('position', 'absolute');
  pinDiv.style('left', xPercent + '%');
  pinDiv.style('top', yPercent + '%');
  pinDiv.mousePressed(() => showStationPopup(xPercent, yPercent, color, stationName, bikes, total));
}

function showStationPopup(xPercent, yPercent, color, stationName, bikes, total) {
  if (currentPopup) currentPopup.remove();
  currentPopup = createDiv().addClass("station-popup").parent(homeCard);
  currentPopup.style('position', 'absolute');
  currentPopup.style('left', `calc(${xPercent}% - 70px)`);
  currentPopup.style('top', `calc(${yPercent}% - 110px)`);

  const closeBtn = createButton("×").addClass("popup-close-btn").parent(currentPopup);
  closeBtn.mousePressed(() => {
    currentPopup.remove();
    currentPopup = null;
  });

  createElement('b', stationName).parent(currentPopup);
  createDiv(`🚴‍♂️ <b>${bikes}/${total}</b> bikes available`)
    .style('font-size', '22px')
    .style('margin-bottom', '9px')
    .parent(currentPopup);

  const navBtn = createButton("Navigate").addClass("navigate-btn").parent(currentPopup);
  navBtn.mousePressed(() => alert('Navigation not implemented.'));
}

//Password Update Logic
async function changePassword(currentPassword, newPassword, confirmPassword) {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to change your password.");
    return;
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Please fill in all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match.");
    return;
  }

  try {
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
    alert("Password updated successfully!");
  } catch (error) {
    console.error("Password update error:", error);
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
      alert("Incorrect current password.");
    } else if (error.code === "auth/requires-recent-login") {
      alert("Please sign in again to change your password.");
    } else {
      alert("Error updating password: " + error.message);
    }
  }
}

window.setup = setup;