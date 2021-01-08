import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import gsap from 'gsap/gsap-core';
import React, { Fragment, useEffect } from 'react';

import { Linear } from 'gsap/gsap-core';
import { testForAABB } from "components/pixi.js/PixiJSCollision";
import { menu } from 'shared/IdConstants';
import { logInfo } from 'shared/P3dcLogger';
import {
    addPixiTick, addPixiTickFromSceneToCache, cachedPixiTicksFromScene, clearAllPixiTimeouts,
    pixiTicks, removeCachedPixiTickFromScene, removePixiTick
} from 'components/pixi.js/SharedTicks';
import { viewConstant } from './ViewConstants';
import { defaultMenuButton, disabledMenuButton, UI_MIN_BLUR } from "components/pixi.js/PixiJSButton";
import { goLabels, listenerKeys, smvRefs, views } from 'shared/Indentifiers';
import { changeAudio } from './PixiJSAudio';
import { appViewDimension } from './PixiJSMain';

const loading = {
    circle: new PIXI.Graphics(),
    circleThickness: 10,
    tick: null,
    tween: null,
};
let isHoveringOverMenu = false;
let storedHoverMenuItem = null;

export const menuCollRes = (app, otherGOs, handGOs) => {
    if (handGOs !== undefined && handGOs !== null &&
        handGOs.left !== undefined && handGOs.left !== null &&
        handGOs.right !== undefined && handGOs.right !== null
    ) {
        const collisionGOs = otherGOs.filter(otherGO => testForAABB(handGOs.left, otherGO[1]));
        const isSingleCollision = collisionGOs.length === 1;
        //* for a case where we want to seperate the funtionalities between left and right hand
        // const collisionGOsRight = otherGOs.filter(otherGO => 
        //     (otherGO[1].id === menu.button.topRight) && testForAABB(handGOs.right, otherGO[1])
        // );
        const collisionGOsRight = otherGOs.filter(otherGO => testForAABB(handGOs.right, otherGO[1]));
        const isMenuCollisionSingle = collisionGOsRight.length === 1;

        if (collisionGOs.length + collisionGOsRight.length === 1) {
            if (isSingleCollision) {
                const currentlyHoveredMenuItem = collisionGOs[0][1].id;
                if (storedHoverMenuItem !== currentlyHoveredMenuItem) {
                    storedHoverMenuItem = currentlyHoveredMenuItem;
                    menuCollcleanUp(app);
                }

                if (!isHoveringOverMenu) {

                    isHoveringOverMenu = true;

                    if (collisionGOs[0][1].id.includes(menu.button.ui.idPrefix)) {
                        loading.tween = loadingConfigurator.start(
                            app, collisionGOs[0][1], collisionGOs[0][0], true
                        );
                    } else {
                        loading.tween = loadingConfigurator.start(
                            app, collisionGOs[0][1], collisionGOs[0][0]
                        );
                    }
                }
            } else if (isMenuCollisionSingle) {
                const currentlyHoveredMenuItem = collisionGOsRight[0][1].id;
                if (storedHoverMenuItem !== currentlyHoveredMenuItem) {
                    storedHoverMenuItem = currentlyHoveredMenuItem;
                    menuCollcleanUp(app);
                }

                if (!isHoveringOverMenu) {

                    isHoveringOverMenu = true;

                    if (collisionGOsRight[0][1].id.includes(menu.button.ui.idPrefix)) {
                        loading.tween = loadingConfigurator.start(
                            app, collisionGOsRight[0][1], collisionGOsRight[0][0], true
                        );
                    } else {
                        loading.tween = loadingConfigurator.start(
                            app, collisionGOsRight[0][1], collisionGOsRight[0][0]
                        );
                    }
                    
                }
            } else {
                storedHoverMenuItem = null;
                menuCollcleanUp(app);
            }
        } else {
            storedHoverMenuItem = null;
            menuCollcleanUp(app);
        }
    }
};

