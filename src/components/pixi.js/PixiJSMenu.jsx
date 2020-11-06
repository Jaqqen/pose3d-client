import * as PIXI from 'pixi.js';

import gsap from 'gsap/gsap-core';
import React, { Fragment, useEffect } from 'react';

import { Linear } from 'gsap/gsap-core';
import { testForAABB } from "components/pixi.js/PixiJSCollision";
import { getPixiJsText } from './PixiJSText';
import { goLabels, pJsTxtOptions, views } from 'shared/Indentifiers';
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

const defaultMenuButton = (buttonName, id=null, x=null, y =null) => {
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

const disabledMenuButton = (buttonName, id=null, x=null, y =null) => {
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

    return buttonContainer;
}

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
}

export const menuCleanUp = (app, globalObjCont) => {
    if ([goLabels.menu.MENU] in globalObjCont) {
        for (const gameObj of Object.values(globalObjCont[goLabels.menu.MENU])) {
            app.stage.removeChild(gameObj);
            gameObj.destroy({children:true, texture:true, baseTexture:true});
        }
        delete globalObjCont[goLabels.menu.MENU];
    }
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

        const menuGOs = [
            [() => changeViewFn(views.levels), startLevelsButton],
            [() => changeViewFn(views.tutorials), tutorialsButton],
            [() => console.log('topu Righto'), menuTopRightButton]
        ];
        app.ticker.add(() => menuCollRes(app, menuGOs, hands.left));

    },[props, startLevelsButton, tutorialsButton, savesButton, menuTopRightButton]);

    return (
        <Fragment></Fragment>
    )
};
