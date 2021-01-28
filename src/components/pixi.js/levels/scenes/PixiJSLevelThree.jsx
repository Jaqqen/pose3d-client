import { CHAR_STATE, PixiGameChar } from "components/pixi.js/animations/PixiGameChar";
import { audioOnClick, shouldPlayAudio } from "components/pixi.js/PixiJSAudio";
import { uiMenuButton } from "components/pixi.js/PixiJSButton";
import { checkCollision, checkPlayerEnvironment, testForAABB } from "components/pixi.js/PixiJSCollision";
import { COLL_STATE, getCloudsForScene, getCloudXDist, getFinishingFlag, getGroundsByTypeForScene, getLifeBars, lifeHandlerTick, removeCloudFromStageBeforeLevelStart, runPlayerEntryAnimation, onScreenStartingX, runFlagEntryAnimation, runPlayerFinishAnimation, onFinishLevel, getLife } from "components/pixi.js/PixiJSGameObjects";
import { appViewDimension } from "components/pixi.js/PixiJSMain";
import { quitBtnFn } from "components/pixi.js/PixiJSMenu";
import { addPixiTick, addPixiTimeout, addSceneTweenByKey, clearPixiTimeoutWithKey, pixiTimeouts, removePixiTick, sceneTweens, deleteAllSceneTweens } from "components/pixi.js/SharedTicks";
import { UiMenu } from "components/pixi.js/UiMenu";
import { viewConstant } from "components/pixi.js/ViewConstants";
import gsap from "gsap/gsap-core";
import { Graphics, Point, Rectangle, Sprite, Texture, utils } from "pixi.js";
import { Fragment, useEffect } from "react";
import { levels } from "shared/IdConstants";
import { assetRsrc, envInteractionKey, goLabels, listenerKeys, views, viewsMain } from "shared/Indentifiers";
import { logInfo } from "shared/P3dcLogger";
import { doesObjectContainFunction, getRandomArbitrary } from "shared/Utils";

