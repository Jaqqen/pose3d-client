import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import {
    addPixiTick, addPixiTimeout, clearPixiTimeoutWithKey, pixiTimeouts, removePixiTick
} from 'components/pixi.js/SharedTicks';
import { viewConstant } from 'components/pixi.js/ViewConstants';

import React, { Fragment, useEffect } from 'react'
import { assetRsrc, goLabels, listenerKeys, views, viewsMain } from 'shared/Indentifiers';
import { logInfo } from 'shared/P3dcLogger';
import {
    getCloudsForScene, getCloudXDist, getGroundsByTypeForScene,
    defaultWorldAnimation, getFinishingFlag, runPlayerFinishAnimation, 
    runFlagEntryAnimation, runPlayerEntryAnimation, onScreenStartingX,
    removeCloudFromStageBeforeLevelStart, getLifeBars, lifeHandlerTick,
    onFinishLevel
} from "components/pixi.js/PixiJSGameObjects";
import { getRandomArbitrary, getRandomArbitraryInStep, getRandomChoiceOfArray } from 'shared/Utils';
import { checkCollision, checkPlayerEnvironment } from 'components/pixi.js/PixiJSCollision';
import { appViewDimension } from 'components/pixi.js/PixiJSMain';
import { UiMenu } from 'components/pixi.js/UiMenu';
import { uiMenuButton } from 'components/pixi.js/PixiJSButton';
import { quitBtnFn } from 'components/pixi.js/PixiJSMenu';
import { audioOnClick, shouldPlayAudio } from 'components/pixi.js/PixiJSAudio';
import { CHAR_STATE, PixiGameChar } from 'components/pixi.js/animations/PixiGameChar';

