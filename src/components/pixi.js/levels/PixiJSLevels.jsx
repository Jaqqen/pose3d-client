import React, { useEffect, Fragment } from 'react'
import { levels } from 'shared/IdConstants';
import { assetRsrc, goLabels, listenerKeys, views } from 'shared/Indentifiers';
import { previewMenuBtn, uiMenuButton } from "components/pixi.js/PixiJSButton";
import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick } from '../SharedTicks';
import { viewConstant } from '../ViewConstants';
import { audioOnClick, changeAudio, shouldPlayAudio } from '../PixiJSAudio';
import { quitBtnFn } from '../PixiJSMenu';
import { UiMenu } from '../UiMenu';

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

    const audioUiButton = uiMenuButton(
        (shouldPlayAudio() === "true" ? assetRsrc.ui.pause : assetRsrc.ui.play),
        'audioSuffix',
        'Audio'
    );
    const creditsUiButton = uiMenuButton(assetRsrc.ui.dollar, 'creditsSuffix', 'Credits');
    const quitUiButton = uiMenuButton(assetRsrc.ui.power, 'quitSuffix', 'Quit');

    changeAudio(views.levels);

    useEffect(() => {
        logInfo('Logging PixiJSLevels useEffect');
        const { app, appContainer, hands, changeViewFn } = props;

        const levelMenuGOs = [
            [() => changeViewFn(views.levelNPrev), levelOneButton],
            [() => changeViewFn(views.levelHPrev), levelTwoButton],
            [() => changeViewFn(views.levelXPrev), levelThreeButton],
        ];

        const uiMenuContainer = new UiMenu();
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: audioUiButton,
            [goLabels.menu.ui.element.func]: () => audioOnClick.audioUiButtonOnComplete(audioUiButton),
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: creditsUiButton,
            [goLabels.menu.ui.element.func]: () => {console.log("credits")},
        });
        uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: quitUiButton,
            [goLabels.menu.ui.element.func]: quitBtnFn,
        });

        appContainer.addChild(levelOneButton);
        appContainer.addChild(levelTwoButton);
        appContainer.addChild(levelThreeButton);
        appContainer.addChild(uiMenuContainer.getRadialAccessPuller());
        appContainer.addChild(uiMenuContainer.getRadialAccessButton());

        const pixiJsLevelsTick = () => menuCollRes(app, levelMenuGOs, hands);
        addPixiTick(app, listenerKeys.levelsView.mainTick, pixiJsLevelsTick);

        const radialAccessPullerTick = () => {
            uiMenuContainer.getRadialAccessPullerTick(
                app, hands, listenerKeys.levelsView.mainTick, pixiJsLevelsTick, levelMenuGOs
            );
        };
        addPixiTick(app, listenerKeys.menu.uiMenuPullerTick, radialAccessPullerTick);
    },[
        props,
        levelOneButton, levelTwoButton, levelThreeButton,
        creditsUiButton, quitUiButton, audioUiButton
    ]);

    return (
        <Fragment></Fragment>
    )
}
