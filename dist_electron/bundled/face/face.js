const { ipcRenderer } = require("electron");
let eyeblinkModel;

let faceLength = 0;
let isAutoDarknessControlOn = false;
let isStretchGuideOn = false;
let isBrightWarningOn = false;
let isDistanceWarningOn = false;
let isEyeblinkWarningOn = false;
let isStareWarningOn = false;
let stareCount = 1;
let notStareCount = 0;
let eyeblinkWarning;
let darkness = 0;
let brighttimer;
let brightFlag = true;
let distanceCount = 0;

let eyeSize = 0;
let leftEyeYSize = 0;
let rightEyeYSize = 0;
let leftEyeXSize = 0;
let rightEyeXSize = 0;
// let isEyeblinkFuncOn = 0;

let predictions;
let eyeSizeStandard;
let eyeSizeStandardAgain;

const cameraWidth = 600;
const cameraHeight = 300;
const videoEl = document.getElementById("inputVideo");
const canvasEl = document.getElementById("inputCanvas");

const brightInterval = new Proxy([], {
  get: (target, index) => 0.8 - index / 50,
  has: (target, brightness) => {
    if (brightness > 0 && brightness < 40) return true;
    else return false;
  },
});
async function loadModel() {
  eyeblinkModel = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: 1 }
  );
}

loadModel();

ipcRenderer.send("REQUEST_INIT_SCREEN_VALUE", "faceProcess");
ipcRenderer.on("INIT", (evt, payload) => {
  faceLength = parseFloat(payload.faceProcess.faceLength);
  leftEyeXSize = parseFloat(payload.faceProcess.leftEyeXSize);
  rightEyeXSize = parseFloat(payload.faceProcess.rightEyeXSize);
  leftEyeYSize = parseFloat(payload.faceProcess.leftEyeYSize);
  rightEyeYSize = parseFloat(payload.faceProcess.rightEyeYSize);
  isStretchGuideOn = payload.stretchGuideScreen.isStretchGuideOn;
  isDistanceWarningOn = payload.faceProcess.isDistanceWarningOn;
  isEyeblinkWarningOn = payload.faceProcess.isEyeblinkWarningOn;
  isStareWarningOn = payload.faceProcess.isStareWarningOn;
  isAutoDarknessControlOn = payload.faceProcess.isAutoDarknessControlOn;
});
ipcRenderer.on("ESTIMATE_DISTANCE", () => {
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "ready-to-capture",
    type: "normal",
  });
  setTimeout(saveDistance, 5 * 1000);
});
ipcRenderer.on("MEASURE_EYESIZE", () => {
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "eye-size-check",
    type: "normal",
  });
  setTimeout(measureEyeSize, 5 * 1000);
});
ipcRenderer.on("SET_DISTANCE_WARNING", (evt, payload) => {
  isDistanceWarningOn = payload;
});
ipcRenderer.on("SET_STARE_WARNING", (evt, payload) => {
  isStareWarningOn = payload;
});
ipcRenderer.on("SET_EYEBLINK_WARNING", (evt, payload) => {
  isEyeblinkWarningOn = payload;
});
ipcRenderer.on("SET_AUTO_DARKNESS_CONTROL", (evt, payload) => {
  isAutoDarknessControlOn = payload;
  resetBright(payload);
});
ipcRenderer.on("SET_STRETCH_GUIDE", (evt, payload) => {
  isStretchGuideOn = payload;
});
ipcRenderer.on("SET_BRIGHT_WARNING", (evt, payload) => {
  isBrightWarningOn = payload;
});
function loadCamera() {
  navigator.getMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetuserMedia ||
    navigator.msGetUserMedia;
  navigator.getMedia(
    { video: true },
    async (stream) => {
      videoEl.srcObject = stream;
      ipcRenderer.send("LOAD_CAMERA_SUCCESS", true);
    },
    (err) => {
      ipcRenderer.send("LOAD_CAMERA_FAILED", true);
      ipcRenderer.send("LOAD_MODEL_FAILED", true);
      console.error(err);
    }
  );
}
videoEl.addEventListener(
  "loadeddata",
  () => {
    const waitForLoadModel = () => {
      if (eyeblinkModel) {
        ipcRenderer.send("LOAD_MODEL_SUCCESS", true);
        bright();
        eyeblink();
        stare();
        screenDistance();
      } else {
        setTimeout(waitForLoadModel, 1000);
      }
    };
    waitForLoadModel();
  },
  false
);

