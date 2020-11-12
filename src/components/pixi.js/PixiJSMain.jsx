import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import React, { useCallback, useEffect, useState } from 'react';

import { asset, assetRsrc, body, views } from 'shared/Indentifiers';
import { estimatePoseOnImage } from 'components/pose/PoseHandler';
import { logDebug, logInfo } from 'shared/P3dcLogger';
import { posenetModule } from 'components/pose/PosenetModelModule';
import { PixiJSMenu } from 'components/pixi.js/PixiJSMenu';
import { PixiJSLevels } from 'components/pixi.js/levels/PixiJSLevels';
import { pixiTicks, removePixiTick } from 'components/pixi.js/SharedTicks';
import { PixiJSTutorials } from 'components/pixi.js/tutorials/PixiJSTutorials';
import { PixiJSLevelOnePreview } from 'components/pixi.js/levels/previews/PixiJSLevelOnePreview';
import { PixiJSLevelTwoPreview } from 'components/pixi.js/levels/previews/PixiJSLevelTwoPreview';
import { PixiJSLevelThreePreview } from 'components/pixi.js/levels/previews/PixiJSLevelThreePreview';
import { PixiJSTutorialHands } from 'components/pixi.js/tutorials/previews/PixiJSTutorialHands';
import { PixiJSTutorialSpeech } from 'components/pixi.js/tutorials/previews/PixiJSTutorialSpeech';
import { getRandomInt, getRandomArbitrary, getInterpolatedValues } from 'shared/Utils';
import { PixiJSLevelOne } from 'components/pixi.js/levels/scenes/PixiJSLevelOne';

let app;
let appContainer;

let leftHand = {
    go: null,
    coordinates: {x: -1000, y: -1000,},
};

let rightHand = {
    go: null,
    coordinates: {x: -1000, y: -1000,},
};

let handSpriteCenter = {x: 0, y: 0,};

export const getCloudsForBackground = (app, resources) => {
    const cloudsContainer = new PIXI.Container();
    cloudsContainer.x = 0;
    cloudsContainer.y = 0;

    for (let i = 0; i < 12; i++) {
        let assetType;
        if (i % 3 === 0) { assetType = assetRsrc.env.cloud.one; }
        else { assetType = assetRsrc.env.cloud.two; }

        debugger
        const _cloud = new PIXI.Sprite(resources[assetType].texture);
        _cloud.scale.set(getRandomArbitrary(0.9, 1.3))

        _cloud.x = getRandomInt(app.view.width - _cloud.width);
        _cloud.y = getRandomInt(app.view.height - _cloud.height);
        cloudsContainer.addChild(_cloud);
    }
    cloudsContainer.id = ID.cloudsContainerBg;
    cloudsContainer.zIndex = -20;

    return cloudsContainer;
};

