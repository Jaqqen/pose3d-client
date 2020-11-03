import * as PIXI from 'pixi.js';

import React, { Fragment, useEffect } from 'react';

export const PixiJSMenu = (props) => {
    const startLevelsButton = new PIXI.Sprite(PIXI.Texture.WHITE);
    startLevelsButton.position.set(100, 76);
    startLevelsButton.width = 440;
    startLevelsButton.height = 284;
    startLevelsButton.tint = '0xf8e4b7';

    useEffect(() => {
        props.app.stage.addChild(startLevelsButton);

        props.setGoInGlbCtx('levelsButton', startLevelsButton);

    },[props, startLevelsButton]);

    return (
        <Fragment></Fragment>
    )
}
