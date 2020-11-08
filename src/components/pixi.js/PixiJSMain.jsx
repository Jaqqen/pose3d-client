import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import React, { useCallback, useEffect, useState } from 'react';

import { asset, assetRsrc, body, views } from 'shared/Indentifiers';
import { estimatePoseOnImage } from 'components/pose/PoseHandler';
import { logDebug, logInfo } from 'shared/P3dcLogger';
import { posenetModule } from 'components/pose/PosenetModelModule';
import { PixiJSMenu } from 'components/pixi.js/PixiJSMenu';
import { PixiJSLevels } from './levels/PixiJSLevels';
import { pixiTicks, removePixiTick } from './SharedTicks';
import { PixiJSTutorials } from './tutorials/PixiJSTutorials';

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

export default function PixiJSMain(props) {
    const [areHandsStaged, setAreHandsStaged] = useState(false);
    const [videoSrc] = useState(document.getElementById(ID.poseWebcam));
    const [viewState, setViewState] = useState(views.menu);

    const setView = (viewKey) => {
        logDebug('setting View with', viewKey);
        switch (viewKey) {
            case views.levelN:
                break;
            case views.levelH:
                break;
            case views.levelX:
                break;
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
                break;
            case views.tutSpeech:
                break;
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
        hand.go.x = hand.coordinates.x;
        hand.go.y = hand.coordinates.y;
        hand.go.zIndex = 99;

        handSpriteCenter = {
            x: hand.go._texture.baseTexture.width/2,
            y: hand.go._texture.baseTexture.height/2,
        };

        return hand.go;
    };

    const setHandsPositions = useCallback((coordinates) => {
        leftHand.coordinates = getCenterKPtOfHand(getHandPositions(coordinates, body.left.wrist));
        rightHand.coordinates = getCenterKPtOfHand(getHandPositions(coordinates, body.right.wrist));

        app.ticker.add(() => {
            if (leftHand.coordinates !== null && leftHand.go !== null) {
                leftHand.go.x = leftHand.coordinates.x;
                leftHand.go.y = leftHand.coordinates.y;
            }
            if (rightHand.coordinates !== null && rightHand.go !== null) {
                rightHand.go.x = rightHand.coordinates.x;
                rightHand.go.y = rightHand.coordinates.y;
            }
        });
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
                x: (app.view.width - keypoint.x) - handSpriteCenter.x,
                y: keypoint.y - handSpriteCenter.y
            };
        }

        return {x: -1000, y: -1000,};
    };

    const getHandPositions = (coordinates, handType) => {
        const kPWrist = coordinates.keypoints.filter(kPt => kPt.part === handType )[0];
        if (kPWrist.score > 0.5) return kPWrist.position;

        return null;
    };

    if (!areHandsStaged) {
        const stageProps = {
            antialias: true,
            backgroundColor: 0x666666,
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
            .load((loader, resources) => {
                logDebug('Inside APPLoader for Staging Hands');

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
            removePixiTick(app, _tickKey)
        }
        appContainer.destroy({children: true, texture: true, baseTexture: true});
        appContainer = new PIXI.Container();
        appContainer.sortableChildren = true;
        appContainer.name = ID.appContainer;
        app.stage.addChild(appContainer);
        setViewState(viewKey);
    };

    // useEffect(() => {
    //     app.loader.load((loader, resources) => {
    //         logInfo('Logging 4th useEffect');

    //         const groundDotsNoneResourceName = 'groundDotsNone';
    //         const dummyResourceName = 'characterDummy';
    //         const meteorResourceName = 'meteor';

    //         let groundDotsNone;

    //         if (meteorResourceName in otherResources.current &&
    //             otherResources.current[meteorResourceName] !== null) {

    //             const meteor = new PIXI.Sprite(resources[meteorResourceName].texture);
    //             //? meteor
    //             meteor.scale.set(0.5, 0.5);
                
    //             meteor.x = app.view.width + 100;
    //             meteor.y = 250;
                
    //             //? staging
    //             app.stage.addChild(meteor);
                
    //             const meteorMove = () => {
    //                 if (!(meteor.y > app.view.height)) {
    //                     meteor.x -= 2.2;
    //                     meteor.y += 1.5;
    //                 } else { app.ticker.remove(meteorMove) }
    //             };

    //             app.ticker.add(meteorMove);
    //         }

    //         if (groundDotsNoneResourceName in otherResources.current &&
    //             otherResources.current[groundDotsNoneResourceName] !== null) {
    //             groundDotsNone = new PIXI.Sprite(resources[groundDotsNoneResourceName].texture);
    //             //? ground
    //             groundDotsNone.scale.set(2.1, 0.7);

    //             groundDotsNone.y = app.view.height - groundDotsNone.height + 20;
    //             groundDotsNone.x = 0;

    //             //? staging
    //             app.stage.addChild(groundDotsNone);
    //         }

    //         if (dummyResourceName in otherResources.current &&
    //             otherResources.current[dummyResourceName] !== null) {
    //             const characterDummy = new PIXI.Sprite(resources[dummyResourceName].texture);
    //             //? character
    //             characterDummy.y = app.view.height - groundDotsNone.height - 15;
    //             characterDummy.x = 0;

    //             //? staging
    //             app.stage.addChild(characterDummy);

    //             app.ticker.add(() => {
    //                 characterDummy.x += 0.4;
    //             });
    //         }
    //     });
    // }, []);

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
