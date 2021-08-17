const { ipcRenderer } = require("electron");
let net, eyeblinkModel;

let faceLength = 0;
let isAutoDarknessControlOn = false;
let isStretchGuideOn = false;
let isBrightWarningOn = false;
let isDistanceWarningOn = false;
let isEyeblinkWarningOn = false;
let isStareWarningOn = false;
let stareCount = 0;
// let second = 0;
// let timer;
let eyeblinkWarning;
let darkness = 0;
let brighttimer;
let brightFlag = true;
let leftEyeSize = 0;
let rightEyeSize = 0;
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
  net = await posenet.load({
    inputResolution: { width: cameraWidth, height: cameraHeight },
  });

  eyeblinkModel = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    {
      maxFaces: 1,
    }
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
  darkness = 0;
  clearTimeout(brighttimer);
  bright();
  if (!payload) ipcRenderer.send("SET_DARKNESS", 0);
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
      if (net && eyeblinkModel) {
        ipcRenderer.send("LOAD_MODEL_SUCCESS", true);
        bright();
        eyeblink();
        // startTimer();
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
  const pose = await net.estimateSinglePose(videoEl, {
    flipHorizontal: true,
  });
  if (pose) {
    faceLength = pose.keypoints[2].position.x - pose.keypoints[1].position.x;
    sittingHeight = pose.keypoints[0].position.y;
    ipcRenderer.send("INSERT_MESSAGE", {
      content: "capture-face",
      type: "normal",
    });
    ipcRenderer.send("SET_FACE_DISTANCE", {
      faceLength: faceLength,
      faceHeight: sittingHeight,
    });
  } else {
    ipcRenderer.send("INSERT_MESSAGE", { content: "no-face", type: "warning" });
  }
}

function distancePoints(a, b) {
  // return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
  return a[1] > b[1] ? a[1] - b[1] : b[1] - a[1];
}

function startTimer() {
  // timer = setInterval(() => {
  //   second = second + 0.1;
  // }, 100);
  eyeblinkWarning = setInterval(generateEyeblinkWarning, 7 * 1000);
  // if (second >= 7) eyeblinkWarning = setInterval(generateEyeblinkWarning, 2000);
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
    // console.log(eyeSizeStandard);
    if (eyeSizeStandard) {
      if (eyeSizeStandard.length > 0) {
        eyeSizeStandard.forEach((prediction) => {
          const keypoints = prediction.scaledMesh;
          leftEyeSize = distancePoints(keypoints[386], keypoints[374]);
          rightEyeSize = distancePoints(keypoints[159], keypoints[144]);
          // console.log(leftEyeSize, rightEyeSize);
        });
      }
      while (1) {
        // console.log(leftEyeSize, rightEyeSize);
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
          // console.log(eyeSizeStandardAgain);
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
  if (eyeblinkModel && isEyeblinkWarningOn && leftEyeSize && rightEyeSize) {
    predictions = await eyeblinkModel.estimateFaces({
      input: videoEl,
    });
    // console.log(second);
    // console.log(predictions);
    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        const keypoints = prediction.scaledMesh;
        leftEyelid = distancePoints(keypoints[386], keypoints[374]);
        rightEyelid = distancePoints(keypoints[159], keypoints[144]);
        // console.log(leftEyelid, rightEyelid);
        if (leftEyelid <= leftEyeSize / 2 && rightEyelid <= rightEyeSize / 2) {
          // clearInterval(timer);
          clearInterval(eyeblinkWarning);
          // console.log(second);
          // second = 0;
          // console.log("closed");
          startTimer();
        }
      });
    }
  }

  setTimeout(eyeblink, 80);
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

  // console.log('brightness',brightness)
  //brightness가 0 인경우 에러값으로 치부하고 패스하겠음(처음 값으로 0값이 들어와 무조건 알람이 발생함)
  if (isBrightWarningOn && 0 < brightness && brightness < 25) {
    if (brightFlag) {
      generateBrightWarning();
    }
    if (isAutoDarknessControlOn) brightFlag = false;
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

  brighttimer = setTimeout(bright, 10 * 1000); //30초마다 밝기 테스트하도록 되어있음
}

async function stare() {
  if (isStareWarningOn) {
    const pose = await net.estimateSinglePose(videoEl, {
      flipHorizontal: true,
    });
    if (pose) stareCount++;
  }
  if (stareCount % 3600 == 0 && stareCount !== 0) {
    stareCount = stareCount >= 7200 ? stareCount - 3600 : stareCount;
    if (isStretchGuideOn) ipcRenderer.send("SHOW_STRETCH_GUIDE");
    generateStareWarning();
  }
  setTimeout(stare, 1000); //10~30프레임 0.06초마다 얼굴을 감지한다.
}

async function screenDistance() {
  if (isDistanceWarningOn) {
    if (faceLength !== 0) {
      const pose = await net.estimateSinglePose(videoEl, {
        flipHorizontal: true,
      });
      if (
        pose &&
        (faceLength * 3) / 2 <
          pose.keypoints[2].position.x - pose.keypoints[1].position.x
      ) {
        generateDistanceWarning();
      }
    }
  }
  setTimeout(screenDistance, 10 * 1000); //10초에 한번 얼굴 감지
}

loadCamera();
