import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import { assetRsrc, goLabels, listenerKeys, overlayerRefs, pJsTxtOptions } from "shared/Indentifiers";
import { getRandomArbitrary } from "shared/Utils";
import { Linear } from "gsap/gsap-core";
import { 
    addPixiTick, addPixiTimeout, clearAllPixiTimeouts, clearPixiTimeoutWithKey, removePixiTick
} from "./SharedTicks";

import gsap from "gsap/gsap-core";
import { uiMenuOverworldButton } from './PixiJSButton';
import { viewConstant } from './ViewConstants';
import { getPixiJsText } from './PixiJSText';
import { quitBtnFn } from "components/pixi.js/PixiJSMenu";
import { menuCollRes } from './PixiJSMenu';
import { changeAudio } from './PixiJSAudio';
import { appViewDimension } from './PixiJSMain';

const cloudInitDist = 272;
export const getCloudXDist = () => { return cloudInitDist + getRandomArbitrary(-55, 55); }

export const getCloudsForScene = (amountOfClouds) => {
    let clouds = [];
    for (let i = 0; i < amountOfClouds; i++) {
        let assetType;
        if (i % 1.5 === 0) { assetType = assetRsrc.env.cloud.two; }
        else { assetType = assetRsrc.env.cloud.one; }
        const _cloud = new PIXI.Sprite(PIXI.utils.TextureCache[assetType])
        _cloud.scale.set(getRandomArbitrary(0.7, 1.1))
        if (_cloud.scale.x < 1) {
            _cloud.alpha = _cloud.scale.x * 0.9;
        }
        clouds.push(_cloud);
    }
    return clouds;
};

export const getGroundsByTypeForScene = (amount, groundType) => {
    let grounds = [];
    for (let i = 0; i < amount; i++) {
        grounds.push(new PIXI.Sprite(PIXI.utils.TextureCache[groundType]));
    }
    return grounds;
};

export const defaultWorldAnimation = (tickSpeed, worldObjects) => {
    return () => {
        worldObjects.forEach(worldObject => {
            if (Array.isArray(worldObject)) {
                worldObject.forEach(object => {
                    object.x -= tickSpeed;
                });
            } else {
                worldObject.x -= tickSpeed;
            }
        })
    };
};

const _height = 50;
const _width = Math.floor((_height/2) * Math.sqrt(3));
const flagLineStyle = {
    width: 4,
    color: 0xf9fcfb,
    alpha: 1
};
export const getFinishingFlag = () => {
    const flag = new PIXI.Container();

    const finishingFlag = new PIXI.Graphics();
    finishingFlag.beginFill(0xeF0000, 1);
    finishingFlag.lineStyle(flagLineStyle.width, flagLineStyle.color, flagLineStyle.alpha);
    finishingFlag.moveTo(0, 0);
    finishingFlag.lineTo(_width, _height/2);
    finishingFlag.lineTo(0, _height);
    finishingFlag.lineTo(0, 0)
    finishingFlag.lineTo(_width, _height/2);
    finishingFlag.endFill()
    flag.addChild(finishingFlag)

    const flagBar = new PIXI.Graphics();
    flagBar.lineStyle(flagLineStyle.width, flagLineStyle.color, flagLineStyle.alpha);
    flagBar.moveTo(0, _height);
    flagBar.lineTo(0, _height * 2.1);
    flag.addChild(flagBar);

    return flag;
};

export const onScreenStartingX = 450;
export const runPlayerEntryAnimation = (
    app, player, animations, showMenuAndLifebars, addMainTickToPixiTick, levelView,
    onStartAnim, onCompleteAnim
) => {
    const characterInit = {x: -70};
    const characterIntroTick = () => {player.character.x = characterInit.x};

    gsap.to(characterInit, {
        x: onScreenStartingX,
        duration: 3,
        ease: Linear.easeIn,
        onStart: () => {
            changeAudio(levelView);

            if (
                onStartAnim &&
                player.character && player.character.children &&
                player.character.getChildByName('animSpriteCharName')
            ) {
                player.playAnimation(onStartAnim.state, onStartAnim.animation);
            }
        },
        onComplete: () => {
            for (let key of Object.keys(animations)) {
                addPixiTick(app, key, animations[key]);
            }
            removePixiTick(app, listenerKeys.char.entry.own);
            showMenuAndLifebars();
            addMainTickToPixiTick();

            if (
                onCompleteAnim &&
                player.character && player.character.children &&
                player.getChildByName('animSpriteCharName')
            ) {
                player.playAnimation(onCompleteAnim.state, onCompleteAnim.animation);
            }
        },
    });
    addPixiTick(app, listenerKeys.char.entry.own, characterIntroTick);
};

