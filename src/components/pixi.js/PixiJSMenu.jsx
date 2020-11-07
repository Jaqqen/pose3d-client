import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import gsap from 'gsap/gsap-core';
import React, { Fragment, useEffect } from 'react';

import { Linear } from 'gsap/gsap-core';
import { testForAABB } from "components/pixi.js/PixiJSCollision";
import { getPixiJsText } from './PixiJSText';
import { pJsTxtOptions, views, smvRefs } from 'shared/Indentifiers';
import { menu } from 'shared/IdConstants';
import { logInfo } from 'shared/P3dcLogger';

let loading = {
    circle: new PIXI.Graphics(),
    tick: null,
    tween: null,
};
let isHoveringOverMenu = false;
let storedHoverMenuItem = null;

export const menuCollRes = (app, otherGOs, handGO) => {
    if (handGO !== undefined && handGO !== null) {
        setTimeout(() => {

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
        }, 600);

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
    defaultButton.width = 390;
    defaultButton.height = 274;
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

const disabledMenuButton = (buttonName, id=null, x=null, y =null, dimensions={w: null, h: null}) => {
    const buttonContainer = new PIXI.Container();

    const defaultButton = new PIXI.Sprite(PIXI.Texture.WHITE);
    defaultButton.width = 390;
    defaultButton.height = 274;
    defaultButton.tint = '0xe7ddc6';

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
    if (dimensions !== null && dimensions !== undefined) {
        if (dimensions.w !== null && dimensions.h !== null) {
            buttonContainer.width = dimensions.w;
            buttonContainer.height = dimensions.h;
        }
    }

    return buttonContainer;
};

const menuTopRight = (id=null, x=null, y =null) => {
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

const menuTopRightFn = (app, nonSmvTick, appContainer, hands) => {
    app.ticker.remove(nonSmvTick);

    const {
        [smvRefs.container]:container,
        [smvRefs.credits]:creditsBtn,
        [smvRefs.quit]:quitBtn,
        [smvRefs.returnBack]:returnBtn
    } = getSubMenuView(app, appContainer);
    app.stage.addChild(container);

    let pixiJsSmvTick;
    const returnBtnFnWithSmvTick = () => {
        returnBtnFn(app, pixiJsSmvTick, container, nonSmvTick);
    }

    const smvGOs = [
        [creditsBtnFn, creditsBtn],
        [quitBtnFn, quitBtn],
        [returnBtnFnWithSmvTick, returnBtn]
    ];
    pixiJsSmvTick = () => menuCollRes(app, smvGOs, hands.left);
    app.ticker.add(pixiJsSmvTick);
};


const creditsBtnFn = () => {
    console.log('credits');
};
const quitBtnFn = () => {
    document.location.reload();
}
const returnBtnFn = (app, pixiJsSmvTick, container, nonSmvTick) => {
    app.ticker.remove(pixiJsSmvTick);
    app.stage.removeChild(container);
    app.ticker.add(nonSmvTick);
}

const getSubMenuView = (app, appContainer) => {
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

    const smvBtnCredits = disabledMenuButton(
        'Credits',
        ID.subMenu.default.credits,
        subMenuStartX + 50,
        66,
        {w: 300, h: 190}
    );
    smvBtnCredits.zIndex = 52;
    subMenuContainer.addChild(smvBtnCredits);

    const smvBtnQuit = disabledMenuButton(
        'Quit',
        ID.subMenu.default.quit,
        subMenuStartX + 50,
        subMenuViewHeight - 190 - 50,
        {w: 300, h: 190}
    );
    smvBtnQuit.zIndex = 52;
    subMenuContainer.addChild(smvBtnQuit);

    appContainer.addChild(subMenuContainer);

    return {
        [smvRefs.container]: subMenuContainer,
        [smvRefs.credits]: smvBtnCredits,
        [smvRefs.quit]: smvBtnQuit,
        [smvRefs.returnBack]: smvReturnIconBtn,
    };
};

export const PixiJSMenu = (props) => {
    const initX = 66;
    const initY = 100;

    const startLevelsButton = defaultMenuButton('Levels', menu.button.levelsId, initX, initY);

    const tutorialsButton = defaultMenuButton('Tutorials', menu.button.tutorialsId, initX, 450);

    const savesButton = disabledMenuButton('Saves', menu.button.savesId, 570, initY);

    const menuTopRightButton = menuTopRight(menu.button.topRight, 1036, 26);

    useEffect(() => {
        logInfo('Logging PixiJSMenu useEffect');

        const { app, appContainer, hands, changeViewFn } = props;
        appContainer.addChild(startLevelsButton);
        appContainer.addChild(tutorialsButton);
        appContainer.addChild(savesButton);
        appContainer.addChild(menuTopRightButton);

        let pixiJsMenuTick;
        const openSmv = () => menuTopRightFn(app, pixiJsMenuTick, appContainer, hands);

        const menuGOs = [
            [() => changeViewFn(views.levels), startLevelsButton],
            [() => changeViewFn(views.tutorials), tutorialsButton],
            [openSmv, menuTopRightButton]
        ];
        pixiJsMenuTick = () => menuCollRes(app, menuGOs, hands.left);

        app.ticker.add(pixiJsMenuTick);
    },[
        props,
        startLevelsButton, tutorialsButton, savesButton, menuTopRightButton
    ]);

    return (
        <Fragment></Fragment>
    )
};
