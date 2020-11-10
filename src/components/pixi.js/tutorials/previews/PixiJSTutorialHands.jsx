import React, { useEffect, Fragment } from 'react';
import { listenerKeys, preview, views } from 'shared/Indentifiers';
import { menuTopRightFn, menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { getPixiJsPreviewContainer } from "components/pixi.js/PixiJSPreview";
import { addPixiTick } from 'components/pixi.js/SharedTicks';
import { menuTopRight } from 'components/pixi.js/PixiJSMenu';
import { menu } from 'shared/IdConstants';
import { viewConstant } from 'components/pixi.js/ViewConstants';

export const PixiJSTutorialHands = (props) => {

    const {
        [preview.level.container]: prevContainer,
        [preview.level.returnBtn]: returnButton,
        [preview.level.startBtn]: startButton,
    } = getPixiJsPreviewContainer('Hands');

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    useEffect(() => {
        logInfo('Logging Tutorial Hands useEffect');

        const { app, appContainer, hands, changeViewFn } = props;

        appContainer.addChild(prevContainer);
        appContainer.addChild(menuTopRightButton);

        let pixiJsPreviewTick;
        const openSmv2 = () => menuTopRightFn(
            app, pixiJsPreviewTick, appContainer, hands, listenerKeys.tutorialHandsPreview.mainTick,
            () => changeViewFn(views.menu)
        );

        const previewMenuGOs = [
            [() => changeViewFn(views.tutorials), returnButton],
            [() => console.log('start tutorial hands'), startButton],
            [openSmv2, menuTopRightButton]
        ];

        pixiJsPreviewTick = () => menuCollRes(app, previewMenuGOs, hands.left);
        addPixiTick(app, listenerKeys.tutorialHandsPreview.mainTick, pixiJsPreviewTick);

    },[props, prevContainer, returnButton, startButton, menuTopRightButton]);

    return (
        <Fragment></Fragment>
    )
}
