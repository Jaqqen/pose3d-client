import React, { useEffect, Fragment } from 'react'
import { levels, menu } from 'shared/IdConstants';
import { listenerKeys, views } from 'shared/Indentifiers';
import { defaultMenuButton, disabledMenuButton } from "components/pixi.js/PixiJSButton";
import { menuTopRight, menuTopRightFn, menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick } from '../SharedTicks';
import { viewConstant } from '../ViewConstants';

export const PixiJSLevels = (props) => {
    const levelOneButton = defaultMenuButton(
        'Level 1', levels.button.one, viewConstant.initCoord.x, viewConstant.initCoord.y,
        {h: viewConstant.previewBtnDim.h, w: viewConstant.previewBtnDim.w,}
    );

    const levelTwoButton = disabledMenuButton(
        'Level 2', levels.button.two,
        viewConstant.initCoord.x, (viewConstant.initCoord.y + viewConstant.modifiedMenuBtnDim.h)
    );

    const levelThreeButton = disabledMenuButton(
        'Level 3', levels.button.three,
        (viewConstant.initCoord.x + viewConstant.modifiedMenuBtnDim.w + viewConstant.offset.w), viewConstant.initCoord.y
    );

    const menuTopRightButton = menuTopRight (
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    useEffect(() => {
        logInfo('Logging PixiJSLevels useEffect');

        const { app, appContainer, hands, changeViewFn } = props;
        appContainer.addChild(levelOneButton);
        appContainer.addChild(levelTwoButton);
        appContainer.addChild(levelThreeButton);
        appContainer.addChild(menuTopRightButton);

        let pixiJsLevelsTick;
        const openSmv2 = () => menuTopRightFn(
            app, pixiJsLevelsTick, appContainer, hands, listenerKeys.levelsView.mainTick,
            () => changeViewFn(views.menu)
        );

        const levelMenuGOs = [
            [() => console.log('level one'), levelOneButton],
            [() => console.log('level two'), levelTwoButton],
            [() => console.log('level three'), levelThreeButton],
            [openSmv2, menuTopRightButton]
        ];

        pixiJsLevelsTick = () => menuCollRes(app, levelMenuGOs, hands.left);
        addPixiTick(app, listenerKeys.levelsView.mainTick, pixiJsLevelsTick);

    },[props, levelOneButton, levelTwoButton, levelThreeButton, menuTopRightButton]);

    return (
        <Fragment></Fragment>
    )
}
