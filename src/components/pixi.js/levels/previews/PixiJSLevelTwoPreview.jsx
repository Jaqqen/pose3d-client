import React, { useEffect, Fragment } from 'react';
import { assetRsrc, goLabels, listenerKeys, preview, views } from 'shared/Indentifiers';
import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { getPixiJsPreviewContainer, removePreviewTextureFromCache } from "components/pixi.js/PixiJSPreview";
import { addPixiTick } from 'components/pixi.js/SharedTicks';
import { uiMenuButton } from 'components/pixi.js/PixiJSButton';
import { UiMenu } from 'components/pixi.js/UiMenu';
import { quitBtnFn } from 'components/pixi.js/PixiJSMenu';
import previewImg from "static/assets/pixi.js/img/previewImg/PreviewLevelTwo.png";


export const PixiJSLevelTwoPreview = (props) => {

    const {
        [preview.level.container]: prevContainer,
        [preview.level.returnBtn]: returnButton,
        [preview.level.startBtn]: startButton,
    } = getPixiJsPreviewContainer(
        'Hard',
        'Etwas härter, aber definitiv nicht zu schwer. Versucht bis ans Ende des Untergrundpfades zu kommen und vermeidet, von den Fallen getroffen zu werden. Gibt Acht auf die rotierenden Ringe.',
        previewImg
    );

    const creditsUiButton = uiMenuButton(assetRsrc.ui.dollar, 'creditsSuffix', 'Credits');
    const returnUiButton = uiMenuButton(assetRsrc.ui.return, 'returnSuffix', 'Back');
    const quitUiButton = uiMenuButton(assetRsrc.ui.power, 'quitSuffix', 'Quit');

    useEffect(() => {
        logInfo('Logging PixiJSPrevtwo useEffect');
        const { app, appContainer, hands, changeViewFn } = props;

        const previewMenuGOs = [
            [() => changeViewFn(views.levels), returnButton],
            [() => changeViewFn(views.levelH), startButton],
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
        addPixiTick(app, listenerKeys.levelTwoPreview.mainTick, pixiJsPreviewTick);

        const radialAccessPullerTick = () => {
            uiMenuContainer.getRadialAccessPullerTick(
                app, hands, listenerKeys.levelTwoPreview.mainTick, pixiJsPreviewTick, previewMenuGOs
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
