import { CHAR_STATE, PixiGameChar } from "components/pixi.js/animations/PixiGameChar";
import { audioOnClick, shouldPlayAudio } from "components/pixi.js/PixiJSAudio";
import { uiMenuButton } from "components/pixi.js/PixiJSButton";
import { testForAABB, checkCollision, checkPlayerEnvironment } from "components/pixi.js/PixiJSCollision";
import { 
    getFinishingFlag, getGroundsByTypeForScene, getLifeBars, removeCloudFromStageBeforeLevelStart,
    runPlayerEntryAnimation, runFlagEntryAnimation, runPlayerFinishAnimation, onFinishLevel,
    getCloudsForScene, getCloudXDist, lifeHandlerTick, COLL_STATE
} from "components/pixi.js/PixiJSGameObjects";
import { appViewDimension } from "components/pixi.js/PixiJSMain";
import { quitBtnFn } from "components/pixi.js/PixiJSMenu";
import { 
    addPixiTick, addPixiTimeout, addSceneTweenByKey, clearPixiTimeoutWithKey, pixiTimeouts,
    removePixiTick, sceneTweens
} from "components/pixi.js/SharedTicks";
import { UiMenu } from "components/pixi.js/UiMenu";
import { viewConstant } from "components/pixi.js/ViewConstants";
import gsap from "gsap/gsap-core";
import { Graphics, Point, Rectangle, Sprite, Texture, utils } from "pixi.js";
import { Fragment, useEffect } from "react";
import { levels } from "shared/IdConstants";
import { assetRsrc, envInteractionKey, goLabels, listenerKeys, views, viewsMain } from "shared/Indentifiers";
import { logInfo } from "shared/P3dcLogger";
import { getRandomArbitrary } from "shared/Utils";

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
}

