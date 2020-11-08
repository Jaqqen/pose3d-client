import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import gsap from 'gsap/gsap-core';
import React, { Fragment, useEffect } from 'react';

import { Linear } from 'gsap/gsap-core';
import { testForAABB } from "components/pixi.js/PixiJSCollision";
import { getPixiJsText } from './PixiJSText';
import { pJsTxtOptions, views, smvRefs, listenerKeys } from 'shared/Indentifiers';
import { menu } from 'shared/IdConstants';
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick, removePixiTick } from './SharedTicks';
import { viewConstant } from './ViewConstants';

let loading = {
    circle: new PIXI.Graphics(),
    tick: null,
    tween: null,
};
let isHoveringOverMenu = false;
let storedHoverMenuItem = null;

const defaultMenuButtonDim = {
    h: 124,
    w: 350,
};

export const menuCollRes = (app, otherGOs, handGO) => {
    if (handGO !== undefined && handGO !== null) {

    const collisionGOs = otherGOs.filter(otherGO => testForAABB(handGO, otherGO[1]));
    const isSingleCollision = collisionGOs.length === 1;
    if (isSingleCollision) {
        const currentlyHoveredMenuItem = collisionGOs[0][1].id;
        if (storedHoverMenuItem !== currentlyHoveredMenuItem) {
            storedHoverMenuItem = currentlyHoveredMenuItem;
            menuCollcleanUp(app);
        }

        if (!isHoveringOverMenu) {

            isHoveringOverMenu = true;

            loading.tween = loadingConfigurator.start(
                app, collisionGOs[0][1], collisionGOs[0][0]
            );
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
    start: (app, otherGO, onCompleteFunc) => {
        app.stage.addChild(loading.circle);

        const RAD = Math.PI / 180;

        const arcParam = {
            x: (otherGO.getBounds().x + otherGO.getBounds().width),
            y: otherGO.getBounds().y,
            radius: 25,
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
            duration: 1.5,
            ease: Linear.easeNone,
            onComplete: onCompleteLoading,
        });

        loading.tick = () => {
            loading.circle
                .clear()
                .lineStyle(14, 0xf44336)
                .arc(arcParam.x, arcParam.y, arcParam.radius, -95 * RAD, arcParam.angle * RAD);
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
        }

        return {
            resetTween: null,
            resetTick: null,
        }
    },
};

export const defaultMenuButton = (buttonName, id=null, x=null, y =null, dimensions={w: null, h: null}) => {
    const buttonContainer = new PIXI.Container();

    const defaultButton = new PIXI.Sprite(PIXI.Texture.WHITE);
    defaultButton.width = defaultMenuButtonDim.w;
    defaultButton.height = defaultMenuButtonDim.h;
    defaultButton.tint = '0xf8e4b7';

    const buttonLabel = getButtonLabel(
        defaultButton, buttonName, { [pJsTxtOptions.removeShadow]: true, }
        );

    buttonContainer.addChild(defaultButton);
    buttonContainer.addChild(buttonLabel);

    if (id !== null) buttonContainer.id = id;
    if (x !== null) buttonContainer.x = x;
    if (y !== null) buttonContainer.y = y;
    if (dimensions !== null && dimensions !== undefined) {
        if (dimensions.w !== null && dimensions.h !== null) {
            buttonContainer.width = dimensions.w;
            buttonContainer.height = dimensions.h;
        }
    }

    return buttonContainer;
};

const getButtonLabel = (pixiJsGo, buttonText, options={}) => {
    const bounds = pixiJsGo.getBounds();

    const buttonLabel = getPixiJsText(
        buttonText, options
    );
    buttonLabel.anchor.set(0.5, 0.5);
    buttonLabel.position.set(
        (bounds.width/2),
        (bounds.height/2)
    );

    return buttonLabel;
};

export const disabledMenuButton = (buttonName, id=null, x=null, y =null, dimensions={w: null, h: null}) => {
    const buttonContainer = new PIXI.Container();

    const defaultButton = new PIXI.Sprite(PIXI.Texture.WHITE);
    defaultButton.width = defaultMenuButtonDim.w;
    defaultButton.height = defaultMenuButtonDim.h;
    defaultButton.tint = '0xe7ddc6';
    if (dimensions !== null && dimensions !== undefined) {
        if (dimensions.w !== null && dimensions.h !== null) {
            buttonContainer.width = dimensions.w;
            buttonContainer.height = dimensions.h;
        }
    }

    const buttonLabel = getButtonLabel(
        defaultButton, buttonName, {
            [pJsTxtOptions.removeShadow]: true,
            [pJsTxtOptions.alpha]: 0.5
        }
    );

    buttonContainer.addChild(defaultButton);
    buttonContainer.addChild(buttonLabel);

    if (id !== null) buttonContainer.id = id;
    if (x !== null) buttonContainer.x = x;
    if (y !== null) buttonContainer.y = y;

    return buttonContainer;
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
    app, mainTickForReturnBtn, appContainer, hands, mainTickKey, returnToMMFunction
) => {
    removePixiTick(app, mainTickKey);

    let smvGOs;
    let pixiJsSmvTick;

    if (returnToMMFunction === null) {
        const {
            [smvRefs.container]:container,
            [smvRefs.credits]:creditsBtn,
            [smvRefs.quit]:quitBtn,
            [smvRefs.returnBack]:returnBtn
        } = getSubMenuView(app, appContainer, true);
        app.stage.addChild(container);

        smvGOs = [
            // [creditsBtnFn, creditsBtn],
            [() => console.log('credits'), creditsBtn],
            [quitBtnFn, quitBtn],
            [() => returnBtnFn(app, listenerKeys.menuView.smvTick, container, mainTickForReturnBtn, mainTickKey), returnBtn]
        ];
    } else {
        const {
            [smvRefs.container]:container,
            [smvRefs.mainMenu]:mainMenuBtn,
            [smvRefs.quit]:quitBtn,
            [smvRefs.returnBack]:returnBtn
        } = getSubMenuView(app, appContainer, false);
        app.stage.addChild(container);

        const returnFn = () => returnBtnFn(
            app, listenerKeys.menuView.smvTick, container, mainTickForReturnBtn, mainTickKey
        );
        const removeSmvAndReturnToMM = () => {
            returnFn();
            returnToMMFunction();
        }

        smvGOs = [
            [removeSmvAndReturnToMM, mainMenuBtn],
            [quitBtnFn, quitBtn],
            [returnFn, returnBtn]
        ];
    }
    pixiJsSmvTick = () => menuCollRes(app, smvGOs, hands.left);
    addPixiTick(app, listenerKeys.menuView.smvTick, pixiJsSmvTick)
};

const creditsBtnFn = () => {
    console.log('credits');
};
const quitBtnFn = () => {
    document.location.reload();
}
const returnBtnFn = (app, smvTickKey, container, mainTick, mainTickKey) => {
    removePixiTick(app, smvTickKey);
    app.stage.removeChild(container);

    addPixiTick(app, mainTickKey, mainTick);
}

const getSubMenuView = (app, appContainer, isMainMenu) => {
    const subMenuContainer = new PIXI.Container();
    subMenuContainer.sortableChildren = true;
    subMenuContainer.zIndex = 49;

    const subMenuViewHeight = app.view.height;
    const subMenuViewWidth = app.view.width;
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

    const smvBtnQuit = disabledMenuButton(
        'Quit',
        ID.subMenu.default.quit,
        subMenuStartX + 26,
        subMenuViewHeight - 190,
        {w: viewConstant.modifiedMenuBtnDim.w, h: viewConstant.modifiedMenuBtnDim.h}
    );
    smvBtnQuit.zIndex = 52;
    subMenuContainer.addChild(smvBtnQuit);

    const customProps = {
        x: subMenuStartX + 26,
        y: 66,
        dim: {w: viewConstant.modifiedMenuBtnDim.w, h: viewConstant.modifiedMenuBtnDim.h},
        zIndex: 52,
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
        customButton = disabledMenuButton(
            'Main Menu',
            ID.subMenu.default.credits,
            customProps.x,
            customProps.y,
            customProps.dim
        );
        customButtonKey = smvRefs.mainMenu;
    }

    customButton.zIndex = customProps.zIndex;
    subMenuContainer.addChild(customButton)
    appContainer.addChild(subMenuContainer);

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

    const tutorialsButton = defaultMenuButton(
        'Tutorials', menu.button.tutorialsId,
        viewConstant.initCoord.x, (viewConstant.initCoord.y + viewConstant.modifiedMenuBtnDim.h)
    );

    const savesButton = disabledMenuButton(
        'Saves', menu.button.savesId,
        (viewConstant.initCoord.x + viewConstant.modifiedMenuBtnDim.w + 140), viewConstant.initCoord.y
    );

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    useEffect(() => {
        logInfo('Logging PixiJSMenu useEffect');

        const { app, appContainer, hands, changeViewFn } = props;
        appContainer.addChild(startLevelsButton);
        appContainer.addChild(tutorialsButton);
        appContainer.addChild(savesButton);
        appContainer.addChild(menuTopRightButton);

        let pixiJsMenuTick;
        const openSmv = () => menuTopRightFn(
            app, pixiJsMenuTick, appContainer, hands, listenerKeys.menuView.mainTick, null
        );

        const menuGOs = [
            [() => changeViewFn(views.levels), startLevelsButton],
            [() => console.log('tutorials'), tutorialsButton],
            [openSmv, menuTopRightButton]
        ];

        pixiJsMenuTick = () => menuCollRes(app, menuGOs, hands.left);
        addPixiTick(app, listenerKeys.menuView.mainTick, pixiJsMenuTick);
    },[
        props,
        startLevelsButton, tutorialsButton, savesButton, menuTopRightButton
    ]);

    return (
        <Fragment></Fragment>
    )
};