const flagPosition = () => { return appViewDimension.width - 300 };
export const runPlayerFinishAnimation = (
    app, player, onStartAnimations, onCompleteAnimations, cleanUpFn, initiateFinishOverlay,
    onStartAnim, onCompleteAnim
) => {
    const characterInScreenPos = {x: onScreenStartingX};
    const characterFinishingTick = () => {player.character.x = characterInScreenPos.x}
    gsap.to(characterInScreenPos, {
        x: flagPosition(),
        duration: 3,
        ease: Linear.easeInOut,
        onStart: () => {
            clearAllPixiTimeouts();
            for (let key of Object.keys(onStartAnimations)) {
                removePixiTick(app, key);
            }

            if (
                onStartAnim &&
                player.character && player.character.children &&
                player.character.getChildByName('animSpriteCharName')
            ) {
                player.playAnimation(onStartAnim.state, onStartAnim.animation);
            }
        },
        onComplete: () => {
            for (let key of Object.keys(onCompleteAnimations)) {
                removePixiTick(app, key);
            }

            removePixiTick(app, listenerKeys.char.finish.own);
            cleanUpFn();

            if (
                onCompleteAnim &&
                player.character && player.character.children &&
                player.character.getChildByName('animSpriteCharName')
            ) {
                player.playAnimation(onCompleteAnim.state, onCompleteAnim.animation);
            }

            initiateFinishOverlay();
        },
    });
    addPixiTick(app, listenerKeys.char.finish.own, characterFinishingTick);
};

export const runFlagEntryAnimation = (app, appContainer, flagContainer, groundHeight) => {
    flagContainer.zIndex = -10;
    flagContainer.x = flagPosition();
    flagContainer.y = groundHeight + flagContainer.getBounds().height;
    appContainer.addChild(flagContainer);

    const flagContainerInit = {y: flagContainer.y};
    const flagEntryTick = () => {flagContainer.y = flagContainerInit.y};
    gsap.to(flagContainerInit, {
        y: groundHeight - 25,
        duration: 2,
        ease: Linear.easeIn,
        onComplete: () => {
            removePixiTick(app, listenerKeys.game.object.flag.own);
        },
    });
    addPixiTick(app, listenerKeys.game.object.flag.own, flagEntryTick);
};

export const removeCloudFromStageBeforeLevelStart = (app) => {
    const bgCloudsContainer = app.stage.children.filter(
        (child) => child.id === ID.cloudsContainerBg
    )[0];

    app.stage.removeChild(bgCloudsContainer);
}

export const getLifeBars = (id=null, x=null, y =null) => {
    const lifeBarsContainer = new PIXI.Container();

    for (let i = 0; i < 3; i++) {
        const lifeBar = new PIXI.Graphics();
        lifeBar.lineStyle(3, 0xFFFFFF, 1);
        lifeBar.beginFill(0x799351);
        lifeBar.drawRoundedRect(0, 0, 25, 80, 4);
        lifeBar.endFill();
        lifeBar.x = Math.floor(i * 30);

        lifeBarsContainer.addChild(lifeBar);
    }

    if (id !== null) lifeBarsContainer.id = id;
    if (x !== null) lifeBarsContainer.x = x;
    if (y !== null) lifeBarsContainer.y = y;

    return lifeBarsContainer;
};

