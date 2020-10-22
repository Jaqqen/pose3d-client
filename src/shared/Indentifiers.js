export const media = {
    image: 'IMAGE',
    video: 'VIDEO',
};

export const interaction = {
    arm: 'ARM',
};

export const body = {
    nose: 'nose',
    left: {
        ankle: 'rightAnkle',
        ear: 'leftEar',
        elbow: 'leftElbow',
        eye: 'leftEye',
        hip: 'leftHip',
        knee: 'leftKnee',
        shoulder: 'leftShoulder',
        wrist: 'leftWrist',
    },
    right: {
        ankle: 'leftAnkle',
        ear: 'rightEar',
        elbow: 'rightElbow',
        eye: 'rightEye',
        hip: 'rightHip',
        knee: 'rightKnee',
        shoulder: 'rightShoulder',
        wrist: 'rightWrist',
    },
};

export const asset = {
    hand: {
        left: require('static/assets/pixi.js/img/bodyparts/leftHand.png'),
        right: require('static/assets/pixi.js/img/bodyparts/rightHand.png'),
    },
    icicle: require('static/assets/pixi.js/img/bodyparts/icicle.png'),
    meteor: require('static/assets/pixi.js/img/bodyparts/meteor.png'),
};