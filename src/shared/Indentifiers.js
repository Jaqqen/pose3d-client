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
    character: {
        dummy: require('static/assets/pixi.js/img/character_dummy.png'),
    },
    env: {
        groundDots: require('static/assets/pixi.js/img/envs/ground_dots.png'),
        groundDotsNone: require('static/assets/pixi.js/img/envs/ground_no_dots.png'),
        groundDotsFlying: require('static/assets/pixi.js/img/envs/ground_dots_flying.png'),
    },
    hand: {
        left: require('static/assets/pixi.js/img/bodyparts/leftHand.png'),
        right: require('static/assets/pixi.js/img/bodyparts/rightHand.png'),
    },
    projectile: {
        icicle: require('static/assets/pixi.js/img/projectiles/icicle.png'),
        meteor: require('static/assets/pixi.js/img/projectiles/meteor.png'),
    },
};
