import * as PIXI from 'pixi.js';

import gsap from 'gsap/gsap-core';
import React, { Fragment, useEffect } from 'react';

import { Linear } from 'gsap/gsap-core';
import { testForAABB } from "components/pixi.js/PixiJSCollision";
import { getPixiJsText } from './PixiJSText';
import { goLabels, pJsTxtOptions } from 'shared/Indentifiers';
import { menu } from 'shared/IdConstants';

let loading = {
    circle: new PIXI.Graphics(),
    tick: null,
    tween: null,
};
let isHoveringOverMenu = false;
let storedHoverMenuItem = null;

export const menuCollRes = (app, _if_func, otherGOs, handGO) => {
    if (handGO.current !== undefined && handGO.current !== null) {
        const collisionGOs = otherGOs.filter(otherGO => testForAABB(handGO.current, otherGO));
        const isSingleCollision = collisionGOs.length === 1;
        if (isSingleCollision) {
            const currentlyHoveredMenuItem = collisionGOs[0].id;
            if (storedHoverMenuItem !== currentlyHoveredMenuItem) {
                storedHoverMenuItem = currentlyHoveredMenuItem;
                menuCollcleanUp(app);
            }

            if (!isHoveringOverMenu) {
                isHoveringOverMenu = true;

                loading.tween = loadingConfigurator.start(app, collisionGOs[0], _if_func);
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
            radius: 50,
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
            duration: 3,
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

const defaultMenuButton = (tint = '0xf8e4b7') => {
    const defaultButton = new PIXI.Sprite(PIXI.Texture.WHITE);
    defaultButton.width = 440;
    defaultButton.height = 284;
    defaultButton.tint = tint;

    return defaultButton;
};

const getAndSetTextOnButton = (pixiJsGo, buttonText) => {
    const bounds = pixiJsGo.getBounds();

    const buttonLabel = getPixiJsText(
        buttonText, { [pJsTxtOptions.removeShadow]: true, }
    );
    buttonLabel.anchor.set(0.5, 0.5);
    buttonLabel.position.set(
        bounds.x + (bounds.width/2),
        bounds.y + (bounds.height/2)
    );

    return buttonLabel;
};

const getAndSetTextOnDisabledButton = (pixiJsGo, buttonText, alpha) => {
    const bounds = pixiJsGo.getBounds();

    const buttonLabel = getPixiJsText(
        buttonText, {
            [pJsTxtOptions.removeShadow]: true,
            [pJsTxtOptions.alpha]: alpha,
        }
    );

    buttonLabel.anchor.set(0.5, 0.5);
    buttonLabel.position.set(
        bounds.x + (bounds.width/2),
        bounds.y + (bounds.height/2)
    );

    return buttonLabel;
};

export const PixiJSMenu = (props) => {
    const startLevelsButton = defaultMenuButton();
    startLevelsButton.position.set(100, 76);
    startLevelsButton.id = menu.button.levelsId;

    const tutorialsButton = defaultMenuButton();
    tutorialsButton.position.set(100, 450);
    startLevelsButton.id = menu.button.tutorialsId;

    const savesButton = defaultMenuButton('0xe7ddc6');
    savesButton.position.set(600, 76);
    startLevelsButton.id = menu.button.savesId;


    useEffect(() => {
        props.app.stage.addChild(startLevelsButton);
        props.app.stage.addChild(tutorialsButton);
        props.app.stage.addChild(savesButton);

        props.app.stage.addChild(getAndSetTextOnButton(startLevelsButton, 'Levels'));
        props.app.stage.addChild(getAndSetTextOnButton(tutorialsButton, 'Tutorials'));
        props.app.stage.addChild(getAndSetTextOnDisabledButton(savesButton, 'Saves', 0.5));

        props.setGoInGlbCtx(goLabels.menu.levels, startLevelsButton);
        props.setGoInGlbCtx(goLabels.menu.tutorials, tutorialsButton);
        props.setGoInGlbCtx(goLabels.menu.saves, savesButton);

    },[props, startLevelsButton, tutorialsButton, savesButton]);

    return (
        <Fragment></Fragment>
    )
};
