import * as PIXI from 'pixi.js';
import { menu } from 'shared/IdConstants';
import { pJsTxtOptions } from 'shared/Indentifiers';
import { getPixiJsText } from './PixiJSText';
import { viewConstant } from './ViewConstants';

const defaultMenuButtonDim = {
    h: viewConstant.menuBtnDim.h,
    w: viewConstant.menuBtnDim.w,
};
const defaultPreviewMenuBtnDim = {
    h: viewConstant.previewBtnDim.h,
    w: viewConstant.previewBtnDim.w,
};

export const defaultMenuButton = (buttonName, id=null, x=null, y=null, dimensions={w: null, h: null}) => {
    const buttonContainer = new PIXI.Container();

    const defaultButton = new PIXI.Sprite(PIXI.Texture.WHITE);
    defaultButton.width = defaultMenuButtonDim.w;
    defaultButton.height = defaultMenuButtonDim.h;
    defaultButton.tint = '0xf8e4b7';
    if (dimensions !== null && dimensions !== undefined) {
        if (dimensions.w !== null) { defaultButton.width = dimensions.w; }
        if (dimensions.h !== null) { defaultButton.height = dimensions.h; }
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
        if (dimensions.w !== null) { defaultButton.width = dimensions.w; }
        if (dimensions.h !== null) { defaultButton.height = dimensions.h; }
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

export const previewMenuBtn = (buttonName, id=null, x=null, y=null, dimensions={w: null, h: null}) => {
    const buttonContainer = new PIXI.Container();

    const defaultButton = new PIXI.Sprite(PIXI.Texture.WHITE);
    defaultButton.width = defaultPreviewMenuBtnDim.w;
    defaultButton.height = defaultPreviewMenuBtnDim.h;
    defaultButton.tint = '0xf8e4b7';
    if (dimensions !== null && dimensions !== undefined) {
        if (dimensions.w !== null) { defaultButton.width = dimensions.w; }
        if (dimensions.h !== null) { defaultButton.height = dimensions.h; }
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

export const UI_MIN_BLUR = 15;
export const uiMenuButton = (rsrcName, id_suffix, _buttonText=null, _x=null, _y=null) => {
    const buttonContainer = new PIXI.Container();

    const uiIcon = new PIXI.Sprite(PIXI.utils.TextureCache[rsrcName]);
    uiIcon.name = menu.button.ui.spriteName + id_suffix;
    uiIcon.anchor.set(0.5);
    uiIcon.scale.set(0.5);
    const buttonSize = uiIcon.width*0.75 + 10;

    const buttonCircle = new PIXI.Graphics();
    buttonCircle.lineStyle(0);
    buttonCircle.beginFill(0xecb390, 1);
    buttonCircle.drawCircle(0, 0, buttonSize);
    buttonCircle.endFill();

    const shadowCircle = new PIXI.Graphics();
    shadowCircle.name = menu.button.ui.shadowCircleName;
    shadowCircle.lineStyle(0);
    shadowCircle.beginFill(0x333333, 1);
    shadowCircle.drawCircle(0, 0, buttonSize+2);
    shadowCircle.endFill();
    shadowCircle.filters = [new PIXI.filters.BlurFilter(UI_MIN_BLUR, 7)];

    const buttonText = getPixiJsText(_buttonText, {
        [pJsTxtOptions.removeShadow]: true,
        [pJsTxtOptions.customFontSize]: 16,
        [pJsTxtOptions.wordWrap]: (viewConstant.previewDim.w/3) - 50,
        [pJsTxtOptions.fill]: '#ffffff',
        [pJsTxtOptions.fontWeight]: 'normal',
    });
    buttonText.name = menu.button.ui.buttonName + id_suffix;
    buttonText.anchor.set(0.5);
    buttonText.alpha = 0;

    buttonContainer.addChild(shadowCircle);
    buttonContainer.addChild(buttonCircle);
    buttonContainer.addChild(uiIcon);
    buttonContainer.addChild(buttonText);

    buttonText.y = -buttonContainer.height/2 - 20;

    _x && (buttonContainer.x = _x);
    _y && (buttonContainer.y = _y);

    buttonContainer.id = menu.button.ui.idPrefix + id_suffix;

    return buttonContainer;
};