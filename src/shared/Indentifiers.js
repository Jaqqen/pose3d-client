import snowMagic from 'static/assets/pixi.js/audio/arthur-vyncke-snow-and-magic.mp3';
import divisionBlade from 'static/assets/pixi.js/audio/schematist-division-blade.mp3';

export const appMode = {
    _START_PAGE_: '_START_PAGE_MODE_',
    CONTROLLER: '_CONTROLLER_MODE_',
    WEBCAM: '_WEBCAM_MODE_',
    KB_AND_MOUSE: '_KB_AND_MOUSE_',
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

export const client = {
    icon: {
        close: require('static/img/ui/close.png').default,
        controller: require('static/img/ui/controller.png').default,
        controllerDisconnected: require('static/img/ui/controller_disconnected.png').default,
        keyboardAndMouse: require('static/img/ui/keyboard_and_mouse.png').default,
        pause: require('static/img/ui/pause.png').default,
        play: require('static/img/ui/play.png').default,
        webcam: require('static/img/ui/webcam.png').default,
        return: require('static/img/ui/return.png').default,
        power: require('static/img/ui/power.png').default,
        dollar: require('static/img/ui/dollar.png').default,
        menu: require('static/img/ui/menu.png').default,
    },
}

export const asset = {
    audio: {
        bgm: {
            menu: snowMagic,
            levelScene: divisionBlade,
        },
    },
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
        left: {
            default: require('static/assets/pixi.js/img/bodyparts/leftHand.png').default,
            crack_1: require('static/assets/pixi.js/img/bodyparts/leftHand_crack_1.png').default,
            crack_2: require('static/assets/pixi.js/img/bodyparts/leftHand_crack_2.png').default,
            crack_3: require('static/assets/pixi.js/img/bodyparts/leftHand_crack_3.png').default,
            crack_4: require('static/assets/pixi.js/img/bodyparts/leftHand_crack_4.png').default,
        },
        right: {
            default: require('static/assets/pixi.js/img/bodyparts/rightHand.png').default,
            crack_1: require('static/assets/pixi.js/img/bodyparts/rightHand_crack_1.png').default,
            crack_2: require('static/assets/pixi.js/img/bodyparts/rightHand_crack_2.png').default,
            crack_3: require('static/assets/pixi.js/img/bodyparts/rightHand_crack_3.png').default,
            crack_4: require('static/assets/pixi.js/img/bodyparts/rightHand_crack_4.png').default,
        },
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
    leftHand: {
        default: 'leftHandRsrc',
        crack_1: 'leftHandCrack_1Rsrc',
        crack_2: 'leftHandCrack_2Rsrc',
        crack_3: 'leftHandCrack_3Rsrc',
        crack_4: 'leftHandCrack_4Rsrc',
    },
    rightHand: {
        default: 'rightHandRsrc',
        crack_1: 'rightHandCrack_1Rsrc',
        crack_2: 'rightHandCrack_2Rsrc',
        crack_3: 'rightHandCrack_3Rsrc',
        crack_4: 'rightHandCrack_4Rsrc',
    },
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
    ui: {
        pause: 'pauseRsrc',
        play: 'playRsrc',
        power: 'powerRsrc',
        return: 'returnRsrc',
        dollar: 'dollarRsrc',
        menu: 'menuRsrc',
        close: 'closeRsrc',
    },
};

export const goLabels = {
    interactive: {
        go: '_interactiveGoKey_',
        tick: '_interactiveTickKey_',
        collDis: '_interactiveCollisionDisabledKey_',
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
    menu: {
        ui: {
            element: {
                button: 'button',
                func: 'func',
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
    fontWeight: 'bold',
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
export const viewsMain = views.levels;

export const menuViews = {
    menu: 'menuView',
    levelHPrev: 'levelHardPreview',
    levelNPrev: 'levelNormalPreview',
    levelXPrev: 'levelExtremePreview',
    levels: 'levelsView',
    tutHands: 'tutHandsView',
    tutSpeech: 'tutSpeechView',
    tutorials: 'tutorialsView',
};

export const levelSceneViews = {
    levelH: 'levelHardView',
    levelN: 'levelNormalView',
    levelX: 'levelExtremeView',
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
    menu: {
        decreaseBlurInMenuContainerTick: 'menuDecreaseBlurInMenuContainerTickKey',
        decreaseBlurTick: 'menuDecreaseBlurTickKey',
        openingMenuTick: 'openingMenuTickKey',
        closingMenuTick: 'closingMenuTickKey',
        uiMenuViewTick: 'uiMenuViewTickKey',
        uiMenuPullerTick: 'uiMenuPullerTickKey',
        uiMenuShowTextTick: 'uiMenuShowTextTickKey'
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

export const localStorageKeys = {
    audioVolume: 'musicVolume',
    handsSpeed: 'handsSpeed',
    handsDriftTreshold: 'handsDriftTreshold',
    isAudioPlaying: 'isMusicPlaying',
    kbAndMouse: {
        kbHandSpeed: 'kbHandSpeed',
    },
    videoOpacity: 'videoOpacity',
};