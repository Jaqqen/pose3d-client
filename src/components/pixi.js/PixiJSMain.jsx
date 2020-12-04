import { cloudsContainerBg, pixiJsCanvas, pixiJsContainer, poseWebcam } from 'shared/IdConstants';
import * as PIXI from 'pixi.js';
import { GUI } from 'dat.gui';

import React, { useEffect, useState } from 'react';

import { asset, assetRsrc, views } from 'shared/Indentifiers';
import { appContainerName } from "shared/IdConstants";
import { logDebug, logInfo } from 'shared/P3dcLogger';
import { PixiJSMenu } from 'components/pixi.js/PixiJSMenu';
import { PixiJSLevels } from 'components/pixi.js/levels/PixiJSLevels';
import {
    cachedPixiTicksFromScene, clearAllPixiTimeouts, pixiTicks, removePixiTick
} from 'components/pixi.js/SharedTicks';
import { PixiJSTutorials } from 'components/pixi.js/tutorials/PixiJSTutorials';
import { PixiJSLevelOnePreview } from 'components/pixi.js/levels/previews/PixiJSLevelOnePreview';
import { PixiJSLevelTwoPreview } from 'components/pixi.js/levels/previews/PixiJSLevelTwoPreview';
import { PixiJSLevelThreePreview } from 'components/pixi.js/levels/previews/PixiJSLevelThreePreview';
import { PixiJSTutorialHands } from 'components/pixi.js/tutorials/previews/PixiJSTutorialHands';
import { PixiJSTutorialSpeech } from 'components/pixi.js/tutorials/previews/PixiJSTutorialSpeech';
import { getRandomInt, getRandomArbitrary } from 'shared/Utils';
import { PixiJSLevelOne } from 'components/pixi.js/levels/scenes/PixiJSLevelOne';
import { getHandByRsrcName, getHands, leftHand, renderHands, rightHand, setLeftHand, setRightHand } from './PixiJSHands';

let app;
let appContainer;

let my_gui;
let guiVideo;

const getCleanAppContainer = () => {
    const _appContainer = new PIXI.Container();
    _appContainer.sortableChildren = true;
    _appContainer.name = appContainerName;

    return _appContainer;
};

const poseWebcamQry = '#' + poseWebcam

export const getCloudsForBackground = (app, resources) => {
    const cloudsContainer = new PIXI.Container();
    cloudsContainer.x = 0;
    cloudsContainer.y = 0;

    for (let i = 0; i < 9; i++) {
        let assetType;
        if (i % 3 === 0) { assetType = assetRsrc.env.cloud.one; }
        else { assetType = assetRsrc.env.cloud.two; }

        const _cloud = new PIXI.Sprite(resources[assetType]);
        _cloud.scale.set(getRandomArbitrary(0.9, 1.3))

        _cloud.x = getRandomInt(app.view.width - _cloud.width);
        _cloud.y = getRandomInt(app.view.height - _cloud.height);
        cloudsContainer.addChild(_cloud);
    }
    cloudsContainer.id = cloudsContainerBg;
    cloudsContainer.zIndex = -20;

    return cloudsContainer;
};

export default function PixiJSMain(props) {
    const [areRsrcsLoaded, setAreRsrcsLoaded] = useState(false);
    const [areHandsStaged, setAreHandsStaged] = useState(false);
    const [viewState, setViewState] = useState(views.menu);

    const setView = (viewKey) => {
        logDebug('setting View with', viewKey);
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
                break;
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
                break;
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
            default:
                break;
        };
    }

    useEffect(() => {
        if (!areRsrcsLoaded) {
            const videoSrc = document.querySelector(poseWebcamQry);
            videoSrc.onloadeddata = () => {
                const stageProps = {
                    antialias: true,
                    backgroundColor: 0x1099bb,
                    height: videoSrc.clientHeight,
                    transparent: false,
                    width: videoSrc.clientWidth,
                };
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
                    .add(assetRsrc.leftHand, asset.hand.left)
                    .add(assetRsrc.rightHand, asset.hand.right)
                    .add(assetRsrc.env.ground.dots, asset.env.ground.dots)
                    .add(assetRsrc.env.cloud.one, asset.env.cloud.one)
                    .add(assetRsrc.env.cloud.two, asset.env.cloud.two)
                    .add(assetRsrc.env.ground.noDots, asset.env.ground.noDots)
                    .add(assetRsrc.env.ground.flying, asset.env.ground.flying)
                    .add(assetRsrc.projectile.meteor, asset.projectile.meteor)
                    .add(assetRsrc.projectile.icicle, asset.projectile.icicle)
                    .add(assetRsrc.character.dummy, asset.character.dummy)
                    .load(() => { setAreRsrcsLoaded(true); });
            }
        }
    });

    //? stage Interaction-Controllers
    useEffect (() => {
        if (areRsrcsLoaded) {
            logInfo('Logging 1st useEffect');
            document.getElementById(pixiJsContainer).appendChild(app.view);
            app.stage.addChild(getCloudsForBackground(app, PIXI.utils.TextureCache));

            setLeftHand(getHandByRsrcName(app, assetRsrc.leftHand));
            setRightHand(getHandByRsrcName(app, assetRsrc.rightHand));

            app.stage.addChild(leftHand.go);
            app.stage.addChild(rightHand.go);
            setAreHandsStaged(true);
        }
    }, [areRsrcsLoaded,]);

    //? requestAnimationFrames with videoSrc
    useEffect(() => {
        if (areRsrcsLoaded) {
            logInfo('Logging 2nd useEffect');
            const videoSrc = document.querySelector(poseWebcamQry);
            renderHands(videoSrc);

            my_gui = new GUI();
            guiVideo = my_gui.addFolder('VIDEO');
            const videoOpacity = guiVideo.add(videoSrc.style, 'opacity');
            videoOpacity.setValue("0");
        }
    }, [areRsrcsLoaded, ]);

    const changeView = (viewKey) => {
        logDebug('changing View with', viewKey);
        for (let _tickKey of Object.keys(pixiTicks)) {
            removePixiTick(app, _tickKey);
        }
        appContainer.destroy({children: true, texture: false, baseTexture: false});
        appContainer = getCleanAppContainer();
        app.stage.addChild(appContainer);
        setViewState(viewKey);
    };

    const changeViewOnLevelOrTutExit = (viewKey, resources) => {
        app.ticker.stop();
        clearAllPixiTimeouts();
        const cacheTicks = cachedPixiTicksFromScene;
        logDebug('changing View with', viewKey);
        const pixiTickKeys = Object.keys(pixiTicks);
        for (let _tickKey of pixiTickKeys) {
            removePixiTick(app, _tickKey);
        }

        appContainer.destroy({children: true, texture: false, baseTexture: false});
        appContainer = getCleanAppContainer();
        app.stage.addChild(getCloudsForBackground(app, resources));

        app.stage.addChild(appContainer);
        app.ticker.start();

        setViewState(viewKey);
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
