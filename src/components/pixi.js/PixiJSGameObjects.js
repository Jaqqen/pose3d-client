import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import { assetRsrc, goLabels, listenerKeys, overlayerRefs, pJsTxtOptions } from "shared/Indentifiers";
import { getRandomArbitrary } from "shared/Utils";
import { Linear } from "gsap/gsap-core";
import { addPixiTick, addPixiTimeout, clearAllPixiTimeouts, clearPixiTimeoutWithKey, removePixiTick } from "./SharedTicks";

import gsap from "gsap/gsap-core";
import { defaultMenuButton, disabledMenuButton } from './PixiJSButton';
import { viewConstant } from './ViewConstants';
import { getPixiJsText } from './PixiJSText';
import { quitBtnFn } from "components/pixi.js/PixiJSMenu";
import { menuCollRes } from './PixiJSMenu';
import { changeAudio } from './PixiJSAudio';

const cloudInitDist = 272;
export const getCloudXDist = () => { return cloudInitDist + getRandomArbitrary(-55, 55); }

export const getCloudsForScene = (amountOfClouds, resources) => {
    let clouds = [];
    for (let i = 0; i < amountOfClouds; i++) {
        let assetType;
        if (i % 1.5 === 0) { assetType = assetRsrc.env.cloud.two; }
        else { assetType = assetRsrc.env.cloud.one; }
    
        clouds.push(new PIXI.Sprite(resources[assetType].texture));
    }
    return clouds;
};