const getMomentumForJump = (startX, endX, currentX, constSpeed=null) => {
    let val = 0;
    const halfDist = (endX - startX)/3;
    const iMidX = startX + halfDist;
    if (currentX <= iMidX) {
        val = (iMidX - currentX) / halfDist;
    } else {
        val = (iMidX - currentX) / halfDist * 3;
        constSpeed ?? (val += constSpeed * 0.7);
    }
    return constSpeed ? constSpeed + val : val;
};
export const PixiJSLevelThree = (props) => {
    const lifeBars = getLifeBars(
        6, levels.lifeBar, viewConstant.lifeBarsDim.x, viewConstant.lifeBarsDim.y
    );
    lifeBars.zIndex = 80;
    lifeBars.visible = false;

    const audioUiButton = uiMenuButton(
        (shouldPlayAudio() === "true" ? assetRsrc.ui.pause : assetRsrc.ui.play),
        'audioSuffix',
        'Audio'
    );

    const returnUiButton = uiMenuButton(assetRsrc.ui.return, 'returnSuffix', 'Back');
    const quitUiButton = uiMenuButton(assetRsrc.ui.power, 'quitSuffix', 'Quit');
    const retryUiButton = uiMenuButton(assetRsrc.ui.retry, 'retrySuffix', 'Retry');

    useEffect(() => {
        logInfo('Logging PixiJS Level Two useEffect');
        const { app, appContainer, hands, exitViewFn } = props;
        removeCloudFromStageBeforeLevelStart(app);
        appContainer.addChild(lifeBars);

        const retryLevelFn = () => exitViewFn(views.levelX, true);
        const returnToViewsMainFn = () => exitViewFn(viewsMain);

        const handGOs = {
            left: hands.left.go,
            right: hands.right.go
        };

        const uiMenuContainer = new UiMenu();
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: audioUiButton,
            [goLabels.menu.ui.element.func]: () => audioOnClick.audioUiButtonOnComplete(audioUiButton),
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: returnUiButton,
            [goLabels.menu.ui.element.func]: returnToViewsMainFn,
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: quitUiButton,
            [goLabels.menu.ui.element.func]: quitBtnFn,
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: retryUiButton,
            [goLabels.menu.ui.element.func]: retryLevelFn,
        });
        appContainer.addChild(uiMenuContainer.getRadialAccessPuller());
        appContainer.addChild(uiMenuContainer.getRadialAccessButton());

        let levelThreeTick;
        let menuCollTick;
        const menuCollTickKey = listenerKeys.levelThreeScene.menuCollTick;
        const levelThreeTickKey = listenerKeys.levelThreeScene.mainTick;

        //? measures and tracking variables
        const initWorldTickSpeedX = 12;
        const slowdownWorldSpeedX = 0.16;
        let worldTickSpeedX = initWorldTickSpeedX;
        const initWorldTickSpeedY = 0;
        let worldTickSpeedY = initWorldTickSpeedY;
        let worldSpeedTween = null;
        const worldTweenKey = 'worldTweenKey';

        const worldAnimKey = listenerKeys.char.entry.worldAnim;

        //? non-interactive, world objects
        const groundBottoms = getGroundsByTypeForScene(11, assetRsrc.env.ground.dots);
        const belowGrounds = getGroundsByTypeForScene(7, assetRsrc.env.ground.underground.top);
        const uGroundBottoms = getGroundsByTypeForScene(8, assetRsrc.env.ground.underground.bottom);
        const overworldSmallTile = new Texture(utils.TextureCache[assetRsrc.env.ground.dots]);
        overworldSmallTile.frame = new Rectangle(0, 0, 500, overworldSmallTile.height);
        const belowGroundSmallTile = new Texture(utils.TextureCache[assetRsrc.env.ground.underground.top]);
        belowGroundSmallTile.frame = new Rectangle(0, 0, 500, belowGroundSmallTile.height);
        const ugSmallTile = new Texture(utils.TextureCache[assetRsrc.env.ground.underground.bottom]);
        ugSmallTile.frame = new Rectangle(0, 0, 500, ugSmallTile.height);
        const flagContainer = getFinishingFlag();

        const dfltGroundWidth = groundBottoms[0].width;
        const dfltGroundHeight = groundBottoms[0].height;

        const upperGroundOffsetY = 15;
        const defaultUpperGroundY =
            appViewDimension.height
            - dfltGroundHeight
            + upperGroundOffsetY;

        const trapholeWidth = 300;
        const ceilTrapWidth = 300;

        const wallGrounds = [];

        const clouds = [];
        const cloudsAmount = 4;

        const worldTicks = {};
        const interactiveGOs = [];

        //? character
        let slimeTween;
        const slimeTweenKey = 'slimeCharacterTweenKey';
        const slimeInitAnimSpeed = 0.1;
        const slime = new PixiGameChar(
            utils.TextureCache[assetRsrc.character.slime_spritesheet],
            64, 64,
            slimeInitAnimSpeed, true
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
            },
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
        const slimeCharY =
            defaultUpperGroundY
            - slime.character.height
            + 2.6*upperGroundOffsetY;
        slime.character.y = slimeCharY;
        slime.character.zIndex = 7;
        appContainer.addChild(slime.character);

        //? COLLIDER
        const collNameSuffix = 'ColliderName';
        const collTransparency = 0;
        const collPadd = 25;
        const goUpOne = {};
        const showTrigger1 = {};
        const normalizerOne = {};
        const goUpTwo = {};
        const showTrigger2 = {};
        const normalizerTwo = {};
        const stopAtWallGrass = {};
        const showTrigger3 = {};
        const infiniteTrigger1 = {}
        const recycle_icicleTrap = {}
        const goDown1 = {};
        const goDown1Response = {};
        const ceilTrap1 = {};
        const goFinish = {};
        const colliderArr = [
            goUpOne, showTrigger1, normalizerOne, goUpTwo, showTrigger2, normalizerTwo, stopAtWallGrass,
            showTrigger3, infiniteTrigger1, recycle_icicleTrap, goDown1, goDown1Response,
            ceilTrap1, goFinish
        ];
        colliderArr.forEach(collObj => {
            collObj.state = COLL_STATE.IDLE;

            collObj.collider = new Graphics();
            collObj.collider.beginFill(0xff0000, collTransparency);
            collObj.collider.drawRect(0,0, 200, 200);
            collObj.collider.endFill();
            collObj.collider.name = collNameSuffix;
            Object.defineProperty(collObj, 'setCollName', {
                set: function(namePrefix) { collObj.collider.name = namePrefix + collNameSuffix; }
            });
        });
        const mappedCollider = colliderArr.map(collObj => collObj.collider);

        //? TRAPS
        const trapholeStartOffset = slime.character.width + 10;
        const trapDisabledSuffix = '_DISABLED';
        const traphole1 = {};
        const traphole2 = {};
        const traphole3 = {};
        const traphole4 = {};
        const trapObjs = [
            traphole1, traphole2, traphole3, traphole4
        ];
        trapObjs.forEach(trapObj => {
            trapObj.state = COLL_STATE.IDLE;

            trapObj.collider = new Graphics();
            trapObj.collider.beginFill(0xff0000, collTransparency);
            trapObj.collider.drawRect(0,0, 200, 200);
            trapObj.collider.endFill();
            Object.defineProperty(trapObj, 'setCollName', {
                set: function(namePrefix) { trapObj.collider.name = namePrefix + collNameSuffix; }
            });
        });
        const mappedTraps = trapObjs.map(trapObj => trapObj.collider);
        const isTrapDisabled = (trapObj) => {
            return trapObj.collider.name.includes(trapDisabledSuffix);
        };

        const deathFall = () => {
            gsap.to(slime.character, {
                y: appViewDimension.height + slime.character.height,
                duration: 2,
                onComplete: () => {
                    lifeBars.children = 0;
                    lifeHandlerTick(
                        app,
                        interactiveGOs, worldTicks,
                        [levelThreeTickKey, levelThreeTick],
                        handGOs,
                        retryLevelFn,
                        returnToViewsMainFn,
                        [menuCollTickKey, menuCollTick],
                        lifeBars, listenerKeys.menu.uiMenuPullerTick
                    );
                }
            });
        }

        //? LIFE / LIFES / LIFECORES / LIFE CORES / LIFE-CORES
        const lcCollectorKey = 'lcCollectorTweenKey';
        const lifeCores = [];
        for (let i = 0; i < 4; i++) {
            const lifeCore = new Sprite(utils.TextureCache[assetRsrc.life.emerald]);
            lifeCore.scale.set(0.6);
            lifeCore.zIndex = -4;
            lifeCore.name = 'alive';
            lifeCores.push(lifeCore);
        }
        const lifeCoreCollectorTween = () => {
            const lcCollector = gsap.to({}, {
                onUpdate: () => {
                    for (const hKey of Object.keys(hands)) {
                        lifeCores.forEach(lc => {
                            if (lc.name === 'alive') {
                                if (testForAABB(lc, hands[hKey].go)) {
                                    lc.name = 'dead';
                                    appContainer.removeChild(lc);
                                    lifeBars.addChild(getLife(lifeBars.children.length));
                                }
                            }
                        })
                    }
                },
                repeat: -1,
            });
            addSceneTweenByKey(lcCollectorKey, lcCollector);
        }

        //? BRIDGE/BRIDGES
        const brgColor = 0x260c0c;
        const brgGoUpOne = {};
        const brgGoUpTwo = {};
        const brgGoUpThree = {};
        const brgGoUpFour = {};
        const noBrgTrap = {};
        const noBrgGoLeft = {};
        const brigdeObjs = [
            brgGoUpOne, brgGoUpTwo, noBrgTrap, noBrgGoLeft, brgGoUpThree, brgGoUpFour
        ];
        brigdeObjs.forEach((brgObj, index) => {
            brgObj.go = new Graphics();
            brgObj.go.beginFill(brgColor, 1);
            brgObj.go.drawRect(0,0, trapholeWidth+50, 50);
            brgObj.go.endFill();
            brgObj.go.zIndex = -4;
            brgObj.go.alpha = 0;

            brgObj.trigger = new Sprite(utils.TextureCache[assetRsrc.animation.trigger]);
            brgObj.trigger.scale.set(0.8);
            brgObj.trigger.anchor.set(0.5);
            brgObj.triggerTweenkey = envInteractionKey + 'bridge' + index + '_trigger_tween_key';
            brgObj.triggerRotationSpd = 0.1;
        });
        brgGoUpTwo.trigger.visible = false;
        noBrgTrap.trigger.visible =  false;
        noBrgGoLeft.trigger.visible = false;
        const mappedBrgGos = brigdeObjs.map(brgObj => brgObj.go);
        const mappedBrgTriggers = brigdeObjs.map(brgObj => brgObj.trigger);

        const startBridgeTriggerTween = (bridge, trapholeToDisable) => {
            const bridgeTriggerTween = gsap.to({}, {
                onUpdate: () => {
                    if (
                        appViewDimension.width > bridge.trigger.x && bridge.trigger.x > 0 &&
                        appViewDimension.height > bridge.trigger.y && bridge.trigger.y > 0
                    ) {
                        bridge.trigger.rotation += bridge.triggerRotationSpd;

                        for (const hKey of Object.keys(hands)) {
                            if (testForAABB(bridge.trigger, hands[hKey].go)) {
                                bridge.triggerRotationSpd = 0;

                                bridge.go.alpha = 1;
                                trapholeToDisable.collider.name += trapDisabledSuffix;
                                bridgeTriggerTween.kill();
                            }
                        }
                    }
                },
                repeat: -1,
            });
            addSceneTweenByKey(bridge.triggerTweenkey, bridgeTriggerTween);
        };

        const startNoBridgeTween = (noBridge, tweenToStart) => {
            const bridgeTriggerTween = gsap.to({}, {
                onUpdate: () => {
                    if (
                        appViewDimension.width > noBridge.trigger.x && noBridge.trigger.x > 0 &&
                        appViewDimension.height > noBridge.trigger.y && noBridge.trigger.y > 0
                    ) {
                        noBridge.trigger.rotation += noBridge.triggerRotationSpd;

                        for (const hKey of Object.keys(hands)) {
                            if (testForAABB(noBridge.trigger, hands[hKey].go)) {
                                noBridge.triggerRotationSpd = 0;

                                tweenToStart.play();
                                bridgeTriggerTween.kill();
                            }
                        }
                    }
                },
                repeat: -1,
            });
            addSceneTweenByKey(noBridge.triggerTweenkey, bridgeTriggerTween);
        };

        const killAllBridgeTriggerTweens = () => {
            brigdeObjs.forEach(brgObj => {
                if (doesObjectContainFunction(sceneTweens[brgObj.triggerTweenkey], 'kill')) {
                    sceneTweens[brgObj.triggerTweenkey].kill();
                }
            });
        };

        const afterBridgeNormalize = (currentColl, _bottomGround_, directionMultiplyer=1) => {
            if (
                sceneTweens[slimeTweenKey] &&
                doesObjectContainFunction(sceneTweens[slimeTweenKey], 'isActive') &&
                !sceneTweens[slimeTweenKey].isActive()
            ) {
                worldTickSpeedX = 1;

                slimeTween = gsap.to({}, {
                    duration: 3,
                    onUpdate: () => {
                        if (!(_bottomGround_.y < defaultUpperGroundY)) {
                            slimeTween.seek(3, false);
                            worldTickSpeedY = initWorldTickSpeedY;
                        } else {
                            slime.character.y -= -4;
                            worldObjects.forEach(wObj => {
                                wObj.y -= -4;
                            });
                        }
                    },
                    onComplete: () => {
                        const spdWrapper = {_spd: worldTickSpeedX};
                        worldSpeedTween = gsap.to(spdWrapper, {
                            duration: 4,
                            _spd: directionMultiplyer * initWorldTickSpeedX,
                            ease: "none",
                            onUpdate: () => {
                                worldTickSpeedX = spdWrapper._spd;
                            }
                        });
                        addSceneTweenByKey(worldTweenKey, worldSpeedTween);

                        let currentStartingX = onScreenStartingX;
                        if (directionMultiplyer === -1) {
                            currentStartingX = appViewDimension.width - onScreenStartingX;
                        }
                        slimeTween = gsap.to({}, {
                            delay: 0.5,
                            duration: 4,
                            onStart: () => {
                                slime.animationSpeed = 0.04;
                            },
                            onUpdate: () => {
                                if (slime.character.x <= currentStartingX) {
                                    slime.animationSpeed = slimeInitAnimSpeed;
                                    slimeTween.kill();
                                } else {
                                    slime.character.x -= 2;
                                }
                            },
                            onComplete: () => {
                                slime.animationSpeed = slimeInitAnimSpeed;
                            },
                        })
                        addSceneTweenByKey(slimeTweenKey, slimeTween);
                    },
                });
                addSceneTweenByKey(slimeTweenKey, slimeTween);
            } else {
                currentColl.state = COLL_STATE.IDLE;
            }
        };

        //? INTERACTIVE OBJECTS
        const interactiveGOKey = goLabels.interactive.go;
        const interactiveTickKey = goLabels.interactive.tick;
        const dfltZIndex = -7;

        const getRandomTimeout = (timeoutRanges) => {
            return getRandomArbitrary(
                timeoutRanges.minInTick,
                timeoutRanges.max,
                timeoutRanges.step
            );
        };

        ////* METEORS
        const meteorTickKeyPrefix = goLabels.level.one.projectiles.meteor.tickKeyPrefix;
        const infiniteMeteorsKey = listenerKeys.game.object.meteors.own;
        const meteorBoundaryPadding = 5;
        const meteorAmount = 8;
        const meteors = [];
        const tweenMeteorAmount = 3;
        const tweenMeteors = [];
        const meteorTimeoutRange = { min: 100, minInTick: 1000, max: 8000, step: 1900, };
        const meteorAccelBounds = {
            x: { min: 4.2, max: 4.4, }, ySlow: { min: -0.3, max: -0.6, },
            yFast: {min: -2.2, max: -2.4},
        };

        const createAndGetMeteorWithNum = (tmpMeteorNum, meteorArr, _isSpawnedLeft=null) => {
            const tmpMeteor = new Sprite(utils.TextureCache[assetRsrc.projectile.meteor]);
            tmpMeteor.scale.set(0.6);
            tmpMeteor.acceleration = new Point(-10, -10);
            tmpMeteor.id = interactiveGOKey;
            tmpMeteor.zIndex = dfltZIndex;
            const tmpMeteorKey = meteorTickKeyPrefix + tmpMeteorNum

            if (_isSpawnedLeft) {
                meteorArr.push({
                    [interactiveGOKey]: tmpMeteor,
                    [interactiveTickKey]: tmpMeteorKey,
                    isSpawnedLeft: _isSpawnedLeft,
                });
            } else {
                meteorArr.push({
                    [interactiveGOKey]: tmpMeteor,
                    [interactiveTickKey]: tmpMeteorKey,
                });
            }

            return meteorArr.find(meteorO => meteorO[interactiveTickKey] === tmpMeteorKey);
        };

        for (let i = 0; i < tweenMeteorAmount; i++) {
            createAndGetMeteorWithNum(i, tweenMeteors)
        }
        const tweenMeteorGos = tweenMeteors.map(tMeteor => tMeteor[interactiveGOKey]);
        const refreshTweenMeteorGos = () => {
            tweenMeteorGos.forEach(tMeteor => {
                tMeteor.acceleration = new Point(-10, -10);
                tMeteor.id = interactiveGOKey;
            });
        };

        for (let i = 0; i < meteorAmount; i++) {
            const isSpawnedLeft = i % 2 === 0 ? true : false;
            const tmpMeteor = createAndGetMeteorWithNum(i, meteors, isSpawnedLeft);
            const tmpMeteorGo = tmpMeteor[interactiveGOKey];
            tmpMeteorGo.angle = 45;
            if (isSpawnedLeft) {
                tmpMeteorGo.scale.x = -0.6;
                tmpMeteorGo.angle = -45;
            }
            tmpMeteorGo.x = -400;
            tmpMeteorGo.y = -400;
        }
        const meteorGosOnly = meteors.map(meteor => meteor[interactiveGOKey]);
        const initiateMeteor = (meteor) => {
            const meteorGo = meteor[interactiveGOKey];
            const meteorKey = meteor[interactiveTickKey];
            const isSpawnedLeft = meteor.isSpawnedLeft;
            removePixiTick(app, meteorKey);

            meteorGo.acceleration = new Point(0);
            meteorGo.id = interactiveGOKey;

            meteorGo.y = getRandomArbitrary(
                dfltGroundHeight * 1.3 + meteorBoundaryPadding,
                appViewDimension.height - 1.5*dfltGroundHeight - meteorBoundaryPadding
            );
            meteorGo.x = isSpawnedLeft
                ? 0 - meteorGo.width - meteorBoundaryPadding
                : appViewDimension.width + meteorBoundaryPadding;
            const horizontalAccel = getRandomArbitrary(
                    meteorAccelBounds.x.min, meteorAccelBounds.x.max
                ) * (isSpawnedLeft ? -1 : 1);
            meteorGo.acceleration.set(
                horizontalAccel,
                getRandomArbitrary(meteorAccelBounds.ySlow.min, meteorAccelBounds.ySlow.max)
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
                        > ( appViewDimension.height
                            + meteor[interactiveGOKey].getBounds().height
                            + meteorBoundaryPadding
                        ) ||
                    meteor[interactiveGOKey].y 
                        < ( 0
                            - meteor[interactiveGOKey].getBounds().height
                            - meteorBoundaryPadding
                        ) ||
                    meteor[interactiveGOKey].x
                        < ( 0
                            - meteor[interactiveGOKey].getBounds().width
                            - meteorBoundaryPadding * 2
                        ) ||
                    meteor[interactiveGOKey].x
                        > ( appViewDimension.width
                            + meteor[interactiveGOKey].getBounds().width
                            + meteorBoundaryPadding * 2
                        )
                )
            );

            if (lostMeteors.length > 0) {
                lostMeteors.forEach(lostMeteor => {
                    const meteorKey = lostMeteor[interactiveTickKey];
                    if (!(meteorKey in pixiTimeouts)) {
                        const timeoutId = setTimeout(
                            initiateMeteor, getRandomTimeout(meteorTimeoutRange), lostMeteor
                        );
                        addPixiTimeout(meteorKey, timeoutId);
                    }
                });
            }
        }

        ////* ICICLES
        const icicleTickKeyPrefix = goLabels.level.one.projectiles.icicle.tickKeyPrefix;
        const icicleBoundaryPadding = 10;
        const icicles = [];

        const getIcicleByTickKeyNumber = (num) => {
            return icicles.find(icicleO => icicleO[interactiveTickKey] === icicleTickKeyPrefix + num);
        };

        const createAndGetIcicleWithNum = (tmpIcicleNum) => {
            const tmpIcicle = new Sprite(utils.TextureCache[assetRsrc.projectile.icicle]);
            tmpIcicle.scale.set(0.6);
            tmpIcicle.acceleration = new Point(0, -10);
            tmpIcicle.id = interactiveGOKey;
            tmpIcicle.zIndex = dfltZIndex;
            const tmpIcicleKey = icicleTickKeyPrefix + tmpIcicleNum

            icicles.push({
                [interactiveGOKey]: tmpIcicle,
                [interactiveTickKey]: tmpIcicleKey,
            });

            return icicles.find(icicleO => icicleO[interactiveTickKey] === tmpIcicleKey);
        };

        const startCeilTrapTween = (icicleNum) => {
            const icicleO = getIcicleByTickKeyNumber(icicleNum);
            const ceilTrapTween = gsap.to({}, {
                duration: 6,
                ease: "power3.inOut",
                onUpdate: () => {
                    icicleO[interactiveGOKey].x -= icicleO[interactiveGOKey].acceleration.x;
                    icicleO[interactiveGOKey].y -= icicleO[interactiveGOKey].acceleration.y;

                    if (
                        icicleO[interactiveGOKey].y > appViewDimension.height ||
                        icicleO[interactiveGOKey].y
                            < ( - icicleO[interactiveGOKey].getBounds().height * 2
                                - icicleBoundaryPadding
                            ) ||
                        icicleO[interactiveGOKey].x
                            < ( - icicleO[interactiveGOKey].getBounds().width
                                - icicleBoundaryPadding
                            ) ||
                        icicleO[interactiveGOKey].x
                            > ( appViewDimension.width
                                + icicleO[interactiveGOKey].getBounds().width
                                + icicleBoundaryPadding
                            )
                    ) {
                        if (ceilTrapTween) { ceilTrapTween.kill(); }
                        appContainer.removeChild(icicleO[interactiveGOKey]);
                    }
                },
            });
            addSceneTweenByKey('iciclesTween' + icicleNum, ceilTrapTween);
        };
        const recycleIcicleTrapTween = (icicleNum, _colliderObj=null, noX=null) => {
            const icicleO = getIcicleByTickKeyNumber(icicleNum);
            const icicleGo = icicleO[interactiveGOKey];
            icicleGo.x = slime.character.x;
            icicleGo.y = -icicleGo.height - icicleBoundaryPadding;
            icicleGo.acceleration.x = noX || Math.abs(worldTickSpeedX);
            icicleGo.acceleration.y = -10;
            icicleGo.id = goLabels.interactive.go;
            appContainer.addChild(icicleGo);
            startCeilTrapTween(icicleNum);
            if (_colliderObj) {
                _colliderObj.collider.x -= 2*dfltGroundWidth;
                _colliderObj.state = COLL_STATE.IDLE;
            }
        }

        ////* GRASS / GRASSES / BUSH / BUSHES
        const bushTickKeyPrefix = goLabels.level.env.bush.spiky.tickKeyPrefix;
        const bushBoundaryPadding = 20;
        const bushAmount = 10;
        const bushes = [];

        const getBushByTickKeyNumber = (num) => {
            return bushes.find(bushO => bushO[interactiveTickKey] === bushTickKeyPrefix + num);
        };

        const createAndGetBushWithNum = (tmpBushNum) => {
            const tmpBush = new Sprite(utils.TextureCache[assetRsrc.env.bush.spiky]);
            tmpBush.scale.set(0.6);
            tmpBush.acceleration = new Point(0, 0);
            tmpBush.id = interactiveGOKey;
            tmpBush.zIndex = dfltZIndex;
            const tmpBushKey = bushTickKeyPrefix + tmpBushNum

            bushes.push({
                [interactiveGOKey]: tmpBush,
                [interactiveTickKey]: tmpBushKey,
            });

            return bushes.find(bushO => bushO[interactiveTickKey] === tmpBushKey);
        };

        for (let i = 1; i <= bushAmount; i++) {
            createAndGetBushWithNum(i);
        }

        const bushCollisionResponse = (bushO) => {
            const bushGo = bushO[interactiveGOKey];
            const bushKey = bushO[interactiveTickKey];
            const bushTick = () => {
                bushGo.x -= bushGo.acceleration.x;
                bushGo.y -= bushGo.acceleration.y;
            };
            addPixiTick(app, bushKey, bushTick);
        };

        //? CLOUDS
        const setDistributedCloudsIntoContainer = (
            _cloudsAmount, startPosition, heightConstraint,
            startY=0
        ) => {
            const _clouds = getCloudsForScene(_cloudsAmount);

            _clouds.forEach((_c, index) => {
                _c.x = startPosition + index * getCloudXDist();
                _c.y = Math
                    .floor(getRandomArbitrary(
                        startY, heightConstraint - _c.height)
                    );
                _c.zIndex = -20;
                clouds.push(_c);
            });
        };

        //? GROUND / GROUND SETUP
        const jumpGroundGap = 600;
        [...groundBottoms, ...uGroundBottoms].forEach((ground, index) => {
            switch (index) {
                case 0: {
                    ground.x = 0;
                    ground.y = defaultUpperGroundY;
                    setDistributedCloudsIntoContainer(
                        cloudsAmount, 0, appViewDimension.height/3
                    );
                    break;
                }
                case 1: {
                    ground.x = dfltGroundWidth;
                    ground.y = defaultUpperGroundY;
                    setDistributedCloudsIntoContainer(
                        cloudsAmount, dfltGroundWidth, appViewDimension.height/3
                    );
                    setDistributedCloudsIntoContainer(
                        cloudsAmount, dfltGroundWidth, appViewDimension.height/3,
                        -(appViewDimension.height/3)
                    );

                    brgGoUpOne.trigger.x =
                        2*dfltGroundWidth - (brgGoUpOne.trigger.width * 0.75) - collPadd;
                    brgGoUpOne.trigger.y =
                        defaultUpperGroundY + (brgGoUpOne.trigger.height * 0.75) + collPadd;
                    brgGoUpOne.go.clear();
                    brgGoUpOne.go.beginFill(brgColor, 1);
                    brgGoUpOne.go.moveTo(2*dfltGroundWidth-50, ground.y);
                    brgGoUpOne.go.lineTo(2*dfltGroundWidth, ground.y);
                    brgGoUpOne.go.lineTo(
                        2*dfltGroundWidth + trapholeWidth,
                        defaultUpperGroundY - dfltGroundHeight - 1
                    );
                    brgGoUpOne.go.lineTo(
                        2*dfltGroundWidth + trapholeWidth + 50,
                        defaultUpperGroundY - dfltGroundHeight - 1
                    );
                    brgGoUpOne.go.lineTo(
                        2*dfltGroundWidth + trapholeWidth + 50,
                        defaultUpperGroundY - dfltGroundHeight + 49
                    );
                    brgGoUpOne.go.lineTo(
                        2*dfltGroundWidth + trapholeWidth,
                        defaultUpperGroundY - dfltGroundHeight + 49
                    );
                    brgGoUpOne.go.lineTo(2*dfltGroundWidth, ground.y + 49);
                    brgGoUpOne.go.lineTo(2*dfltGroundWidth-50, ground.y + 49);
                    brgGoUpOne.go.moveTo(2*dfltGroundWidth-50, ground.y);
                    brgGoUpOne.go.closePath();
                    brgGoUpOne.go.endFill();
                    startBridgeTriggerTween(brgGoUpOne, traphole1);
                    break;
                }
                case 2: {
                    ground.texture = overworldSmallTile;
                    ground.x = 2*dfltGroundWidth + trapholeWidth;
                    ground.y = defaultUpperGroundY - dfltGroundHeight;
                    setDistributedCloudsIntoContainer(
                        cloudsAmount, ground.x, appViewDimension.height/3
                    );
                    setDistributedCloudsIntoContainer(
                        cloudsAmount, ground.x, appViewDimension.height/3,
                        -(appViewDimension.height/3)
                    );
                    setDistributedCloudsIntoContainer(
                        cloudsAmount, ground.x, appViewDimension.height/3,
                        -(2 * (appViewDimension.height/3))
                    );
                    const belowGround = new Sprite(belowGroundSmallTile);
                    belowGround.x = ground.x;
                    belowGround.y = defaultUpperGroundY;

                    goUpOne.collider.x = ground.x - trapholeWidth + (slime.character.width/3);
                    goUpOne.collider.y = defaultUpperGroundY;
                    goUpOne.setCollName = 'goUpOne';

                    traphole1.collider.x = ground.x - trapholeWidth + (slime.character.width * 0.8);
                    traphole1.collider.y = ground.y;
                    traphole1.collider.height = 600;
                    traphole1.setCollName = 'traphole1';

                    showTrigger1.collider.x = ground.x - trapholeWidth + trapholeStartOffset;
                    showTrigger1.collider.y = ground.y;
                    showTrigger1.collider.height = 100;
                    showTrigger1.setCollName = "showTrigger1";

                    const icicleObj = createAndGetIcicleWithNum(0);
                    icicleObj[interactiveGOKey].x =
                        2*dfltGroundWidth + trapholeStartOffset - icicleBoundaryPadding;
                    icicleObj[interactiveGOKey].y =
                        0 - icicleObj[interactiveGOKey].height - icicleBoundaryPadding;

                    normalizerOne.collider.x = ground.x;
                    normalizerOne.collider.y = ground.y - normalizerOne.collider.height;
                    normalizerOne.setCollName = 'normalizerOne';

                    brgGoUpTwo.trigger.x = ground.x + brgGoUpOne.trigger.width + collPadd;
                    brgGoUpTwo.trigger.y = defaultUpperGroundY - 3*dfltGroundHeight - brgGoUpTwo.trigger.height*0.75;
                    brgGoUpTwo.go.clear();
                    brgGoUpTwo.go.beginFill(brgColor, 1);
                    brgGoUpTwo.go.moveTo(ground.x + overworldSmallTile.width-50, ground.y);
                    brgGoUpTwo.go.lineTo(ground.x + overworldSmallTile.width, ground.y);
                    brgGoUpTwo.go.lineTo(
                        ground.x + overworldSmallTile.width + trapholeWidth,
                        ground.y - dfltGroundHeight - 1
                    );
                    brgGoUpTwo.go.lineTo(
                        ground.x + overworldSmallTile.width + trapholeWidth + 50,
                        ground.y - dfltGroundHeight - 1
                    );
                    brgGoUpTwo.go.lineTo(
                        ground.x + overworldSmallTile.width + trapholeWidth + 50,
                        ground.y - dfltGroundHeight + 49
                    );
                    brgGoUpTwo.go.lineTo(
                        ground.x + overworldSmallTile.width + trapholeWidth,
                        ground.y - dfltGroundHeight + 49
                    );
                    brgGoUpTwo.go.lineTo(ground.x + overworldSmallTile.width, ground.y + 49);
                    brgGoUpTwo.go.lineTo(ground.x + overworldSmallTile.width-50, ground.y + 49);
                    brgGoUpTwo.go.moveTo(ground.x + overworldSmallTile.width-50, ground.y);
                    brgGoUpTwo.go.closePath();
                    brgGoUpTwo.go.endFill();
                    break;
                }
                case 3: {
                    ground.x = 2*dfltGroundWidth + 2*trapholeWidth + overworldSmallTile.width;
                    ground.y = defaultUpperGroundY - 2 * dfltGroundHeight;

                    setDistributedCloudsIntoContainer(
                        cloudsAmount,
                        ground.x,
                        appViewDimension.height/3,
                        -(2 * (appViewDimension.height/3))
                    );
                    const belowGround = new Sprite(belowGroundSmallTile);
                    belowGround.x = ground.x;
                    belowGround.y = defaultUpperGroundY - dfltGroundHeight;
                    const bottomGround = new Sprite(ugSmallTile);
                    bottomGround.x = ground.x;
                    bottomGround.y = defaultUpperGroundY;

                    goUpTwo.collider.x = ground.x - trapholeWidth + slime.character.width/3;
                    goUpTwo.collider.y = ground.y + goUpTwo.collider.height;
                    goUpTwo.setCollName = 'goUpTwo';

                    traphole2.collider.x = ground.x - trapholeWidth + (slime.character.width * 0.8);
                    traphole2.collider.y = ground.y;
                    traphole2.collider.height = 600;
                    traphole2.setCollName = "traphole2";

                    showTrigger2.collider.x = ground.x - trapholeWidth + trapholeStartOffset;
                    showTrigger2.collider.y = ground.y;
                    showTrigger2.collider.height = 100;
                    showTrigger2.setCollName = "showTrigger2";

                    noBrgTrap.trigger.x = ground.x + noBrgTrap.trigger.width + collPadd;
                    noBrgTrap.trigger.y = ground.y + noBrgTrap.trigger.height/2 + collPadd;

                    normalizerTwo.collider.x = ground.x;
                    normalizerTwo.collider.y = ground.y - normalizerTwo.collider.height;
                    normalizerTwo.setCollName = 'normalizerTwo';
                    break;
                }
                case 4: {
                    ground.x = 3*dfltGroundWidth + 2*trapholeWidth + overworldSmallTile.width;
                    ground.y = defaultUpperGroundY - 2 * dfltGroundHeight;

                    stopAtWallGrass.collider.x = ground.x;
                    stopAtWallGrass.collider.y = ground.y - stopAtWallGrass.collider.height;
                    stopAtWallGrass.collider.width = 400;
                    stopAtWallGrass.setCollName = 'stopAtWallGrass';

                    showTrigger3.collider.x = ground.x + dfltGroundWidth*0.6;
                    showTrigger3.collider.y = ground.y - showTrigger3.collider.height;
                    showTrigger3.setCollName = "showTrigger3";

                    noBrgGoLeft.trigger.x = showTrigger3.collider.x + noBrgGoLeft.trigger.width + collPadd
                    noBrgGoLeft.trigger.y = ground.y + noBrgGoLeft.trigger.height/2 + collPadd;

                    const bushObj = createAndGetBushWithNum(0);
                    bushObj[interactiveGOKey].angle = -90;
                    bushObj[interactiveGOKey].x =
                        ground.x + dfltGroundWidth*0.9 - bushObj[interactiveGOKey].width - bushBoundaryPadding;
                    bushObj[interactiveGOKey].y = ground.y - slime.character.height/2;
                    bushObj[interactiveGOKey].id = goLabels.interactive.collDis;
                    break;
                }
                case 5: {
                    belowGrounds[0].x = 3*dfltGroundWidth + 2*trapholeWidth + overworldSmallTile.width - jumpGroundGap;
                    belowGrounds[0].y = defaultUpperGroundY - 5*dfltGroundHeight;

                    ground.x = belowGrounds[0].x;
                    ground.y = belowGrounds[0].y - dfltGroundHeight;

                    infiniteTrigger1.collider.x = ground.x;
                    infiniteTrigger1.collider.y = ground.y - infiniteTrigger1.collider.height;
                    infiniteTrigger1.setCollName = 'infiniteTrigger1';

                    recycle_icicleTrap.collider.x = ground.x;
                    recycle_icicleTrap.collider.y = ground.y;
                    recycle_icicleTrap.setCollName = 'recycle_icicleTrap';

                    bushes.forEach((bushO, index) => {
                        if (bushO[interactiveTickKey] !== bushTickKeyPrefix+0) {
                            const bush = bushO[interactiveGOKey];
                            bush.x = ground.x - index * dfltGroundWidth/2;
                            bush.y = ground.y - bush.height*0.9;
                            bushCollisionResponse(bushO);
                        }
                    });
                    break;
                }
                case 6: {
                    ground.x = belowGrounds[0].x - dfltGroundWidth;
                    ground.y = groundBottoms[5].y;
                    break;
                }
                case 7: {
                    ground.x = groundBottoms[6].x - dfltGroundWidth;
                    ground.y = groundBottoms[6].y;
                    break;
                }
                case 8: {
                    ground.x = groundBottoms[7].x - dfltGroundWidth;
                    ground.y = groundBottoms[7].y;
                    break;
                }
                case 9: {
                    ground.x = groundBottoms[8].x - dfltGroundWidth;
                    ground.y = groundBottoms[8].y;
                    break;
                }
                case 10: {
                    ground.x = groundBottoms[9].x - dfltGroundWidth;
                    ground.y = groundBottoms[9].y;
                    belowGrounds[1].x = ground.x;
                    belowGrounds[1].y = ground.y + dfltGroundHeight;

                    const groundDiff = belowGrounds[0].x - ground.x;
                    lifeCores.forEach((lCore, index) => {
                        lCore.x = groundDiff/(index+1);
                        lCore.y = getRandomArbitrary(
                            ground.y-300, ground.y-500
                        );
                        appContainer.addChild(lCore);
                    });

                    goDown1.collider.x = ground.x;
                    goDown1.collider.y = ground.y - goDown1.collider.height;
                    goDown1.setCollName = 'goDown1';
                    break;
                }
                case 11: {
                    //* UG starts here
                    ground.x = groundBottoms[10].x - dfltGroundWidth/2;
                    ground.y = groundBottoms[10].y + 3*appViewDimension.height;

                    goDown1Response.collider.x = ground.x;
                    goDown1Response.collider.y = ground.y + slime.character.height - 4.6*upperGroundOffsetY;;
                    goDown1Response.collider.width = dfltGroundWidth;
                    goDown1Response.setCollName = 'goDown1Response';
                    break;
                }
                case 12: {
                    ground.x = uGroundBottoms[0].x + dfltGroundWidth;
                    ground.y = uGroundBottoms[0].y;
                    break;
                }
                case 13: {
                    ground.x = uGroundBottoms[1].x + dfltGroundWidth;
                    ground.y = uGroundBottoms[1].y;

                    belowGrounds[2].x = ground.x;
                    belowGrounds[2].y = ground.y - appViewDimension.height + 0.85*dfltGroundHeight;
                    break;
                }
                case 14: {
                    ground.x = uGroundBottoms[2].x + dfltGroundWidth + trapholeWidth;
                    ground.y = uGroundBottoms[2].y;
                    traphole3.collider.x = ground.x - trapholeWidth + (slime.character.width * 0.8);
                    traphole3.collider.y = ground.y;
                    traphole3.collider.height = 600;
                    traphole3.setCollName = "traphole3";
                    brgGoUpThree.trigger.x = ground.x - trapholeWidth - brgGoUpThree.trigger.width*0.8 - collPadd;
                    brgGoUpThree.trigger.y = ground.y + brgGoUpThree.trigger.height*0.8 + collPadd;
                    brgGoUpThree.go.x = ground.x - trapholeWidth - 30;
                    brgGoUpThree.go.y = ground.y;
                    startBridgeTriggerTween(brgGoUpThree, traphole3);

                    belowGrounds[3].x = belowGrounds[2].x + dfltGroundWidth;
                    belowGrounds[3].y = belowGrounds[2].y;
                    break;
                }
                case 15: {
                    ground.x = uGroundBottoms[3].x + dfltGroundWidth;
                    ground.y = uGroundBottoms[3].y;

                    belowGrounds[4].x = belowGrounds[3].x + dfltGroundWidth + ceilTrapWidth;
                    belowGrounds[4].y = belowGrounds[3].y;
                    ceilTrap1.collider.x = belowGrounds[4].x - ceilTrapWidth;
                    ceilTrap1.collider.y = ground.y-50;
                    ceilTrap1.setCollName = 'ceilTrap1';
                    const ceilIcicle = createAndGetIcicleWithNum(1);
                    ceilIcicle[interactiveGOKey].x = ceilTrap1.collider.x + 100;
                    ceilIcicle[interactiveGOKey].y = belowGrounds[4].y - ceilIcicle[interactiveGOKey].height - icicleBoundaryPadding;
                    brgGoUpFour.trigger.x = belowGrounds[4].x + brgGoUpFour.trigger.width*0.8;
                    brgGoUpFour.trigger.y = belowGrounds[4].y + brgGoUpFour.trigger.height*0.8;
                    startBridgeTriggerTween(brgGoUpFour, traphole4);

                    break;
                }
                case 16: {
                    ground.x = uGroundBottoms[4].x + dfltGroundWidth + trapholeWidth;
                    ground.y = uGroundBottoms[4].y;
                    traphole4.collider.x = ground.x - trapholeWidth + (slime.character.width * 0.8);
                    traphole4.collider.y = ground.y;
                    traphole4.collider.height = 600;
                    traphole4.setCollName = "traphole4";
                    brgGoUpFour.go.x = ground.x - trapholeWidth - 30;
                    brgGoUpFour.go.y = ground.y;

                    belowGrounds[5].x = belowGrounds[4].x + dfltGroundWidth;
                    belowGrounds[5].y = belowGrounds[4].y;
                    break;
                }
                case 17: {
                    ground.x = uGroundBottoms[5].x + dfltGroundWidth;
                    ground.y = uGroundBottoms[5].y;

                    belowGrounds[6].x = belowGrounds[5].x + dfltGroundWidth;
                    belowGrounds[6].y = belowGrounds[5].y;
                    break;
                }
                case 18: {
                    ground.x = uGroundBottoms[6].x + dfltGroundWidth;
                    ground.y = uGroundBottoms[6].y;

                    goFinish.collider.x = ground.x;
                    goFinish.collider.y = ground.y - 200;
                    goFinish.setCollName = 'goFinish';
                    break;
                }
                default:
                    break;
            }
        });

        //? DIMMER
        const ugDimmer = new Graphics();
        ugDimmer.beginFill(0x444444, 1);
        ugDimmer.drawRect(0,0, appViewDimension.width, appViewDimension.height);
        ugDimmer.endFill();
        ugDimmer.alpha = 0;
        ugDimmer.zIndex = 15;
        appContainer.addChild(ugDimmer);
        const ugDimmerTweenKey = 'ugDimmerTweenKey';
        const startUGDimming = (alphaValue, delay) => {
            const ugDimmerTween = gsap.to(ugDimmer, {
                duration: 6,
                delay: delay,
                alpha: alphaValue,
                ease: "power2.inOut",
            });
            addSceneTweenByKey(ugDimmerTweenKey, ugDimmerTween);
        };

        const icicleGosOnly = icicles.map(icicle => icicle[interactiveGOKey]);
        const bushGosOnly = bushes.map(bush => bush[interactiveGOKey]);
        interactiveGOs.push(
            ...meteors,
            ...tweenMeteors,
            ...icicles,
            ...bushes,
        );
        //? WORLD
        const worldObjects = [
            ...clouds,
            ...groundBottoms,
            ...belowGrounds,
            ...uGroundBottoms,
            ...wallGrounds,
            ...mappedCollider,
            ...mappedBrgGos,
            ...mappedBrgTriggers,
            ...mappedTraps,
            ...icicleGosOnly,
            ...bushGosOnly,
            ...lifeCores
        ];
        worldObjects.forEach(wObj => {
            appContainer.addChild(wObj);
        });

        const cleanUpOnFinish = () => {
            const lostAppContChildren = appContainer.children.filter(
                child => (
                    child.y > (
                        appViewDimension.height
                        - dfltGroundHeight
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

        const worldAnimation = () => {
            worldObjects.forEach((worldObj,idx) => {
                worldObj.x -= worldTickSpeedX;
                worldObj.y -= worldTickSpeedY;

                if (worldObj.name && worldObj.name.toLowerCase().includes('collidername')) {
                    const currentColl = [...colliderArr, ...trapObjs].find(collObj => (
                        collObj.state !== COLL_STATE.TRIGGERED &&
                        collObj.collider.name === worldObj.name
                    ));
                    if (currentColl) {
                        if (testForAABB(currentColl.collider, slime.character)) {
                            currentColl.state = COLL_STATE.TRIGGERED;

                            switch (currentColl.collider.name) {
                                case 'goUpOne'+collNameSuffix: {
                                    if (isTrapDisabled(traphole1)) {
                                        worldTickSpeedX = 0;
                                        worldTickSpeedY = 0;
                                        slimeTween = gsap
                                            .timeline()
                                            .to(slime.character, {
                                                duration: 2.5,
                                                x: groundBottoms[2].x - slime.character.width * 0.7,
                                                y: groundBottoms[2].y - slime.character.height * 0.65,
                                                ease: "none",
                                            })
                                            .to(slime.character, {
                                                duration: 1,
                                                x: groundBottoms[2].x,
                                                ease: "none"
                                            });
                                        addSceneTweenByKey(slimeTweenKey, slimeTween);
                                    } else {
                                        if (doesObjectContainFunction(
                                            sceneTweens[brgGoUpOne.triggerTweenkey], 'kill'
                                        )) {
                                            sceneTweens[brgGoUpOne.triggerTweenkey].kill();
                                        }
                                    }
                                    break;
                                }
                                case 'traphole1'+collNameSuffix: {
                                    worldTickSpeedX = 0;

                                    killAllBridgeTriggerTweens();
                                    deathFall();
                                    break;
                                }
                                case 'showTrigger1'+collNameSuffix: {
                                    brgGoUpTwo.trigger.visible = true;
                                    startBridgeTriggerTween(brgGoUpTwo, traphole2);

                                    startCeilTrapTween(0);
                                    break;
                                }
                                case 'normalizerOne'+collNameSuffix: {
                                    afterBridgeNormalize(currentColl, groundBottoms[2]);
                                    break;
                                }
                                case 'goUpTwo'+collNameSuffix: {
                                    if (isTrapDisabled(traphole2)) {
                                        if (
                                            sceneTweens[worldTweenKey] &&
                                            doesObjectContainFunction(sceneTweens[worldTweenKey], 'isActive') &&
                                            sceneTweens[worldTweenKey].isActive()
                                        ) {
                                            sceneTweens[worldTweenKey].kill();
                                        }
                                        worldTickSpeedX = 0;
                                        worldTickSpeedY = 0;

                                        slimeTween = gsap
                                            .timeline()
                                            .to(slime.character, {
                                                duration: 2.5,
                                                x: groundBottoms[3].x - slime.character.width * 0.7,
                                                y: groundBottoms[3].y - slime.character.height * 0.65,
                                                ease: "none",
                                            })
                                            .to(slime.character, {
                                                duration: 1,
                                                x: groundBottoms[3].x,
                                                ease: "none"
                                            });
                                        addSceneTweenByKey(slimeTweenKey, slimeTween);
                                    }
                                    break;
                                }
                                case 'traphole2'+collNameSuffix: {
                                    worldTickSpeedX = 0;

                                    killAllBridgeTriggerTweens();
                                    deathFall();
                                    break;
                                }
                                case 'showTrigger2'+collNameSuffix: {
                                    const meteorTween = gsap.to({}, {
                                        paused: true,
                                        duration: 6,
                                        ease: "power3.inOut",
                                        onStart: () => {
                                            tweenMeteorGos.forEach((tMeteor, index) => {
                                                tMeteor.x = 0 - tMeteor.width - meteorBoundaryPadding;
                                                tMeteor.y =
                                                    slime.character.y
                                                    + 1.5*tMeteor.height
                                                    - tMeteor.height*(1 + index * 0.5);
                                                tMeteor.scale.x = -0.6;
                                                tMeteor.angle = -45;
        
                                                appContainer.addChild(tMeteor);
                                            });
                                        },
                                        onUpdate: () => {
                                            tweenMeteorGos.forEach(tMeteor => {
                                                tMeteor.x -= tMeteor.acceleration.x;

                                                const lostMeteors = tweenMeteorGos.filter(_tMeteor => (
                                                        _tMeteor.y > appViewDimension.height ||
                                                        _tMeteor.y
                                                            < (
                                                                0
                                                                - _tMeteor.getBounds().height * 2
                                                                - meteorBoundaryPadding
                                                            ) ||
                                                        _tMeteor.x
                                                            < (
                                                                0
                                                                - _tMeteor.getBounds().width * 2
                                                                - meteorBoundaryPadding
                                                            ) ||
                                                        _tMeteor.x
                                                            > (
                                                                appViewDimension.width
                                                                + _tMeteor.getBounds().width
                                                                + meteorBoundaryPadding
                                                            )
                                                ));
                                                if (lostMeteors.length === tweenMeteorAmount) {
                                                    if (meteorTween) {
                                                        meteorTween.kill();
                                                    }
                                                    lostMeteors.forEach(disMet => {
                                                        appContainer.removeChild(disMet);
                                                    });
                                                }
                                            });
                                        },
                                    });
                                    noBrgTrap.trigger.visible = true;
                                    addSceneTweenByKey('tweenMeteorsKey', meteorTween);
                                    startNoBridgeTween(noBrgTrap, meteorTween);
                                    break;
                                }
                                case 'normalizerTwo'+collNameSuffix: {
                                    afterBridgeNormalize(currentColl, groundBottoms[3]);
                                    break;
                                }
                                case 'stopAtWallGrass'+collNameSuffix: {
                                    if (
                                        sceneTweens[worldTweenKey] &&
                                        doesObjectContainFunction(sceneTweens[worldTweenKey], 'isActive') &&
                                        !sceneTweens[worldTweenKey].isActive()
                                    ) {
                                        sceneTweens.tweenMeteorsKey && sceneTweens.tweenMeteorsKey.kill();
                                        const spdWrapper = {_spd: worldTickSpeedX};
                                        worldSpeedTween = gsap.to(spdWrapper, {
                                            onUpdate: () => {
                                                if (
                                                    getBushByTickKeyNumber(0)[interactiveGOKey].x
                                                    <= (appViewDimension.width
                                                        - getBushByTickKeyNumber(0)[interactiveGOKey].width*0.9
                                                )) {
                                                    worldTickSpeedX = 0;
                                                    worldSpeedTween.kill();
                                                }
                                            },
                                            onInterrupt: () => {
                                                slimeTween = gsap.to(slime.character, {
                                                    x: appViewDimension.width - slime.character.width,
                                                    duration: 4,
                                                    ease: "power1.inOut",
                                                });
                                                addSceneTweenByKey(slimeTweenKey, slimeTween);
                                            },
                                            repeat: -1
                                        });
                                        addSceneTweenByKey(worldTweenKey, worldSpeedTween);

                                        const meteorTween = gsap.to({}, {
                                            duration: 3,
                                            repeat: 3,
                                            repeatDelay: 0.2,
                                            delay: 0.5,
                                            ease: "power3.inOut",
                                            onStart: () => {
                                                tweenMeteorGos.forEach((tMeteor, index) => {
                                                    tMeteor.x = 0 - tMeteor.width - meteorBoundaryPadding;
                                                    tMeteor.y = groundBottoms[4].y - tMeteor.height*(1 + index * 0.5);
                                                    tMeteor.scale.x = -0.6;
                                                    tMeteor.angle = -45;
                                                    appContainer.addChild(tMeteor);
                                                });
                                                refreshTweenMeteorGos();
                                            },
                                            onUpdate: () => {
                                                tweenMeteorGos.forEach(tMeteor => {
                                                    tMeteor.x -= tMeteor.acceleration.x;
                                                });
                                            },
                                            onRepeat: () => {
                                                refreshTweenMeteorGos();
                                                tweenMeteorGos.forEach((tMeteor, index) => {
                                                    tMeteor.x = 0 - tMeteor.width - meteorBoundaryPadding;
                                                    tMeteor.y = groundBottoms[4].y - tMeteor.height*(1 + index * 0.5);
                                                });
                                            },
                                            onComplete: () => {
                                                tweenMeteorGos.forEach(disMet => {
                                                    appContainer.removeChild(disMet);
                                                });
                                            }
                                        });
                                        addSceneTweenByKey('tweenMeteorsKey', meteorTween);
                                    } else {
                                        currentColl.state = COLL_STATE.IDLE;
                                    }
                                    break;
                                }
                                case 'showTrigger3'+collNameSuffix: {
                                    noBrgGoLeft.trigger.visible = true;
                                    let isBackToDownStartY = false;

                                    const midJump = { x: { start: 0, end: 0, }, y: { start: 0, }, };

                                    slimeTween = gsap
                                        .timeline({
                                            paused: true,
                                            onInterrupt: () => {
                                                const spdWrapper = {_spd: worldTickSpeedX};
                                                worldSpeedTween = gsap.to(spdWrapper, {
                                                    _spd: -initWorldTickSpeedX,
                                                    duration: 3, ease: "power2.out",
                                                    onUpdate: () => {
                                                        worldTickSpeedX = spdWrapper._spd;
                                                    }
                                                });
                                                addSceneTweenByKey(worldTweenKey, worldSpeedTween);

                                                slimeTween = gsap.to(slime.character, {
                                                    x: appViewDimension.width - onScreenStartingX,
                                                    duration: 3, ease: "power2.out",
                                                });
                                                addSceneTweenByKey(slimeTweenKey, slimeTween);
                                            }
                                        })
                                        .to(slime.character, {
                                            x: showTrigger3.collider.x - 25,
                                            duration: 1,
                                            onComplete: () => {
                                                midJump.x.start = slime.character.x;
                                                slime.character.scale.x = -1;
                                            },
                                        })
                                        .to(slime.character, {
                                            y: groundBottoms[4].y - 200,
                                            duration: 0.5,
                                            ease: "none",
                                            onStart: () => {
                                                slime.playAnimation(
                                                    CHAR_STATE.JUMPING, 'jump_anim'
                                                );
                                                worldTickSpeedX = -0.3;
                                            },
                                            onComplete: () => {
                                                midJump.x.start = slime.character.x;
                                                midJump.x.end = slime.character.x - 200;
                                                midJump.y.start = slimeCharY;
                                            }
                                        })
                                        .to(slime.character, {
                                            onStart: () => {
                                                worldTickSpeedY = -5;
                                            },
                                            onUpdate: () => {
                                                if (groundBottoms[5].y > defaultUpperGroundY) {
                                                    worldTickSpeedY = initWorldTickSpeedY;

                                                    if (!isBackToDownStartY) {
                                                        slime.character.y -= getMomentumForJump(
                                                            midJump.x.start,
                                                            midJump.x.end,
                                                            slime.character.x,
                                                            0.5
                                                        );
                                                        slime.character.x -= 4;

                                                        if (slime.character.y >= midJump.y.start) {
                                                            isBackToDownStartY = true;
                                                            slime.character.y = midJump.y.start;
                                                            slime.playAnimation(
                                                                CHAR_STATE.WALKING, 'walk_anim'
                                                            );
                                                            slimeTween.kill();
                                                        }
                                                    }
                                                }
                                            },
                                            repeat: -1,
                                        });
                                    startNoBridgeTween(noBrgGoLeft, slimeTween);
                                    addSceneTweenByKey(slimeTweenKey, slimeTween);

                                    lifeCoreCollectorTween();
                                    break;
                                }
                                case 'infiniteTrigger1'+collNameSuffix: {
                                    meteorGosOnly.forEach(meteor => {appContainer.addChild(meteor)});
                                    addPixiTick(app, infiniteMeteorsKey, infiniteMeteors);
                                    break;
                                }
                                case 'recycle_icicleTrap'+collNameSuffix: {
                                    recycleIcicleTrapTween(0, recycle_icicleTrap);
                                    break;
                                }
                                case 'goDown1'+collNameSuffix: {
                                    recycle_icicleTrap.setCollname = 'DIS_recycle_icicleTrap';
                                    removePixiTick(app, infiniteMeteorsKey);

                                    sceneTweens[lcCollectorKey].kill();
                                    const timelineWrapper = {
                                        _spd: worldTickSpeedX, jumpStart: {x: null, y: null},
                                        jumpEnd: {x: null}, isBackToDownStartY: false,
                                    };
                                    slimeTween = gsap
                                        .timeline({
                                            onInterrupt: () => {
                                                slimeTween = gsap.to(slime.character, {
                                                    onStart: () => {
                                                        worldTickSpeedY = 5;
                                                        startUGDimming(0.4, 0.2);
                                                    },
                                                    onUpdate: () => {
                                                        if (uGroundBottoms[0].y < defaultUpperGroundY) {
                                                            worldTickSpeedY = initWorldTickSpeedY;
        
                                                            if (!timelineWrapper.isBackToDownStartY) {
                                                                slime.character.y += 4;
                                                                if (slime.character.y >= timelineWrapper.jumpStart.y) {
                                                                    timelineWrapper.isBackToDownStartY = true;
                                                                    slime.character.y = timelineWrapper.jumpStart.y;
                                                                    slime.character.scale.x *= (-1);
                                                                    slimeTween.kill();
                                                                    slime.playAnimation(
                                                                        CHAR_STATE.WALKING, 'walk_anim'
                                                                    );
                                                                }
                                                            }
                                                        }
                                                    },
                                                    onInterrupt: () => {
                                                        const spdWrapper = {_spd: worldTickSpeedX}
                                                        worldSpeedTween = gsap.to(timelineWrapper, {
                                                            _spd: initWorldTickSpeedX,
                                                            duration: 0.3, ease: 'none',
                                                            onUpdate: () => {
                                                                worldTickSpeedX = spdWrapper._spd;
                                                            },
                                                        });
                                                        addSceneTweenByKey(worldTweenKey, worldSpeedTween);
                                                    }
                                                });
                                                addSceneTweenByKey(slimeTweenKey, slimeTween);
                                            }
                                        })
                                        .to(timelineWrapper, {
                                            _spd: 0.3,
                                            duration: 0.3, ease: 'none',
                                            onUpdate: () => {
                                                worldTickSpeedX = timelineWrapper._spd;
                                            },
                                            onComplete: () => {
                                                timelineWrapper.jumpStart.x = slime.character.x;
                                                timelineWrapper.jumpEnd.x = slime.character.x - 300;
                                                timelineWrapper.jumpStart.y = slime.character.y;
                                            }
                                        })
                                        .to(slime.character, {
                                            ease: "none",
                                            onStart: () => {
                                                slime.playAnimation(
                                                    CHAR_STATE.JUMPING, 'jump_anim'
                                                );
                                            },
                                            onUpdate: () => {
                                                if (!timelineWrapper.isBackToDownStartY) {
                                                    slime.character.y -= getMomentumForJump(
                                                        timelineWrapper.jumpStart.x,
                                                        timelineWrapper.jumpEnd.x,
                                                        slime.character.x,
                                                        0.5
                                                    );
                                                    slime.character.x -= 4;

                                                    if (slime.character.y > timelineWrapper.jumpStart.y) {
                                                        timelineWrapper.isBackToDownStartY = true;
                                                        slime.character.y = timelineWrapper.jumpStart.y;
                                                        slimeTween.kill();
                                                    }
                                                }
                                            },
                                            repeat: -1
                                        });
                                    addSceneTweenByKey(slimeTweenKey, slimeTween);
                                    break;
                                }
                                case 'goDown1Response'+collNameSuffix: {
                                    slime.character.scale.x *= (-1);
                                    worldTickSpeedX = slowdownWorldSpeedX;
                                    worldTickSpeedY = initWorldTickSpeedY;
                                    slime.playAnimation(
                                        CHAR_STATE.WALKING, 'walk_anim'
                                    );
                                    const spdWrapper = {_spd: worldTickSpeedX}
                                    worldSpeedTween = gsap.to(spdWrapper, {
                                        _spd: initWorldTickSpeedX,
                                        onUpdate: () => {
                                            worldTickSpeedX = spdWrapper._spd;
                                        },
                                    });
                                    addSceneTweenByKey(worldTweenKey, worldSpeedTween);

                                    addPixiTick(app, infiniteMeteorsKey, infiniteMeteors);
                                    break;
                                }
                                case 'traphole3'+collNameSuffix: {
                                    worldTickSpeedX = 0;

                                    killAllBridgeTriggerTweens();
                                    deathFall();
                                    break;
                                }
                                case 'traphole4'+collNameSuffix: {
                                    worldTickSpeedX = 0;

                                    killAllBridgeTriggerTweens();
                                    deathFall();
                                    break;
                                }
                                case 'ceilTrap1'+collNameSuffix: {
                                    startCeilTrapTween(1);
                                    break;
                                }
                                case 'goFinish'+collNameSuffix: {
                                    deleteAllSceneTweens();
                                    runFlagEntryAnimation(
                                        appContainer, flagContainer, defaultUpperGroundY
                                    );

                                    runPlayerFinishAnimation(app, slime,
                                        {
                                            [worldAnimKey]: worldAnimation,
                                            [levelThreeTickKey]: levelThreeTick
                                        },
                                        {
                                            [infiniteMeteorsKey]: infiniteMeteors,
                                        },
                                        cleanUpOnFinish,
                                        () => onFinishLevel(
                                            app, interactiveGOs, worldTicks,
                                            [levelThreeTickKey, levelThreeTick],
                                            handGOs,
                                            retryLevelFn,
                                            returnToViewsMainFn,
                                            [menuCollTickKey, menuCollTick]
                                        ),
                                        slimeStates.finish.onStart,
                                        slimeStates.finish.onComplete,
                                    );
                                    break;
                                }
                                default:
                                    break;
                            }
                        }
                    }
                }
            });
        };

        worldTicks[worldAnimKey] = worldAnimation;

        let radialSceneAccessPullerTick;

        runPlayerEntryAnimation(
            app, slime,
            worldTicks,
            () => {
                lifeBars.visible = true;
            },
            () => {
                addPixiTick(app, levelThreeTickKey, levelThreeTick);
                addPixiTick(app, listenerKeys.menu.uiMenuPullerTick, radialSceneAccessPullerTick);
            },
            views.levelH,
            slimeStates.entry.onStart,
            null
        );


        const rightHand = {
            isHit: false,
            isOnCooldown: false,
            cooldownCircle: new Graphics(),
            angle: -95,
            whichHand: 'rightHand',
        };
        rightHand.cooldownCircle.zIndex = hands.right.go.zIndex + 1;

        const leftHand = {
            isHit: false,
            isOnCooldown: false,
            cooldownCircle: new Graphics(),
            angle: -95,
            whichHand: 'leftHand',
        };
        leftHand.cooldownCircle.zIndex = hands.left.go.zIndex + 1;

        levelThreeTick = () => {
            checkCollision(app, hands.left, interactiveGOs, leftHand);
            checkCollision(app, hands.right, interactiveGOs, rightHand);
            checkPlayerEnvironment(interactiveGOs, slime, lifeBars);
            lifeHandlerTick(
                app, interactiveGOs, worldTicks,
                [levelThreeTickKey, levelThreeTick],
                handGOs,
                retryLevelFn,
                returnToViewsMainFn,
                [menuCollTickKey, menuCollTick],
                lifeBars, listenerKeys.menu.uiMenuPullerTick
            );
        };

        radialSceneAccessPullerTick = () => {
            uiMenuContainer.getSceneRadialAccessPullerTick(
                app, hands, levelThreeTickKey, levelThreeTick, worldTicks, interactiveGOs, menuCollTickKey
            );
        };
    }, [audioUiButton, lifeBars, props, quitUiButton, retryUiButton, returnUiButton]);
    return (
        <Fragment></Fragment>
    )
};
