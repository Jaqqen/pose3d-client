import React, { useEffect, Fragment } from 'react'
import { levels, menu } from 'shared/IdConstants';
import { listenerKeys, views } from 'shared/Indentifiers';
import { previewMenuBtn } from "components/pixi.js/PixiJSButton";
import { menuTopRight, menuTopRightFn, menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick } from '../SharedTicks';
import { viewConstant } from '../ViewConstants';
import { changeAudio } from '../PixiJSAudio';

export const PixiJSLevels = (props) => {

    const levelOneButton = previewMenuBtn(
        'Lv. 1', levels.button.one, viewConstant.initCoord.x, viewConstant.initCoord.y
    );

    const previewBtnWidthAndOffset = viewConstant.previewBtnDim.w + viewConstant.offset.w[30]
    const secondMenuBtnX = viewConstant.initCoord.x + previewBtnWidthAndOffset;
    const levelTwoButton = previewMenuBtn(
        'Lv. 2', levels.button.two, secondMenuBtnX, viewConstant.initCoord.y 
    );

    const thirdMenuBtnX = secondMenuBtnX + previewBtnWidthAndOffset;
    const levelThreeButton = previewMenuBtn(
        'Lv. 3', levels.button.three,
        thirdMenuBtnX, viewConstant.initCoord.y
    );

    const menuTopRightButton = menuTopRight (
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    changeAudio(views.levels);

    useEffect(() => {
        logInfo('Logging PixiJSLevels useEffect');

        const { app, appContainer, hands, changeViewFn } = props;
        appContainer.addChild(levelOneButton);
        appContainer.addChild(levelTwoButton);
        appContainer.addChild(levelThreeButton);
        appContainer.addChild(menuTopRightButton);

        let pixiJsLevelsTick;
        // const openSmv2 = () => menuTopRightFn(
        //     app, pixiJsLevelsTick, hands, listenerKeys.levelsView.mainTick,
        //     () => changeViewFn(views.menu)
        // );
        const openSmv2 = () => menuTopRightFn(
            app, pixiJsLevelsTick, hands, listenerKeys.levelsView.mainTick, null
        );

        const levelMenuGOs = [
            [() => changeViewFn(views.levelNPrev), levelOneButton],
            [() => changeViewFn(views.levelHPrev), levelTwoButton],
            [() => changeViewFn(views.levelXPrev), levelThreeButton],
            [openSmv2, menuTopRightButton]
        ];

        pixiJsLevelsTick = () => menuCollRes(app, levelMenuGOs, hands);
        addPixiTick(app, listenerKeys.levelsView.mainTick, pixiJsLevelsTick);

    },[props, levelOneButton, levelTwoButton, levelThreeButton, menuTopRightButton]);

    return (
        <Fragment></Fragment>
    )
}