export const PixiJSLevelTwo = (props) => {
    const lifeBars = getLifeBars(
        5, levels.lifeBar, viewConstant.lifeBarsDim.x, viewConstant.lifeBarsDim.y
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

        const retryLevelFn = () => exitViewFn(views.levelH, true);
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


        let levelTwoTick;
        let menuCollTick;
        const menuCollTickKey = listenerKeys.levelTwoScene.menuCollTick;
        const levelTwoTickKey = listenerKeys.levelTwoScene.mainTick;

        //? measures and tracking variables
        const initWorldTickSpeedX = 4;
        const slowdownWorldSpeedX = 0.16;
        let worldTickSpeedX = initWorldTickSpeedX;
        const initWorldTickSpeedY = 0;
        let worldTickSpeedY = initWorldTickSpeedY;
        let worldSpeedTween = null;

        //? animationKeys
        const worldAnimKey = listenerKeys.char.entry.worldAnim;

        //? non-interactive, world objects
        const uGroundTops = getGroundsByTypeForScene(6, assetRsrc.env.ground.underground.top);
        const lastUGroundTopTexture = new Texture(utils.TextureCache[assetRsrc.env.ground.underground.top]);
        lastUGroundTopTexture.frame = new Rectangle(0, 0, 700, lastUGroundTopTexture.height);
        const groundBottoms = getGroundsByTypeForScene(5, assetRsrc.env.ground.dots);
        const ugGroundBottoms = getGroundsByTypeForScene(7, assetRsrc.env.ground.underground.bottom);
        const ugGroundBottomSmall = new Texture(utils.TextureCache[assetRsrc.env.ground.underground.bottom]);
        ugGroundBottomSmall.frame = new Rectangle(0, 0, 500, ugGroundBottomSmall.height);
        const flagContainer = getFinishingFlag();

        const defaultGroundWidth = groundBottoms[0].width;
        const defaultGroundHeight = groundBottoms[0].height;

        const upperGroundOffsetY = 15;
        const defaultUpperGroundY = 
            appViewDimension.height
            - defaultGroundHeight
            + upperGroundOffsetY;
        const ugStartHeight = defaultUpperGroundY + 6 * defaultGroundHeight;
        const ugTopStartHeight = 
            defaultUpperGroundY
            + 7 * defaultGroundHeight
            - appViewDimension.height
            - 40;

        const trapholeWidth = 300;
        const ceilTrapWidth = 300;

        const wallGrounds = [];
        const wallGroundAmount = 6;

        const clouds = [];
        const cloudsAmount = 4;

        //? character
        let slimeTween;
        const slimeTweenKey = 'slimeCharacterTweenKey';
        let slimeStartX;
        const slime = new PixiGameChar(
            utils.TextureCache[assetRsrc.character.slime_spritesheet],
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
            },
            status_surprise: {
                startColumn: 0,
                endColumn: 1,
                row: 3,
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
        appContainer.addChild(slime.character);

        //? UGROUNDTOPs / UNDERGROUNDTOPS / UNDERGROUND TOPS
        const jumpDownGroundGap = 600;
        uGroundTops.forEach((uGroundTop, index) => {
            uGroundTop.y = ugTopStartHeight;

            switch (index) {
                case 0: {
                    //? lower scene
                    uGroundTop.x = 2*defaultGroundWidth + jumpDownGroundGap;
                    for (let i = 1; i < wallGroundAmount; i++) {
                        const startUGroundTopWall = new Sprite(utils.TextureCache[assetRsrc.env.ground.underground.top]);
                        startUGroundTopWall.x = 2*defaultGroundWidth + jumpDownGroundGap;
                        startUGroundTopWall.y = ugTopStartHeight - i * startUGroundTopWall.height;
                        startUGroundTopWall.zIndex = -3;
                        startUGroundTopWall.name = 'uGroundTopName_' + index;
                        wallGrounds.push(startUGroundTopWall);
                        appContainer.addChild(startUGroundTopWall);
                    }
                    break;
                }
                case 1: {
                    //? lower scene (before trapholes)
                    uGroundTop.x = 3*defaultGroundWidth + jumpDownGroundGap;
                    break;
                }
                case 2: {
                    //? lower scene (middle-part between trapholes)
                    uGroundTop.x = 4*defaultGroundWidth + jumpDownGroundGap;
                    break;
                }
                case 3: {
                    //? lower scene (after trapholes)
                    uGroundTop.x = 5*defaultGroundWidth + jumpDownGroundGap;
                    break;
                }
                case 4: {
                    //? lower scene (before ceilling-traps)
                    uGroundTop.texture = ugGroundBottomSmall;
                    uGroundTop.x = 
                        6*defaultGroundWidth
                        + jumpDownGroundGap
                        + ceilTrapWidth;
                    break;
                }
                case 5: {
                    //? lower scene (in-middle of ceilling-traps)
                    uGroundTop.texture = lastUGroundTopTexture;
                    uGroundTop.x = 
                        6*defaultGroundWidth + jumpDownGroundGap
                        + ugGroundBottomSmall.width
                        + 2*ceilTrapWidth;
                    uGroundTop.width = 700;
                    for (let i = 1; i < wallGroundAmount; i++) {
                        const endUGroundTopWall = new Sprite(lastUGroundTopTexture);
                        endUGroundTopWall.x =
                            6*defaultGroundWidth + jumpDownGroundGap
                            + ugGroundBottomSmall.width
                            + 2*ceilTrapWidth;
                        endUGroundTopWall.y = ugTopStartHeight - i * endUGroundTopWall.height;
                        endUGroundTopWall.zIndex = -3;
                        endUGroundTopWall.name = 'uGroundTopName_' + index;
                        wallGrounds.push(endUGroundTopWall);
                        appContainer.addChild(endUGroundTopWall);
                    }
                    break;
                }
                default:
                    break;
            }

            uGroundTop.zIndex = -3;
            uGroundTop.name = 'uGroundTopName_' + index;
            appContainer.addChild(uGroundTop);
        });

        //? GROUNDBOTTOMS / GROUNDBOTTOMS / GROUND BOTTOMS
        //? CLOUDS
        groundBottoms.forEach((groundBottom, index) => {
            groundBottom.y = defaultUpperGroundY;

            switch (index) {
                case 0: {
                    //? upper scene
                    groundBottom.x = 0;

                    const belowUpperGround = new Sprite(utils.TextureCache[assetRsrc.env.ground.underground.top]);
                    belowUpperGround.y = defaultUpperGroundY + defaultGroundHeight;
                    belowUpperGround.zIndex = -3;
                    belowUpperGround.x = defaultGroundWidth;
                    wallGrounds.push(belowUpperGround);
                    appContainer.addChild(belowUpperGround);

                    for (let i = 2; i <= wallGroundAmount; i++) {
                        const wallGround = new Sprite(utils.TextureCache[assetRsrc.env.ground.underground.bottom]);
                        wallGround.x = defaultGroundWidth;
                        wallGround.y = defaultUpperGroundY + i * defaultGroundHeight;
                        wallGround.zIndex = -3;
                        wallGrounds.push(wallGround);
                        appContainer.addChild(wallGround);
                    }

                    const _clouds = getCloudsForScene(cloudsAmount);

                    _clouds.forEach((_c, index) => {
                        _c.x = index * getCloudXDist();
                        _c.y = Math
                            .floor(getRandomArbitrary(
                                0, (appViewDimension.height/3) - _c.height)
                            );
                        _c.zIndex = -20;
                        clouds.push(_c);
                        appContainer.addChild(_c);
                    });
                    break;
                }
                case 1: {
                    //? upper scene
                    groundBottom.x = defaultGroundWidth;

                    const _clouds = getCloudsForScene(cloudsAmount);

                    _clouds.forEach((_c, index) => {
                        _c.x = defaultGroundWidth + index * getCloudXDist();
                        _c.y = Math
                            .floor(getRandomArbitrary(
                                0, (appViewDimension.height/3) - _c.height)
                            );
                        _c.zIndex = -20;
                        clouds.push(_c);
                        appContainer.addChild(_c);
                    });
                    break;
                }
                case 2: {
                    //? upper scene
                    groundBottom.x =
                        8*defaultGroundWidth
                        + 2*trapholeWidth
                        + ugGroundBottomSmall.width;

                    const belowUpperGround = new Sprite(utils.TextureCache[assetRsrc.env.ground.underground.top]);
                    belowUpperGround.y = defaultUpperGroundY + defaultGroundHeight;
                    belowUpperGround.zIndex = -3;
                    belowUpperGround.x =
                        8*defaultGroundWidth
                        + 2*trapholeWidth
                        + ugGroundBottomSmall.width;
                    wallGrounds.push(belowUpperGround);
                    appContainer.addChild(belowUpperGround);


                    for (let i = 2; i <= wallGroundAmount; i++) {
                        const wallGround = new Sprite(utils.TextureCache[assetRsrc.env.ground.underground.bottom]);
                        wallGround.x =
                            8*defaultGroundWidth
                            + 2*trapholeWidth
                            + ugGroundBottomSmall.width;
                        wallGround.y = defaultUpperGroundY + i * defaultGroundHeight;
                        wallGround.zIndex = -3;
                        wallGrounds.push(wallGround);
                        appContainer.addChild(wallGround);
                    }

                    const _clouds = getCloudsForScene(cloudsAmount);

                    _clouds.forEach((_c, index) => {
                        _c.x = 
                            8*defaultGroundWidth
                            + 2*trapholeWidth
                            + ugGroundBottomSmall.width
                            + index * getCloudXDist();
                        _c.y = Math
                            .floor(getRandomArbitrary(
                                0, (appViewDimension.height/3) - _c.height)
                            );
                        _c.zIndex = -20;
                        clouds.push(_c);
                        appContainer.addChild(_c);
                    });
                    break;
                }
                case 3: {
                    //? upper scene
                    groundBottom.x =
                        9*defaultGroundWidth
                        + 2*trapholeWidth
                        + ugGroundBottomSmall.width;

                    const _clouds = getCloudsForScene(cloudsAmount);

                    _clouds.forEach((_c, index) => {
                        _c.x = 
                            9*defaultGroundWidth
                            + 2*trapholeWidth
                            + ugGroundBottomSmall.width
                            + index * getCloudXDist();
                        _c.y = Math
                            .floor(getRandomArbitrary(
                                0, (appViewDimension.height/3) - _c.height)
                            );
                        _c.zIndex = -20;
                        clouds.push(_c);
                        appContainer.addChild(_c);
                    });
                    break;
                }
                case 4: {
                    //? upper scene (last visible tile)
                    groundBottom.x =
                        10*defaultGroundWidth
                        + 2*trapholeWidth
                        + ugGroundBottomSmall.width;

                    const _clouds = getCloudsForScene(cloudsAmount);

                    _clouds.forEach((_c, index) => {
                        _c.x = 
                            10*defaultGroundWidth
                            + 2*trapholeWidth
                            + ugGroundBottomSmall.widt
                            + index * getCloudXDist();
                        _c.y = Math
                            .floor(getRandomArbitrary(
                                0, (appViewDimension.height/3) - _c.height)
                            );
                        _c.zIndex = -20;
                        clouds.push(_c);
                        appContainer.addChild(_c);
                    });
                    break;
                }
                default:
                    break;
            };
            groundBottom.zIndex = -3;
            groundBottom.name = 'upGroundBottomName_' + index;
            appContainer.addChild(groundBottom);
        });

        //? UGGROUNDBOTTOMS / UNDERGROUNDBOTTOMS / UNDERGROUND BOTTOMS
        ugGroundBottoms.forEach((ugGroundBottom, index) => {
            ugGroundBottom.y = ugStartHeight

            switch (index) {
                case 0: {
                    //? lower scene
                    ugGroundBottom.x = 2*defaultGroundWidth;
                    break;
                }
                case 1: {
                    //? lower scene (before trapholes)
                    ugGroundBottom.x = 3*defaultGroundWidth;
                    break;
                }
                case 2: {
                    //? lower scene (middle-part between trapholes)
                    ugGroundBottom.texture = ugGroundBottomSmall;
                    ugGroundBottom.x = 4*defaultGroundWidth + trapholeWidth;
                    break;
                }
                case 3: {
                    //? lower scene (after trapholes)
                    ugGroundBottom.x = 
                        4*defaultGroundWidth
                        + 2*trapholeWidth
                        + ugGroundBottomSmall.width;
                    break;
                }
                case 4: {
                    //? lower scene (before ceilling-traps)
                    ugGroundBottom.x = 
                        5*defaultGroundWidth
                        + 2*trapholeWidth
                        + ugGroundBottomSmall.width;
                    break;
                }
                case 5: {
                    //? lower scene (in-middle of ceilling-traps)
                    ugGroundBottom.x = 
                        6*defaultGroundWidth
                        + 2*trapholeWidth
                        + ugGroundBottomSmall.width;
                    break;
                }
                case 6: {
                    //? lower scene (after ceilling-traps)
                    ugGroundBottom.x = 
                        7*defaultGroundWidth
                        + 2*trapholeWidth
                        + ugGroundBottomSmall.width;
                    break;
                }
                default:
                    break;
            }
            ugGroundBottom.zIndex = -3;
            ugGroundBottom.name = 'uGroundBottomName_' + index;
            appContainer.addChild(ugGroundBottom);
        });

        //? COLLIDER
        const doJumpDown = {};
        const goDown = {};
        const downResponse = {};
        const traphole1 = {};
        const traphole2 = {};
        const ceilTrap1 = {};
        const ceilTrap2 = {};
        const goUp = {};
        const doJumpUp = {};
        const upResponseBeforeGround = {};
        const upResponseOnGround = {};
        const goFinish = {};

        const colliderArr = [
            doJumpDown, goDown, downResponse, traphole1, traphole2, ceilTrap1, ceilTrap2, doJumpUp,
            goUp, upResponseBeforeGround, upResponseOnGround, goFinish
        ];
        colliderArr.forEach(collObj => {
            collObj.state = COLL_STATE.IDLE;

            collObj.collider = new Graphics();
            collObj.collider.beginFill(0xff0000, 0);
            collObj.collider.drawRect(0,0, 200, 200);
            collObj.collider.endFill();
            appContainer.addChild(collObj.collider);
        });
        const mappedCollider = colliderArr.map(collObj => collObj.collider);

        doJumpDown.collider.name = 'doJumpDownColliderName';
        doJumpDown.collider.x = 2*defaultGroundWidth - 250;
        doJumpDown.collider.y = defaultUpperGroundY - doJumpDown.collider.height/2;
        goDown.collider.name = 'goDownColliderName';
        goDown.collider.x = 2*defaultGroundWidth + 200;
        goDown.collider.y = defaultUpperGroundY - goDown.collider.height/2;
        downResponse.collider.width = 800;
        downResponse.collider.name = 'downResponseColliderName';
        downResponse.collider.x = 2*defaultGroundWidth;
        downResponse.collider.y = ugStartHeight - downResponse.collider.height;

        const trapholeStartOffset = slime.character.width + 80;
        traphole1.collider.name = 'traphole1ColliderName';
        traphole1.collider.x = 4*defaultGroundWidth + trapholeStartOffset;
        traphole1.collider.y = ugStartHeight - traphole1.collider.height/2;

        traphole2.collider.name = 'traphole2ColliderName';
        traphole2.collider.x =
            4*defaultGroundWidth
            + trapholeWidth
            + ugGroundBottomSmall.width
            + trapholeStartOffset;
        traphole2.collider.y = ugStartHeight - traphole1.collider.height/2;

        ceilTrap1.collider.name = 'ceilTrap1ColliderName';
        ceilTrap1.collider.x = 
            6*defaultGroundWidth
            + jumpDownGroundGap;
        ceilTrap1.collider.y = ugStartHeight - ceilTrap1.collider.height/2;
        ceilTrap2.collider.name = 'ceilTrap2ColliderName';
        ceilTrap2.collider.x =
            6*defaultGroundWidth
            + jumpDownGroundGap
            + ugGroundBottomSmall.width
            + ceilTrapWidth;
        ceilTrap2.collider.y = ugStartHeight - ceilTrap2.collider.height/2;

        doJumpUp.collider.name = 'doJumpUpColliderName';
        doJumpUp.collider.x = 8*defaultGroundWidth + 2*trapholeWidth - 200;
        doJumpUp.collider.y = ugStartHeight;
        goUp.collider.name = 'goUpColliderName';
        goUp.collider.height = 700;
        goUp.collider.x = doJumpUp.collider.x + doJumpUp.collider.width - 100;
        goUp.collider.y = ugStartHeight - goUp.collider.height;
        upResponseBeforeGround.collider.name = 'upResponseBeforeGroundColliderName';
        upResponseBeforeGround.collider.width = 800;
        upResponseBeforeGround.collider.x =
            6*defaultGroundWidth + 600
            + ugGroundBottomSmall.width
            + 2*trapholeWidth + lastUGroundTopTexture.width;
        upResponseBeforeGround.collider.y = defaultUpperGroundY - upResponseBeforeGround.collider.height;
        upResponseBeforeGround.collider.alpha = 0.8;

        upResponseOnGround.collider.name = 'upResponseOnGroundColliderName';
        upResponseOnGround.collider.width = 600;
        upResponseOnGround.collider.x = groundBottoms[2].x;
        upResponseOnGround.collider.y = defaultUpperGroundY - upResponseOnGround.collider.height;

        goFinish.collider.name = 'goFinishColliderName';
        goFinish.collider.x = groundBottoms[4].x - 200;
        goFinish.collider.y = defaultUpperGroundY - goFinish.collider.height;

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
                duration: 4,
                delay: delay,
                alpha: alphaValue,
                ease: "power2.inOut",
            });
            addSceneTweenByKey(ugDimmerTweenKey, ugDimmerTween);
        };

        //? BRIDGE / BRIDGES
        const bridge1 = {
            go: new Graphics(),
            trigger: new Sprite(utils.TextureCache[assetRsrc.animation.trigger]),
            triggerTweenkey: envInteractionKey + 'bridge1_trigger_tween_key',
            triggerRotationSpd: 0.1,
        };
        const bridge2 = {
            go: new Graphics(),
            trigger: new Sprite(utils.TextureCache[assetRsrc.animation.trigger]),
            triggerTweenkey: envInteractionKey + 'bridge2_trigger_tween_key',
            triggerRotationSpd: 0.1,
        };
        [bridge1.go, bridge2.go].forEach(bGo => {
            bGo.beginFill(0x260c0c, 1);
            bGo.drawRect(0,0,trapholeWidth, 50);
            bGo.endFill();
            bGo.y = ugStartHeight;
            bGo.zIndex = -4;
            bGo.alpha = 0;
            appContainer.addChild(bGo);
        });
        [bridge1.trigger, bridge2.trigger].forEach((bTrigger, index) => {
            bTrigger.scale.set(0.8);
            bTrigger.anchor.set(0.5);
            if (index === 0) {
                bTrigger.y = ugStartHeight + bTrigger.height;
            } else {
                bTrigger.y = ugTopStartHeight + bTrigger.height * 1.5;
            }
            appContainer.addChild(bTrigger);
        });
        bridge1.go.x = 4*defaultGroundWidth;
        bridge1.trigger.x = 4*defaultGroundWidth - bridge1.trigger.width;

        bridge2.go.x = 
            4*defaultGroundWidth
            + trapholeWidth
            + ugGroundBottomSmall.width;
        bridge2.trigger.x =
            4*defaultGroundWidth
            + trapholeWidth
            + ugGroundBottomSmall.width/2;

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
                                //? makes it faster
                                bridge.triggerRotationSpd = 0;

                                bridge.go.alpha = 1;
                                trapholeToDisable.collider.name += '_DISABLED';
                                bridgeTriggerTween.kill();
                            }
                        }
                    }
                },
                repeat: -1,
            });
            addSceneTweenByKey(bridge.triggerTweenkey, bridgeTriggerTween);
        };
        startBridgeTriggerTween(bridge1, traphole1);
        startBridgeTriggerTween(bridge2, traphole2);

        //? INTERACTIVE OBJECTS
        const interactiveGOKey = goLabels.interactive.go;
        const interactiveTickKey = goLabels.interactive.tick;

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
        const meteorTimeoutRange = {
            min: 100,
            minInTick: 1000,
            max: 8000,
            step: 1900,
        };
        const meteorAccelBounds = {
            x: {
                min: 4.2,
                max: 4.4,
            },
            y: {
                min: -0.3,
                max: -0.6,
            },
        };
        const meteors = [];
        const amtMeteors = 5;
        for (let i = 0; i < amtMeteors; i++) {
            const tmpMeteor = new Sprite(utils.TextureCache[assetRsrc.projectile.meteor]);
            tmpMeteor.id = interactiveGOKey;
            meteors.push({
                [interactiveGOKey]: tmpMeteor,
                [interactiveTickKey]: meteorTickKeyPrefix + i,
                isSpawnedLeft: i % 2 === 0 ? true : false,
            });
            tmpMeteor.scale.set(0.6);
            tmpMeteor.angle = 45;
            if (i % 2 === 0) {
                tmpMeteor.scale.x = -0.6;
                tmpMeteor.angle = -45;
            }
            tmpMeteor.x = 0 - 400;
            tmpMeteor.y = 0 - 400;
            tmpMeteor.zIndex = -10;
            appContainer.addChild(tmpMeteor);
        }

        const initiateMeteor = (meteor) => {
            const meteorGo = meteor[interactiveGOKey];
            const meteorKey = meteor[interactiveTickKey];
            const isSpawnedLeft = meteor.isSpawnedLeft;
            removePixiTick(app, meteorKey);

            meteorGo.acceleration = new Point(0);
            meteorGo.id = interactiveGOKey;

            meteorGo.y = getRandomArbitrary(
                uGroundTops[0].y
                + 2*defaultGroundHeight
                + meteorBoundaryPadding,
                ugGroundBottoms[0].y
                - meteorGo.height
                - 4*meteorBoundaryPadding
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
                            - defaultGroundHeight
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
                    if (!(meteorKey in pixiTimeouts)) {
                        const timeoutId = setTimeout(
                            initiateMeteor, getRandomTimeout(meteorTimeoutRange), lostMeteor
                        );

                        addPixiTimeout(meteorKey, timeoutId);
                    }
                });
            }
        };

        ////* ICICLES
        const icicleTickKeyPrefix = goLabels.level.one.projectiles.icicle.tickKeyPrefix;
        const icicleBoundaryPadding = 5;
        const icicles = [];
        const iciclesAmount = 6;
        for (let i = 0; i < iciclesAmount; i++) {
            const tmpIcicle = new Sprite(utils.TextureCache[assetRsrc.projectile.icicle]);
            tmpIcicle.scale.set(0.6);
            tmpIcicle.y = ugTopStartHeight - tmpIcicle.height - icicleBoundaryPadding;
            if (i < 3) {
                tmpIcicle.x =
                    6*defaultGroundWidth
                    + jumpDownGroundGap
                    + getRandomArbitrary(
                        ceilTrapWidth*0.2, ceilTrapWidth*0.8
                    );
            } else {
                tmpIcicle.x =
                    6*defaultGroundWidth
                    + jumpDownGroundGap
                    + ugGroundBottomSmall.width
                    + ceilTrapWidth
                    + getRandomArbitrary(
                        ceilTrapWidth*0.2, ceilTrapWidth*0.8
                    );
            }
            tmpIcicle.acceleration = new Point(0, -10);
            tmpIcicle.id = interactiveGOKey;

            icicles.push({
                [interactiveGOKey]: tmpIcicle,
                [interactiveTickKey]: icicleTickKeyPrefix + i,
                ceilIndex: i,
            });
        
            appContainer.addChild(tmpIcicle);
        }

        const icicleGosOnly = icicles.map(icicle => icicle[interactiveGOKey]);

        const startCeilTrapTween = (icicleArray, tweenIndex) => {
            const ceilTrapTween = gsap.to({}, {
                ease: "power3.inOut",
                onUpdate: () => {
                    icicleArray.forEach(icicle => {
                        icicle[interactiveGOKey].y -= icicle[interactiveGOKey].acceleration.y;
                        const lostIcicles = icicleArray.filter(_icicle => (
                                icicle[interactiveGOKey].y
                                    > (
                                        appViewDimension.height
                                        - defaultGroundHeight
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
                        ));
                        if (lostIcicles.length === 3) {
                            if (ceilTrapTween) {
                                ceilTrapTween.kill();
                            }
                            lostIcicles.forEach(disIci => {
                                appContainer.removeChild(disIci[interactiveGOKey]);
                            });
                        }
                    });
                },
                repeat: -1,
            });
            addSceneTweenByKey('iciclesTween' + tweenIndex, ceilTrapTween);
        };

        //? WORLD
        const worldObjects = [
            ...clouds,
            ...groundBottoms,
            ...wallGrounds,
            ...uGroundTops,
            ...ugGroundBottoms,
            ...mappedCollider,
            bridge1.go,
            bridge1.trigger,
            bridge2.go,
            bridge2.trigger,
            ...icicleGosOnly,
        ];
        const worldTweenKey = 'worldTweenKey';

        const cleanUpOnFinish = () => {
            const lostAppContChildren = appContainer.children.filter(
                child => (
                    child.y > (
                        appViewDimension.height
                        - defaultGroundHeight
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
            worldObjects.forEach(worldObj => {
                worldObj.x -= worldTickSpeedX;
                worldObj.y -= worldTickSpeedY;

                if (worldObj.name && worldObj.name.toLowerCase().includes('collidername')) {
                    const currentColl = colliderArr.find(collObj => (
                        collObj.state !== COLL_STATE.TRIGGERED &&
                        collObj.collider.name === worldObj.name
                    ));
                    if (currentColl) {
                        if (testForAABB(currentColl.collider, slime.character)) {
                            currentColl.state = COLL_STATE.TRIGGERED;

                            switch (currentColl.collider.name) {
                                case 'doJumpDownColliderName': {
                                    const spdWrapper = {_spd: worldTickSpeedX};
                                    worldSpeedTween = gsap.to(spdWrapper, {
                                        duration: 0.3,
                                        _spd: slowdownWorldSpeedX,
                                        ease: "none",
                                        onUpdate: () => {
                                            worldTickSpeedX = spdWrapper._spd;
                                        },
                                        onComplete: () => {
                                            slimeStartX = slime.character.x;
                                            const slimeDownDestX = goDown.collider.x;
                                            const slimeDownStartY = slime.character.y;
                                            let isBackToDownStartY = false
        
                                            slimeTween = gsap.to(slime.character, {
                                                duration: 5,
                                                delay: 0.1,
                                                x: slimeDownDestX,
                                                onStart: () => {
                                                    slime.playAnimation(
                                                        CHAR_STATE.JUMPING,
                                                        'jump_anim'
                                                    );
                                                },
                                                onUpdate: () => {
                                                    if (!isBackToDownStartY) {
                                                        slime.character.y -= getMomentumForJump(
                                                            doJumpDown.collider.x,
                                                            slimeDownDestX,
                                                            slime.character.x,
                                                            1.5
                                                        );
                                                    }
                                                    if (slime.character.y >= slimeDownStartY) {
                                                        isBackToDownStartY = true;
        
                                                        slime.character.y = slimeDownStartY;
                                                    }
                                                },
                                            });
                                            addSceneTweenByKey(slimeTweenKey, slimeTween);

                                        },
                                    });
                                    addSceneTweenByKey(worldTweenKey, worldSpeedTween);
                                    break;
                                }
                                case 'goDownColliderName': {
                                    worldSpeedTween.kill();
                                    slimeTween.kill();

                                    removePixiTick(app, infiniteMeteorsKey);

                                    worldTickSpeedX = 0.5;
                                    worldTickSpeedY = 8;

                                    startUGDimming(0.3, 0.2);
                                    break;
                                }
                                case 'downResponseColliderName': {
                                    if (!(ugGroundBottoms[0].y > defaultUpperGroundY)) {
                                        worldTickSpeedY = initWorldTickSpeedY;

                                        slimeTween = gsap.to(slime.character, {
                                            duration: 0.2,
                                            y: slimeCharY,
                                            ease: 'none',
                                            onStart: () => {
                                                slime.animationSpeed = 0.04;
                                            },
                                            onComplete: () => {
                                                const spdWrapper = {_spd: worldTickSpeedX}
                                                worldSpeedTween = gsap.to(spdWrapper, {
                                                    _spd: initWorldTickSpeedX,
                                                    onUpdate: () => {
                                                        worldTickSpeedX = spdWrapper._spd;
                                                    },
                                                });
                                                addSceneTweenByKey(worldTweenKey, worldSpeedTween);


                                                slimeTween = gsap.to(slime.character, {
                                                    duration: 5,
                                                    x: slimeStartX,
                                                    onStart: () => {
                                                        slime.animationSpeed = 0.1;
                                                        slime.playAnimation(
                                                            CHAR_STATE.WALKING,
                                                            'walk_anim'
                                                        );
                                                    },
                                                    onComplete: () => {
                                                        addPixiTick(
                                                            app,
                                                            infiniteMeteorsKey,
                                                            infiniteMeteors
                                                        );
                                                    }
                                                });
                                                addSceneTweenByKey(slimeTweenKey, slimeTween);

                                            },
                                        });
                                        addSceneTweenByKey(slimeTweenKey, slimeTween);

                                    } else {
                                        currentColl.state = COLL_STATE.IDLE;
                                    }

                                    break;
                                }
                                case 'traphole1ColliderName': {
                                    worldTickSpeedX = 0;

                                    sceneTweens[bridge1.triggerTweenkey].kill();
                                    sceneTweens[bridge2.triggerTweenkey].kill();
                                    gsap.to(slime.character, {
                                        y: appViewDimension.height + slime.character.height,
                                        duration: 2,
                                        onComplete: () => {
                                            lifeBars.children = 0;
                                            lifeHandlerTick(
                                                app,
                                                [], {},
                                                [levelTwoTickKey, levelTwoTick],
                                                handGOs,
                                                retryLevelFn,
                                                returnToViewsMainFn,
                                                [menuCollTickKey, menuCollTick],
                                                lifeBars, listenerKeys.menu.uiMenuPullerTick
                                            );
                                        }
                                    });
                                    break;
                                }
                                case 'traphole2ColliderName': {
                                    worldTickSpeedX = 0;

                                    sceneTweens[bridge1.triggerTweenkey].kill();
                                    sceneTweens[bridge2.triggerTweenkey].kill();
                                    gsap.to(slime.character, {
                                        y: appViewDimension.height + slime.character.height,
                                        duration: 2,
                                        onComplete: () => {
                                            lifeBars.children = 0;
                                            lifeHandlerTick(
                                                app,
                                                [], {},
                                                [levelTwoTickKey, levelTwoTick],
                                                handGOs,
                                                retryLevelFn,
                                                returnToViewsMainFn,
                                                [menuCollTickKey, menuCollTick],
                                                lifeBars, listenerKeys.menu.uiMenuPullerTick
                                            );
                                        }
                                    });
                                    break;
                                }
                                case 'ceilTrap1ColliderName': {
                                    const icicleArray = icicles.filter(icicles =>
                                        icicles.ceilIndex < 3
                                    );
                                    startCeilTrapTween(icicleArray, 1);

                                    break;
                                }
                                case 'ceilTrap2ColliderName': {
                                    const icicleArray = icicles.filter(icicles =>
                                        icicles.ceilIndex >= 3
                                    );
                                    startCeilTrapTween(icicleArray, 2);

                                    break;
                                }
                                case 'doJumpUpColliderName': {
                                    worldTickSpeedX = 0;
                                    removePixiTick(app, infiniteMeteorsKey);
                                    const spdWrapper = {_spd: worldTickSpeedX};
                                    worldSpeedTween = gsap.to(spdWrapper, {
                                        _spd: slowdownWorldSpeedX,
                                        onUpdate: () => {
                                            worldTickSpeedX = spdWrapper._spd;
                                        },
                                        onComplete: () => {
                                            const slimeUpDestX = goUp.collider.x;
                                            const slimeUpStartY = slime.character.y;
                                            let isBacktoUpStartY = false;

                                            slimeTween = gsap.to(slime.character, {
                                                duration: 3,
                                                delay: 0.1,
                                                x: slimeUpDestX,
                                                onStart: () => {
                                                    slime.playAnimation(
                                                        CHAR_STATE.JUMPING,
                                                        'jump_anim'
                                                    );
                                                },
                                                onUpdate: () => {
                                                    if (!isBacktoUpStartY) {
                                                        slime.character.y -= getMomentumForJump(
                                                            slimeStartX,
                                                            slimeUpDestX,
                                                            slime.character.x,
                                                            1.3
                                                        );
                                                    }
                                                    if (slime.character.y >= slimeUpStartY) {
                                                        isBacktoUpStartY = true;
        
                                                        slime.character.y = slimeUpStartY;
                                                    }
                                                },
                                            });
                                            addSceneTweenByKey(slimeTweenKey, slimeTween);
                                        },
                                    });
                                    addSceneTweenByKey(worldTweenKey, worldSpeedTween);
                                    break;
                                }
                                case 'goUpColliderName': {
                                    slimeTween.kill();

                                    worldTickSpeedX = 1;
                                    worldTickSpeedY = -4;

                                    startUGDimming(0, 0.6);
                                    break;
                                }
                                case 'upResponseBeforeGroundColliderName': {
                                    if (groundBottoms[2].y > defaultUpperGroundY) {
                                        worldTickSpeedY = initWorldTickSpeedY;
                                        worldSpeedTween.kill();

                                        const slimeUpDestX2 = upResponseOnGround.collider.x;
                                        const slimeUpStartY2 = slime.character.y;
                                        let isBacktoUpStartY2 = false;

                                        slimeTween = gsap.to(slime.character, {
                                            duration: 4,
                                            ease: "none",
                                            x: slimeUpDestX2,
                                            onUpdate: () => {
                                                if (!isBacktoUpStartY2) {
                                                    slime.character.y -= getMomentumForJump(
                                                        slimeStartX,
                                                        groundBottoms[2].x,
                                                        slime.character.x,
                                                        4.5
                                                    );
                                                }
                                                if (slime.character.y >= slimeUpStartY2) {
                                                    isBacktoUpStartY2 = true;

                                                    slime.character.y = slimeUpStartY2;
                                                }
                                            },
                                        });
                                        addSceneTweenByKey(slimeTweenKey, slimeTween);
                                    } else {
                                        currentColl.state = COLL_STATE.IDLE;
                                    }
                                    break;
                                }
                                case 'upResponseOnGroundColliderName': {
                                    slimeTween.kill();

                                    const spdWrapper = {_spd: worldTickSpeedX}
                                    worldSpeedTween = gsap.to(spdWrapper, {
                                        duration: 2,
                                        _spd: initWorldTickSpeedX,
                                        onUpdate: () => {
                                            worldTickSpeedX = spdWrapper._spd;
                                        },
                                    });
                                    addSceneTweenByKey(worldTweenKey, worldSpeedTween);

                                    slimeTween = gsap.to(slime.character, {
                                        duration: 1,
                                        y: slimeCharY,
                                        ease: 'none',
                                        onStart: () => {
                                            slime.animationSpeed = 0.04;
                                        },
                                        onComplete: () => {
                                            slimeTween = gsap.to(slime.character, {
                                                duration: 5,
                                                x: slimeStartX,
                                                onStart: () => {
                                                    slime.animationSpeed = 0.1;
                                                    slime.playAnimation(
                                                        CHAR_STATE.WALKING,
                                                        'walk_anim'
                                                    );
                                                },
                                            });
                                            addSceneTweenByKey(slimeTweenKey, slimeTween);

                                        },
                                    });
                                    addSceneTweenByKey(slimeTweenKey, slimeTween);
                                    break;
                                }
                                case 'goFinishColliderName': {
                                    runFlagEntryAnimation(
                                        appContainer, flagContainer, defaultUpperGroundY
                                    );

                                    runPlayerFinishAnimation(app, slime,
                                        {
                                            [worldAnimKey]: worldAnimation,
                                            [levelTwoTickKey]: levelTwoTick
                                        },
                                        {
                                            [infiniteMeteorsKey]: infiniteMeteors,
                                        },
                                        cleanUpOnFinish,
                                        () => onFinishLevel(
                                            app, interactiveGOs, worldTicks,
                                            [levelTwoTickKey, levelTwoTick],
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

        const worldTicks = {
            [worldAnimKey]: worldAnimation,
        };

        let radialSceneAccessPullerTick;

        runPlayerEntryAnimation(
            app, slime,
            worldTicks,
            () => {
                lifeBars.visible = true;
            },
            () => {
                addPixiTick(app, levelTwoTickKey, levelTwoTick);
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

        const interactiveGOs = [
            ...meteors,
            ...icicles
        ];
        const leftHand = {
            isHit: false,
            isOnCooldown: false,
            cooldownCircle: new Graphics(),
            angle: -95,
            whichHand: 'leftHand',
        };
        leftHand.cooldownCircle.zIndex = hands.left.go.zIndex + 1;
        levelTwoTick = () => {
            checkCollision(app, hands.left, interactiveGOs, leftHand);
            checkCollision(app, hands.right, interactiveGOs, rightHand);
            checkPlayerEnvironment(interactiveGOs, slime, lifeBars);
            lifeHandlerTick(
                app, interactiveGOs, worldTicks,
                [levelTwoTickKey, levelTwoTick],
                handGOs,
                retryLevelFn,
                returnToViewsMainFn,
                [menuCollTickKey, menuCollTick],
                lifeBars, listenerKeys.menu.uiMenuPullerTick
            );
        };

        radialSceneAccessPullerTick = () => {
            uiMenuContainer.getSceneRadialAccessPullerTick(
                app, hands, levelTwoTickKey, levelTwoTick, worldTicks, interactiveGOs, menuCollTickKey
            );
        };
    }, [props, lifeBars, returnUiButton, quitUiButton, audioUiButton, retryUiButton]);

    return(
        <Fragment></Fragment>
    );
};