export const reduceLifeByOne = (lifebarsContainer, player) => {
    const lifeBarsFirstChild = lifebarsContainer.children.find(e => e)
    if (lifeBarsFirstChild !== undefined) {
        lifeBarsFirstChild.destroy(true);

        const cooldownId = ID.levels.charOnCooldown;
        if (player.character.getChildByName('animSpriteCharName')) {
            player.setDamageState(false);
        } else {
            player.tint = '0xa20a0a';
            player.id = cooldownId;
        }

        const removeCharId_id = setTimeout(() => {
            if (player.character.getChildByName('animSpriteCharName')) {
                player.setDamageState(true);
            } else {
                player.id = null;
                player.tint = '0xffffff';
            }
            clearPixiTimeoutWithKey(cooldownId);
        }, 3000);
        addPixiTimeout(cooldownId, removeCharId_id);
    }
};

const getGameOverlayByStatus = (gameStatus) => {
    const gameOverlayContainer = new PIXI.Container();
    gameOverlayContainer.sortableChildren = true;
    gameOverlayContainer.zIndex = 49;

    const gameOverlayHeight = appViewDimension.height;
    const gameOverlayWidth = appViewDimension.width;

    const dimming = new PIXI.Graphics();
    dimming.beginFill(0x444444);
    dimming.drawRect(0, 0, gameOverlayWidth, gameOverlayHeight);
    dimming.endFill();
    dimming.alpha = 0.6;
    dimming.zIndex = 50;
    gameOverlayContainer.addChild(dimming);

    let overlayLabelColor;
    let overlayLabelName;
    let btnStatusColor; 
    switch (gameStatus) {
        case ID.levels.status.gameOver:
            overlayLabelColor = 0xec0101;
            overlayLabelName = 'Game Over';
            btnStatusColor = 0x799351;
            break;
        case ID.levels.status.win:
            overlayLabelColor = '#a8dda8';
            overlayLabelName = 'WIN';
            btnStatusColor = 0xbedbbb;
            break;
        default:
            overlayLabelColor = '#FFFFFF';
            overlayLabelName = '-= OUT OF GAME =-';
            break;
    }

    const overlayLabel = getPixiJsText(overlayLabelName,
        {
            [pJsTxtOptions.fill]: overlayLabelColor,
            [pJsTxtOptions.customFontSize]: 74,
        }
    );
    overlayLabel.anchor.set(0.5);
    overlayLabel.x = appViewDimension.width/2;
    overlayLabel.y = appViewDimension.height * (1.2/5);
    overlayLabel.zIndex = 52;
    gameOverlayContainer.addChild(overlayLabel);

    const buttonConstraints = {
        y: (appViewDimension.height * (2.5/5)),
        dim: { w: viewConstant.overlayBtnDim.w, h: viewConstant.overlayBtnDim.h, },
        textScale: 0.7,
    };

    const getColumnX = (orderNumber) => {
        let columnIndex = 1;
        (orderNumber === 2) && (columnIndex = 3);
        (orderNumber === 3) && (columnIndex = 5);

        return appViewDimension.width * (columnIndex/6);
    };

    const uiRetryBtn = uiMenuOverworldButton(
        'overlayRetryBtnId', 'Retry',
        getColumnX(1), buttonConstraints.y,
        btnStatusColor
    );
    uiRetryBtn.scale.set(0.8);
    uiRetryBtn.zIndex = 52;

    gameOverlayContainer.addChild(uiRetryBtn);

    const uiMainMenuBtn = uiMenuOverworldButton(
        'overlayMainMenuBtnId', 'Main Menu',
        getColumnX(2), buttonConstraints.y,
        btnStatusColor
    );
    uiMainMenuBtn.scale.set(0.8);
    uiMainMenuBtn.zIndex = 52;

    gameOverlayContainer.addChild(uiMainMenuBtn);

    const uiQuitBtn = uiMenuOverworldButton(
        'overlayQuitBtnId', 'Quit',
        getColumnX(3), buttonConstraints.y,
        btnStatusColor
    );
    uiQuitBtn.scale.set(0.8);
    uiQuitBtn.zIndex = 52;

    gameOverlayContainer.addChild(uiQuitBtn);
    gameOverlayContainer.name = 'gameOverlayContainerName';

    return {
        [overlayerRefs.container]: gameOverlayContainer,
        [overlayerRefs.retry]: uiRetryBtn,
        [overlayerRefs.mainMenu]: uiMainMenuBtn,
        [overlayerRefs.quit]: uiQuitBtn,
    };
}

