export const appMode = {
    _START_PAGE_: '_START_PAGE_MODE_',
    CONTROLLER: '_CONTROLLER_MODE_',
    WEBCAM: '_WEBCAM_MODE_',
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

export const client_ui = {
    icon: {
        close: require('static/img/ui/close.png').default,
        controller: require('static/img/ui/controller.png').default,
        controllerDisconnected: require('static/img/ui/controller_disconnected.png').default,
        pause: require('static/img/ui/pause.png').default,
        play: require('static/img/ui/play.png').default,
    },
}

export const asset = {
    character: {
        dummy: require('static/assets/pixi.js/img/character_dummy.png').default,
    },
    env: {
        ground: {
            dots: require('static/assets/pixi.js/img/envs/ground_dots.png').default,
            noDots: require('static/assets/pixi.js/img/envs/ground_no_dots.png').default,
            flying: require('static/assets/pixi.js/img/envs/ground_dots_flying.png').default,
        },
        cloud: {
            one: require('static/assets/pixi.js/img/envs/cloudOne.png').default,
            two: require('static/assets/pixi.js/img/envs/cloudTwo.png').default,
        },
    },
    hand: {
        left: require('static/assets/pixi.js/img/bodyparts/leftHand.png').default,
        right: require('static/assets/pixi.js/img/bodyparts/rightHand.png').default,
    },
    projectile: {
        icicle: require('static/assets/pixi.js/img/projectiles/icicle.png').default,
        meteor: require('static/assets/pixi.js/img/projectiles/meteor.png').default,
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
                meteor: {
                    tickKeyPrefix: '_meteorTickKeyPrefix_',
                },
                icicle: {
                    tickKeyPrefix: '_icicleTickKeyPrefix_',
                },
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