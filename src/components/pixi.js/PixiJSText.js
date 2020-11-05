import * as PIXI from 'pixi.js';
import { pJsTxtOptions } from 'shared/Indentifiers';

let style = {
    fontFamily: 'Tahoma',
    fontSize: 64,
    fontWeight: 'bold',
    fill: '#111111',
    stroke: '#4a4a48',
    strokeThickness: 2,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 3,
    dropShadowAlpha: 0.3,
    wordWrap: true,
    wordWrapWidth: 440,
    lineJoin: 'round'
};

export const getPixiJsText = (
    text,
    options = {
        [pJsTxtOptions.removeShadow]: false,
        [pJsTxtOptions.mediumSize]: false,
        [pJsTxtOptions.alpha]: 1
    }
) => {

    if (options[pJsTxtOptions.removeShadow]) {
        style = { ...style, dropShadow: false, };
    }
    if (options[pJsTxtOptions.mediumSize]) {
        style = { ...style, fontSize: 18, };
    }

    const pixiJsText = new PIXI.Text(text, style);

    if (options[pJsTxtOptions.alpha]) {
        pixiJsText.alpha = options[pJsTxtOptions.alpha];
    }

    return pixiJsText;
}