const menuCollcleanUp = (app) => {
    isHoveringOverMenu = false;

    if (
        (loading.tick !== null && loading.tick !== undefined) &&
        (loading.tween !== null && loading.tween !== undefined)
    ) {
        const resetInfo = loadingConfigurator.stop(app, loading.tick, loading.tween);
        loading.tick = resetInfo.resetTick;
        loading.tween = resetInfo.resetTween;
    }
}

const loadingConfigurator = {
    start: (app, otherGO, onCompleteFunc, isUiGo=false) => {
        isUiGo && removePixiTick(app, listenerKeys.menu.decreaseBlurInMenuContainerTick);
        isUiGo && removePixiTick(app, listenerKeys.menu.decreaseBlurTick);

        app.stage.addChild(loading.circle);

        const RAD = Math.PI / 180;

        const arcParam = {
            x: otherGO.getBounds().x + (isUiGo ? (otherGO.getBounds().width/2) : otherGO.getBounds().width),
            y: otherGO.getBounds().y + (isUiGo ? (otherGO.getBounds().height/2 + 15) : 0),
            radius: isUiGo ? otherGO.width/2 : 25,
            angle: -95
        };

        const onCompleteLoading = () => {
            const resetInfo = loadingConfigurator.stop(app, loading.tick, loading.tween);
            loading.tick = resetInfo.resetTick;
            loading.tween = resetInfo.resetTween;
            onCompleteFunc();
        };

        const tmpLoadingTween = gsap.to(arcParam, {
            angle: 280,
            delay: 0.6,
            duration: 1.0,
            ease: Linear.easeNone,
            onComplete: onCompleteLoading,
        });

        const shadowCircle = otherGO.hasOwnProperty('children')
            ? otherGO.getChildByName(menu.button.ui.shadowCircleName)
            : false;

        loading.tick = () => {
            loading.circle
                .clear()
                .lineStyle(loading.circleThickness, 0xf05454)
                .arc(arcParam.x, arcParam.y, arcParam.radius, -95 * RAD, arcParam.angle * RAD);

            if (shadowCircle !== null && shadowCircle !== undefined && shadowCircle !== false) {
                (shadowCircle.filters[0].blur <= 42) && (shadowCircle.filters[0].blur += 4);
            }
        };

        loading.circle.zIndex = otherGO.zIndex + 1;
        app.ticker.add(loading.tick);

        return tmpLoadingTween;
    },
    stop: (app, tickToStop, tweenToStop) => {
        if (tweenToStop !== null && tweenToStop !== undefined) {
            tweenToStop
                .pause()
                .time(0);
            app.ticker.remove(tickToStop);
            loading.circle.clear();
            app.stage.removeChild(loading.circle);
            const reduceShadowCircleInsideUiMenuContainer = (_uiMenuContainer) => {
                const shadowCircleArr = _uiMenuContainer.children
                    .map(__child => __child.getChildByName(menu.button.ui.shadowCircleName))
                    .filter(_shadow => _shadow !== undefined && _shadow !== null);

                if (shadowCircleArr.length > 0) {
                    shadowCircleArr.forEach(uiMenuShadow => {
                        if (uiMenuShadow.filters[0].blur >= UI_MIN_BLUR) {
                            uiMenuShadow.filters[0].blur += -4;
                        }
                    });
                    const currentMaxBlur = Math.max(...shadowCircleArr.map(s => s.filters[0].blur));
                    if (currentMaxBlur <= UI_MIN_BLUR) {
                        removePixiTick(app, listenerKeys.menu.decreaseBlurInMenuContainerTick);
                    }
                }
            };
            const reduceShadowCircle = () => {
                const uiMenuBtnShadows = app.stage
                    .getChildByName(ID.appContainerName)
                    .children
                    .map(appContainerChild => {
                        if (
                            appContainerChild.hasOwnProperty('id') &&
                            appContainerChild.id !== null && appContainerChild.id !== undefined &&
                            appContainerChild.id.includes(menu.button.ui.idPrefix)
                        ) {
                            return appContainerChild.getChildByName(menu.button.ui.shadowCircleName);
                        }
                        return null;
                    })
                    .filter(uiMenuBtnShadow => uiMenuBtnShadow !== null);

                    if (uiMenuBtnShadows.length > 0) {
                        uiMenuBtnShadows.forEach(uiMenuShadow => {
                            (uiMenuShadow.filters[0].blur >= UI_MIN_BLUR) && (uiMenuShadow.filters[0].blur += -4);
                        });
                        const currentMaxBlur = Math.max(...uiMenuBtnShadows.map(s => s.filters[0].blur));
                        if (currentMaxBlur <= UI_MIN_BLUR) {
                            removePixiTick(app, listenerKeys.menu.decreaseBlurTick);
                        }
                    }
            };
            const uiMenuContainer = app.stage.children
                .find(_child => _child.id === menu.container.ui);
            if (uiMenuContainer !== undefined) {
                addPixiTick(
                    app, listenerKeys.menu.decreaseBlurInMenuContainerTick,
                    () => reduceShadowCircleInsideUiMenuContainer(uiMenuContainer)
                );
            } else {
                addPixiTick(
                    app, listenerKeys.menu.decreaseBlurTick,
                    () => reduceShadowCircle()
                );
            }
        }

        return {
            resetTween: null,
            resetTick: null,
        }
    },
};

