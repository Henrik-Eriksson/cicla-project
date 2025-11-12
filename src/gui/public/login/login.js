let userNameBox, passwordBox, loginButton, signupButton, title, subtitle, card, img;
let registrationPopup, closePopupButton, regNameInput, regLastNameInput, regEmailInput, regPasswordInput, createAccountBtn;


function setup() {
  noCanvas();

  // Create card container
  card = createDiv();
  card.addClass("login-card");

  // Add logo
  let logo = createImg('assets/cicla_logo.png', 'Cicla Logo');
  logo.parent(card);
  logo.addClass('login-logo');

  // Title
  title = createElement("h2", "Welcome!");
  title.parent(card);

  // Subtitle
  subtitle = createP("Log in to continue");
  subtitle.parent(card);
  
  // Username input
  userNameBox = createInput();
  userNameBox.attribute("placeholder", "Enter your username");
  userNameBox.parent(card);

  // Password input
  passwordBox = createInput("", "password");
  passwordBox.attribute("placeholder", "Enter your password");
  passwordBox.parent(card);

  // Log in button
  loginButton = createButton("Log in");
  loginButton.parent(card);
  loginButton.addClass("login-btn");
  loginButton.mousePressed(login);

  // Sign up button
  signupButton = createButton("Sign up");
  signupButton.parent(card);
  signupButton.addClass("signup-btn");

  // Sign up button handler triggers popup
  signupButton.mousePressed(showRegistrationPopup);

  // Terms text
  let terms = createP(
    'By continuing, you agree to our <a href="#" style="color:#ff4b4b; text-decoration:none;">Terms and Conditions</a>'
  );
  terms.parent(card);
  terms.addClass("terms");
}

function login() {
  let userName = userNameBox.value();
  let password = passwordBox.value();

  // Allow login with "user"/"pass" or "admin"/"password"
  if (
    (userName === "user" && password === "pass") || 
    (userName === "admin" && password === "password")
  ) {
    localStorage.setItem("username", userName);
    localStorage.setItem("password", password);
    window.open("/home", "_self");
  } else {
    alert("Incorrect username or password");
  }
}


// Show registration popup
function showRegistrationPopup() {
  registrationPopup = createDiv();
  registrationPopup.addClass("popup-overlay");

  let popupCard = createDiv();
  popupCard.addClass("registration-card");
  popupCard.parent(registrationPopup);

  let popupTitle = createElement("h2", "Register Account");
  popupTitle.parent(popupCard);

  regNameInput = createInput();
  regNameInput.attribute("placeholder", "First name");
  regNameInput.parent(popupCard);

  regLastNameInput = createInput();
  regLastNameInput.attribute("placeholder", "Last name");
  regLastNameInput.parent(popupCard);

  regEmailInput = createInput();
  regEmailInput.attribute("placeholder", "Email");
  regEmailInput.parent(popupCard);

  regPasswordInput = createInput("", "password");
  regPasswordInput.attribute("placeholder", "Password");
  regPasswordInput.parent(popupCard);

  createAccountBtn = createButton("Create Account");
  createAccountBtn.parent(popupCard);
  createAccountBtn.addClass("login-btn");
  createAccountBtn.mousePressed(registerAccount);

  closePopupButton = createButton("×");
  closePopupButton.parent(popupCard);
  closePopupButton.addClass("close-btn");
  closePopupButton.mousePressed(closePopup);
}

function closePopup() {
  registrationPopup.remove();
}

// Example registration action
function registerAccount() {
  let name = regNameInput.value();
  let lastName = regLastNameInput.value();
  let email = regEmailInput.value();
  let password = regPasswordInput.value();
  alert(`Account created for ${name} ${lastName}`);
  closePopup();
}