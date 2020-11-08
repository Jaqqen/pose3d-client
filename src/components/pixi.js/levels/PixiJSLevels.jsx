import React, { useEffect, Fragment } from 'react'
import { menu } from 'shared/IdConstants';
import { listenerKeys, views } from 'shared/Indentifiers';
import { defaultMenuButton, disabledMenuButton, menuTopRight, menuTopRightFn, menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick } from '../SharedTicks';

export const PixiJSLevels = (props) => {
    const initX = 66;
    const initY = 100;

    const levelOneButton = defaultMenuButton('Level 1', menu.button.levelsId, initX, initY);

    const levelTwoButton = disabledMenuButton('Level 2', menu.button.tutorialsId, initX, 450);

    const levelThreeButton = disabledMenuButton('Level 3', menu.button.savesId, 570, initY);

    const menuTopRightButton = menuTopRight (menu.button.topRight, 1036, 26);

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

        const testLevelOne = () => {
            debugger
            console.log('level one');
        }
        const levelMenuGOs = [
            [testLevelOne, levelOneButton],
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