export const menuTopRight = (id=null, x=null, y =null) => {
    const menuContainer = new PIXI.Container();

    for (let i = 0; i < 3; i++) {
        const menuPart = new PIXI.Graphics();
        menuPart.lineStyle(3, 0xFFFFFF, 1);
        menuPart.beginFill(0x55335A);
        menuPart.drawRect(0, 0, 80, 20);
        menuPart.endFill();
        menuPart.y = Math.floor(i * 28);

        menuContainer.addChild(menuPart);
    }

    if (id !== null) menuContainer.id = id;
    if (x !== null) menuContainer.x = x;
    if (y !== null) menuContainer.y = y;

    return menuContainer;
};

export const menuTopRightFn = (
    app, mainTickForReturnBtn, hands, mainTickKey, returnToMMFunction
) => {
    removePixiTick(app, mainTickKey);

    let smvGOs;
    let pixiJsSmvTick;

    if (returnToMMFunction === null) {
        const {
            [smvRefs.container]:container,
            // [smvRefs.credits]:creditsBtn,
            [smvRefs.quit]:quitBtn,
            [smvRefs.returnBack]:returnBtn
        } = getSubMenuView(true);
        app.stage.addChild(container);

        smvGOs = [
            // [creditsBtnFn, creditsBtn],
            [quitBtnFn, quitBtn],
            [() => returnBtnFn(app, listenerKeys.menuView.smvTick, container, mainTickForReturnBtn, mainTickKey), returnBtn]
        ];
    } else {
        const {
            [smvRefs.container]:container,
            [smvRefs.mainMenu]:mainMenuBtn,
            [smvRefs.quit]:quitBtn,
            [smvRefs.returnBack]:returnBtn
        } = getSubMenuView(false);
        app.stage.addChild(container);

        const returnFn = () => returnBtnFn(
            app, listenerKeys.menuView.smvTick, container, mainTickForReturnBtn, mainTickKey
        );
        const removeSmvAndReturnToMM = () => {
            returnFn();
            returnToMMFunction();
        };

        smvGOs = [
            [removeSmvAndReturnToMM, mainMenuBtn],
            [quitBtnFn, quitBtn],
            [returnFn, returnBtn]
        ];
    }
    pixiJsSmvTick = () => menuCollRes(app, smvGOs, hands);
    addPixiTick(app, listenerKeys.menuView.smvTick, pixiJsSmvTick)
};

