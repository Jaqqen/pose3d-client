import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import { menuTopRight } from 'components/pixi.js/PixiJSMenu';
import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { addPixiTick, addPixiTimeout, clearPixiTimeoutWithKey, removePixiTick } from 'components/pixi.js/SharedTicks';
import { viewConstant } from 'components/pixi.js/ViewConstants';
import VoiceHandler from 'components/voice/VoiceHandler';

import React, { Fragment, useEffect } from 'react'
import { menu } from 'shared/IdConstants';
import { assetRsrc, goLabels, listenerKeys, views } from 'shared/Indentifiers';
import { logInfo } from 'shared/P3dcLogger';
import { 
    getCloudsForScene, getCloudXDist, getGroundsByTypeForScene,
    defaultWorldAnimation, getFinishingFlag, runCharacterFinishAnimation, 
    runFlagEntryAnimation, runCharacterEntryAnimation, onScreenStartingX,
    removeCloudFromStageBeforeLevelStart, getLifeBars, lifeHandlerTick,
    onFinishLevel
} from "components/pixi.js/PixiJSGameObjects";
import { getRandomArbitrary, getRandomArbitraryInStep } from 'shared/Utils';
import { checkCollision } from 'components/pixi.js/PixiJSCollision';
import { menuTopRightSceneFn } from 'components/pixi.js/PixiJSMenu';
import gsap from 'gsap/gsap-core';
import { Linear } from 'gsap/gsap-core';