export const PixiJSLevelOne = (props) => {
    const lifeBars = getLifeBars(
        3, ID.levels.lifeBar, viewConstant.lifeBarsDim.x, viewConstant.lifeBarsDim.y
    );
    lifeBars.zIndex = 80;
    lifeBars.visible = false;

    const audioUiButton = uiMenuButton(
        (shouldPlayAudio() === "true" ? assetRsrc.ui.pause : assetRsrc.ui.play),
        'audioSuffix',
        'Audio'
    );
    const creditsUiButton = uiMenuButton(assetRsrc.ui.dollar, 'creditsSuffix', 'Credits');
    const returnUiButton = uiMenuButton(assetRsrc.ui.return, 'returnSuffix', 'Back');
    const quitUiButton = uiMenuButton(assetRsrc.ui.power, 'quitSuffix', 'Quit');

    useEffect(() => {
        logInfo('Logging PixiJS Level One useEffect');
        const { app, appContainer, hands, exitViewFn } = props;
        removeCloudFromStageBeforeLevelStart(app);

        const uiMenuContainer = new UiMenu();
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: audioUiButton,
            [goLabels.menu.ui.element.func]: () => audioOnClick.audioUiButtonOnComplete(audioUiButton),
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: returnUiButton,
            [goLabels.menu.ui.element.func]: () => exitViewFn(views.levels),
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: quitUiButton,
            [goLabels.menu.ui.element.func]: quitBtnFn,
        });

        appContainer.addChild(lifeBars);
        appContainer.addChild(uiMenuContainer.getRadialAccessPuller());
        appContainer.addChild(uiMenuContainer.getRadialAccessButton());

        let levelOneTick;
        let menuCollTick;

        //? measures and tracking variables
        const worldWidth = appViewDimension.width * 7;
        const lastPartBeforeEndX = worldWidth - appViewDimension.width;
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
        const slime = new PixiGameChar(
            PIXI.utils.TextureCache[assetRsrc.character.slime_spritesheet],
            64, 64,
            0.1, true
        );
        slime.createCharacter({
            idle_anim: {
                startColumn: 0,
                endColumn: 3,
                row: 0,
            },
            walk_anim: {
                startColumn: 0,
                endColumn: 9,
                row: 1,
            },
            jump_anim: {
                startColumn: 0,
                endColumn: 13,
                row: 2,
            }
        }, 'idle_anim');
        const slimeStates = {
            entry: {
                onStart: {
                    state: CHAR_STATE.WALKING,
                    animation: 'walk_anim',
                },
            },
            finish: {
                onStart: {
                    state: CHAR_STATE.WALKING,
                    animation: 'walk_anim',
                },
                onComplete: {
                    state: CHAR_STATE.IDLE,
                    animation: 'idle_anim',
                },
            },
        };

        //? interactive objects
        const interactiveGOKey = goLabels.interactive.go;
        const interactiveTickKey = goLabels.interactive.tick;

        const meteors = [];
        const amtMeteors = 3;
        const meteorBoundaryPadding = 5;
        const meteorAccelBounds = {
            x: {
                min: 3.2,
                max: 3.4,
            },
            y: {
                min: -1.8,
                max: -2,
            },
        };
        const meteorTimeoutRange = {
            min: 100,
            minInTick: 4000,
            max: 8000,
            step: 1900,
        };
        const meteorTickKeyPrefix = goLabels.level.one.projectiles.meteor.tickKeyPrefix;

        const icicles = [];
        const amtIcicles = 2;
        const icicleBoundaryPadding = 5;
        const iciclesAccelBounds = {
            x: worldTickSpeed * 0.9,
            y: {
                min: -2,
                max: -2.4,
            },
        };
        const icicleTimeoutRange = {
            min: 100,
            minInTick: 3000,
            max: 8000,
            step: 1000,
        };
        const icicleTickKeyPrefix = goLabels.level.one.projectiles.icicle.tickKeyPrefix;
        const icicleDistances = [
            onScreenStartingX + 400,
            onScreenStartingX + 660
        ];

        //? non-interactive, world objects
        const groundWithDots = getGroundsByTypeForScene(3, assetRsrc.env.ground.dots);
        const clouds = getCloudsForScene(amountOfClouds);
        const flagContainer = getFinishingFlag();

        const aboveGroundHeight = (
            appViewDimension.height
            - groundWithDots[0].getBounds().height
            - slime.character.getChildByName('animSpriteCharName').height/2.1
        );
        const flagDestHeight = (
            appViewDimension.height
            - groundWithDots[0].getBounds().height
            + 15
        );

        //? setup of scene
        slime.character.y = aboveGroundHeight;
        appContainer.addChild(slime.character);

        clouds.forEach((cloud, index) => {
            cloud.x = index * getCloudXDist();
            cloud.y = Math.floor(getRandomArbitrary(0, (appViewDimension.height/3) - cloud.height));
            cloud.zIndex = -20;
            appContainer.addChild(cloud);
        });

        groundWithDots.forEach((ground, index) => {
            ground.x = index * ground.getBounds().width;
            ground.y = appViewDimension.height - ground.getBounds().height + 15;
            ground.zIndex = -3;
            appContainer.addChild(ground);
        });

        for (let i = 0; i < amtMeteors; i++) {
            const tmpMeteor = new PIXI.Sprite(PIXI.utils.TextureCache[assetRsrc.projectile.meteor]);
            tmpMeteor.id = interactiveGOKey;
            meteors.push({
                [interactiveGOKey]: tmpMeteor,
                [interactiveTickKey]: meteorTickKeyPrefix + i,
                isSpawnedLeft: i % 2 === 0 ? true : false,
            });
            tmpMeteor.scale.set(0.6);
            (i % 2 === 0) && (tmpMeteor.scale.x = -0.6);
            tmpMeteor.x = 0 - 400;
            tmpMeteor.y = 0 - 400;
            tmpMeteor.zIndex = -10;
            tmpMeteor.acceleration = new PIXI.Point(
                getRandomArbitrary(meteorAccelBounds.x.min, meteorAccelBounds.x.max),
                getRandomArbitrary(meteorAccelBounds.y.min, meteorAccelBounds.y.max)
            );
            appContainer.addChild(tmpMeteor);
        }
        for (let i = 0; i < amtIcicles; i++) {
            const tmpIcicle = new PIXI.Sprite(
                PIXI.utils.TextureCache[assetRsrc.projectile.icicle]
            );
            icicles.push({
                [interactiveGOKey]: tmpIcicle,
                [interactiveTickKey]: icicleTickKeyPrefix + i,
            });
            tmpIcicle.scale.set(0.6);
            (i % 2 === 0) && (tmpIcicle.scale.x = -0.6);
            tmpIcicle.x = -400;
            tmpIcicle.y = -400;
            tmpIcicle.zIndex = -10;
            tmpIcicle.acceleration = new PIXI.Point(
                iciclesAccelBounds.x,
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
                        appContainer, flagContainer, flagDestHeight
                    );

                    runPlayerFinishAnimation(app, slime,
                        {
                            [worldAnimKey]: worldAnimation,
                            [infiniteCloudsKey]: infiniteClouds,
                            [infiniteGroundKey]: infiniteGround,
                            [levelOneTickKey]: levelOneTick
                        },
                        {
                            [infiniteMeteorsKey]: infiniteMeteors,
                            [infiniteIciclesKey]: infiniteIcicles,
                        },
                        cleanUpOnFinish,
                        () => onFinishLevel(
                            app, interactiveGOs, worldGOs,
                            [levelOneTickKey, levelOneTick],
                            handGOs,
                            () => exitViewFn(views.levelN, true),
                            () => exitViewFn(viewsMain),
                            [menuCollTickKey, menuCollTick],
                            () => exitViewFn(views.levelH)
                        ),
                        slimeStates.finish.onStart,
                        slimeStates.finish.onComplete,
                    );
                }
            }
        };

        const getRandomTimeout = {
            meteor: () => {
                return getRandomArbitraryInStep(
                    meteorTimeoutRange.minInTick,
                    meteorTimeoutRange.max,
                    meteorTimeoutRange.step
                );
            },
            icicle: () => {
                return getRandomArbitrary(
                    icicleTimeoutRange.min,
                    icicleTimeoutRange.max,
                    icicleTimeoutRange.step
                );
            },
        };

        const initiateMeteor = (meteor) => {
            const meteorGo = meteor[interactiveGOKey];
            const meteorKey = meteor[interactiveTickKey];
            const isSpawnedLeft = meteor.isSpawnedLeft;
            removePixiTick(app, meteorKey);

            meteorGo.acceleration = new PIXI.Point(0);
            meteorGo.id = interactiveGOKey;

            meteorGo.y = getRandomArbitrary(
                (0 - meteorGo.height - meteorBoundaryPadding) * 1.3,
                (meteorGo.height * 1.4)
            );

            meteorGo.x = isSpawnedLeft
                ? 0 - meteorGo.width - meteorBoundaryPadding
                : appViewDimension.width + meteorBoundaryPadding;

            const horizontalAccel = getRandomArbitrary(
                    meteorAccelBounds.x.min, meteorAccelBounds.x.max
                ) * (isSpawnedLeft ? -1 : 1);
            meteorGo.acceleration.set(
                horizontalAccel,
                getRandomArbitrary(meteorAccelBounds.y.min, meteorAccelBounds.y.max)
            );

            const meteorTick = () => {
                meteorGo.x -= meteorGo.acceleration.x;
                meteorGo.y -= meteorGo.acceleration.y;
            };

            addPixiTick(app, meteorKey, meteorTick);
            clearPixiTimeoutWithKey(meteorKey);
        };

        const infiniteMeteors = () => {
            const lostMeteors = meteors.filter(
                meteor => (
                    meteor[interactiveGOKey].y 
                        > (
                            appViewDimension.height
                            - groundWithDots[0].getBounds().height
                            + meteor[interactiveGOKey].getBounds().height
                            + meteorBoundaryPadding
                        ) ||
                    meteor[interactiveGOKey].y 
                        < (
                            0
                            - meteor[interactiveGOKey].getBounds().height
                            - meteorBoundaryPadding
                        ) ||
                    meteor[interactiveGOKey].x
                        < (
                            0
                            - meteor[interactiveGOKey].getBounds().width
                            - meteorBoundaryPadding * 2
                        ) ||
                    meteor[interactiveGOKey].x
                        > (
                            appViewDimension.width
                            + meteor[interactiveGOKey].getBounds().width
                            + meteorBoundaryPadding * 2
                        )
                )
            );

            if (lostMeteors.length > 0) {
                lostMeteors.forEach(lostMeteor => {
                    const meteorKey = lostMeteor[interactiveTickKey];
                    if (lastPartBeforeEndX - (appViewDimension.width/2) < elapsedGroundWidth) {
                        removePixiTick(app, meteorKey);
                        appContainer.removeChild(lostMeteor[interactiveGOKey]);
                    } else {
                        if (!(meteorKey in pixiTimeouts)) {
                            const timeoutId = setTimeout(
                                initiateMeteor, getRandomTimeout.meteor(), lostMeteor
                            );

                            addPixiTimeout(meteorKey, timeoutId);
                        }
                    }
                });
            }
        };

        const initiateIcicle = (icicle) => {
            const icicleGo = icicle[interactiveGOKey];
            const icicleKey = icicle[interactiveTickKey];
            removePixiTick(app, icicleKey);

            icicleGo.acceleration = new PIXI.Point(0);
            icicleGo.id = interactiveGOKey;

            icicleGo.x = getRandomChoiceOfArray(icicleDistances);
            icicleGo.y = -icicleGo.getBounds().height;

            icicleGo.acceleration.set(
                iciclesAccelBounds.x,
                getRandomArbitrary(iciclesAccelBounds.y.min, iciclesAccelBounds.y.max)
            );

            const icicleTick = () => {
                if (icicleGo.y < 0 && icicleGo.acceleration.y < 0) {
                    icicleGo.y -= -(Math.abs((icicleGo.acceleration.y/2)));
                } else {
                    icicleGo.x -= icicleGo.acceleration.x;
                    icicleGo.y -= icicleGo.acceleration.y;
                }
            };

            addPixiTick(app, icicleKey, icicleTick);
            clearPixiTimeoutWithKey(icicleKey);
        };

        const infiniteIcicles = () => {
            const lostIcicles = icicles.filter(
                icicle => (
                    icicle[interactiveGOKey].y
                        > (
                            appViewDimension.height
                            - groundWithDots[0].getBounds().height
                            + icicle[interactiveGOKey].getBounds().height
                            + icicleBoundaryPadding
                        ) ||
                    icicle[interactiveGOKey].y
                        < (
                            0
                            - icicle[interactiveGOKey].getBounds().height * 2
                            - icicleBoundaryPadding
                        ) ||
                    icicle[interactiveGOKey].x
                        < (
                            0
                            - icicle[interactiveGOKey].getBounds().width
                            - icicleBoundaryPadding
                        ) ||
                    icicle[interactiveGOKey].x
                        > (
                            appViewDimension.width
                            + icicle[interactiveGOKey].getBounds().width
                            + icicleBoundaryPadding
                        )
                )
            );

            if (lostIcicles.length > 0) {
                lostIcicles.forEach(lostIcicle => {
                    const icicleKey = lostIcicle[interactiveTickKey];
                    if (lastPartBeforeEndX - (appViewDimension.width/2) < elapsedGroundWidth) {
                        removePixiTick(app, icicleKey);
                        appContainer.removeChild(lostIcicle[interactiveGOKey]);
                    } else {
                        if (!(icicleKey in pixiTimeouts)) {
                            const timeoutId = setTimeout(
                                initiateIcicle, getRandomTimeout.meteor(), lostIcicle
                            );

                            addPixiTimeout(icicleKey, timeoutId);
                        }
                    }
                });
            }
        };

        const cleanUpOnFinish = () => {
            const lostAppContChildren = appContainer.children.filter(
                child => (
                    child.y > (
                        appViewDimension.height
                        - groundWithDots[0].getBounds().height
                        + child.getBounds().height
                    ) ||
                    child.y < (0 - child.getBounds().height) ||
                    child.x < (0 - child.getBounds().width) ||
                    child.x > (appViewDimension.width + child.getBounds().width) ||
                    child.id === interactiveGOKey
                )
            );

            lostAppContChildren.forEach(lostChild => {
                lostChild.destroy({children: true, texture: false, baseTexture: false});
            });
        };

        const worldGOs = {
            [worldAnimKey]: worldAnimation,
            [infiniteCloudsKey]: infiniteClouds,
            [infiniteGroundKey]: infiniteGround,
            [infiniteMeteorsKey]: infiniteMeteors,
            [infiniteIciclesKey]: infiniteIcicles,
        };

        let radialSceneAccessPullerTick;

        runPlayerEntryAnimation(
            app, slime,
            worldGOs,
            () => {
                lifeBars.visible = true;
            },
            () => {
                addPixiTick(app, levelOneTickKey, levelOneTick);
                addPixiTick(app, listenerKeys.menu.uiMenuPullerTick, radialSceneAccessPullerTick);
            },
            views.levelN,
            slimeStates.entry.onStart,
            null
        );

        const interactiveGOs = [
            ...meteors,
            ...icicles
        ];

        const handGOs = {
            left: hands.left.go,
            right: hands.right.go
        };

        addPixiTick(app, menuCollTickKey, () => menuCollRes(app, [], handGOs));

        const rightHand = {
            isHit: false,
            isOnCooldown: false,
            cooldownCircle: new PIXI.Graphics(),
            angle: -95,
            whichHand: 'rightHand',
        };
        rightHand.cooldownCircle.zIndex = hands.right.go.zIndex + 1;
        const leftHand = {
            isHit: false,
            isOnCooldown: false,
            cooldownCircle: new PIXI.Graphics(),
            angle: -95,
            whichHand: 'leftHand',
        };
        leftHand.cooldownCircle.zIndex = hands.left.go.zIndex + 1;

        levelOneTick = () => {
            checkCollision(app, hands.left, interactiveGOs, leftHand);
            checkCollision(app, hands.right, interactiveGOs, rightHand);
            checkPlayerEnvironment(interactiveGOs, slime, lifeBars);
            lifeHandlerTick(
                app, interactiveGOs, worldGOs,
                [levelOneTickKey, levelOneTick],
                handGOs,
                () => exitViewFn(views.levelN, true),
                () => exitViewFn(viewsMain),
                [menuCollTickKey, menuCollTick],
                lifeBars, listenerKeys.menu.uiMenuPullerTick
            );
        };

        radialSceneAccessPullerTick = () => {
            uiMenuContainer.getSceneRadialAccessPullerTick(
                app, hands, levelOneTickKey, levelOneTick, worldGOs, interactiveGOs, menuCollTickKey
            );
        };
    }, [props, lifeBars, creditsUiButton, returnUiButton, quitUiButton, audioUiButton])

    return(
        <Fragment></Fragment>
    );
};
