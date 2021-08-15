const { ipcRenderer } = require("electron");
const path = require("path");
// const faceapi = require('face-api.js');

let detectFace = "no face";
let faceLength = 0;
let isAutoDarknessControlOn = false;
let isStretchGuideOn = false;
let isDistanceWarningOn = false;
let isEyeblinkWarningOn = false;
let isSittedWarningOn = false;

// faceapi.env.monkeyPatch({
//     Canvas: HTMLCanvasElement,
//     Image: HTMLImageElement,
//     ImageData: ImageData,
//     Video: HTMLVideoElement,
//     createCanvasElement: () => document.createElement('canvas'),
//     createImageElement: () => document.createElement('img')
// });

ipcRenderer.send("REQUEST_INIT_SCREEN_VALUE", "faceProcess");
ipcRenderer.on("INIT", (evt, payload) => {
  faceLength = parseFloat(payload.faceProcess.faceLength);
  isDistanceWarningOn = payload.faceProcess.isDistanceWarningOn;
  isEyeblinkWarningOn = payload.faceProcess.isEyeblinkWarningOn;
  isSittedWarningOn = payload.faceProcess.isSittedWarningOn;
  isAutoDarknessControlOn = payload.faceProcess.isAutoDarknessControlOn;
});
ipcRenderer.on("ESTIMATE_DISTANCE", () => {
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "ready-to-capture",
    type: "normal",
  });
  setTimeout(() => saveDistance(), 5 * 1000);
});
ipcRenderer.on("SET_DISTANCE_WARNING", (evt, payload) => {
  isDistanceWarningOn = payload;
});
ipcRenderer.on("SET_SITTED_WARNING", (evt, payload) => {
  isSittedWarningOn = payload;
});
ipcRenderer.on("SET_EYEBLINK_WARNING", (evt, payload) => {
  isEyeblinkWarningOn = payload;
});
ipcRenderer.on("SET_AUTO_DARKNESS_CONTROL", (evt, payload) => {
  autoDarknessControl = payload;
});
ipcRenderer.on("SET_STRETCH_GUIDE", (evt, payload) => {
  isStretchGuideOn = payload;
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
      videoEl.play();
    },
    (err) => {
      ipcRenderer.send("LOAD_CAMERA_FAILED", true);
      console.error(err);
    }
  );
}

videoEl.addEventListener(
  "play",
  async () => {
    //faceapi가 모델을 불러오고 화면 작동을 시작하는 시점을 settingPage에 알려주기 위한 코드
    // const img = getImgfromWebcam(videoEl,canvas);
    // await faceapi.detectSingleFace(img)
    ipcRenderer.send("LOAD_CAMERA_SUCCESS", true);
    // draw();
    // bright();
    // eyeblink();
    // sitted();
    // screenDistance();
  },
  false
);

function generateBrightWarning() {
  // ipcRenderer.send('INSERT_MESSAGE',{content:'bright-warning',type:'normal'})
  if (isAutoDarknessControlOn) {
    //밝기 자동 조절 모드가 켜져있는 경우
    // ipcRenderer.send('SET_DARKNESS',0.5);//0~0.5
  }
}

function generateDistanceWarning() {
  ipcRenderer.send("INSERT_MESSAGE", {
    content: "distance-warning",
    type: "warning",
  });
}

async function saveDistance() {
  const videoEl = document.getElementById("inputVideo");
  const canvas = document.getElementById("inputCanvas");
  const img = getImgfromWebcam(videoEl, canvas);
  const detections = await faceapi.detectSingleFace(img);
  if (detections) {
    faceLength = detections.box.width;
    ipcRenderer.send("INSERT_MESSAGE", {
      content: "capture-face",
      type: "normal",
    });
    ipcRenderer.send("SET_FACE_DISTANCE", detections.box.width);
  } else {
    ipcRenderer.send("INSERT_MESSAGE", { content: "no-face", type: "warning" });
  }
}

function getImgfromWebcam(videoEl, canvas) {
  const context = canvas.getContext("2d");
  context.drawImage(videoEl, 0, 0, 300, 150);
  const img = new Image();
  img.src = canvas.toDataURL("image/jpeg");
  return img;
}

async function draw() {
  const img = getImgfromWebcam(videoEl, canvas);
  const detections = await faceapi.detectSingleFace(img);
  if (detections) {
    box.style.width = 0; //detections.box.width+'px';
    box.style.height = 0; //detections.box.height+'px';
    box.style.top = 0; //detections.box.y+'px';
    box.style.left = 0; //detections.box.x+'px';
  }
  detectFace = detections ? detections.classScore : "no face";
  setTimeout(draw, 1000); //10~30프레임 0.06초마다 얼굴을 감지한다.
}

async function bright() {
  if (brightWarningOn) {
    const context = canvas.getContext("2d");
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0,
      g = 0,
      b = 0;
    for (let x = 0, len = data.length; x < len; x += 4) {
      r += data[x];
      g += data[x + 1];
      b += data[x + 2];
    }
  }

  videoEl.addEventListener(
    "play",
    async () => {
      //faceapi가 모델을 불러오고 화면 작동을 시작하는 시점을 settingPage에 알려주기 위한 코드
      const img = getImgfromWebcam(videoEl, canvas);
      pose.keypoints[2] - pose.keypoints[1];
      ipcRenderer.send("LOAD_CAMERA_SUCCESS", true);
      // draw();
      // bright();
      // eyeblink();
      sitted();
      screenDistance();
    },
    false
  );

  let draw = async () => {
    const img = getImgfromWebcam(videoEl, canvas);
    const detections = await faceapi.detectSingleFace(img);
    if (detections) {
      box.style.width = 0; //detections.box.width+'px';
      box.style.height = 0; //detections.box.height+'px';
      box.style.top = 0; //detections.box.y+'px';
      box.style.left = 0; //detections.box.x+'px';
    } else if (0 < brightness && brightness < 50) {
      generateBrightWarning();
    }
  };
  // let eyeblink = async () => {
  //     //눈 깜빡임 감지 로직
  //     //setTimeout( eyeblink, 60 );//10~30프레임 0.06초마다 얼굴을 감지한다.
  // }
  let sitted = async () => {
    //앉아있는지 감지하는 로직
    //setTimeout( sitted, 1000 );//10~30프레임 0.06초마다 얼굴을 감지한다.
    const net = await posenet.load({
      inputResolution: { width: 300, height: 150 },
    });
    const pose = await net.estimateSinglePose(videoEl, {
      flipHorizontal: true,
    });
    console.log(pose);
  };
  let screenDistance = async () => {
    if (distanceWarningOn) {
      if (faceLength !== 0) {
        const net = await posenet.load({
          inputResolution: { width: 300, height: 150 },
        });
        const pose = await net.estimateSinglePose(videoEl, {
          flipHorizontal: true,
        });
        if (
          pose &&
          (faceLength * 8) / 6 < pose.keypoints[2] - pose.keypoints[1]
        ) {
          generateDistanceWarning();
        }
      }
    }
  };
  setTimeout(screenDistance, 10 * 1000); //10초에 한번 얼굴 감지
}

loadCamera();
