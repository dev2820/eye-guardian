const posenet = require('@tensorflow-models/posenet');

async function estimatePoseOnImage(imageElement) {
  // load the posenet model from a checkpoint
  const net = await posenet.load();

  const pose = await net.estimateSinglePose(imageElement, {
    flipHorizontal: false
  });
  return pose;
}

const imageElement = new HTMLImageElement()
imageElement.src = 'cat.jpg'
const pose = estimatePoseOnImage(imageElement);

console.log(pose);