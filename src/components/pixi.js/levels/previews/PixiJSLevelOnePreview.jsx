import React, { useEffect, Fragment } from 'react';
import { assetRsrc, goLabels, listenerKeys, preview, views } from 'shared/Indentifiers';
import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { 
    getPixiJsPreviewContainer, removePreviewTextureFromCache 
} from "components/pixi.js/PixiJSPreview";
import { addPixiTick } from 'components/pixi.js/SharedTicks';
import previewImg from "static/assets/pixi.js/img/previewImg/PreviewLevelOne.png";
import { uiMenuButton } from 'components/pixi.js/PixiJSButton';
import { quitBtnFn } from 'components/pixi.js/PixiJSMenu';
import { UiMenu } from 'components/pixi.js/UiMenu';

export const PixiJSLevelOnePreview = (props) => {
    const {
        [preview.level.container]: prevContainer,
        [preview.level.returnBtn]: returnButton,
        [preview.level.startBtn]: startButton,
    } = getPixiJsPreviewContainer(
        'Normal',
        'Ein simples, kleines Level bei dem man Projektile abwehren muss, um den Charackter erfolgreich zu seinem Ziel zu führen. Wichtig ist, immer einsatzbereit zu sein.',
        previewImg
    );

    const creditsUiButton = uiMenuButton(assetRsrc.ui.dollar, 'creditsSuffix', 'Credits');
    const returnUiButton = uiMenuButton(assetRsrc.ui.return, 'returnSuffix', 'Back');
    const quitUiButton = uiMenuButton(assetRsrc.ui.power, 'quitSuffix', 'Quit');

    useEffect(() => {
        logInfo('Logging PixiJSPrevOne useEffect');
        const { app, appContainer, hands, changeViewFn } = props;

        const previewMenuGOs = [
            [() => changeViewFn(views.levels), returnButton],
            [() => changeViewFn(views.levelN), startButton],
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
        addPixiTick(app, listenerKeys.levelOnePreview.mainTick, pixiJsPreviewTick);

        const radialAccessPullerTick = () => {
            uiMenuContainer.getRadialAccessPullerTick(
                app, hands, listenerKeys.levelOnePreview.mainTick, pixiJsPreviewTick, previewMenuGOs
            );
        };
        addPixiTick(app, listenerKeys.menu.uiMenuPullerTick, radialAccessPullerTick);

        return(() => {
            removePreviewTextureFromCache();
        });
    },[
        props,
        prevContainer, returnButton, startButton,
        creditsUiButton, returnUiButton, quitUiButton
    ]);

    return (
        <Fragment></Fragment>
    )
}