export const lifeHandlerTick = (
    app, interactiveTickObjs, worldTickObjs, mainTickObj, hands, _retryFn, _exitFn,
    menuTickObj, lifeBarsContainer
) => {
    if (lifeBarsContainer.children <= 0) {
        clearAllPixiTimeouts();
        app.stage
            .children
            .find(elem => elem.name = ID.appContainerName)
            .removeChild(lifeBarsContainer);

        interactiveTickObjs.forEach(tickObj => {
            const _key = tickObj[goLabels.interactive.tick];
            removePixiTick(app, _key);
        });
        for (let key of Object.keys(worldTickObjs)) {
            removePixiTick(app, key);
        }

        //* mainTickObj[0] is the KEY and mainTickObj[1] is the main tick FUNCTION
        removePixiTick(app, mainTickObj[0]);

        //* menuTickObj[0] is the KEY and menuTickObj[1] is the main tick FUNCTION
        removePixiTick(app, menuTickObj[0]);

        const {
            [overlayerRefs.container]: container,
            [overlayerRefs.retry]: retryBtn,
            [overlayerRefs.mainMenu]: mainMenuBtn,
            [overlayerRefs.quit]: quitBtn
        } = getGameOverlayByStatus(ID.levels.status.gameOver);
        app.stage.addChild(container);

        const retryFn = () => {
            removePixiTick(app, listenerKeys.game.overlay.own);
            app.stage.removeChild(container);
            _retryFn();
        };

        const exitFn = () => {
            removePixiTick(app, listenerKeys.game.overlay.own);
            app.stage.removeChild(container);
            _exitFn();
        };


        const overlayGOs = [
            [retryFn, retryBtn],
            [exitFn, mainMenuBtn],
            [quitBtnFn, quitBtn]
        ]

        const overlayTick = () => menuCollRes(app, overlayGOs, hands);
        addPixiTick(app, listenerKeys.game.overlay.own, overlayTick);
    }
};

export const onFinishLevel = (
    app, interactiveTickObjs, worldTickObjs, mainTickObj, hands, _retryFn, _exitFn,
    menuTickObj
) => {
    clearAllPixiTimeouts();

    interactiveTickObjs.forEach(tickObj => {
        const _key = tickObj[goLabels.interactive.tick];
        removePixiTick(app, _key);
    });
    for (let key of Object.keys(worldTickObjs)) {
        removePixiTick(app, key);
    }

    //* mainTickObj[0] is the KEY and mainTickObj[1] is the main tick FUNCTION
    removePixiTick(app, mainTickObj[0]);

    //* menuTickObj[0] is the KEY and menuTickObj[1] is the main tick FUNCTION
    removePixiTick(app, menuTickObj[0]);

    const {
        [overlayerRefs.container]: container,
        [overlayerRefs.retry]: retryBtn,
        [overlayerRefs.mainMenu]: mainMenuBtn,
        [overlayerRefs.quit]: quitBtn
    } = getGameOverlayByStatus(ID.levels.status.win);
    app.stage.addChild(container);

    const retryFn = () => {
        removePixiTick(app, listenerKeys.game.overlay.own);
        app.stage.removeChild(container);
        _retryFn();
    };

    const exitFn = () => {
        removePixiTick(app, listenerKeys.game.overlay.own);
        app.stage.removeChild(container);
        _exitFn();
    };

    const overlayGOs = [
        [retryFn, retryBtn],
        [exitFn, mainMenuBtn],
        [quitBtnFn, quitBtn]
    ]

    const overlayTick = () => menuCollRes(app, overlayGOs, hands);
    addPixiTick(app, listenerKeys.game.overlay.own, overlayTick);
};