export default function PixiJSMain(props) {
    const [areHandsStaged, setAreHandsStaged] = useState(false);
    const [videoSrc] = useState(document.getElementById(ID.poseWebcam));
    const [viewState, setViewState] = useState(views.levelN);

    const setView = (viewKey) => {
        logDebug('setting View with', viewKey);
        switch (viewKey) {
            case views.levelN:
                return(
                    <PixiJSLevelOne
                        app={app}
                        appContainer={appContainer}
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
                        exitViewFn={changeViewOnLevelOrTutExit}
                    />
                );
            case views.levelNPrev:
                return(
                    <PixiJSLevelOnePreview
                        app={app}
                        appContainer={appContainer}
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
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
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
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
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
                        changeViewFn={changeView}
                    />
                );
            case views.levels:
                return(
                    <PixiJSLevels 
                        app={app}
                        appContainer={appContainer}
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
                        changeViewFn={changeView}
                    />
                );
            case views.menu:
                return(
                    <PixiJSMenu
                        app={app}
                        appContainer={appContainer}
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
                        changeViewFn={changeView}
                    />
                );
            case views.tutHands:
                return(
                    <PixiJSTutorialHands
                        app={app}
                        appContainer={appContainer}
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
                        changeViewFn={changeView}
                    />
                );
            case views.tutSpeech:
                return(
                    <PixiJSTutorialSpeech
                        app={app}
                        appContainer={appContainer}
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
                        changeViewFn={changeView}
                    />
                );
            case views.tutorials:
                return(
                    <PixiJSTutorials
                        app={app}
                        appContainer={appContainer}
                        hands={{
                            right: rightHand.go,
                            left: leftHand.go,
                        }}
                        changeViewFn={changeView}
                    />
                );
            default:
                break;
        };
    }

    const stageHand = (hand, handResource) => {
        logDebug('Staging Hands');
        hand.go = new PIXI.Sprite(handResource.texture);
        hand.go.x = app.view.width/2;
        hand.go.y = hand.go.height * (-1);
        hand.go.zIndex = 99;

        handSpriteCenter = {
            x: hand.go._texture.baseTexture.width/2,
            y: hand.go._texture.baseTexture.height/2,
        };

        return hand.go;
    };

    const setHandsPositions = useCallback((coordinates) => {
        if (leftHand.coordinates !== null && leftHand.go !== null) {
            const {x: inX, y: inY} = getInterpolatedValues(
                {x: leftHand.go.x, y: leftHand.go.y},
                getCenterKPtOfHand(getHandPositions(coordinates, body.left.wrist)),
                0.4
            );
            leftHand.go.x = inX;
            leftHand.go.y = inY;
        }
        if (rightHand.coordinates !== null && rightHand.go !== null) {
            const {x: inX, y: inY} = getInterpolatedValues(
                {x: rightHand.go.x, y: rightHand.go.y},
                getCenterKPtOfHand(getHandPositions(coordinates, body.right.wrist)),
                0.4
            );
            rightHand.go.x = inX;
            rightHand.go.y = inY;
        }
    }, []);

    const renderHands = useCallback((src) => {
        src.onplay = () => {
            const step = async () => {
                let coordinates = await estimatePoseOnImage(posenetModule, src);
                if (coordinates !== null) setHandsPositions(coordinates);
                requestAnimationFrame(step);
            };
            step();
        };
    }, [setHandsPositions]);

    const getCenterKPtOfHand = (keypoint) => {
        if (keypoint !== null) {
            return {
                x: keypoint.x - handSpriteCenter.x,
                y: keypoint.y - handSpriteCenter.y
            };
        }

        return {x: app.view.width/2, y: (leftHand.go.height * (-1)),};
    };

    const getHandPositions = (coordinates, handType) => {
        const kPWrist = coordinates.keypoints.filter(kPt => kPt.part === handType )[0];
        if (kPWrist.score > 0.6) return kPWrist.position;

        return null;
    };

    if (!areHandsStaged) {
        const stageProps = {
            antialias: true,
            backgroundColor: 0x1099bb,
            height: props.height,
            transparent: false,
            width: props.width,
        };
        app = new PIXI.Application({...stageProps});
        app.view.id = ID.pixiJsCanvas;
        if (
            document.getElementById(ID.pixiJsContainer) !== null &&
            document.getElementById(ID.pixiJsCanvas) !== null
        ) {
            document.getElementById(ID.pixiJsCanvas).remove();
        }
        appContainer = new PIXI.Container();
        appContainer.sortableChildren = true;
        appContainer.name = ID.appContainer;
        app.stage.addChild(appContainer);
        app.stage.sortableChildren = true;

        logDebug('Before APPLoader for Staging Hands');

        app.loader
            .add(assetRsrc.leftHand, asset.hand.left)
            .add(assetRsrc.rightHand, asset.hand.right)
            .add(assetRsrc.env.ground.dots, asset.env.ground.dots)
            .add(assetRsrc.env.ground.noDots, asset.env.ground.noDots)
            .add(assetRsrc.env.ground.flying, asset.env.ground.flying)
            .add(assetRsrc.env.cloud.one, asset.env.cloud.one)
            .add(assetRsrc.env.cloud.two, asset.env.cloud.two)
            .add(assetRsrc.projectile.meteor, asset.projectile.meteor)
            .add(assetRsrc.projectile.icicle, asset.projectile.icicle)
            .add(assetRsrc.character.dummy, asset.character.dummy)
            .load((loader, resources) => {
                logDebug('Inside APPLoader for Staging Hands');

                app.stage.addChild(getCloudsForBackground(app, resources));

                app.stage.addChild(stageHand(leftHand, resources[assetRsrc.leftHand]));
                app.stage.addChild(stageHand(rightHand, resources[assetRsrc.rightHand]));

                setAreHandsStaged(true);
            });
    }


    //? stage Interaction-Controllers
    useEffect (() => {
        if (!areHandsStaged) {
            logInfo('Logging 1st useEffect');
            document.getElementById(ID.pixiJsContainer).appendChild(app.view);
        }
    }, [areHandsStaged,]);

    //? requestAnimationFrames with videoSrc
    useEffect(() => {
        if (!areHandsStaged) {
            logInfo('Logging 2nd useEffect');
            renderHands(videoSrc);
        }
    }, [areHandsStaged, renderHands, videoSrc]);

    const changeView = (viewKey) => {
        logDebug('changing View with', viewKey);
        for (let _tickKey of Object.keys(pixiTicks)) {
            removePixiTick(app, _tickKey);
        }
        appContainer.destroy({children: true, texture: false, baseTexture: false});
        appContainer = new PIXI.Container();
        appContainer.sortableChildren = true;
        appContainer.name = ID.appContainer;
        app.stage.addChild(appContainer);
        setViewState(viewKey);
    };

    const changeViewOnLevelOrTutExit = (viewKey, resources) => {
        logDebug('changing View with', viewKey);
        for (let _tickKey of Object.keys(pixiTicks)) {
            removePixiTick(app, _tickKey);
        }
        appContainer.destroy({children: true, texture: false, baseTexture: false});
        appContainer = new PIXI.Container();
        appContainer.sortableChildren = true;
        appContainer.name = ID.appContainer;

        app.stage.addChild(getCloudsForBackground(app, resources));

        app.stage.addChild(appContainer);
        setViewState(viewKey);
    }

    return (
        <div id={ID.pixiJsContainer}>
            {
                areHandsStaged ?
                    setView(viewState)
                    :
                    null
            }
        </div>
    );
}
