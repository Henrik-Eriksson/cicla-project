const MAX_SPOTS = 12;

let neuralNetwork;
let fullData = [];
let trainData = [];
let testData = [];
let isModelTrained = false;

const ui = {
  epochs: 100,
  learningRate: 0.2,
  hour: 9,
  temp: 15,
  rain: 0
};

const lossHistory = [];
let maxLossSeen = 0;

let dataSampleBodyRef = null;


function setup() {
  console.log("[setup] starting setup");
  createCanvas(10, 10).hide();
  generateFakeData();
  splitTrainTest();
  initializeNetwork();
  hookUI();
  populateSampleTable();
  console.log("[setup] done, train =", trainData.length, "test =", testData.length);
}

function draw() {
}


function generateFakeData() {
  console.log("[data] generating fake data…");
  fullData = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const temperature =
        10 + Math.sin((hour / 24) * Math.PI) * 10 + (Math.random() - 0.5) * 4;
      const isRaining = Math.random() > 0.8 ? 1 : 0;

      let occupancy = 0;
      if (hour >= 7 && hour <= 9) occupancy += 8;
      else if (hour >= 17 && hour <= 19) occupancy += 10;
      else if (hour >= 10 && hour <= 16) occupancy += 4;
      else if (hour >= 20 && hour <= 23) occupancy += 3;
      else occupancy += 1;

      if (temperature < 5) occupancy += 2;
      if (temperature > 25) occupancy -= 2;
      if (isRaining === 1) occupancy -= 3;

      occupancy += (Math.random() - 0.5) * 2;
      occupancy = Math.max(0, Math.min(MAX_SPOTS, Math.round(occupancy)));

      fullData.push({
        hour,
        temp: Math.round(temperature * 10) / 10,
        rain: isRaining,
        occupancy
      });
    }
  }
  console.log("[data] done, samples =", fullData.length);
}

function splitTrainTest() {
  const shuffled = [...fullData].sort(() => Math.random() - 0.5);
  const cutoff = Math.floor(shuffled.length * 0.8);
  trainData = shuffled.slice(0, cutoff);
  testData = shuffled.slice(cutoff);
  console.log("[data] train size =", trainData.length, "test size =", testData.length);
}

function initializeNetwork() {
  console.log("[ml5] initializing network with lr", ui.learningRate);
  const options = {
    inputs: 3,
    outputs: 1,
    task: "regression",
    debug: false,
    learningRate: ui.learningRate
  };
  neuralNetwork = ml5.neuralNetwork(options); 

  trainData.forEach((p, i) => {
    neuralNetwork.addData(
      { hour: p.hour, temperature: p.temp, raining: p.rain },
      { occupancy: p.occupancy }
    );
    if (i < 3) {
      console.log(
        "[ml5] train sample",
        i,
        "in",
        { hour: p.hour, temperature: p.temp, raining: p.rain },
        "out",
        { occupancy: p.occupancy }
      );
    }
  });

  console.log("[ml5] training data added");
}