export const menuTopRightSceneFn = (
    app, interactiveTickObjs, worldTickObjs, mainTickObj, hands, _exitFn, menuTickObj
) => {
    interactiveTickObjs.forEach(tickObj => {
        const _key = tickObj[goLabels.interactive.tick];
        addPixiTickFromSceneToCache(_key, pixiTicks[_key]);
        removePixiTick(app, _key);
    });
    for (let key of Object.keys(worldTickObjs)) {
        addPixiTickFromSceneToCache(key, worldTickObjs[key]);
        removePixiTick(app, key);
    }
    //* mainTickObj[0] is the KEY and mainTickObj[1] is the main tick FUNCTION
    removePixiTick(app, mainTickObj[0]);
    addPixiTickFromSceneToCache(mainTickObj[0], mainTickObj[1]);

    //* menuTickObj[0] is the KEY and menuTickObj[1] is the main tick FUNCTION
    removePixiTick(app, menuTickObj[0]);
    addPixiTickFromSceneToCache(menuTickObj[0], menuTickObj[1]);

    const {
        [smvRefs.container]:container,
        [smvRefs.mainMenu]:mainMenuBtn,
        [smvRefs.quit]:quitBtn,
        [smvRefs.returnBack]:returnBtn
    } = getSubMenuView(false);
    app.stage.addChild(container);
    container.id = ID.sceneSmv;

    const returnFn = () => {
        const cachedPixiTicksFromSceneKeys = Object.keys(cachedPixiTicksFromScene);
        for (let key of cachedPixiTicksFromSceneKeys) {
            addPixiTick(app, key, cachedPixiTicksFromScene[key]);
            removeCachedPixiTickFromScene(key);
        }
        removePixiTick(app, listenerKeys.menuView.smvTick);
        app.stage.removeChild(container);

        addPixiTick(app, mainTickObj[0], mainTickObj[1]);
        removeCachedPixiTickFromScene(mainTickObj[0]);

        addPixiTick(app, menuTickObj[0], menuTickObj[1]);
        removeCachedPixiTickFromScene(menuTickObj[0]);
    };

    const exitFn = () => {
        clearAllPixiTimeouts();
        removePixiTick(app, listenerKeys.menuView.smvTick);
        app.stage.removeChild(container);
        _exitFn();
    };

    const smvGOs = [
        [exitFn, mainMenuBtn],
        [quitBtnFn, quitBtn],
        [returnFn, returnBtn]
    ];

    const pixiJsSmvTick = () => menuCollRes(app, smvGOs, hands);
    addPixiTick(app, listenerKeys.menuView.smvTick, pixiJsSmvTick);
};

// const creditsBtnFn = () => {
//     console.log('credits');
// };
export const quitBtnFn = () => {
    document.location.reload();
}
const returnBtnFn = (app, smvTickKey, container, mainTick, mainTickKey) => {
    removePixiTick(app, smvTickKey);
    app.stage.removeChild(container);

    addPixiTick(app, mainTickKey, mainTick);
}

