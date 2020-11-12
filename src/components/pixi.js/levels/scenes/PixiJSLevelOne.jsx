import * as PIXI from 'pixi.js';
import * as ID from 'shared/IdConstants';

import { menuTopRight } from 'components/pixi.js/PixiJSMenu';
import { menuTopRightFn } from 'components/pixi.js/PixiJSMenu';
import { menuCollRes } from 'components/pixi.js/PixiJSMenu';
import { addPixiTick, removePixiTick } from 'components/pixi.js/SharedTicks';
import { viewConstant } from 'components/pixi.js/ViewConstants';
import VoiceHandler from 'components/voice/VoiceHandler';

import React, { Fragment, useEffect } from 'react'
import { menu } from 'shared/IdConstants';
import { assetRsrc, listenerKeys, views } from 'shared/Indentifiers';
import { logInfo } from 'shared/P3dcLogger';
import { 
    getCloudsForScene, getCloudXDist, getGroundsByTypeForScene,
    defaultWorldAnimation, getFinishingFlag, getCharacterFinishAnimation, 
    getFlagEntryAnimation, getCharacterEntryAnimation
} from "components/pixi.js/PixiJSGameObjects";
import { getRandomArbitrary } from 'shared/Utils';


export const PixiJSLevelOne = (props) => {

    const menuTopRightButton = menuTopRight(
        menu.button.topRight, viewConstant.topRightMenuCoord.x, viewConstant.topRightMenuCoord.y
    );
    menuTopRightButton.zIndex = 80;

    useEffect(() => {
        logInfo('Logging PixiJS Level One useEffect');

        const { app, appContainer, hands, exitViewFn } = props;


        const bgCloudsContainer = app.stage.children.filter(
            (child) => child.id === ID.cloudsContainerBg
        )[0];

        app.stage.removeChild(bgCloudsContainer);

        appContainer.addChild(menuTopRightButton);

        let levelOneTick;

        app.loader
            .load((loader, resources) => {
                const openSmv2 = () => menuTopRightFn(
                    app, levelOneTick, appContainer, hands, listenerKeys.levelOneScene.mainTick,
                    () => exitViewFn(views.menu, resources)
                );

                let meteors = [];
                let icicles = [];

                const worldWidth = app.view.width * 5;
                const lastPartBeforeEndX = worldWidth - app.view.width;
                const amountOfClouds = 7;

                //? clouds
                let clouds = getCloudsForScene(amountOfClouds, resources);

                clouds.forEach((cloud, index) => {
                    cloud.x = index * getCloudXDist();
                    cloud.y = Math.floor(getRandomArbitrary(0, (app.view.height/3) - cloud.height));
                    appContainer.addChild(cloud);
                });

                for (let y = 0; y < 13; y++) {
                    meteors.push(new PIXI.Sprite(resources[assetRsrc.projectile.meteor].texture));
                    icicles.push(new PIXI.Sprite(resources[assetRsrc.projectile.icicle].texture));
                }

                //? ground
                const groundWithDots = getGroundsByTypeForScene(
                    3, resources, assetRsrc.env.ground.dots
                );
                groundWithDots.forEach((ground, index) => {
                    ground.x = index * ground.getBounds().width;
                    ground.y = app.view.height - ground.getBounds().height + 15;
                    appContainer.addChild(ground);
                });

                const tickSpeed = 12;
                const worldAnimation = defaultWorldAnimation(tickSpeed, [ clouds, groundWithDots ]);

                const aboveGroundHeight = app.view.height - groundWithDots[0].getBounds().height - 16;
                const flagContainer = getFinishingFlag();

                let elapsedGroundWidth = 0;
                const infiniteClouds = () => {
                    const lostCloudsArr = clouds.filter(
                        cloud => (cloud.x + cloud.getBounds().width) < 0
                    );
                    if (lostCloudsArr.length > 0) {
                        const xValuesOfClouds = clouds.map(obj => obj.x);
                        const endXOfClouds = (
                            Math.max(...xValuesOfClouds) + clouds[0].getBounds().width
                        );
                        lostCloudsArr.forEach(lostCloud => {
                            lostCloud.x = endXOfClouds + getCloudXDist();
                        });
                    }
                };
                const characterDummy = new PIXI.Sprite(resources[assetRsrc.character.dummy].texture);

                const infiniteGround = () => {
                    const lostGroundTileArr = groundWithDots.filter(
                        ground => (ground.x + ground.getBounds().width) < 0
                    );
                    if (lostGroundTileArr.length > 0) {
                        const lostTile = lostGroundTileArr[0];
                        const xValuesOfGroundTiles = groundWithDots.map(obj => obj.x);
                        const endXOfGroundTiles = (
                            Math.max(...xValuesOfGroundTiles) + lostTile.getBounds().width
                        );

                        lostTile.x = endXOfGroundTiles;
                        elapsedGroundWidth += lostTile.getBounds().width;

                        if (lastPartBeforeEndX < elapsedGroundWidth) {
                            removePixiTick(app, listenerKeys.char.entry.infinite.ground);
                            removePixiTick(app, listenerKeys.char.entry.worldAnim);

                            getFlagEntryAnimation(app, appContainer, flagContainer, aboveGroundHeight, 5)

                            getCharacterFinishAnimation(app, characterDummy, infiniteClouds);
                        }
                    }
                };
                
                //? character
                getCharacterEntryAnimation(
                    app, characterDummy, {
                        [listenerKeys.char.entry.worldAnim]: worldAnimation,
                        [listenerKeys.char.entry.infinite.clouds]: infiniteClouds,
                        [listenerKeys.char.entry.infinite.ground]: infiniteGround,
                    }
                );

                characterDummy.position.y = aboveGroundHeight;
                appContainer.addChild(characterDummy);
                //? meteor
                // meteor.scale.set(0.5, 0.5);

                // meteor.x = app.view.width + 100;
                // meteor.y = 250;

                // const meteorMove = () => {
                //     if (!(meteor.y > app.view.height)) {
                //         meteor.x -= 2.2;
                //         meteor.y += 1.5;
                //     } else { app.ticker.remove(meteorMove) }
                // };

                //? staging
                // app.stage.addChild(meteor);

                    // if (characterDummy.x <= 220) { characterDummy.x += 1.8 }
                // app.ticker.add();


                const levelGOs = [
                    [openSmv2, menuTopRightButton]
                ];

                levelOneTick = () => menuCollRes(app, levelGOs, hands);

                addPixiTick(app, listenerKeys.levelOneScene.mainTick, levelOneTick);
                // app.ticker.add(meteorMove);
                //! Character y-coordinate has to be set here
                // setJumpAt();
            });
    }, [props, menuTopRightButton])

    return (
        <Fragment>
            <VoiceHandler />
        </Fragment>
    )
}
