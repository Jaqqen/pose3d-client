import { assetRsrc, listenerKeys } from "shared/Indentifiers";

import * as PIXI from 'pixi.js';
import { getRandomArbitrary } from "shared/Utils";
import gsap from "gsap/gsap-core";
import { Linear } from "gsap/gsap-core";
import { addPixiTick, removePixiTick } from "./SharedTicks";

const cloudInitDist = 272;
export const getCloudXDist = () => { return cloudInitDist + getRandomArbitrary(-55, 55); }

export const getCloudsForScene = (amountOfClouds, resources) => {
    let clouds = [];
    for (let i = 0; i < amountOfClouds; i++) {
        let assetType;
        if (i % 1.5 === 0) { assetType = assetRsrc.env.cloud.two; }
        else { assetType = assetRsrc.env.cloud.one; }
    
        clouds.push(new PIXI.Sprite(resources[assetType].texture));
    }
    return clouds;
};

export const getGroundsByTypeForScene = (amount, resources, groundType) => {
    let grounds = [];
    for (let i = 0; i < amount; i++) {
        grounds.push(new PIXI.Sprite(resources[groundType].texture));
    }
    return grounds;
};

export const defaultWorldAnimation = (tickSpeed, worldObjects) => {
    return () => {
        worldObjects.forEach(worldObject => {
            if (Array.isArray(worldObject)) {
                worldObject.forEach(object => {
                    object.x -= tickSpeed;
                });
            } else {
                worldObject.x -= tickSpeed;
            }
        })
    };
};

const _height = 50;
const _width = Math.floor((_height/2) * Math.sqrt(3));
const flagLineStyle = {
    width: 4,
    color: 0xf9fcfb,
    alpha: 1
};
export const getFinishingFlag = () => {
    const flag = new PIXI.Container();

    const finishingFlag = new PIXI.Graphics();
    finishingFlag.beginFill(0xeF0000, 1);
    finishingFlag.lineStyle(flagLineStyle.width, flagLineStyle.color, flagLineStyle.alpha);
    finishingFlag.moveTo(0, 0);
    finishingFlag.lineTo(_width, _height/2);
    finishingFlag.lineTo(0, _height);
    finishingFlag.lineTo(0, 0)
    finishingFlag.lineTo(_width, _height/2);
    finishingFlag.endFill()
    flag.addChild(finishingFlag)

    const flagBar = new PIXI.Graphics();
    flagBar.lineStyle(flagLineStyle.width, flagLineStyle.color, flagLineStyle.alpha);
    flagBar.moveTo(0, _height);
    flagBar.lineTo(0, _height * 2.1);
    flag.addChild(flagBar);

    return flag;
};

export const getCharacterEntryAnimation = (app, characterDummy, animations) => {
    const characterInit = {x: -70};
    const characterIntroTick = () => {characterDummy.position.x = characterInit.x};

    gsap.to(characterInit, {
        x: 220,
        duration: 3,
        ease: Linear.easeIn,
        onComplete: () => {
            for (let key of Object.keys(animations)) {
                addPixiTick(app, key, animations[key]);
            }
            removePixiTick(app, listenerKeys.char.entry.own);
        },
    });
    addPixiTick(app, listenerKeys.char.entry.own, characterIntroTick);
};

export const getCharacterFinishAnimation = (app, character, infiniteCloudsAnimation) => {
    const characterInScreenPos = {x: 220};
    const characterFinishingTick = () => {character.x = characterInScreenPos.x}
    gsap.to(characterInScreenPos, {
        x: app.view.width - 300,
        duration: 3,
        ease: Linear.easeInOut,
        onComplete: () => {
            console.log('finished level one');
            addPixiTick(app, listenerKeys.char.finish.own, characterFinishingTick);
            removePixiTick(app, listenerKeys.char.entry.infinite.clouds);
        },
    });
    addPixiTick(app, listenerKeys.char.finish.own, characterFinishingTick);
};

export const getFlagEntryAnimation = (app, appContainer, flagContainer, groundHeight, offset=0) => {
    flagContainer.zIndex = -10;
    flagContainer.x = app.view.width - 300;
    flagContainer.y = groundHeight - offset;
    appContainer.addChild(flagContainer);

    const flagContainerInit = {y: groundHeight - offset};
    const flagEntryTick = () => {flagContainer.y = flagContainerInit.y};
    gsap.to(flagContainerInit, {
        y: groundHeight - flagContainer.getBounds().width,
        duration: 2,
        ease: Linear.easeIn,
        onComplete: () => {
            console.log('flag here');
            removePixiTick(app, listenerKeys.game.object.flag.own);
        },
    });
    addPixiTick(app, listenerKeys.game.object.flag.own, flagEntryTick);
};