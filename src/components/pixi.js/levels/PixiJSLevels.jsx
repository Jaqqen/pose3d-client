import React, { useMemo, useEffect, Fragment } from 'react'
import { levels, menu } from 'shared/IdConstants';
import { assetRsrc, goLabels, listenerKeys, views } from 'shared/Indentifiers';
import { previewMenuBtn, uiMenuButton } from "components/pixi.js/PixiJSButton";
import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick } from '../SharedTicks';
import { viewConstant } from '../ViewConstants';
import { changeAudio } from '../PixiJSAudio';
import { UiMenu } from '../PixiJSGameObjects';
import { quitBtnFn } from '../PixiJSMenu';

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

    const creditsUiButton = uiMenuButton(assetRsrc.ui.dollar, 'creditsSuffix');
    const quitUiButton = uiMenuButton(assetRsrc.ui.power, 'quitSuffix');
    const uiMenuContainer = useMemo(() => {
        const _uiMenuContainer = new UiMenu();
        _uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: creditsUiButton,
            [goLabels.menu.ui.element.func]: () => {console.log("credits")},
        });
        _uiMenuContainer.addMenuItem({
            [goLabels.menu.ui.element.button]: quitUiButton,
            [goLabels.menu.ui.element.func]: quitBtnFn,
        });
        return _uiMenuContainer;
    }, [creditsUiButton, quitUiButton]);

    changeAudio(views.levels);

    useEffect(() => {
        logInfo('Logging PixiJSLevels useEffect');

        const { app, appContainer, hands, changeViewFn } = props;
        appContainer.addChild(levelOneButton);
        appContainer.addChild(levelTwoButton);
        appContainer.addChild(levelThreeButton);
        appContainer.addChild(uiMenuContainer.getContainerAsPixiContainer(menu.container.ui));

        let pixiJsLevelsTick;

        const levelMenuGOs = [
            [() => changeViewFn(views.levelNPrev), levelOneButton],
            [() => changeViewFn(views.levelHPrev), levelTwoButton],
            [() => changeViewFn(views.levelXPrev), levelThreeButton],
            ...uiMenuContainer.getAsMenuGOs(),
        ];

        pixiJsLevelsTick = () => menuCollRes(app, levelMenuGOs, hands);
        addPixiTick(app, listenerKeys.levelsView.mainTick, pixiJsLevelsTick);

    },[props, levelOneButton, levelTwoButton, levelThreeButton, uiMenuContainer]);

    return (
        <Fragment></Fragment>
    )
}