export const getGroundsByTypeForScene = (amount, resources, groundType) => {
    let grounds = [];
    for (let i = 0; i < amount; i++) {
        grounds.push(new PIXI.Sprite(resources[groundType].texture));
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

export const onScreenStartingX = 220;
export const runCharacterEntryAnimation = (
    app, characterDummy, animations, showMenuAndLifebars, addMainTickToPixiTick, interactivesInitiation,
    menuCollTick, levelView
) => {
    const characterInit = {x: -70};
    const characterIntroTick = () => {characterDummy.position.x = characterInit.x};

    gsap.to(characterInit, {
        x: onScreenStartingX,
        duration: 3,
        ease: Linear.easeIn,
        onStart: () => { changeAudio(levelView) },
        onComplete: () => {
            interactivesInitiation();
            for (let key of Object.keys(animations)) {
                addPixiTick(app, key, animations[key]);
            }
            removePixiTick(app, listenerKeys.char.entry.own);
            showMenuAndLifebars();
            addMainTickToPixiTick();
            menuCollTick();
        },
    });
    addPixiTick(app, listenerKeys.char.entry.own, characterIntroTick);
};

export const runCharacterFinishAnimation = (
    app, character, onStartAnimations, onCompleteAnimations, cleanUpFn, initiateFinishOverlay
) => {
    const characterInScreenPos = {x: onScreenStartingX};
    const characterFinishingTick = () => {character.x = characterInScreenPos.x}
    gsap.to(characterInScreenPos, {
        x: app.view.width - 300,
        duration: 3,
        ease: Linear.easeInOut,
        onStart: () => {
            clearAllPixiTimeouts();
            for (let key of Object.keys(onStartAnimations)) {
                removePixiTick(app, key);
            }
        },
        onComplete: () => {
            for (let key of Object.keys(onCompleteAnimations)) {
                removePixiTick(app, key);
            }

            console.log('finished level one');
            removePixiTick(app, listenerKeys.char.finish.own);
            cleanUpFn();

            initiateFinishOverlay();
        },
    });
    addPixiTick(app, listenerKeys.char.finish.own, characterFinishingTick);
};

export const runFlagEntryAnimation = (app, appContainer, flagContainer, groundHeight, offset=0) => {
    flagContainer.zIndex = -10;
    flagContainer.x = app.view.width - 300;
    flagContainer.y = groundHeight - offset;
    appContainer.addChild(flagContainer);

    const flagContainerInit = {y: groundHeight - offset};
    const flagEntryTick = () => {flagContainer.y = flagContainerInit.y};
    gsap.to(flagContainerInit, {
        y: groundHeight - flagContainer.getBounds().width,
        duration: 2,
        ease: Linear.easeIn,
        onComplete: () => {
            console.log('flag here');
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

export const reduceLifeByOne = (lifebarsContainer, character) => {
    const lifeBarsFirstChild = lifebarsContainer.children.find(e => e)
    if (lifeBarsFirstChild !== undefined) {
        lifeBarsFirstChild.destroy(true);

        character.tint = '0xa20a0a';
        const cooldownId = ID.levels.charOnCooldown;
        character.id = cooldownId;
    
        const removeCharId_id = setTimeout(() => {
            character.id = null;
            character.tint = '0xffffff';
            clearPixiTimeoutWithKey(cooldownId);
        }, 3000);
        addPixiTimeout(cooldownId, removeCharId_id);
    }
};

const getGameOverlayByStatus = (app, gameStatus) => {
    const gameOverlayContainer = new PIXI.Container();
    gameOverlayContainer.sortableChildren = true;
    gameOverlayContainer.zIndex = 49;

    const gameOverlayHeight = app.view.height;
    const gameOverlayWidth = app.view.width;

    const dimming = new PIXI.Graphics();
    dimming.beginFill(0x444444);
    dimming.drawRect(0, 0, gameOverlayWidth, gameOverlayHeight);
    dimming.endFill();
    dimming.alpha = 0.6;
    dimming.zIndex = 50;
    gameOverlayContainer.addChild(dimming);

    let overlayLabelColor;
    let overlayLabelName;
    switch (gameStatus) {
        case ID.levels.status.gameOver:
            overlayLabelColor = '#a20a0a';
            overlayLabelName = 'Game Over';
            break;
        case ID.levels.status.win:
            overlayLabelColor = '#a8dda8';
            overlayLabelName = 'WIN';
            break;
        default:
            overlayLabelColor = '#FFFFFF';
            overlayLabelName = '-= OUT OF GAME =-';
            break;
    }

    const overlayLabel = getPixiJsText(overlayLabelName,
        {
            [pJsTxtOptions.fill]: overlayLabelColor,
        }
    );
    overlayLabel.anchor.set(0.5);
    overlayLabel.x = app.view.width/2;
    overlayLabel.y = app.view.height * (2/5);
    overlayLabel.zIndex = 52;
    gameOverlayContainer.addChild(overlayLabel);

    const buttonConstraints = {
        y: (app.view.height * (2.5/5)),
        dim: { w: viewConstant.overlayBtnDim.w, h: viewConstant.overlayBtnDim.h, },
        textScale: 0.7,
    };

    const retryBtn = disabledMenuButton(
        'Retry',
        'overlayRetryBtnId',
        70,
        buttonConstraints.y,
        buttonConstraints.dim
    );
    retryBtn.children.find(e => e.text === 'Retry').scale.set(buttonConstraints.textScale);
    retryBtn.zIndex = 52;
    gameOverlayContainer.addChild(retryBtn);

    const mainMenuBtn = defaultMenuButton(
        'Main Menu',
        'overlayMainMenuBtnId',
        retryBtn.getBounds().x + retryBtn.getBounds().width + 150,
        buttonConstraints.y,
        buttonConstraints.dim
    );
    mainMenuBtn.children.find(e => e.text === 'Main Menu').scale.set(buttonConstraints.textScale - 0.1);
    mainMenuBtn.zIndex = 52;
    gameOverlayContainer.addChild(mainMenuBtn);

    const quitBtn = defaultMenuButton(
        'Quit',
        'overlayQuitBtnId',
        mainMenuBtn.getBounds().x + mainMenuBtn.getBounds().width + 150,
        buttonConstraints.y,
        buttonConstraints.dim
    );
    quitBtn.children.find(e => e.text === 'Quit').scale.set(buttonConstraints.textScale);
    quitBtn.zIndex = 52;
    gameOverlayContainer.addChild(quitBtn);

    return {
        [overlayerRefs.container]: gameOverlayContainer,
        [overlayerRefs.retry]: retryBtn,
        [overlayerRefs.mainMenu]: mainMenuBtn,
        [overlayerRefs.quit]: quitBtn,
    };
}

export const lifeHandlerTick = (
    app, interactiveTickObjs, worldTickObjs, mainTickObj, hands, _retryFn, _exitFn,
    menuTickObj, lifeBarsContainer
) => {
    if (lifeBarsContainer.children <= 0) {
        clearAllPixiTimeouts();
        app.stage.children.find(elem => elem.name = ID.appContainerName).removeChild(lifeBarsContainer);

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
            // [overlayerRefs.retry]: retryBtn,
            [overlayerRefs.mainMenu]: mainMenuBtn,
            [overlayerRefs.quit]: quitBtn
        } = getGameOverlayByStatus(app, ID.levels.status.gameOver);
        app.stage.addChild(container);

        // const retryFn = () => {
        //     removePixiTick(app, listenerKeys.game.overlay.own);
        //     app.stage.removeChild(container);
        //     _retryFn();
        // };

        const exitFn = () => {
            removePixiTick(app, listenerKeys.game.overlay.own);
            app.stage.removeChild(container);
            _exitFn();
        };


        const overlayGOs = [
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
        // [overlayerRefs.retry]: retryBtn,
        [overlayerRefs.mainMenu]: mainMenuBtn,
        [overlayerRefs.quit]: quitBtn
    } = getGameOverlayByStatus(app, ID.levels.status.win);
    app.stage.addChild(container);

    // const retryFn = () => {
    //     removePixiTick(app, listenerKeys.game.overlay.own);
    //     app.stage.removeChild(container);
    //     _retryFn();
    // };

    const exitFn = () => {
        removePixiTick(app, listenerKeys.game.overlay.own);
        app.stage.removeChild(container);
        _exitFn();
    };

    const overlayGOs = [
        [exitFn, mainMenuBtn],
        [quitBtnFn, quitBtn]
    ]

    const overlayTick = () => menuCollRes(app, overlayGOs, hands);
    addPixiTick(app, listenerKeys.game.overlay.own, overlayTick);
};