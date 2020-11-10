import React, { useEffect, Fragment } from 'react'
import { menu, tutorials } from 'shared/IdConstants';
import { listenerKeys, views } from 'shared/Indentifiers';
import { menuTopRight, menuTopRightFn, menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { previewMenuBtn } from "components/pixi.js/PixiJSButton";
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick } from '../SharedTicks';
import { viewConstant } from '../ViewConstants';

export const PixiJSTutorials = (props) => {
    const tutorialHandsButton = previewMenuBtn(
        'Hands', tutorials.button.hands, viewConstant.initCoord.x, viewConstant.initCoord.y
    );

    const previewBtnWidthAndOffset = viewConstant.previewBtnDim.w + viewConstant.offset.w[30]
    const secondMenuBtnX = viewConstant.initCoord.x + previewBtnWidthAndOffset;
    const tutorialSpeechButton = previewMenuBtn(
        'Speech', tutorials.button.hands, secondMenuBtnX, viewConstant.initCoord.y
    );

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    useEffect(() => {
        logInfo('Logging PixiJSTutorials useEffect');

        const { app, appContainer, hands, changeViewFn } = props;
        appContainer.addChild(tutorialHandsButton);
        appContainer.addChild(tutorialSpeechButton);
        appContainer.addChild(menuTopRightButton);

        let pixiJsTutorialsTick;
        const openSmv2 = () => menuTopRightFn(
            app, pixiJsTutorialsTick, appContainer, hands, listenerKeys.tutorialsView.mainTick,
            () => changeViewFn(views.menu)
        );

        const tutorialMenuGOs = [
            [() => changeViewFn(views.tutHands), tutorialHandsButton],
            [() => changeViewFn(views.tutSpeech), tutorialSpeechButton],
            [openSmv2, menuTopRightButton]
        ];

        pixiJsTutorialsTick = () => menuCollRes(app, tutorialMenuGOs, hands);
        addPixiTick(app, listenerKeys.tutorialsView.mainTick, pixiJsTutorialsTick);

    },[props, tutorialHandsButton, tutorialSpeechButton, menuTopRightButton]);

    return (
        <Fragment></Fragment>
    )
}
