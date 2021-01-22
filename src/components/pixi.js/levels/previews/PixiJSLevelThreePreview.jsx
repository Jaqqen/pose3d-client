import { uiMenuButton } from 'components/pixi.js/PixiJSButton';
import { menuCollRes, quitBtnFn } from 'components/pixi.js/PixiJSMenu';
import { getPixiJsPreviewContainer } from "components/pixi.js/PixiJSPreview";
import { addPixiTick } from 'components/pixi.js/SharedTicks';
import { UiMenu } from 'components/pixi.js/UiMenu';
import React, { Fragment, useEffect } from 'react';
import { assetRsrc, goLabels, listenerKeys, preview, views } from 'shared/Indentifiers';
import { logInfo } from 'shared/P3dcLogger';

export const PixiJSLevelThreePreview = (props) => {

    const {
        [preview.level.container]: prevContainer,
        [preview.level.returnBtn]: returnButton,
        [preview.level.startBtn]: startButton,
    } = getPixiJsPreviewContainer('Extreme');

    const creditsUiButton = uiMenuButton(assetRsrc.ui.dollar, 'creditsSuffix', 'Credits');
    const returnUiButton = uiMenuButton(assetRsrc.ui.return, 'returnSuffix', 'Back');
    const quitUiButton = uiMenuButton(assetRsrc.ui.power, 'quitSuffix', 'Quit');

    useEffect(() => {
        logInfo('Logging PixiJSPrevThree useEffect');
        const { app, appContainer, hands, changeViewFn } = props;

        const previewMenuGOs = [
            [() => changeViewFn(views.levels), returnButton],
            [() => console.log('start level three'), startButton],
        ];

        const uiMenuContainer = new UiMenu();
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: creditsUiButton,
            [goLabels.menu.ui.element.func]: () => {console.log("credits")},
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: returnUiButton,
            [goLabels.menu.ui.element.func]: () => props.changeViewFn(views.levels),
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: quitUiButton,
            [goLabels.menu.ui.element.func]: quitBtnFn,
        });

        appContainer.addChild(prevContainer);
        appContainer.addChild(uiMenuContainer.getRadialAccessPuller());
        appContainer.addChild(uiMenuContainer.getRadialAccessButton());

        const pixiJsPreviewTick = () => menuCollRes(app, previewMenuGOs, hands);
        addPixiTick(app, listenerKeys.levelThreePreview.mainTick, pixiJsPreviewTick);

        const radialAccessPullerTick = () => {
            uiMenuContainer.getRadialAccessPullerTick(
                app, hands, listenerKeys.levelThreePreview.mainTick, pixiJsPreviewTick, previewMenuGOs
            );
        };
        addPixiTick(app, listenerKeys.menu.uiMenuPullerTick, radialAccessPullerTick);

    },[props, prevContainer, returnButton, startButton, creditsUiButton, returnUiButton, quitUiButton]);

    return (
        <Fragment></Fragment>
    )
}
