import React, { useEffect, Fragment } from 'react'
import { menu, tutorials } from 'shared/IdConstants';
import { listenerKeys, views } from 'shared/Indentifiers';
import { menuTopRight, menuTopRightFn, menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { defaultMenuButton, disabledMenuButton } from "components/pixi.js/PixiJSButton";
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick } from '../SharedTicks';
import { viewConstant } from '../ViewConstants';

export const PixiJSTutorials = (props) => {
    const tutorialsOneButton = defaultMenuButton(
        'Tutorial 1', tutorials.button.one, viewConstant.initCoord.x, viewConstant.initCoord.y
    );

    const tutorialsTwoButton = disabledMenuButton(
        'Tutorial 2', tutorials.button.one,
        (viewConstant.initCoord.x + viewConstant.modifiedMenuBtnDim.w + viewConstant.offset.w), viewConstant.initCoord.y
    );

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    useEffect(() => {
        logInfo('Logging PixiJSTutorials useEffect');

        const { app, appContainer, hands, changeViewFn } = props;
        appContainer.addChild(tutorialsOneButton);
        appContainer.addChild(tutorialsTwoButton);
        appContainer.addChild(menuTopRightButton);

        let pixiJsTutorialsTick;
        const openSmv2 = () => menuTopRightFn(
            app, pixiJsTutorialsTick, appContainer, hands, listenerKeys.tutorialsView.mainTick,
            () => changeViewFn(views.menu)
        );

        const tutorialMenuGOs = [
            [() => console.log('tutorial one'), tutorialsOneButton],
            [() => console.log('tutorial two'), tutorialsTwoButton],
            [openSmv2, menuTopRightButton]
        ];

        pixiJsTutorialsTick = () => menuCollRes(app, tutorialMenuGOs, hands.left);
        addPixiTick(app, listenerKeys.tutorialsView.mainTick, pixiJsTutorialsTick);

    },[props, tutorialsOneButton, tutorialsTwoButton, menuTopRightButton]);

    return (
        <Fragment></Fragment>
    )
}