const getSubMenuView = (isMainMenu) => {
    const subMenuContainer = new PIXI.Container();
    subMenuContainer.sortableChildren = true;
    subMenuContainer.zIndex = 49;

    const subMenuViewHeight = appViewDimension.height;
    const subMenuViewWidth = appViewDimension.width;
    const subMenuStartX = subMenuViewWidth * 0.65;

    const dimming = new PIXI.Graphics();
    dimming.beginFill(0x444444);
    dimming.drawRect(0, 0, subMenuViewWidth, subMenuViewHeight);
    dimming.endFill();
    dimming.alpha = 0.6;
    dimming.zIndex = 50;
    subMenuContainer.addChild(dimming);

    const rightOverlay = new PIXI.Graphics();
    rightOverlay.beginFill(0x666666);
    rightOverlay.drawRect(subMenuStartX, 0, subMenuViewWidth * 0.35, subMenuViewHeight);
    rightOverlay.endFill();
    rightOverlay.zIndex = 51;
    subMenuContainer.addChild(rightOverlay);

    const smvReturnIconBtn = new PIXI.Container();
    smvReturnIconBtn.zIndex = 52;
    const returnCircle = new PIXI.Graphics();
    returnCircle.lineStyle(1, 0xf9fcfb);
    returnCircle.beginFill(0x665566);
    returnCircle.drawCircle(0, 0, 40);
    returnCircle.endFill();
    returnCircle.pivot.set(0.5, 0.5);
    returnCircle.position.set(subMenuStartX, subMenuViewHeight * 0.5);
    returnCircle.zIndex = 53;
    smvReturnIconBtn.addChild(returnCircle);

    const returnArrow = new PIXI.Graphics();
    returnArrow.lineStyle(7, 0xf9fcfb, 1);
    returnArrow.moveTo(0, 0);
    returnArrow.lineTo(23, 23);
    returnArrow.lineTo(1, 46);
    returnArrow.position.set(
        subMenuStartX - (returnArrow.width/2.6),
        (subMenuViewHeight * 0.5) - (returnArrow.height/2.15)
    );
    returnArrow.zIndex = 54;
    smvReturnIconBtn.addChild(returnArrow);

    subMenuContainer.addChild(smvReturnIconBtn);

    const smvBtnQuit = defaultMenuButton(
        'Quit',
        ID.subMenu.default.quit,
        subMenuStartX + 26,
        subMenuViewHeight - 190,
        {w: viewConstant.smvBtnDim.w, h: viewConstant.smvBtnDim.h}
    );
    smvBtnQuit.zIndex = 52;
    subMenuContainer.addChild(smvBtnQuit);

    const customProps = {
        x: subMenuStartX + 26,
        y: 66,
        dim: {w: viewConstant.smvBtnDim.w, h: viewConstant.smvBtnDim.h},
        zIndex: 52,
        scale: 0.9,
    };

    let customButton;
    let customButtonKey;
    if (isMainMenu) {
        customButton = disabledMenuButton(
            'Credits',
            ID.subMenu.default.credits,
            customProps.x,
            customProps.y,
            customProps.dim
        );
        customButtonKey = smvRefs.credits;
    } else {
        customButton = defaultMenuButton(
            'Main Menu',
            ID.subMenu.default.credits,
            customProps.x,
            customProps.y,
            customProps.dim
        );
        customButton.children.find(e => e.text === 'Main Menu').scale.set(customProps.scale);
        customButtonKey = smvRefs.mainMenu;
    }

    customButton.zIndex = customProps.zIndex;
    subMenuContainer.addChild(customButton)

    return {
        [smvRefs.container]: subMenuContainer,
        [customButtonKey]: customButton,
        [smvRefs.quit]: smvBtnQuit,
        [smvRefs.returnBack]: smvReturnIconBtn,
    };
};

export const PixiJSMenu = (props) => {
    const startLevelsButton = defaultMenuButton(
        'Levels', menu.button.levelsId, viewConstant.initCoord.x, viewConstant.initCoord.y
    );

    // const tutorialsButton = defaultMenuButton(
    //     'Tutorials', menu.button.tutorialsId,
    //     viewConstant.initCoord.x, (viewConstant.initCoord.y + viewConstant.menuBtnDim.h + viewConstant.offset.h[80])
    // );

    const savesButton = disabledMenuButton(
        'Saves', menu.button.savesId,
        (viewConstant.initCoord.x + viewConstant.menuBtnDim.w + viewConstant.offset.w[73]), viewConstant.initCoord.y
    );

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    changeAudio(views.menu);

    useEffect(() => {
        logInfo('Logging PixiJSMenu useEffect');

        const { app, appContainer, hands, changeViewFn } = props;
        appContainer.addChild(startLevelsButton);
        // appContainer.addChild(tutorialsButton);
        appContainer.addChild(savesButton);
        appContainer.addChild(menuTopRightButton);

        let pixiJsMenuTick;
        const openSmv = () => menuTopRightFn(
            app, pixiJsMenuTick, hands, listenerKeys.menuView.mainTick, null
        );

        const menuGOs = [
            [() => changeViewFn(views.levels), startLevelsButton],
            // [() => changeViewFn(views.tutorials), tutorialsButton],
            [openSmv, menuTopRightButton]
        ];

        pixiJsMenuTick = () => menuCollRes(app, menuGOs, hands);
        addPixiTick(app, listenerKeys.menuView.mainTick, pixiJsMenuTick);
    },[
        props,
        startLevelsButton, savesButton, menuTopRightButton, 
    ]);

    return (
        <Fragment></Fragment>
    )
};
