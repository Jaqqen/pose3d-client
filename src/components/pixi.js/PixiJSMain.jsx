import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import gsap from 'gsap/gsap-core';
import React, { useEffect, useRef, useState } from 'react';

import { asset, body } from 'shared/Indentifiers';
import { estimatePoseOnImage } from 'components/pose/PoseHandler';
import { logInfo } from 'shared/P3dcLogger';
import { PixiJSLevelOne } from 'components/pixi.js/levels/PixiJSLevelOne';
import { posenetModule } from 'components/pose/PosenetModelModule';
import { PixiJSMenu } from './PixiJSMenu';
import { testForAABB } from "components/pixi.js/PixiJSCollision";
import { useCallback } from 'react';
import { Linear } from 'gsap/gsap-core';


export default function PixiJSMain(props) {
    const stageProps = {
        antialias: true,
        backgroundColor: 0x666666,
        height: props.height,
        transparent: false,
        width: props.width,
    };
    const app = new PIXI.Application({...stageProps});
    app.view.id = ID.pixiJsCanvas;

    const [videoSrc] = useState(document.getElementById(ID.poseWebcam));

    let leftHand = {
        go: useRef(null),
        coordinates: useRef({x: -1000, y: -1000,}),
        resourceName: 'leftHand',
    };

    let rightHand = {
        go: useRef(null),
        coordinates: useRef({x: -1000, y: -1000,}),
        resourceName: 'rightHand',
    };

    let handSpriteCenter = useRef({x: 0, y: 0,});

    let menu = {
        isOn: useRef(true),
        isLevelsPanel: useRef(false),
        isHovering: useRef(false),
        loadingCircle: useRef(new PIXI.Graphics())
    };

    const otherGOs = useRef({});
    const otherResources = useRef({});

    const stageHand = useCallback((hand, handResource) => {
        hand.go.current = new PIXI.Sprite(handResource.texture);
        hand.go.current.x = hand.coordinates.current.x;
        hand.go.current.y = hand.coordinates.current.y;

        handSpriteCenter.current = {
            x: hand.go.current._texture.baseTexture.width/2,
            y: hand.go.current._texture.baseTexture.height/2,
        };

        app.stage.addChild(hand.go.current);
    }, [app.stage,]);

    const renderHands = (src) => {
        src.onplay = () => {
            const step = async () => {
                let coordinates = await estimatePoseOnImage(posenetModule, src);
                if (coordinates !== null) setHandsPositions(coordinates);
                requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        };
    };

    const setHandsPositions = (coordinates) => {

        leftHand.coordinates.current = getCenterKPtOfHand(getHandPositions(coordinates, body.left.wrist));
        rightHand.coordinates.current = getCenterKPtOfHand(getHandPositions(coordinates, body.right.wrist));

        app.ticker.add(() => {
            if (leftHand.coordinates.current !== null && leftHand.go.current !== null) {
                leftHand.go.current.x = leftHand.coordinates.current.x;
                leftHand.go.current.y = leftHand.coordinates.current.y;
            }
            if (rightHand.coordinates.current !== null && rightHand.go.current !== null) {
                rightHand.go.current.x = rightHand.coordinates.current.x;
                rightHand.go.current.y = rightHand.coordinates.current.y;
            }
        });
    };

    const getCenterKPtOfHand = (keypoint) => {
        if (keypoint !== null) {
            return {
                x: (app.view.width - keypoint.x) - handSpriteCenter.current.x,
                y: keypoint.y - handSpriteCenter.current.y
            };
        }

        return {x: -1000, y: -1000,};
    };

    const getHandPositions = (coordinates, handType) => {
        const kPWrist = coordinates.keypoints.filter(kPt => kPt.part === handType )[0];
        if (kPWrist.score > 0.35) return kPWrist.position;

        return null;
    };

    const setGoInGlbCtx = (goName, gameobject) => {
        otherGOs.current = {
            ...otherGOs.current,
            [goName]: gameobject,
        };
    };

    const setResourceInGlbCtx = (resourceName, rsrc) => {
        otherResources.current = {
            ...otherResources.current,
            [resourceName]: rsrc,
        };
    }

    let loadCircleTick = useRef(null);
    let loadingTween = useRef(null);

    const menuCollRes = (_if_func, otherGOKey, hand) => {
        if (hand.go.current !== undefined && hand.go.current !== null) {
            if (testForAABB(hand.go.current, otherGOs.current[otherGOKey])) {
                if (!menu.isHovering.current) {
                    const otherGO = otherGOs.current[otherGOKey];
                    menu.isHovering.current = true;

                    loadingTween.current = loadingConfigurator.start(otherGO, _if_func);
                }
            } else {
                menu.isHovering.current = false;

                loadingConfigurator.stop(loadCircleTick, loadingTween);
            }
        }
    };

    const loadingConfigurator = {
        start: (otherGO, onCompleteFunc) => {
            app.stage.addChild(menu.loadingCircle.current);

            const RAD = Math.PI / 180;

            const arcParam = {
                x: (otherGO.getBounds().x + otherGO.getBounds().width),
                y: otherGO.getBounds().y,
                radius: 50,
                angle: -95
            };

            const onCompleteLoading = () => {
                loadingConfigurator.stop(loadCircleTick, loadingTween);
                onCompleteFunc();
            };

            const tmpLoadingTween = gsap.to(arcParam, {
                angle: 280,
                duration: 3,
                ease: Linear.easeNone,
                onComplete: onCompleteLoading,
            });

            loadCircleTick.current = () => {
                menu.loadingCircle.current
                    .clear()
                    .lineStyle(14, 0xf44336)
                    .arc(arcParam.x, arcParam.y, arcParam.radius, -95 * RAD, arcParam.angle * RAD);
            };

            app.ticker.add(loadCircleTick.current);

            return tmpLoadingTween;
        },
        stop: (tickToStop, tweenToStop) => {
            if (tweenToStop.current !== null && tweenToStop.current !== undefined) {
                tweenToStop.current
                    .pause()
                    .time(0);
                app.ticker.remove(tickToStop.current);
                menu.loadingCircle.current.clear();
                app.stage.removeChild(menu.loadingCircle.current);

                tweenToStop.current = null;
            }
        },
    };

    //? stage Interaction-Controllers
    useEffect (() => {
        logInfo('Appending APP');
        document.getElementById(ID.pixiJsContainer).appendChild(app.view);

        app.loader
            .add(leftHand.resourceName, asset.hand.left)
            .add(rightHand.resourceName, asset.hand.right)
            .load((loader, resources) => {

                if (leftHand.go.current === null) {
                    stageHand(leftHand, resources[leftHand.resourceName]);
                }
                if (rightHand.go.current === null) {
                    stageHand(rightHand, resources[rightHand.resourceName]);
                }
            });

    }, [app, leftHand, rightHand, stageHand, ]);

    //? requestAnimationFrames with videoSrc
    useEffect(() => {
        logInfo('Logging 2nd useEffect');
        renderHands(videoSrc);
    });

    // let isLevelOne = useRef(false);
    // const setIsLevelOne = () => {isLevelOne.current = true};
    const [isLevelOne, setIsLevelOne] = useState(false);

    //? collision between hands and menu
    useEffect(() => {
        logInfo('Logging 3rd useEffect');
        app.ticker.add(() => menuCollRes(() => console.log('collision'), 'levelsButton', leftHand));
    });

    useEffect(() => {
        app.loader.load((loader, resources) => {

            logInfo('Logging 4th useEffect');

            const groundDotsNoneResourceName = 'groundDotsNone';
            const dummyResourceName = 'characterDummy';
            const meteorResourceName = 'meteor';

            let groundDotsNone;

            if (meteorResourceName in otherResources.current &&
                otherResources.current[meteorResourceName] !== null) {

                const meteor = new PIXI.Sprite(resources[meteorResourceName].texture);
                //? meteor
                meteor.scale.set(0.5, 0.5);
                
                meteor.x = app.view.width + 100;
                meteor.y = 250;
                
                //? staging
                app.stage.addChild(meteor);
                
                const meteorMove = () => {
                    if (!(meteor.y > app.view.height)) {
                        meteor.x -= 2.2;
                        meteor.y += 1.5;
                    } else { app.ticker.remove(meteorMove) }
                };

                app.ticker.add(meteorMove);
            }

            if (groundDotsNoneResourceName in otherResources.current &&
                otherResources.current[groundDotsNoneResourceName] !== null) {
                groundDotsNone = new PIXI.Sprite(resources[groundDotsNoneResourceName].texture);
                //? ground
                groundDotsNone.scale.set(2.1, 0.7);

                groundDotsNone.y = app.view.height - groundDotsNone.height + 20;
                groundDotsNone.x = 0;

                //? staging
                app.stage.addChild(groundDotsNone);
            }

            if (dummyResourceName in otherResources.current &&
                otherResources.current[dummyResourceName] !== null) {
                const characterDummy = new PIXI.Sprite(resources[dummyResourceName].texture);
                //? character
                characterDummy.y = app.view.height - groundDotsNone.height - 15;
                characterDummy.x = 0;

                //? staging
                app.stage.addChild(characterDummy);

                app.ticker.add(() => {
                    characterDummy.x += 0.4;
                });
            }
        });
    }, [app, isLevelOne]);

    return (
        <div id={ID.pixiJsContainer}>
            { menu.isOn.current ?
                <PixiJSMenu
                    app={app}
                    resourceNames={{leftHand: leftHand.resourceName, rightHand: rightHand.resourceName}}
                    setGoInGlbCtx={setGoInGlbCtx}
                />
                : null
            }
            {/* <PixiJSLevelOne app={app} setResourceInGlbCtx={setResourceInGlbCtx}/> */}
            { isLevelOne ?
                <PixiJSLevelOne app={app} setResourceInGlbCtx={setResourceInGlbCtx}/>
                :
                null
            }
        </div>
    );
}
