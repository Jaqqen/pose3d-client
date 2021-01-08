import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import { menuTopRight } from 'components/pixi.js/PixiJSMenu';
import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import {
    addPixiTick, addPixiTimeout, clearPixiTimeoutWithKey, pixiTimeouts, removePixiTick
} from 'components/pixi.js/SharedTicks';
import { viewConstant } from 'components/pixi.js/ViewConstants';

import React, { Fragment, useEffect } from 'react'
import { menu } from 'shared/IdConstants';
import { assetRsrc, goLabels, listenerKeys, views, viewsMain } from 'shared/Indentifiers';
import { logInfo } from 'shared/P3dcLogger';
import {
    getCloudsForScene, getCloudXDist, getGroundsByTypeForScene,
    defaultWorldAnimation, getFinishingFlag, runCharacterFinishAnimation, 
    runFlagEntryAnimation, runCharacterEntryAnimation, onScreenStartingX,
    removeCloudFromStageBeforeLevelStart, getLifeBars, lifeHandlerTick,
    onFinishLevel
} from "components/pixi.js/PixiJSGameObjects";
import { getRandomArbitrary, getRandomArbitraryInStep, getRandomChoiceOfArray } from 'shared/Utils';
import { checkCollision } from 'components/pixi.js/PixiJSCollision';
import { appViewDimension } from 'components/pixi.js/PixiJSMain';
import { UiMenu } from 'components/pixi.js/UiMenu';
import { uiMenuButton } from 'components/pixi.js/PixiJSButton';
import { quitBtnFn } from 'components/pixi.js/PixiJSMenu';

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

    const creditsUiButton = uiMenuButton(assetRsrc.ui.dollar, 'creditsSuffix', 'Credits');
    const returnUiButton = uiMenuButton(assetRsrc.ui.return, 'returnSuffix', 'Back');
    const quitUiButton = uiMenuButton(assetRsrc.ui.power, 'quitSuffix', 'Quit');

    useEffect(() => {
        logInfo('Logging PixiJS Level One useEffect');
        const { app, appContainer, hands, exitViewFn } = props;
        removeCloudFromStageBeforeLevelStart(app);

        const uiMenuContainer = new UiMenu();

        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: creditsUiButton,
            [goLabels.menu.ui.element.func]: () => {console.log("credits")},
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: returnUiButton,
            [goLabels.menu.ui.element.func]: () => exitViewFn(views.levels),
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: quitUiButton,
            [goLabels.menu.ui.element.func]: quitBtnFn,
        });

        // appContainer.addChild(menuTopRightButton);
        appContainer.addChild(lifeBars);
        appContainer.addChild(uiMenuContainer.getRadialAccessPuller());
        appContainer.addChild(uiMenuContainer.getRadialAccessButton());

        let levelOneTick;
        let menuCollTick;

        //? measures and tracking variables
        const worldWidth = appViewDimension.width * 5;
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
        const characterDummy = new PIXI.Sprite(PIXI.utils.TextureCache[assetRsrc.character.dummy]);

        //? interactive objects
        const interactiveGOKey = goLabels.interactive.go;
        const interactiveTickKey = goLabels.interactive.tick;

        let meteors = [];
        const amtMeteors = 8;
        const meteorBoundaryPadding = 5;
        const meteorAccelBounds = {
            x: {
                min: 5.2,
                max: 5.4,
            },
            y: {
                min: -3.4,
                max: -3.6,
            },
        };
        const meteorTimeoutRange = {
            min: 100,
            minInTick: 2500,
            max: 8000,
            step: 1900,
        };
        const meteorTickKeyPrefix = goLabels.level.one.projectiles.meteor.tickKeyPrefix;

        let icicles = [];
        const amtIcicles = 3;
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
            minInTick: 2000,
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

        const aboveGroundHeight = appViewDimension.height - groundWithDots[0].getBounds().height - 16;

        //? setup of scene
        characterDummy.position.y = aboveGroundHeight;
        appContainer.addChild(characterDummy);

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
                            [infiniteIciclesKey]: infiniteIcicles,
                        },
                        cleanUpOnFinish,
                        () => onFinishLevel(
                            app, interactiveGOs, worldGOs,
                            [levelOneTickKey, levelOneTick],
                            handGOs,
                            () => exitViewFn(views.levelN),
                            () => exitViewFn(viewsMain),
                            [menuCollTickKey, menuCollTick]
                        )
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
                                initiateMeteor, getRandomTimeout.icicle(), lostMeteor
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

        runCharacterEntryAnimation(
            app, characterDummy,
            worldGOs,
            () => {
                menuTopRightButton.visible = true;
                lifeBars.visible = true;
            },
            () => {
                addPixiTick(app, levelOneTickKey, levelOneTick);
                addPixiTick(app, listenerKeys.menu.uiMenuPullerTick, radialSceneAccessPullerTick)
            },
            views.levelN
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

        levelOneTick = () => {
            checkCollision(hands.left, interactiveGOs, characterDummy, lifeBars);
            checkCollision(hands.right, interactiveGOs, characterDummy, lifeBars);
            lifeHandlerTick(
                app, interactiveGOs, worldGOs,
                [levelOneTickKey, levelOneTick],
                handGOs,
                () => exitViewFn(views.levelN),
                () => exitViewFn(viewsMain),
                [menuCollTickKey, menuCollTick],
                lifeBars
            );
        };

        radialSceneAccessPullerTick = () => {
            uiMenuContainer.getSceneRadialAccessPullerTick(
                app, hands, levelOneTickKey, levelOneTick, worldGOs, interactiveGOs, menuCollTickKey
            );
        };
    }, [props, menuTopRightButton, lifeBars, creditsUiButton, returnUiButton, quitUiButton])

    return(
        <Fragment></Fragment>
    );
}
