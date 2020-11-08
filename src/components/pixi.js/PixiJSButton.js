import * as PIXI from 'pixi.js';
import { pJsTxtOptions } from 'shared/Indentifiers';
import { getPixiJsText } from './PixiJSText';

const defaultMenuButtonDim = {
    h: 124,
    w: 350,
};

export const defaultMenuButton = (buttonName, id=null, x=null, y =null, dimensions={w: null, h: null}) => {
    const buttonContainer = new PIXI.Container();

    const defaultButton = new PIXI.Sprite(PIXI.Texture.WHITE);
    defaultButton.width = defaultMenuButtonDim.w;
    defaultButton.height = defaultMenuButtonDim.h;
    defaultButton.tint = '0xf8e4b7';
    if (dimensions !== null && dimensions !== undefined) {
        if (dimensions.w !== null && dimensions.h !== null) {
            buttonContainer.width = dimensions.w;
            buttonContainer.height = dimensions.h;
        }
    }

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