function populateSampleTable() {
  if (!dataSampleBodyRef) return;
  dataSampleBodyRef.innerHTML = "";
  const sampleCount = Math.min(5, testData.length);
  for (let i = 0; i < sampleCount; i++) {
    const idx = Math.floor(Math.random() * testData.length);
    const p = testData[idx];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.hour}:00</td>
      <td>${p.temp}°C</td>
      <td>${p.rain === 1 ? "🌧️" : "☀️"}</td>
      <td>${p.occupancy}</td>
    `;
    dataSampleBodyRef.appendChild(tr);
  }
}


function hookUI() {
  console.log("[ui] hooking UI");

  const epochsSlider = document.getElementById("epochs");
  const lrSlider = document.getElementById("lr");
  const hourSlider = document.getElementById("hour");
  const tempSlider = document.getElementById("temp");
  const rainSlider = document.getElementById("rain");

  const epochsVal = document.getElementById("epochs-value");
  const lrVal = document.getElementById("lr-value");
  const hourVal = document.getElementById("hour-value");
  const tempVal = document.getElementById("temp-value");
  const rainVal = document.getElementById("rain-value");

  const trainBtn = document.getElementById("train-btn");
  const statusEl = document.getElementById("train-status");
  const predictBtn = document.getElementById("predict-btn");

  const predVal = document.getElementById("prediction-value");
  const predCap = document.getElementById("prediction-capacity");
  const predConf = document.getElementById("prediction-conf");

  const lossLine = document.getElementById("loss-line");
  const lossLatest = document.getElementById("loss-latest");

  const predActual = document.getElementById("prediction-actual");
  const dataSampleBody = document.getElementById("data-sample-body");
  dataSampleBodyRef = dataSampleBody;

  epochsSlider.addEventListener("input", () => {
    ui.epochs = Number(epochsSlider.value);
    epochsVal.textContent = ui.epochs;
    console.log("[ui] epochs ->", ui.epochs);
  });

  lrSlider.addEventListener("input", () => {
    ui.learningRate = Number(lrSlider.value);
    lrVal.textContent = ui.learningRate.toFixed(2);
    console.log("[ui] learningRate ->", ui.learningRate);
  });

  hourSlider.addEventListener("input", () => {
    ui.hour = Number(hourSlider.value);
    hourVal.textContent = ui.hour;
  });

  tempSlider.addEventListener("input", () => {
    ui.temp = Number(tempSlider.value);
    tempVal.textContent = `${ui.temp}°C`;
  });

  rainSlider.addEventListener("input", () => {
    ui.rain = Number(rainSlider.value);
    rainVal.textContent = ui.rain === 1 ? "🌧️ Yes" : "☀️ No";
  });


  trainBtn.addEventListener("click", async () => {
    if (isModelTrained) {
      console.log("[train] already trained, ignoring click");
      return;
    }

    console.log("[train] starting training", { epochs: ui.epochs });
    statusEl.textContent = "Training…";
    lossHistory.length = 0;
    maxLossSeen = 0;
    lossLine.style.width = "0px";
    lossLatest.textContent = "–";
    predictBtn.disabled = true;

    const opts = { epochs: ui.epochs, batchSize: 16 };

    try {
      await neuralNetwork.normalizeData();
      console.log("[train] data normalized");

      await neuralNetwork.train(opts, (epoch, logs) => {
        console.log("[train] callback epoch", epoch, "logs:", logs);
        if (!logs || typeof logs.loss !== "number" || !isFinite(logs.loss)) {
          console.warn("[train] invalid logs, skipping", logs);
          return;
        }

        const loss = logs.loss;
        statusEl.textContent = `Training… epoch ${epoch}/${ui.epochs} · loss ${loss.toFixed(
          3
        )}`;

        lossLatest.textContent = `loss ${loss.toFixed(3)}`;
        lossHistory.push(loss);
        maxLossSeen = Math.max(maxLossSeen, loss);

        const progress = epoch / ui.epochs;
        const widthPercent = Math.min(100, progress * 100);
        const norm = maxLossSeen > 0 ? loss / maxLossSeen : 0;
        const heightPercent = 5 + (1 - Math.min(1, norm)) * 95;

        lossLine.style.width = `${widthPercent}%`;
        lossLine.style.height = `${heightPercent}%`;
      });

      console.log("[train] finished (promise resolved)");
      isModelTrained = true;
      statusEl.textContent = "Model trained ✔";
      predictBtn.disabled = false;
    } catch (err) {
      console.error("[train] error", err);
      statusEl.textContent = "Training failed";
      predictBtn.disabled = true;
    }
  });


  predictBtn.addEventListener("click", async () => {
    if (!isModelTrained) {
      console.log("[predict] clicked before model trained");
      return;
    }

    const inputs = {
      hour: ui.hour,
      temperature: ui.temp,
      raining: ui.rain
    };
    console.log("[predict] inputs", inputs);

    try {
      const results = await neuralNetwork.predict(inputs);
      console.log("[predict] raw results", results);

      if (
        !Array.isArray(results) ||
        results.length === 0 ||
        results[0] == null ||
        typeof results[0].value !== "number" ||
        !isFinite(results[0].value)
      ) {
        console.warn("[predict] invalid results, showing error");
        predVal.textContent = "error";
        predCap.textContent = "prediction failed";
        predConf.textContent = "Confidence –";
        predActual.textContent = "–";
        return;
      }

      const raw = results[0].value;
      const pred = Math.max(0, Math.min(MAX_SPOTS, Math.round(raw)));
      const conf = Math.min(99, 70 + Math.random() * 25);

      console.log("[predict] value", raw, "rounded", pred, "conf", conf);

      predVal.textContent = `${pred} bikes`;
      predCap.textContent = `${pred} / ${MAX_SPOTS} spots`;
      predConf.textContent = `Confidence ${conf.toFixed(0)}%`;

      let best = null;
      let bestDist = Infinity;
      for (const p of testData) {
        const dh = p.hour - ui.hour;
        const dt = p.temp - ui.temp;
        const dr = p.rain - ui.rain;
        const dist = dh * dh + dt * dt + dr * dr;
        if (dist < bestDist) {
          bestDist = dist;
          best = p;
        }
      }

      if (best) {
        predActual.textContent = `${best.occupancy} bikes (test: h ${best.hour}, ${best.temp}°C, ${best.rain ? "rain" : "dry"})`;
      } else {
        predActual.textContent = "–";
      }
    } catch (err) {
      console.error("[predict] error", err);
      predVal.textContent = "error";
      predCap.textContent = "prediction failed";
      predConf.textContent = "Confidence –";
      predActual.textContent = "–";
    }
  });

  console.log("[ui] hookUI complete");
}
