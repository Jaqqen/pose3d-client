import React, { useEffect, Fragment } from 'react'
import { levels } from 'shared/IdConstants';
import { assetRsrc, goLabels, listenerKeys, views } from 'shared/Indentifiers';
import { uiMenuButton, uiMenuOverworldButton } from "components/pixi.js/PixiJSButton";
import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { logInfo } from 'shared/P3dcLogger';
import { addPixiTick } from '../SharedTicks';
import { viewConstant } from '../ViewConstants';
import { audioOnClick, changeAudio, shouldPlayAudio } from '../PixiJSAudio';
import { quitBtnFn } from '../PixiJSMenu';
import { UiMenu } from '../UiMenu';

export const PixiJSLevels = (props) => {
    const levelOneButton = uiMenuOverworldButton(levels.button.one, 'Lv. 1');
    levelOneButton.position.set(
        viewConstant.initCoord.x + levelOneButton.width/2,
        viewConstant.initCoord.y + levelOneButton.height/2
    );

    const levelTwoButton = uiMenuOverworldButton(levels.button.two, 'Lv. 2');
    levelTwoButton.position.set(
        levelOneButton.x + levelOneButton.width/2 + viewConstant.initCoord.x + levelTwoButton.width/2,
        viewConstant.initCoord.y + levelTwoButton.height/2
    );

    const levelThreeButton = uiMenuOverworldButton(levels.button.two, 'Lv. 3');
    levelThreeButton.position.set(
        levelTwoButton.x + levelTwoButton.width/2 + viewConstant.initCoord.x + levelThreeButton.width/2,
        viewConstant.initCoord.y + levelThreeButton.height/2
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