function generateBrightWarning() {
  if (isAutoDarknessControlOn)
    ipcRenderer.send("INSERT_MESSAGE", {
      content: "bright-warning-auto",
      type: "warning",
    });
  else
    ipcRenderer.send("INSERT_MESSAGE", {
      content: "bright-warning",
      type: "warning",
    });
}

function generateStareWarning() {
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "stare-time",
    type: "warning",
  });
}
function generateEyeSizeCheckWarning() {
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "eye-size-check",
    type: "warning",
  });
}
function generateEyeblinkWarning() {
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "eye-blink",
    type: "warning",
  });
}

function generateDistanceWarning() {
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "distance-warning",
    type: "warning",
  });
}

async function saveDistance() {
  if (predictions && predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    faceLength = calciDstance(keypoints[174], keypoints[145]);
    ipcRenderer.send("INSERT_MESSAGE", {
      content: "capture-face",
      type: "normal",
    });
    ipcRenderer.send("SET_FACE_DISTANCE", faceLength);
  } else {
    ipcRenderer.send("NO_FACE", "face-distance");
    ipcRenderer.send("INSERT_MESSAGE", { content: "no-face", type: "warning" });
  }
}

function distanceXPoints(a, b) {
  return a[0] > b[0] ? a[0] - b[0] : b[0] - a[0];
}
function distanceYPoints(a, b) {
  return a[1] > b[1] ? a[1] - b[1] : b[1] - a[1];
}

function startEyeblinkWarning() {
  // timer = setInterval(() => {
  //   second = second + 0.1;
  // }, 100);
  eyeblinkWarning = setInterval(generateEyeblinkWarning, 7 * 1000);
}
function sleep(delay) {
  let start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

async function measureEyeSize() {
  let startMeasure = await eyeblinkModel.estimateFaces({
    input: videoEl,
  });
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "eye-size-check-start",
    type: "normal",
  });
  setTimeout(async () => {
    eyeSizeStandard = await eyeblinkModel.estimateFaces({
      input: videoEl,
    });
    if (eyeSizeStandard) {
      if (eyeSizeStandard.length > 0) {
        eyeSizeStandard.forEach((prediction) => {
          const keypoints = prediction.scaledMesh;
          rightEyeXSize = distanceXPoints(keypoints[244], keypoints[226]);
          leftEyeXSize = distanceXPoints(keypoints[464], keypoints[446]);
          rightEyeYSize = distanceYPoints(keypoints[386], keypoints[374]);
          leftEyeYSize = distanceYPoints(keypoints[159], keypoints[144]);
        });
      }
      while (1) {
        if (leftEyeYSize <= 4 || rightEyeYSize <= 4) {
          ipcRenderer.send("INSERT_MESSAGE", {
            content: "eye-size-check-fail",
            type: "warning",
          });
          // console.log("다시");
          sleep(3000);
          eyeSizeStandardAgain = await eyeblinkModel.estimateFaces({
            input: videoEl,
          });
          if (eyeSizeStandardAgain.length > 0) {
            eyeSizeStandardAgain.forEach((prediction) => {
              const keypoints = prediction.scaledMesh;
              rightEyeXSize = distanceXPoints(keypoints[244], keypoints[226]);
              leftEyeXSize = distanceXPoints(keypoints[464], keypoints[446]);
              rightEyeYSize = distanceYPoints(keypoints[386], keypoints[374]);
              leftEyeYSize = distanceYPoints(keypoints[159], keypoints[144]);
            });
          }
        } else {
          eyeSize = 1;
          ipcRenderer.send("INSERT_MESSAGE", {
            content: "eye-size-check-complete",
            type: "normal",
          });
          ipcRenderer.send("SET_EYESIZE_DISTANCE", {
            leftEyeXSize: leftEyeXSize,
            leftEyeYSize: leftEyeYSize,
            rightEyeXSize: rightEyeXSize,
            rightEyeYSize: rightEyeYSize,
          });
          break;
        }
      }
    } else {
      ipcRenderer.send("NO_FACE", "measure_eye");
      ipcRenderer.send("INSERT_MESSAGE", {
        content: "no-face",
        type: "warning",
      });
    }
  }, 5000);
}
async function eyeblink() {
  //고개 돌렸을 때 로직 추가해야함
  predictions = await eyeblinkModel.estimateFaces({ input: videoEl });
  if (eyeblinkModel && isEyeblinkWarningOn && eyeSize) {
    // console.log(predictions);
    // if (predictions) {
    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        const keypoints = prediction.scaledMesh;
        rightEyelid = distanceYPoints(keypoints[386], keypoints[374]);
        leftEyelid = distanceYPoints(keypoints[159], keypoints[144]);
        rightEyeLength = distanceXPoints(keypoints[226], keypoints[244]);
        leftEyeLength = distanceXPoints(keypoints[446], keypoints[464]);
        if (rightEyeLength < (rightEyeXSize / 3) * 2) {
          //얼굴 오른쪽으로 돌릴 때
          // console.log("얼굴 오른쪽으로 돌림");
          if (rightEyelid < (rightEyeYSize / 5) * 3) {
            clearInterval(eyeblinkWarning);
            console.log("closed");
            startEyeblinkWarning();
          }
        } else if (leftEyeLength < (leftEyeXSize / 3) * 2) {
          //얼굴 왼쪽으로 돌릴 때
          // console.log("얼굴 왼쪽으로 돌림");
          if (leftEyelid < (leftEyeYSize / 5) * 3) {
            clearInterval(eyeblinkWarning);
            // console.log("closed");
            startEyeblinkWarning();
          }
        } else {
          // 정면 볼 때
          if (
            // leftEyelid < (leftEyeYSize / 3) * 2 &&
            rightEyelid <
            (rightEyeYSize / 5) * 3
          ) {
            clearInterval(eyeblinkWarning);
            // console.log("closed");
            startEyeblinkWarning();
          }
        }
      });
    } else if (predictions.length == 0) {
      clearInterval(eyeblinkWarning);
    }
  } else if (isEyeblinkWarningOn == false) {
    clearInterval(eyeblinkWarning);
  }
  setTimeout(eyeblink, 80);
}

