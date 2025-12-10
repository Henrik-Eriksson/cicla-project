// ==============================================================================
// ESP32 + Firebase + Ultrasonic Sensor + LED + Distance upload
// ==============================================================================

#include <WiFi.h>
#include "Firebase_ESP_Client.h"
#include "addons/TokenHelper.h" 
#include "addons/RTDBHelper.h"

//fill these in with the keys
#define WIFI_SSID ""  
#define WIFI_PASSWORD ""
#define API_KEY ""
#define DATABASE_URL ""

const int trigPin = 32;
const int echoPin = 33;
const int LED = 27;

float duration, distance;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;
int ledState = 0;          // will store LED state (0 or 1)

void setup() {
  Serial.begin(9600);

  // ---------------- Wi-Fi ----------------
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nWi-Fi connected!");

  // ---------------- Firebase config ----------------
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Anonymous sign-up
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase signUp OK");
    signupOK = true;
  } else {
    Serial.printf("SignUp Error: %s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback; 
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // ---------------- Pins ----------------
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  // ---------------- Measure distance ----------------
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = (duration * 0.0343) / 2;          // distance in cm [web:7][web:13]

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Control LED based on distance
  if (distance <= 50) {
    digitalWrite(LED, HIGH);
    ledState = 1;                               // LED ON
  } else {
    digitalWrite(LED, LOW);
    ledState = 0;                               // LED OFF
  }

  if (!signupOK) {
    Serial.println("DEBUG: signupOK is FALSE");
  }

  if (!Firebase.ready()) {
    Serial.println("DEBUG: Firebase not ready");
  }

  // ---------------- Send to Firebase every 5s ----------------
  if (Firebase.ready() && signupOK &&
      (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {

    sendDataPrevMillis = millis();

    // 1) Upload LED state as int
    if (Firebase.RTDB.setInt(&fbdo, "Sensor/led_state", ledState)) {  // uses setInt for integer data [web:12]
      Serial.print("LED state sent: ");
      Serial.println(ledState);
    } else {
      Serial.println("FAILED (led_state): " + fbdo.errorReason());
    }

    // 2) Upload distance as float
    if (Firebase.RTDB.setFloat(&fbdo, "Sensor/distance_cm", distance)) { // uses setFloat for float data [web:6][web:9]
      Serial.print("Distance sent: ");
      Serial.println(distance);
    } else {
      Serial.println("FAILED (distance_cm): " + fbdo.errorReason());
    }
  }

  delay(1000);
}
