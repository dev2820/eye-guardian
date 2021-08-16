const { ipcRenderer } = require("electron");
let net, eyeblinkModel;

const NOSE = 0;
const LEFTEYE = 1;
const RIGHTEYE = 2;
const LEFTEAR = 3;
const RIGHTEAR = 4;
const LEFTSHOULDER = 5;
const RIGHTSHOULDER = 6;
const LEFTELBOW = 7;
const RIGHTELBOW = 8;
const LEFTWRIST = 9;
const RIGHTWRIST = 10;
const LEFTHIP = 11;
const RIGHTHIP = 12;
const LEFTKNEE = 13;
const RIGHTKNEE = 14;
const LEFTANKLE = 15;
const RIGHTANKLE = 16;

let detectFace = "no face";
let faceLength = 0;
let isAutoDarknessControlOn = false;
let isStretchGuideOn = false;
let isDistanceWarningOn = false;
let isEyeblinkWarningOn = false;
let isSittedWarningOn = false;
let sittingHeight = 0;
let sitCount = 0;
let rafID;
const cameraWidth = 600;
const cameraHeight = 300;
const videoEl = document.getElementById("inputVideo");
const canvasEl = document.getElementById("inputCanvas");

async function loadModel(){
    net = await posenet.load({
        inputResolution: { width: cameraWidth, height: cameraHeight },
    })
    
    eyeblinkModel = await faceLandmarksDetection
                        .load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, {
                            maxFaces: 1,
                        })
}

loadModel();

ipcRenderer.send("REQUEST_INIT_SCREEN_VALUE", "faceProcess");
ipcRenderer.on("INIT", (evt, payload) => {
    faceLength = parseFloat(payload.faceProcess.faceLength);
    sittingHeight = parseFloat(payload.faceProcess.faceHeight);
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
    setTimeout(saveDistance, 5 * 1000);
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
    isAutoDarknessControlOn = payload;
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
            ipcRenderer.send("LOAD_CAMERA_SUCCESS", true);
        },
        (err) => {
            ipcRenderer.send("LOAD_CAMERA_FAILED", true);
            ipcRenderer.send("LOAD_MODEL_FAILED", true);
            console.error(err);
        }
    );
}
videoEl.addEventListener('loadeddata',()=>{
    const waitForLoadModel = () => {
        if(net && eyeblinkModel) {
            ipcRenderer.send("LOAD_MODEL_SUCCESS", true);
            bright();
            eyeblink();
            sitted();
            screenDistance();
        }
        else {
            setTimeout(waitForLoadModel,1000);
        }
    }
    waitForLoadModel();
},false)

function generateBrightWarning() {
  // ipcRenderer.send('INSERT_MESSAGE',{content:'bright-warning',type:'normal'})
    if (isAutoDarknessControlOn) {
        //밝기 자동 조절 모드가 켜져있는 경우
        // ipcRenderer.send('SET_DARKNESS',0.5);//0~0.5
    }
}
function distancePoints(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function generateSitWarning() {
    ipcRenderer.send("INSERT_MESSAGE", {
        content: "sit-up-time",
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
        console.log(sittingHeight);
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

async function eyeblink() {
    if (eyeblinkModel && isEyeblinkWarningOn) {
        const predictions = await eyeblinkModel.estimateFaces({
            input: videoEl,
            // returnTensors: false,
            // flipHorizontal: false,
        });

        console.log(predictions);
        if (predictions.length > 0) {
        predictions.forEach((prediction) => {
            const keypoints = prediction.scaledMesh;

            leftEyelid = distancePoints(keypoints[386], keypoints[374]);
            rightEyelid = distancePoints(keypoints[159], keypoints[144]);
            if (leftEyelid <= 5 && rightEyelid <= 5) {
            // console.log(leftEyelid);
            // console.log(rightEyelid);
            console.log("closed");
            }
        });

        // if (renderPointcloud && state.renderPointcloud != null) {
        //   const pointsData = predictions.map((prediction) => {
        //     let scaledMesh = prediction.scaledMesh;
        //     return scaledMesh.map((point) => [-point[0], -point[1], -point[2]]);
        //   });

        //   let flattenedPointsData = [];
        //   for (let i = 0; i < pointsData.length; i++) {
        //     flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
        //   }
        // }
        }
        // rafID = requestAnimationFrame(eyeblink);
    }

    setTimeout(eyeblink, 50);
}
async function bright() {
    const context = canvasEl.getContext('2d');
    context.drawImage(videoEl, 0, 0, cameraWidth, cameraHeight);
    const data= context.getImageData(0,0,cameraWidth,cameraHeight).data;
    let r=0,g=0,b=0;
    for(let x= 0, len= data.length; x < len; x+=4) {
        r += data[x];
        g += data[x+1];
        b += data[x+2];
    }
    const colorSum = Math.sqrt(0.299 * (r ** 2)
    + 0.587 * (g ** 2)
    + 0.114 * (b ** 2));
    const brightness= Math.floor(colorSum /(cameraWidth*cameraHeight));

    // console.log('brightness',brightness)
    if(brightness<=0) {
        //brightness가 0 인경우 에러값으로 치부하고 패스하겠음(처음 값으로 0값이 들어와 무조건 알람이 발생함)
    }
    else if( 0 < brightness && brightness < 50){
        generateBrightWarning();
        //isAutoDarknessControlOn <= 이게 on인 경우
        //ipc.send('SET_DARKNESS',this.darkness); <=이걸로 밝기 조절
    }
    setTimeout( bright, 30*1000 );//30초마다 밝기 테스트하도록 되어있음
}

async function draw() {
    const pose = await net.estimateSinglePose(videoEl, {
        flipHorizontal: true,
    });
    if (pose) {
        box.style.width =
        pose.keypoints[4].position.x - pose.keypoints[3].position.x + "px";
        box.style.height = 10 + "px";
        box.style.top = pose.keypoints[3].position.y + "px";
        box.style.left = pose.keypoints[3].position.x + "px";
    }
    detectFace = pose ? pose.score : "no face";
    setTimeout(draw, 1000); //10~30프레임 0.06초마다 얼굴을 감지한다.
}

async function sitted() {
    // ipc.send('SHOW_STRETCH_GUIDE');<= 이거 써서 장시간 앉아있는 경우 스트레칭 출력하도록
    if(isSittedWarningOn && sittingHeight){//isStretchGuideOn
        //앉아있는지 감지하는 로직
        const pose = await net.estimateSinglePose(videoEl, {
            flipHorizontal:true
        })
        if(pose){
            if(pose.keypoints[0].position.y < sittingHeight - faceLength*2 )
                sitCount = 0;
            else
                sitCount++;
                
            // console.log(sitCount, sittingHeight, pose.keypoints[0].position.y)
        }
    }
    if(sitCount % 360 == 0 && sitCount !== 0)
        generateSitWarning();
    setTimeout( sitted, 1000 );//10~30프레임 0.06초마다 얼굴을 감지한다.
}

async function screenDistance() {
    if (isDistanceWarningOn) {
        if (faceLength !== 0) {
        const pose = await net.estimateSinglePose(videoEl, {
            flipHorizontal: true,
        });
        if (
            pose &&
            (faceLength * 8) / 6 <
            pose.keypoints[2].position.x - pose.keypoints[1].position.x
        ) {
            generateDistanceWarning();
        }
        }
    }
    setTimeout(screenDistance, 10 * 1000); //10초에 한번 얼굴 감지
}

loadCamera();
