import * as PIXI from 'pixi.js';

import { uiMenuOverworldButton } from 'components/pixi.js/PixiJSButton';
import { getPixiJsText } from 'components/pixi.js/PixiJSText';
import { viewConstant } from 'components/pixi.js/ViewConstants';
import { pJsTxtOptions, preview } from 'shared/Indentifiers';
import { previews } from "shared/IdConstants";

export const previewImgId = 'previewImg';

export const removePreviewTextureFromCache = () => {
    if (PIXI.utils.TextureCache[previewImgId]) {
        PIXI.utils.TextureCache[previewImgId].destroy(true);
    }
}

export const getPixiJsPreviewContainer = (previewHeading, descriptionText=null, img=null) => {
    const prevContainer = new PIXI.Container();
    const prevContConstraint = {
        init: {
            x: 30,
            y: 30,
        },
    };
    const initOneThird = viewConstant.previewDim.w/2.5;

    const difficulty = getPixiJsText(previewHeading, { [pJsTxtOptions.removeShadow]: true, });
    const diffBoxWidth = difficulty.width + 80;
    const diffBoxHeight = difficulty.height + 10;
    difficulty.anchor.set(0.5);
    difficulty.x = diffBoxWidth/2;
    difficulty.y = diffBoxHeight/2;

    const difficultyBox = new PIXI.Graphics();
    difficultyBox.lineStyle(5, 0xe2eff1, 0.9);
    difficultyBox.beginFill(0xda5151, 1);
    difficultyBox.drawRoundedRect(0, 0, diffBoxWidth, diffBoxHeight, 6);
    difficultyBox.endFill();
    difficultyBox.addChild(difficulty)
    difficultyBox.x = initOneThird;

    prevContainer.addChild(difficultyBox);

    const previewImgBox = new PIXI.Graphics();
    previewImgBox.lineStyle(5, 0xe2eff1, 0.9);
    previewImgBox.beginFill(0xf7c469, 1);
    previewImgBox.drawRoundedRect(0, 0, 540, 390, 6);
    previewImgBox.endFill();

    const previewImgBoxWidth = previewImgBox.width;
    const previewImgBoxHeight = previewImgBox.height;

    if (img !== null) {
        const previewImg = new PIXI.Sprite(PIXI.Texture.fromLoader(img, previewImgId));
        previewImg.anchor.set(0.5);
        previewImg.scale.set(0.21);
        previewImgBox.addChild(previewImg);
        previewImg.x = previewImgBoxWidth/2;
        previewImg.y = previewImgBoxHeight/2;
    }

    previewImgBox.x = initOneThird;
    previewImgBox.y = difficultyBox.y + difficultyBox.height + 20;
    prevContainer.addChild(previewImgBox);

    if (descriptionText == null) {
        descriptionText =   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do' +
                            'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim' +
                            'ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut' +
                            'aliquip ex ea commodo consequat. Duis aute irure dolor in' +
                            'reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';
    }

    const description = getPixiJsText(
        descriptionText,
        {
            [pJsTxtOptions.removeShadow]: true,
            [pJsTxtOptions.customFontSize]: 22,
            [pJsTxtOptions.wordWrap]: (viewConstant.previewDim.w/3) - 50,
            [pJsTxtOptions.fill]: '#eeeeee',
        }
    );
    description.anchor.set(0.5);

    const descriptionBox = new PIXI.Graphics();
    descriptionBox.lineStyle(5, 0xe2eff1, 0.9);
    descriptionBox.beginFill(0x548e87, 1);
    descriptionBox.drawRoundedRect(0, 0, (viewConstant.previewDim.w/3), previewImgBoxHeight, 6);
    descriptionBox.endFill();
    descriptionBox.addChild(description);
    descriptionBox.x = prevContConstraint.init.x;
    descriptionBox.y = difficultyBox.y + difficultyBox.height + 20;

    description.x = (viewConstant.previewDim.w/3)/2;
    description.y = previewImgBoxHeight/2;

    prevContainer.addChild(descriptionBox);

    const returnButton = uiMenuOverworldButton(previews.button.return, 'Back');
    returnButton.scale.set(0.8);
    returnButton.position.set(
        viewConstant.previewDim.w/2.3,
        viewConstant.previewDim.h
    );
    prevContainer.addChild(returnButton);

    const startButton = uiMenuOverworldButton(previews.button.start, 'Start');
    startButton.scale.set(0.8);
    startButton.position.set(
        viewConstant.previewDim.w * (2.8/4),
        viewConstant.previewDim.h
    );
    prevContainer.addChild(startButton);

    prevContainer.x = viewConstant.initCoord.x;
    prevContainer.y = viewConstant.initCoord.y;
    prevContainer.name = 'previewContainerName';

    return {
        [preview.level.container]: prevContainer,
        [preview.level.returnBtn]: returnButton,
        [preview.level.startBtn]: startButton,
    };
};