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
        ground: {
            dots: require('static/assets/pixi.js/img/envs/ground_dots.png'),
            noDots: require('static/assets/pixi.js/img/envs/ground_no_dots.png'),
            flying: require('static/assets/pixi.js/img/envs/ground_dots_flying.png'),
        },
        cloud: {
            one: require('static/assets/pixi.js/img/envs/cloudOne.png'),
            two: require('static/assets/pixi.js/img/envs/cloudTwo.png'),
        },
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

export const assetRsrc = {
    character: {
        dummy: 'dummyCharacterRsrc',
    },
    leftHand: 'leftHandRsrc',
    rightHand: 'rightHandRsrc',
    env: {
        ground: {
            dots: 'groundDotsRsrc',
            noDots: 'groundNoDotsRsrc',
            flying: 'groundDotsFlyingRsrc',
        },
        cloud: {
            one: 'cloudOneRsrc',
            two: 'cloudTwoRsrc',
        },
    },
    projectile: {
        icicle: 'icicleRsrc',
        meteor: 'meteorRsrc',
    },
};

export const goLabels = {
    interactive: {
        go: '_interactiveGoKey_',
        tick: '_interactiveTickKey_'
    },
    level: {
        one: {
            projectiles: {
                meteor: '_meteorGoKey_',
                tickKey: '_meteorTickKey_',
            },
        },
    },
};

export const pJsTxtOptions = {
    removeShadow: 'removeShadow',
    mediumSize: 'mediumSize',
    setFill: 'setFill',
    wordWrap: 'wordWrap',
    wordWrapWidth: 'wordWrapWidth',
    fill: 'fill',
    customFontSize: 'customFontSize',
};

export const views = {
    levelH: 'levelHardView',
    levelHPrev: 'levelHardPreview',
    levelN: 'levelNormalView',
    levelNPrev: 'levelNormalPreview',
    levelX: 'levelExtremeView',
    levelXPrev: 'levelExtremePreview',
    levels: 'levelsView',
    menu: 'menuView',
    tutHands: 'tutHandsView',
    tutSpeech: 'tutSpeechView',
    tutorials: 'tutorialsView',
};

export const smvRefs = {
    container: 'smvContainerRef',
    credits: 'smvCreditsRef',
    mainMenu: 'smvMainMenuRef',
    quit: 'smvQuitRef',
    returnBack: 'smvReturnBackRef',
};

export const listenerKeys = {
    menuView: {
        mainTick: 'menuViewMainTickKey',
        smvTick: 'menuViewSmvTickKey',
    },
    levelsView: {
        mainTick: 'levelsViewMainTickKey',
    },
    levelOnePreview: {
        mainTick: 'levelOnePreviewMainTickKey',
    },
    levelOneScene: {
        mainTick: 'levelOneSceneMainTickKey',
        menuCollTick: 'levelOneSceneMenuCollTickKey',
    },
    levelTwoPreview: {
        mainTick: 'levelTwoPreviewMainTickKey',
    },
    levelThreePreview: {
        mainTick: 'levelThreePreviewMainTickKey',
    },
    tutorialsView: {
        mainTick: 'tutorialsViewMainTickKey',
    },
    tutorialHandsPreview: {
        mainTick: 'tutorialHandsPreviewMainTickKey',
    },
    tutorialSpeechPreview: {
        mainTick: 'tutorialSpeechPreviewMainTickKey',
    },
    char: {
        entry: {
            worldAnim: 'charEntryWorldAnimationTickKey',
            infinite: {
                clouds: 'charEntryInfiniteCloudsTickKey',
                ground: 'charEntryInfiniteTickKey',
            },
            own: 'charEntryOwnTickKey', 
        },
        finish: {
            own: 'charFinishOwnTickKey',
        }
    },
    game: {
        object: {
            flag: {
                own: 'gameObjectFlagOwnTickKey',
            },
            meteors: {
                own: 'gameObjectMeteorsOwnTickKey',
            },
            icicles: {
                own: 'gameObjectIciclesOwnTickKey',
            }
        },
        interaction: {
            left: 'gameInteractionLeftTickKey',
            right: 'gameInteractionRightTickKey',
        },
        overlay: {
            own: 'gameOverlayTickKey',
        },
    },
};

export const preview = {
    level: {
        container: 'previewLevelContainer',
        returnBtn: 'previewLevelReturnBtn',
        startBtn:  'previewLevelStartBtn',
    },
};

export const overlayerRefs = {
    container: 'overlayContainerRef',
    retry: 'overlayRetryRef',
    mainMenu: 'overlayMainMenuRef',
    quit: 'overlayQuitRef',
}