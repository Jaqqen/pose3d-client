import snowMagic from 'static/assets/pixi.js/audio/arthur-vyncke-snow-and-magic.mp3';
import divisionBlade from 'static/assets/pixi.js/audio/schematist-division-blade.mp3';
import characterDeath from 'static/assets/pixi.js/audio/414209__jacksonacademyashmore__death.wav';
import menu_selection from 'static/assets/pixi.js/audio/171697__nenadsimic__menu-selection-click.wav';
import levelComplete from 'static/assets/pixi.js/audio/487436__elijahdanie__game-win.mp3';

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
        close: require('static/img/ui/close.png'),
        controller: require('static/img/ui/controller.png'),
        controllerDisconnected: require('static/img/ui/controller_disconnected.png'),
        keyboardAndMouse: require('static/img/ui/keyboard_and_mouse.png'),
        pause: require('static/img/ui/pause.png'),
        play: require('static/img/ui/play.png'),
        webcam: require('static/img/ui/webcam.png'),
        return: require('static/img/ui/return.png'),
        power: require('static/img/ui/power.png'),
        dollar: require('static/img/ui/dollar.png'),
        menu: require('static/img/ui/menu.png'),
        retry: require('static/img/ui/reload.png'),
    },
}

export const asset = {
    audio: {
        bgm: {
            menu: snowMagic,
            menuSelection: menu_selection,
            levelScene: divisionBlade,
            levelCompleted: levelComplete,
        },
        character: {
            death: characterDeath,
        },
    },
    character: {
        dummy: require('static/assets/pixi.js/img/character_dummy.png'),
        slime: {
            spriteSheet: require('static/assets/pixi.js/img/slime_spritesheet.png'),
        }
    },
    env: {
        ground: {
            dots: require('static/assets/pixi.js/img/envs/ground_dots.png'),
            noDots: require('static/assets/pixi.js/img/envs/ground_no_dots.png'),
            flying: require('static/assets/pixi.js/img/envs/ground_dots_flying.png'),
            underground: {
                top: require('static/assets/pixi.js/img/envs/underground_top.png'),
                bottom: require('static/assets/pixi.js/img/envs/underground_bottom.png'),
            }
        },
        cloud: {
            one: require('static/assets/pixi.js/img/envs/cloudOne.png'),
            two: require('static/assets/pixi.js/img/envs/cloudTwo.png'),
        },
        bush: {
            spiky: require('static/assets/pixi.js/img/envs/bushSpiky.png'),
        },
        bridge: require('static/assets/pixi.js/img/envs/bridge.png'),
    },
    life: {
        emerald: require('static/assets/pixi.js/img/life/emerald.png'),
    },
    hand: {
        left: {
            default: require('static/assets/pixi.js/img/bodyparts/leftHand.png'),
            crack_1: require('static/assets/pixi.js/img/bodyparts/leftHand_crack_1.png'),
            crack_2: require('static/assets/pixi.js/img/bodyparts/leftHand_crack_2.png'),
            crack_3: require('static/assets/pixi.js/img/bodyparts/leftHand_crack_3.png'),
            crack_4: require('static/assets/pixi.js/img/bodyparts/leftHand_crack_4.png'),
        },
        right: {
            default: require('static/assets/pixi.js/img/bodyparts/rightHand.png'),
            crack_1: require('static/assets/pixi.js/img/bodyparts/rightHand_crack_1.png'),
            crack_2: require('static/assets/pixi.js/img/bodyparts/rightHand_crack_2.png'),
            crack_3: require('static/assets/pixi.js/img/bodyparts/rightHand_crack_3.png'),
            crack_4: require('static/assets/pixi.js/img/bodyparts/rightHand_crack_4.png'),
        },
    },
    projectile: {
        icicle: require('static/assets/pixi.js/img/projectiles/icicle.png'),
        meteor: require('static/assets/pixi.js/img/projectiles/meteor.png'),
    },
    animation: {
        trigger: require('static/assets/pixi.js/img/trigger.png'),
    },
};

export const assetRsrc = {
    character: {
        dummy: 'dummyCharacterRsrc',
        slime_spritesheet: 'slime_spritesheetRsrc',
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
            underground: {
                top: 'groundUndergroundTopRsrc',
                bottom: 'groundUndergroundBottomRsrc',
            }
        },
        cloud: {
            one: 'cloudOneRsrc',
            two: 'cloudTwoRsrc',
        },
        bush: {
            spiky: 'bushSpikyRsrc',
        },
        bridge: 'bridgeRsrc',
    },
    life: {
        emerald: 'lifeEmeraldRsrc',
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
        retry: 'retryRsrc',
    },
    animation: {
        trigger: 'animationTriggerRsrc',
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
        env: {
            bush: {
                spiky: {
                    tickKeyPrefix: '_bushTickKeyPrefix_',
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
    resetView: 'resetViewView',
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
    levelTwoScene: {
        mainTick: 'levelTwoSceneMainTickKey',
        menuCollTick: 'levelTwoSceneMenuCollTickKey',
    },
    levelThreePreview: {
        mainTick: 'levelThreePreviewMainTickKey',
    },
    levelThreeScene: {
        mainTick: 'levelThreeSceneMainTickKey',
        menuCollTick: 'levelThreeSceneMenuCollTickKey',
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
    nextLevel: 'overlayNextLevelRef',
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

export const envInteractionKey = 'envInteractionKey_';