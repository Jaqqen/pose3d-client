import * as PIXI from 'pixi.js';

import { defaultMenuButton } from 'components/pixi.js/PixiJSButton';
import { getPixiJsText } from 'components/pixi.js/PixiJSText';
import { viewConstant } from 'components/pixi.js/ViewConstants';
import { pJsTxtOptions, preview } from 'shared/Indentifiers';
import { previews } from "shared/IdConstants";

export const getPixiJsPreviewContainer = (previewHeading, descriptionText=null, img=null) => {
    const prevContainer = new PIXI.Container();
    prevContainer.x = viewConstant.initCoord.x;
    prevContainer.y = viewConstant.initCoord.y;

    const prevContConstraint = {
        init: {
            x: 45,
            y: 30,
        },
    };

    const background = new PIXI.Sprite(PIXI.Texture.WHITE);
    background.width = viewConstant.previewDim.w;
    background.height = viewConstant.previewDim.h;
    background.tint = '0x7e7474';
    prevContainer.addChild(background);

    const difficulty = getPixiJsText(previewHeading, { [pJsTxtOptions.removeShadow]: true, });
    difficulty.anchor.set(0.5, 0.5);

    const initOneThird = viewConstant.previewDim.w/3;

    const remainingContWidth = viewConstant.previewDim.w * (2/3);
    difficulty.x = initOneThird + (remainingContWidth/2);

    difficulty.y = difficulty.height/2 + 10;

    prevContainer.addChild(difficulty);

    let previewImg;
    if (img !== null) {
        // code to write
    } else {
        previewImg = new PIXI.Sprite(PIXI.Texture.WHITE);
        previewImg.width = 500;
        previewImg.height = 370;
        previewImg.tint = '0x856b69';
    }

    previewImg.anchor.set(0.5);

    previewImg.x = initOneThird + (remainingContWidth/2);
    previewImg.y = difficulty.height + 20 + previewImg.height/2;

    prevContainer.addChild(previewImg);

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
            [pJsTxtOptions.mediumSize]: true,
            [pJsTxtOptions.wordWrap]: (viewConstant.previewDim.w/3) - 50,
        }
    );

    description.x = prevContConstraint.init.x;
    description.y = prevContConstraint.init.y + difficulty.height/2;

    prevContainer.addChild(description);

    const previewButtonDim = {
        w: viewConstant.menuBtnDim.w - 30,
        h: viewConstant.menuBtnDim.h - 50,
    };
    const returnButton = defaultMenuButton(
        'Return', previews.button.return, 0, 0,
        previewButtonDim
    );
    returnButton.x = viewConstant.previewDim.w/4 - returnButton.getBounds().width/2;
    returnButton.y = viewConstant.previewDim.h - returnButton.getBounds().height/2;
    prevContainer.addChild(returnButton);

    const startButton = defaultMenuButton(
        'Start', previews.button.start, 0, 0,
        previewButtonDim
    );
    startButton.x = viewConstant.previewDim.w * (3/4) - startButton.getBounds().width/2;
    startButton.y = viewConstant.previewDim.h - startButton.getBounds().height/2;
    prevContainer.addChild(startButton);

    return {
        [preview.level.container]: prevContainer,
        [preview.level.returnBtn]: returnButton,
        [preview.level.startBtn]: startButton,
    };
};