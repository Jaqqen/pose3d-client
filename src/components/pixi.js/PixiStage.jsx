import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import React, { useEffect } from 'react';

export default function PixiStage(props) {
    const stageProps = {
        antialias: true,
        height: props.height,
        transparent: false,
        width: props.width,
    };

    const app = new PIXI.Application({...stageProps});

    useEffect(() => {
        document.getElementById(ID.pixiJsContainer).appendChild(app.view);

        app.loader
            .add('smolCat', require('static/assets/pixi.js/img/cat.png'))
            .add('mario', require('static/assets/pixi.js/img/mario.png'))
            .load((loader, resources) => {
                const smolCat = new PIXI.Sprite(resources.smolCat.texture);
                const mario = new PIXI.Sprite(resources.mario.texture);
                mario.tint = 0xFF0000;

                mario.scale.set(0.3);
                mario.x = 80;
                mario.y = 80;
                smolCat.x = 100;
                smolCat.y = 100;

                app.stage.addChild(mario)
                app.stage.addChild(smolCat);

                app.ticker.add(() => {
                    smolCat.rotation += 0.01;
                });
            });
    }, [app, props]);

    return (
        <div id={ID.pixiJsContainer}></div>
    )
}
