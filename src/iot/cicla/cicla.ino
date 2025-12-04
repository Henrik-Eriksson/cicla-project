// C++ code
//

//0, 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33 (GPIO PORTS) that we can use for the ESP32-WROOM-32
/*
GPIO0 – OK to use, but affects boot mode (must be HIGH to boot normally)

GPIO2 – OK (must be LOW for flashing)

GPIO5 – Has pull-up, driven at boot

GPIO12 – Must be LOW at boot; affects flash voltage

GPIO15 – Must be LOW at boot
*/

const int trigPin = 32;
const int echoPin = 33;
const int LED = 27;

float duration, distance;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = (duration*.0343)/2;
  Serial.print("Distance: ");
  Serial.println(distance);

  if (distance <= 50) {
    digitalWrite(LED, HIGH);  // object is close → LED ON
  } else {
    digitalWrite(LED, LOW);   // object is far → LED OFF
  }
  
  delay(1000);
}