function resetBright(payload) {
  darkness = 0;
  clearTimeout(brighttimer);
  bright();
  if (!payload) ipcRenderer.send("SET_DARKNESS", 0);
}
async function bright() {
  const context = canvasEl.getContext("2d");
  context.drawImage(videoEl, 0, 0, cameraWidth, cameraHeight);
  const data = context.getImageData(0, 0, cameraWidth, cameraHeight).data;
  let r = 0,
    g = 0,
    b = 0;
  for (let x = 0, len = data.length; x < len; x += 4) {
    r += data[x];
    g += data[x + 1];
    b += data[x + 2];
  }
  const colorSum = Math.sqrt(0.299 * r ** 2 + 0.587 * g ** 2 + 0.114 * b ** 2);
  const brightness = Math.floor(colorSum / (cameraWidth * cameraHeight));

  if (isBrightWarningOn && 0 < brightness && brightness < 25) {
    if (brightFlag) {
      generateBrightWarning();
      brightFlag = false;
    }
  } else brightFlag = true;

  if (isAutoDarknessControlOn) {
    if (brightness in brightInterval) {
      const now = brightInterval[brightness];
      if (darkness - 0.1 > now || darkness + 0.1 < now) {
        darkness = now;
        ipcRenderer.send("SET_DARKNESS", now);
      }
    } else ipcRenderer.send("SET_DARKNESS", 0);
  }

  brighttimer = setTimeout(bright, 10 * 1000); //60초마다 밝기 테스트하도록 되어있음
}

async function stare() {
  if (isStareWarningOn) {
    if (predictions && predictions.length > 0) {
      const keypoints = predictions[0].scaledMesh;
      // console.log(keypoints[19][0], keypoints[280][0], keypoints[123][0]);
      if (
        keypoints[19][0] > keypoints[280][0] - 10 ||
        keypoints[19][0] < keypoints[123][0] + 10
      ) {
        ++notStareCount;
      } else {
        ++stareCount;
        notStareCount = 0;
      }
    } else ++notStareCount;
    // console.log("starecount", stareCount, notStareCount);
  }
  if (stareCount % 3600 == 0) {
    if (isStretchGuideOn) ipcRenderer.send("SHOW_STRETCH_GUIDE");
    generateStareWarning();
  } else if (notStareCount !== 0 && (notStareCount % 5) * 60 == 0)
    stareCount = 1;
  setTimeout(stare, 1000); // 1초에 한번 감지
}

const calcDistance = (a, b) =>
  Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
async function screenDistance() {
  if (isDistanceWarningOn) {
    if (faceLength !== 0 && predictions && predictions.length > 0) {
      const keypoints = predictions[0].scaledMesh;
      if ((faceLength * 3) / 2 < calcDistance(keypoints[174], keypoints[145]))
        distanceCount++;
      else 
        distanceCount = 0;
    }
    if (distanceCount > 2) generateDistanceWarning();
  }
  setTimeout(screenDistance, 5 * 1000); //5초에 한번 얼굴 감지
}

loadCamera();
