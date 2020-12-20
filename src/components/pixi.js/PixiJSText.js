import * as PIXI from 'pixi.js';
import { pJsTxtOptions } from 'shared/Indentifiers';

export const getPixiJsText = (
    text,
    options = {
        [pJsTxtOptions.removeShadow]: false,
        [pJsTxtOptions.mediumSize]: false,
        [pJsTxtOptions.customFontSize]: 64,
        [pJsTxtOptions.alpha]: 1,
        [pJsTxtOptions.wordWrap]: 440,
        [pJsTxtOptions.fill]: '#111111',
    }
) => {
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

    if (options[pJsTxtOptions.removeShadow]) {
        style = { ...style, dropShadow: false, };
    }
    if (options[pJsTxtOptions.mediumSize]) {
        style = { ...style, fontSize: 18, };
    } else if (options[pJsTxtOptions.mediumSize] !== undefined) {
        style = { ...style, fontSize: options[pJsTxtOptions.mediumSize], };
    }
    if (options[pJsTxtOptions.customFontSize] !== undefined) {
        style = { ...style, fontSize: options[pJsTxtOptions.customFontSize], };
    }
    if (options[pJsTxtOptions.wordWrap] !== undefined) {
        style = { ...style, wordWrapWidth: options[pJsTxtOptions.wordWrap], };
    }
    if (options[pJsTxtOptions.fill] !== undefined) {
        style = { ...style, fill: options[pJsTxtOptions.fill], };
    }

    const pixiJsText = new PIXI.Text(text, style);

    if (options[pJsTxtOptions.alpha]) {
        pixiJsText.alpha = options[pJsTxtOptions.alpha];
    }

    return pixiJsText;
}