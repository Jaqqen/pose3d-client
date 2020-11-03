import VoiceHandler from 'components/voice/VoiceHandler';
import * as PIXI from 'pixi.js';

import React, { Fragment, useEffect } from 'react'
import { asset } from 'shared/Indentifiers';


export const PixiJSLevelOne = (props) => {
    const groundDotsNoneResourceName = 'groundDotsNone';
    const dummyResourceName = 'characterDummy';
    const meteorResourceName = 'meteor';

    useEffect(() => {
        const { app } = props;

        app.loader
            .add(groundDotsNoneResourceName, asset.env.groundDotsNone)
            .add(dummyResourceName, asset.character.dummy)
            .add(meteorResourceName, asset.projectile.meteor);
            // .load((loader, resources) => {
            //     const groundDotsNone = new PIXI.Sprite(resources[groundDotsNoneResourceName].texture);
            //     const characterDummy = new PIXI.Sprite(resources[dummyResourceName].texture);
            //     const meteor = new PIXI.Sprite(resources[meteorResourceName].texture)

            //     //? ground
            //     groundDotsNone.scale.set(2.1, 0.7);

            //     groundDotsNone.y = app.view.height - groundDotsNone.height + 20;
            //     groundDotsNone.x = 0;

            //     //? character
            //     characterDummy.y = app.view.height - groundDotsNone.height - 15;
            //     characterDummy.x = 0;

            //     //? meteor
            //     meteor.scale.set(0.5, 0.5);

            //     meteor.x = app.view.width + 100;
            //     meteor.y = 250;

            //     const meteorMove = () => {
            //         if (!(meteor.y > app.view.height)) {
            //             meteor.x -= 2.2;
            //             meteor.y += 1.5;
            //         } else { app.ticker.remove(meteorMove) }
            //     };

            //     //? staging
            //     app.stage.addChild(meteor);
            //     app.stage.addChild(groundDotsNone);
            //     app.stage.addChild(characterDummy);

            //     app.ticker.add(() => {
            //         characterDummy.x += 0.4;
            //     });
            //     app.ticker.add(meteorMove);

            //     app.ticker.add((detla) => {
                    
            //     });
            //     //! Character y-coordinate has to be set here
            //     // setJumpAt();
            // });

            props.setResourceInGlbCtx(groundDotsNoneResourceName, groundDotsNoneResourceName);
            props.setResourceInGlbCtx(dummyResourceName, dummyResourceName);
            props.setResourceInGlbCtx(meteorResourceName, meteorResourceName);
    }, [props])

    return (
        <Fragment>
            <VoiceHandler />
        </Fragment>
    )
}
