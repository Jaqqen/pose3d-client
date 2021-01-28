import { cloudsContainerBg, menu, pixiJsCanvas, pixiJsContainer, poseWebcam } from 'shared/IdConstants';
import * as PIXI from 'pixi.js';
import { GUI } from 'dat.gui';

import React, { useEffect, useRef, useState } from 'react';

import { appMode, asset, assetRsrc, client, localStorageKeys, views } from 'shared/Indentifiers';
import { appContainerName } from "shared/IdConstants";
import { logInfo } from 'shared/P3dcLogger';
import { PixiJSMenu } from 'components/pixi.js/PixiJSMenu';
import { PixiJSLevels } from 'components/pixi.js/levels/PixiJSLevels';
import {
    clearAllPixiTimeouts, pixiTicks, removePixiTick, clearAllCachedPixiTicksFromScene, deleteAllSceneTweens
} from 'components/pixi.js/SharedTicks';
import { PixiJSTutorials } from 'components/pixi.js/tutorials/PixiJSTutorials';
import { PixiJSLevelOnePreview } from 'components/pixi.js/levels/previews/PixiJSLevelOnePreview';
import { PixiJSLevelTwoPreview } from 'components/pixi.js/levels/previews/PixiJSLevelTwoPreview';
import { PixiJSLevelThreePreview } from 'components/pixi.js/levels/previews/PixiJSLevelThreePreview';
import { PixiJSTutorialHands } from 'components/pixi.js/tutorials/previews/PixiJSTutorialHands';
import { PixiJSTutorialSpeech } from 'components/pixi.js/tutorials/previews/PixiJSTutorialSpeech';
import { 
    getRandomInt, getRandomArbitrary, setDatGuiControllerListener, 
    setDatGuiControllerValWithLocalStorage 
} from 'shared/Utils';
import { PixiJSLevelOne } from 'components/pixi.js/levels/scenes/PixiJSLevelOne';
import {
    getHandByRsrcName, getHands, leftHand, renderHands, renderHandsWithController, 
    renderHandsWithKeyboardAndMouse, resetHandsLifeCounter, rightHand, setLeftHand, setRightHand
} from './PixiJSHands';
import { audioInitVolume, changeAudio, my_audio } from './PixiJSAudio';
import { PixiJSLevelTwo } from './levels/scenes/PixiJSLevelTwo';
import { PixiJSLevelThree } from './levels/scenes/PixiJSLevelThree';

let app;
let appContainer;

let my_gui = null;

const getCleanAppContainer = () => {
    const _appContainer = new PIXI.Container();
    _appContainer.sortableChildren = true;
    _appContainer.name = appContainerName;

    return _appContainer;
};

const poseWebcamQry = '#' + poseWebcam;

export const appViewDimension = {
    height: null,
    width: null,
};

export const getCloudsForBackground = (app) => {
    const cloudsContainer = new PIXI.Container();
    cloudsContainer.x = 0;
    cloudsContainer.y = 0;

    for (let i = 0; i < 9; i++) {
        let assetType;
        if (i % 3 === 0) { assetType = assetRsrc.env.cloud.one; }
        else { assetType = assetRsrc.env.cloud.two; }

        const _cloud = new PIXI.Sprite(PIXI.utils.TextureCache[assetType]);
        _cloud.scale.set(getRandomArbitrary(0.8, 1.3))
        if (_cloud.scale.x < 1) {
            _cloud.alpha = _cloud.scale.x * 0.7;
        }

        _cloud.x = getRandomInt(appViewDimension.width - _cloud.width);
        _cloud.y = getRandomInt(appViewDimension.height - _cloud.height);
        cloudsContainer.addChild(_cloud);
    }
    cloudsContainer.id = cloudsContainerBg;
    cloudsContainer.zIndex = -20;

    return cloudsContainer;
};

