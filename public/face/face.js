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
let leftEyeSize = 0;
let rightEyeSize = 0;

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
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, { maxFaces: 1}
    );
}

loadModel();

ipcRenderer.send("REQUEST_INIT_SCREEN_VALUE", "faceProcess");
ipcRenderer.on("INIT", (evt, payload) => {
  faceLength = parseFloat(payload.faceProcess.faceLength);
  leftEyeSize = parseFloat(payload.faceProcess.leftEyeSize);
  rightEyeSize = parseFloat(payload.faceProcess.rightEyeSize);
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
    type: "warning",
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
    resetBright(payload)
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
    const keypoints = predictions[0].scaledMesh
    faceLength = keypoints[174][0] - keypoints[145][0];
    ipcRenderer.send("INSERT_MESSAGE", {
      content: "capture-face",
      type: "normal",
    });
    ipcRenderer.send("SET_FACE_DISTANCE", faceLength );
  } else {
    ipcRenderer.send("INSERT_MESSAGE", { content: "no-face", type: "warning" });
  }
}

function distancePoints(a, b) {
  return a[1] > b[1] ? a[1] - b[1] : b[1] - a[1];
}

function startTimer() {
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
  // console.log("5초 뒤 찰칵"); //알람으로 카운트다운하면 좋을듯
  setTimeout(async () => {
    eyeSizeStandard = await eyeblinkModel.estimateFaces({
      input: videoEl,
    });
    if (eyeSizeStandard) {
      if (eyeSizeStandard.length > 0) {
        eyeSizeStandard.forEach((prediction) => {
          const keypoints = prediction.scaledMesh;
          leftEyeSize = distancePoints(keypoints[386], keypoints[374]);
          rightEyeSize = distancePoints(keypoints[159], keypoints[144]);
        });
      }
      while (1) {
        if (leftEyeSize <= 4 || rightEyeSize <= 4) {
          ipcRenderer.send("INSERT_MESSAGE", {
            content: "eye-size-check-fail",
            type: "warning",
          });
          console.log("다시");
          sleep(3000);
          eyeSizeStandardAgain = await eyeblinkModel.estimateFaces({
            input: videoEl,
          });
          if (eyeSizeStandardAgain.length > 0) {
            eyeSizeStandardAgain.forEach((prediction) => {
              const keypoints = prediction.scaledMesh;
              leftEyeSize = distancePoints(keypoints[386], keypoints[374]);
              rightEyeSize = distancePoints(keypoints[159], keypoints[144]);
              console.log(leftEyeSize, rightEyeSize);
            });
          }
        } else {
          ipcRenderer.send("INSERT_MESSAGE", {
            content: "eye-size-check-complete",
            type: "normal",
          });
          ipcRenderer.send("SET_EYESIZE_DISTANCE", {
            leftEyeSize: leftEyeSize,
            rightEyeSize: rightEyeSize,
          });
          break;
        }
      }
    } else {
      ipcRenderer.send("INSERT_MESSAGE", {
        content: "no-face",
        type: "warning",
      });
    }
  }, 5000);
}
async function eyeblink() {
    predictions = await eyeblinkModel.estimateFaces({
        input: videoEl,
    });
  if (eyeblinkModel && isEyeblinkWarningOn && leftEyeSize && rightEyeSize) {
    // predictions = await eyeblinkModel.estimateFaces({
    //   input: videoEl,
    // });
    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        const keypoints = prediction.scaledMesh;
        leftEyelid = distancePoints(keypoints[386], keypoints[374]);
        rightEyelid = distancePoints(keypoints[159], keypoints[144]);
        if (leftEyelid <= leftEyeSize / 2 && rightEyelid <= rightEyeSize / 2) {
          clearInterval(eyeblinkWarning);
          startTimer();
        }
      });
    }
  }

  setTimeout(eyeblink, 80);
}

function resetBright(payload){
  darkness=0;
  clearTimeout(brighttimer);
  bright();
  if(!payload)
    ipcRenderer.send('SET_DARKNESS', 0);
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
    if (brightFlag) 
        generateBrightWarning();
    if (isAutoDarknessControlOn) 
        brightFlag = false;
  } else 
        brightFlag = true;

    if(isAutoDarknessControlOn){
        if(brightness in brightInterval){
          const now = brightInterval[brightness];
          if(darkness - 0.1 > now || darkness + 0.1 < now){
              darkness = now;
              ipcRenderer.send('SET_DARKNESS', now);
          }
        }
        else
          ipcRenderer.send('SET_DARKNESS', 0);
    }
        
    brighttimer = setTimeout(bright, 60 * 1000); //60초마다 밝기 테스트하도록 되어있음
}

async function stare() {
    if (isStareWarningOn) {
        if (predictions && predictions.length > 0) {
            const keypoints = predictions[0].scaledMesh;
            console.log(keypoints[19][0], keypoints[280][0], keypoints[123][0])
            if(keypoints[19][0] > keypoints[280][0] - 10 || keypoints[19][0] < keypoints[123][0] + 10){
                ++notStareCount;
            }
            else{
                ++stareCount;
                notStareCount=0;
            }
        }
        else
            ++notStareCount;
        console.log('starecount',stareCount, notStareCount)
    }
    if (stareCount % 3600 == 0 ) {
        if(isStretchGuideOn)
            ipcRenderer.send('SHOW_STRETCH_GUIDE');
        generateStareWarning();
    }
    else if(notStareCount !== 0 && notStareCount % 5*60 == 0)
        stareCount = 1;
    setTimeout(stare, 1000); // 1초에 한번 감지
}

async function screenDistance() {
  if (isDistanceWarningOn) {
    if (faceLength !== 0 && predictions && predictions.length>0) {
        const keypoints = predictions[0].scaledMesh;
        if(faceLength*3/2 < keypoints[174][0] - keypoints[145][0])
                generateDistanceWarning();
    }
  }
  setTimeout(screenDistance, 5 * 1000); //5초에 한번 얼굴 감지
}

loadCamera();