export const PixiJSLevelOne = (props) => {

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );
    menuTopRightButton.zIndex = 80;
    menuTopRightButton.visible = false;

    const lifeBars = getLifeBars(
        ID.levels.lifeBar, viewConstant.lifeBarsDim.x, viewConstant.lifeBarsDim.y
    );
    lifeBars.zIndex = 80;
    lifeBars.visible = false;

    useEffect(() => {
        logInfo('Logging PixiJS Level One useEffect');

        const { app, appContainer, hands, exitViewFn } = props;
        removeCloudFromStageBeforeLevelStart(app);

        appContainer.addChild(menuTopRightButton);
        appContainer.addChild(lifeBars);

        let levelOneTick;
        let menuCollTick;

        app.loader
            .load((loader, resources) => {
                //? measures and tracking variables
                const worldWidth = app.view.width * 5;
                const lastPartBeforeEndX = worldWidth - app.view.width;
                const amountOfClouds = 7;
                const worldTickSpeed = 3;
                let elapsedGroundWidth = 0;
                //? animationKeys
                const worldAnimKey = listenerKeys.char.entry.worldAnim;
                const infiniteGroundKey = listenerKeys.char.entry.infinite.ground;
                const infiniteCloudsKey = listenerKeys.char.entry.infinite.clouds;
                const infiniteMeteorsKey = listenerKeys.game.object.meteors.own;
                const infiniteIciclesKey = listenerKeys.game.object.icicles.own;

                const menuCollTickKey = listenerKeys.levelOneScene.menuCollTick;
                const levelOneTickKey = listenerKeys.levelOneScene.mainTick; 

                //? character
                const characterDummy = new PIXI.Sprite(resources[assetRsrc.character.dummy].texture);

                //? interactive objects
                let meteors = [];
                const amtMeteors = 4;
                const meteorMaxXOffset = 50;
                const meteorAccelBounds = {
                    x: {
                        min: 5.2,
                        max: 5.6,
                    },
                    y: {
                        min: -3,
                        max: -3.4,
                    },
                };
                const meteorTimeoutRange = {
                    min: 100,
                    minInTick: 2000,
                    max: 8000,
                    step: 1000,
                };
                const meteorPrefixKey = goLabels.level.one.projectiles.tickKey;
                const interactiveGOKey = goLabels.interactive.go;
                const interactiveTickKey = goLabels.interactive.tick;

                let icicles = [];
                const amtIcicles = 3;
                const iciclesAccelBounds = {
                    x: {
                        min: 0,
                        max: 0,
                    },
                    y: {
                        min: -2,
                        max: -2.4,
                    },
                };
                const icicleTimeoutRange = {
                    min: 100,
                    minInTick: 2000,
                    max: 8000,
                    step: 1000,
                };

                //? non-interactive, world objects
                const groundWithDots = getGroundsByTypeForScene(
                    3, resources, assetRsrc.env.ground.dots
                );
                const clouds = getCloudsForScene(amountOfClouds, resources);
                const flagContainer = getFinishingFlag();

                const aboveGroundHeight = app.view.height - groundWithDots[0].getBounds().height - 16;

                //? setup of scene
                characterDummy.position.y = aboveGroundHeight;
                appContainer.addChild(characterDummy);

                clouds.forEach((cloud, index) => {
                    cloud.x = index * getCloudXDist();
                    cloud.y = Math.floor(getRandomArbitrary(0, (app.view.height/3) - cloud.height));
                    cloud.zIndex = -20;
                    appContainer.addChild(cloud);
                });

                groundWithDots.forEach((ground, index) => {
                    ground.x = index * ground.getBounds().width;
                    ground.y = app.view.height - ground.getBounds().height + 15;
                    ground.zIndex = -3;
                    appContainer.addChild(ground);
                });

                for (let i = 0; i < amtMeteors; i++) {
                    const tmpMeteor = new PIXI.Sprite(resources[assetRsrc.projectile.meteor].texture);
                    meteors.push({
                        [interactiveGOKey]: tmpMeteor,
                        [interactiveTickKey]: null,
                    });
                    tmpMeteor.scale.set(0.6);
                    tmpMeteor.x = app.view.width + getRandomArbitrary(20, meteorMaxXOffset);
                    tmpMeteor.y = getRandomArbitrary(-30, (app.view.height/4));
                    tmpMeteor.zIndex = -10;
                    tmpMeteor.acceleration = new PIXI.Point(
                        getRandomArbitrary(meteorAccelBounds.x.min, meteorAccelBounds.x.max),
                        getRandomArbitrary(meteorAccelBounds.y.min, meteorAccelBounds.y.max)
                    );
                    appContainer.addChild(tmpMeteor);
                }
                for (let i = 0; i < amtIcicles; i++) {
                    const tmpIcicle = new PIXI.Sprite(resources[assetRsrc.projectile.icicle].texture);
                    icicles.push({
                        [interactiveGOKey]: tmpIcicle,
                        [interactiveTickKey]: null,
                    });
                    tmpIcicle.scale.set(0.6);
                    tmpIcicle.x = onScreenStartingX + getRandomArbitrary(180, 260);
                    tmpIcicle.y = -tmpIcicle.getBounds().height;
                    tmpIcicle.zIndex = -10;
                    tmpIcicle.acceleration = new PIXI.Point(
                        iciclesAccelBounds.x.min,
                        getRandomArbitrary(iciclesAccelBounds.y.min, iciclesAccelBounds.y.max)
                    );
                    appContainer.addChild(tmpIcicle);
                }

                //? ticks
                const worldAnimation = defaultWorldAnimation(worldTickSpeed, [ clouds, groundWithDots ]);

                const infiniteClouds = () => {
                    const lostCloudsArr = clouds.filter(
                        cloud => (cloud.x + cloud.getBounds().width) < 0
                    );
                    if (lostCloudsArr.length > 0) {
                        const xValuesOfClouds = clouds.map(obj => obj.x);
                        const endXOfClouds = (
                            Math.max(...xValuesOfClouds) + clouds[0].getBounds().width
                        );
                        lostCloudsArr.forEach(lostCloud => {
                            lostCloud.x = endXOfClouds + getCloudXDist();
                        });
                    }
                };

                const infiniteGround = () => {
                    const lostGroundTileArr = groundWithDots.filter(
                        ground => (ground.x + ground.getBounds().width) < 0
                    );
                    if (lostGroundTileArr.length > 0) {
                        const lostTile = lostGroundTileArr[0];
                        const xValuesOfGroundTiles = groundWithDots.map(obj => obj.x);
                        const endXOfGroundTiles = (
                            Math.max(...xValuesOfGroundTiles) + lostTile.getBounds().width
                        );

                        lostTile.x = endXOfGroundTiles;
                        elapsedGroundWidth += lostTile.getBounds().width;

                        if (lastPartBeforeEndX < elapsedGroundWidth) {
                            runFlagEntryAnimation(
                                app, appContainer, flagContainer, aboveGroundHeight, 5
                            );

                            runCharacterFinishAnimation(app, characterDummy,
                                {
                                    [worldAnimKey]: worldAnimation,
                                    [infiniteCloudsKey]: infiniteClouds,
                                    [infiniteGroundKey]: infiniteGround,
                                    [levelOneTickKey]: levelOneTick
                                },
                                {
                                    [infiniteMeteorsKey]: infiniteMeteors,
                                },
                                cleanUpOnFinish,
                                () => onFinishLevel(
                                    app, interactiveGOs, worldGOs,
                                    [levelOneTickKey, levelOneTick],
                                    handGOs,
                                    () => exitViewFn(views.levelN, resources),
                                    () => exitViewFn(views.menu, resources),
                                    [menuCollTickKey, menuCollTick]
                                )
                            );
                        }
                    }
                };

                const initiateMeteors = () => {
                    meteors.forEach((meteor, index) => {
                        const meteorTick = () => {
                            const meteorGo = meteor[interactiveGOKey];

                            meteorGo.x -= meteorGo.acceleration.x;
                            meteorGo.y -= meteorGo.acceleration.y;
                        };
                        meteor[interactiveTickKey] = meteorPrefixKey + index;
                        meteor[interactiveGOKey].id = interactiveGOKey;

                        const initMetId = setTimeout(() => {
                            addPixiTick(app, meteor[interactiveTickKey], meteorTick);
                            clearPixiTimeoutWithKey(meteor[interactiveTickKey]);
                        },
                            getRandomArbitraryInStep(
                                meteorTimeoutRange.min,
                                meteorTimeoutRange.max,
                                meteorTimeoutRange.step
                            )
                        );
                        addPixiTimeout(meteor[interactiveTickKey], initMetId);
                    })
                };
                // const initiateIcicles = () => {
                //     icicles.forEach((icicle, index) => {
                //         const icicleTick = () => {
                //             const icicleGo = icicle[interactiveGOKey];

                //             const icicleInit = {y: -icicleGo.getBounds().height };
                //             const characterIntroTick = () => {icicleGo.position.y = icicleInit.y};

                //             const initIcicleId = setTimeout(() => {
                //                 gsap.to(icicleInit, {
                //                     y: icicleGo.getBounds().height,
                //                     duration: getRandomArbitrary(1.2,2.4),
                //                     ease: Linear.easeIn
                //                 });
                //             },
                //                 getRandomArbitraryInStep(
                //                     icicleTimeoutRange.min,
                //                     icicleTimeoutRange.max,
                //                     icicleTimeoutRange.step
                //                 )
                //             );


                //             addPixiTick(app, listenerKeys.game.object);
                //         }
                //     });
                // };
                const initiateProjectiles = () => {
                    initiateMeteors();
                };

                const infiniteMeteors = () => {
                    const lostMeteors = meteors.filter(
                        meteor => (
                            meteor[interactiveGOKey].y > (app.view.height - groundWithDots[0].getBounds().height + meteor[interactiveGOKey].getBounds().height) ||
                            meteor[interactiveGOKey].y < (0 - meteor[interactiveGOKey].getBounds().height) ||
                            meteor[interactiveGOKey].x < (0 - meteor[interactiveGOKey].getBounds().width) ||
                            meteor[interactiveGOKey].x > (app.view.width + meteorMaxXOffset)
                        )
                    );

                    if (lostMeteors.length > 0) {
                        lostMeteors.forEach(lostMeteor => {
                            const meteorGo = lostMeteor[interactiveGOKey];
                            const meteorKey = lostMeteor[interactiveTickKey];
                            if (lastPartBeforeEndX - (app.view.width/2) < elapsedGroundWidth) {
                                removePixiTick(app, meteorKey);
                                appContainer.removeChild(meteorGo);
                            } else {
                                meteorGo.acceleration = new PIXI.Point(0);
                                const isSmvOpen = app.stage.children.filter(
                                    (child) => child.id === ID.sceneSmv
                                );
                                if (isSmvOpen.length <= 0) {
                                    clearPixiTimeoutWithKey(meteorKey);
                                    meteorGo.x = app.view.width + getRandomArbitrary(20, meteorMaxXOffset);
                                    meteorGo.y = getRandomArbitrary(-30, (app.view.height/4));

                                    const resetMeteorId = setTimeout(() => {
                                        meteorGo.acceleration.set(
                                            getRandomArbitrary(meteorAccelBounds.x.min, meteorAccelBounds.x.max),
                                            getRandomArbitrary(meteorAccelBounds.y.min, meteorAccelBounds.y.max)
                                        );
                                        clearPixiTimeoutWithKey(meteorKey);
                                        }, getRandomArbitraryInStep(
                                            meteorTimeoutRange.minInTick, meteorTimeoutRange.max, meteorTimeoutRange.step
                                        )
                                    );
                                    addPixiTimeout(meteorKey, resetMeteorId);
                                }
                            }
                        });
                    }
                };

                const cleanUpOnFinish = () => {
                    const lostAppContChildren = appContainer.children.filter(
                        child => (
                            child.y > (app.view.height - groundWithDots[0].getBounds().height + child.getBounds().height) ||
                            child.y < (0 - child.getBounds().height) ||
                            child.x < (0 - child.getBounds().width) ||
                            child.x > (app.view.width + child.getBounds().width) ||
                            child.id === interactiveGOKey
                        )
                    );

                    lostAppContChildren.forEach(lostChild => {
                        lostChild.destroy({children: true, texture: false, baseTexture: false});
                    });
                };

                runCharacterEntryAnimation(
                    app, characterDummy, {
                        [worldAnimKey]: worldAnimation,
                        [infiniteCloudsKey]: infiniteClouds,
                        [infiniteGroundKey]: infiniteGround,
                        [infiniteMeteorsKey]: infiniteMeteors,
                    },
                    () => {
                        menuTopRightButton.visible = true;
                        lifeBars.visible = true;
                    },
                    () => addPixiTick(app, levelOneTickKey, levelOneTick),
                    initiateProjectiles,
                    () => addPixiTick(app, menuCollTickKey, menuCollTick)
                );

                const interactiveGOs = [
                    ...meteors
                ];
                const worldGOs = {
                    [worldAnimKey]: worldAnimation,
                    [infiniteCloudsKey]: infiniteClouds,
                    [infiniteGroundKey]: infiniteGround,
                    [infiniteMeteorsKey]: infiniteMeteors,
                };

                const handGOs = {
                    left: hands.left.go,
                    right: hands.right.go
                };

                const openSmvLevelScene = () => menuTopRightSceneFn(
                    app, appContainer, interactiveGOs, worldGOs,
                    [levelOneTickKey, levelOneTick],
                    handGOs,
                    () => exitViewFn(views.menu, resources),
                    [menuCollTickKey, menuCollTick]
                );

                const levelGOs = [
                    [openSmvLevelScene, menuTopRightButton]
                ];

                menuCollTick = () => menuCollRes(app, levelGOs, handGOs);
                levelOneTick = () => {
                    checkCollision(app, hands.left, interactiveGOs, characterDummy, lifeBars);
                    checkCollision(app, hands.right, interactiveGOs, characterDummy, lifeBars);
                    lifeHandlerTick(
                        app, interactiveGOs, worldGOs,
                        [levelOneTickKey, levelOneTick],
                        handGOs,
                        () => exitViewFn(views.levelN, resources),
                        () => exitViewFn(views.menu, resources),
                        [menuCollTickKey, menuCollTick],
                        lifeBars
                    );
                };

                //! Character y-coordinate has to be set here
                // setJumpAt();
            });
    }, [props, menuTopRightButton, lifeBars])

    return(
        <Fragment>
            <VoiceHandler />
        </Fragment>
    );
}
