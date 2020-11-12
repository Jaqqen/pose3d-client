import React, { useEffect, Fragment } from 'react';
import { listenerKeys, preview, views } from 'shared/Indentifiers';
import { menuTopRightFn, menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { getPixiJsPreviewContainer } from "components/pixi.js/PixiJSPreview";
import { addPixiTick } from 'components/pixi.js/SharedTicks';
import { menuTopRight } from 'components/pixi.js/PixiJSMenu';
import { menu } from 'shared/IdConstants';
import { viewConstant } from 'components/pixi.js/ViewConstants';

export const PixiJSLevelThreePreview = (props) => {

    const {
        [preview.level.container]: prevContainer,
        [preview.level.returnBtn]: returnButton,
        [preview.level.startBtn]: startButton,
    } = getPixiJsPreviewContainer('Extreme');

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );

    useEffect(() => {
        logInfo('Logging PixiJSPrevThree useEffect');

        const { app, appContainer, hands, changeViewFn } = props;

        appContainer.addChild(prevContainer);
        appContainer.addChild(menuTopRightButton);

        let pixiJsPreviewTick;
        const openSmv2 = () => menuTopRightFn(
            app, pixiJsPreviewTick, appContainer, hands, listenerKeys.levelThreePreview.mainTick,
            () => changeViewFn(views.menu)
        );

        const previewMenuGOs = [
            [() => changeViewFn(views.levels), returnButton],
            [() => console.log('start level three'), startButton],
            [openSmv2, menuTopRightButton]
        ];

        pixiJsPreviewTick = () => menuCollRes(app, previewMenuGOs, hands);
        addPixiTick(app, listenerKeys.levelThreePreview.mainTick, pixiJsPreviewTick);

    },[props, prevContainer, returnButton, startButton, menuTopRightButton]);

    return (
        <Fragment></Fragment>
    )
}
