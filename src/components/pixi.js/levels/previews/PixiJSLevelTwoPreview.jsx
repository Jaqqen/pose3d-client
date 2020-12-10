import React, { useEffect, Fragment } from 'react';
import { listenerKeys, preview, views, viewsMain } from 'shared/Indentifiers';
import { menuTopRightFn, menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { getPixiJsPreviewContainer } from "components/pixi.js/PixiJSPreview";
import { addPixiTick } from 'components/pixi.js/SharedTicks';
import { menuTopRight } from 'components/pixi.js/PixiJSMenu';
import { menu } from 'shared/IdConstants';
import { viewConstant } from 'components/pixi.js/ViewConstants';

export const PixiJSLevelTwoPreview = (props) => {

    const {
        [preview.level.container]: prevContainer,
        [preview.level.returnBtn]: returnButton,
        [preview.level.startBtn]: startButton,
    } = getPixiJsPreviewContainer('Hard');

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    useEffect(() => {
        logInfo('Logging PixiJSPrevtwo useEffect');

        const { app, appContainer, hands, changeViewFn } = props;

        appContainer.addChild(prevContainer);
        appContainer.addChild(menuTopRightButton);

        let pixiJsPreviewTick;
        const openSmv2 = () => menuTopRightFn(
            app, pixiJsPreviewTick, hands, listenerKeys.levelTwoPreview.mainTick,
            () => changeViewFn(viewsMain)
        );

        const previewMenuGOs = [
            [() => changeViewFn(views.levels), returnButton],
            [() => console.log('start level two'), startButton],
            [openSmv2, menuTopRightButton]
        ];

        pixiJsPreviewTick = () => menuCollRes(app, previewMenuGOs, hands);
        addPixiTick(app, listenerKeys.levelTwoPreview.mainTick, pixiJsPreviewTick);

    },[props, prevContainer, returnButton, startButton, menuTopRightButton]);

    return (
        <Fragment></Fragment>
    )
}