export default function PixiJSMain(props) {
    const [areRsrcsLoaded, setAreRsrcsLoaded] = useState(false);
    const [areHandsStaged, setAreHandsStaged] = useState(false);
    const [viewState, setViewState] = useState(views.levels);
    const cachedViewKey = useRef(null);

    const setView = (viewKey) => {
        switch (viewKey) {
            case views.levelN:
                return(
                    <PixiJSLevelOne
                        app={app}
                        appContainer={appContainer}
                        hands={getHands(false)}
                        exitViewFn={changeViewOnLevelOrTutExit}
                    />
                );
            case views.levelNPrev:
                return(
                    <PixiJSLevelOnePreview
                        app={app}
                        appContainer={appContainer}
                        hands={getHands()}
                        changeViewFn={changeView}
                    />
                );
            case views.levelH:
                return(
                    <PixiJSLevelTwo
                        app={app}
                        appContainer={appContainer}
                        hands={getHands(false)}
                        exitViewFn={changeViewOnLevelOrTutExit}
                    />
                );
            case views.levelHPrev:
                return(
                    <PixiJSLevelTwoPreview
                        app={app}
                        appContainer={appContainer}
                        hands={getHands()}
                        changeViewFn={changeView}
                    />
                );
            case views.levelX:
                return(
                    <PixiJSLevelThree
                        app={app}
                        appContainer={appContainer}
                        hands={getHands(false)}
                        exitViewFn={changeViewOnLevelOrTutExit}
                    />
                );
            case views.levelXPrev:
                return(
                    <PixiJSLevelThreePreview
                        app={app}
                        appContainer={appContainer}
                        hands={getHands()}
                        changeViewFn={changeView}
                    />
                );
            case views.levels:
                return(
                    <PixiJSLevels
                        app={app}
                        appContainer={appContainer}
                        hands={getHands()}
                        changeViewFn={changeView}
                    />
                );
            case views.menu:
                return(
                    <PixiJSMenu
                        app={app}
                        appContainer={appContainer}
                        hands={getHands()}
                        changeViewFn={changeView}
                    />
                );
            case views.tutHands:
                return(
                    <PixiJSTutorialHands
                        app={app}
                        appContainer={appContainer}
                        hands={getHands()}
                        changeViewFn={changeView}
                    />
                );
            case views.tutSpeech:
                return(
                    <PixiJSTutorialSpeech
                        app={app}
                        appContainer={appContainer}
                        hands={getHands()}
                        changeViewFn={changeView}
                    />
                );
            case views.tutorials:
                return(
                    <PixiJSTutorials
                        app={app}
                        appContainer={appContainer}
                        hands={getHands()}
                        changeViewFn={changeView}
                    />
                );
            case views.resetView:{
                    setViewState(cachedViewKey.current);
                    cachedViewKey.current = null;
                    break;
                }
            default:
                break;
        };
    }

    useEffect(() => {
        if (!areRsrcsLoaded) {
            let stageProps = {
                antialias: true,
                backgroundColor: 0x1099bb,
                height: 853,
                transparent: false,
                width: 1144,
            };

            const initializeStage = () => {
                app = new PIXI.Application({...stageProps});
                app.view.id = pixiJsCanvas;
                if (
                    document.getElementById(pixiJsContainer) !== null &&
                    document.getElementById(pixiJsCanvas) !== null
                ) {
                    document.getElementById(pixiJsCanvas).remove();
                }
                appContainer = getCleanAppContainer();
                app.stage.addChild(appContainer);
                app.stage.sortableChildren = true;

                logInfo('Loading asset textures');

                app.loader
                    .add(assetRsrc.leftHand.default, asset.hand.left.default)
                    .add(assetRsrc.leftHand.crack_1, asset.hand.left.crack_1)
                    .add(assetRsrc.leftHand.crack_2, asset.hand.left.crack_2)
                    .add(assetRsrc.leftHand.crack_3, asset.hand.left.crack_3)
                    .add(assetRsrc.leftHand.crack_4, asset.hand.left.crack_4)
                    .add(assetRsrc.rightHand.default, asset.hand.right.default)
                    .add(assetRsrc.rightHand.crack_1, asset.hand.right.crack_1)
                    .add(assetRsrc.rightHand.crack_2, asset.hand.right.crack_2)
                    .add(assetRsrc.rightHand.crack_3, asset.hand.right.crack_3)
                    .add(assetRsrc.rightHand.crack_4, asset.hand.right.crack_4)
                    .add(assetRsrc.env.ground.dots, asset.env.ground.dots)
                    .add(assetRsrc.env.ground.underground.top, asset.env.ground.underground.top)
                    .add(assetRsrc.env.ground.underground.bottom, asset.env.ground.underground.bottom)
                    .add(assetRsrc.env.cloud.one, asset.env.cloud.one)
                    .add(assetRsrc.env.cloud.two, asset.env.cloud.two)
                    .add(assetRsrc.env.ground.noDots, asset.env.ground.noDots)
                    .add(assetRsrc.env.ground.flying, asset.env.ground.flying)
                    .add(assetRsrc.projectile.meteor, asset.projectile.meteor)
                    .add(assetRsrc.projectile.icicle, asset.projectile.icicle)
                    .add(assetRsrc.character.dummy, asset.character.dummy)
                    .add(assetRsrc.ui.pause, client.icon.pause)
                    .add(assetRsrc.ui.play, client.icon.play)
                    .add(assetRsrc.ui.power, client.icon.power)
                    .add(assetRsrc.ui.return, client.icon.return)
                    .add(assetRsrc.ui.dollar, client.icon.dollar)
                    .add(assetRsrc.ui.menu, client.icon.menu)
                    .add(assetRsrc.ui.close, client.icon.close)
                    .add(assetRsrc.ui.retry, client.icon.retry)
                    .add(assetRsrc.character.slime_spritesheet, asset.character.slime.spriteSheet)
                    .add(assetRsrc.env.bush.spiky, asset.env.bush.spiky)
                    .add(assetRsrc.env.bridge, asset.env.bridge)
                    .add(assetRsrc.life.emerald, asset.life.emerald)
                    .add(assetRsrc.animation.trigger, asset.animation.trigger)
                    .load(() => {
                        appViewDimension.width = app.view.width;
                        appViewDimension.height = app.view.height;
                        setAreRsrcsLoaded(true);

                        my_gui = new GUI();
                        app.ticker.maxFPS = 60;
                    });
            };

            if (props.appMode === appMode.WEBCAM) {
                const videoSrc = document.querySelector(poseWebcamQry);
                videoSrc.onloadeddata = () => {
                    initializeStage();
                }
            } else if (props.appMode === appMode.CONTROLLER) {
                initializeStage();
            } else if (props.appMode === appMode.KB_AND_MOUSE) {
                initializeStage();
            }
        }
    });

    //? stage Interaction-Controllers
    useEffect (() => {
        if (areRsrcsLoaded) {
            logInfo('Building and staging view, clouds and hands');
            document.getElementById(pixiJsContainer).appendChild(app.view);
            app.stage.addChild(getCloudsForBackground(app, PIXI.utils.TextureCache));

            setLeftHand(getHandByRsrcName(assetRsrc.leftHand.default, props.appMode));
            setRightHand(getHandByRsrcName(assetRsrc.rightHand.default, props.appMode));

            app.stage.addChild(leftHand.go);
            app.stage.addChild(rightHand.go);
            setAreHandsStaged(true);
        }
    }, [areRsrcsLoaded, props.appMode, ]);

    //? requestAnimationFrames with videoSrc or controller
    useEffect(() => {
        if (areRsrcsLoaded) {
            if (props.appMode === appMode.WEBCAM) {
                logInfo('Logging Webcam-Render');
                const videoSrc = document.querySelector(poseWebcamQry);
                renderHands(videoSrc);

                const guiVideo = my_gui.addFolder('VIDEO');
                const videoOpacity = guiVideo.add(videoSrc.style, 'opacity');
                const videoOpacityKey = localStorageKeys.videoOpacity;
                setDatGuiControllerListener(videoOpacity, videoOpacityKey);
                setDatGuiControllerValWithLocalStorage(videoOpacity, videoOpacityKey, "0");

            } else if (props.appMode === appMode.CONTROLLER) {
                logInfo('Logging Controller-Render');

                const guiHands = my_gui.addFolder('HANDS');

                renderHandsWithController(guiHands);
            } else if (props.appMode === appMode.KB_AND_MOUSE) {
                logInfo('Logging KB and Mouse-Render');

                const guiHands = my_gui.addFolder('HANDS');

                renderHandsWithKeyboardAndMouse(app, guiHands);
            }

            changeAudio(null);
            const guiAudio = my_gui.addFolder('AUDIO');
            const audioVolume = guiAudio.add(my_audio.element, 'volume', 0, 1, 0.01);
            const audioVolumeKey = localStorageKeys.audioVolume;
            setDatGuiControllerListener(audioVolume, audioVolumeKey);
            setDatGuiControllerValWithLocalStorage(audioVolume, audioVolumeKey, audioInitVolume);
        }
    }, [areRsrcsLoaded, props.appMode, ]);

    const changeView = (viewKey) => {
        for (let _tickKey of Object.keys(pixiTicks)) {
            removePixiTick(app, _tickKey);
        }
        appContainer.destroy({children: true, texture: false, baseTexture: false});
        appContainer = getCleanAppContainer();

        const uiMenuBtn = app.stage.children
            .find(child => child && child.id && child.id.includes('menuSuffix'));
        if (uiMenuBtn !== undefined && uiMenuBtn !== null) {
            uiMenuBtn.destroy({children: true, texture: false, baseTexture: false})
        };

        const uiMenuCont = app.stage.children
            .find(child => child && child.id && child.id === menu.container.ui)
        if (uiMenuCont !== undefined && uiMenuCont !== null) {
            uiMenuCont.destroy({children: true, texture: false, baseTexture: false});
        }

        app.stage.addChild(appContainer);
        setViewState(viewKey);
    };

    const changeViewOnLevelOrTutExit = (viewKey, shouldReset=false) => {
        app.ticker.stop();
        clearAllPixiTimeouts();
        clearAllCachedPixiTicksFromScene(app);
        deleteAllSceneTweens();
        const pixiTickKeys = Object.keys(pixiTicks);
        for (let _tickKey of pixiTickKeys) {
            removePixiTick(app, _tickKey);
        }

        appContainer.destroy({children: true, texture: false, baseTexture: false});
        appContainer = getCleanAppContainer();

        const uiMenuBtn = app.stage.children
            .find(child => child && child.id && child.id.includes('menuSuffix'));
        if (uiMenuBtn !== undefined && uiMenuBtn !== null) {
            uiMenuBtn.destroy({children: true, texture: false, baseTexture: false})
        };

        const uiMenuCont = app.stage.children
            .find(child => child && child.id && child.id === menu.container.ui)
        if (uiMenuCont !== undefined && uiMenuCont !== null) {
            uiMenuCont.destroy({children: true, texture: false, baseTexture: false});
        }

        app.stage.addChild(getCloudsForBackground(app));

        resetHandsLifeCounter();

        app.stage.addChild(appContainer);
        app.ticker.start();

        if (shouldReset) {
            cachedViewKey.current = viewKey;
            setViewState(views.resetView);
        } else {
            setViewState(viewKey);
        }
    };

    return (
        <div id={pixiJsContainer}>
            {
                areRsrcsLoaded && areHandsStaged ?
                    setView(viewState)
                    :
                    null
            }
        </div>
    );
}
