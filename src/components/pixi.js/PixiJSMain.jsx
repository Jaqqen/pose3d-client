import * as ID from 'shared/IdConstants';
import * as PIXI from 'pixi.js';

import PixiInteraction from 'components/pixi.js/PixiInteraction';
import React, { useEffect } from 'react';

import { interaction } from 'shared/Indentifiers';
import { posenetModule } from 'components/pose/PosenetModelModule';

export default function PixiJSMain(props) {
    const stageProps = {
        antialias: true,
        backgroundColor: 0x333333,
        height: props.height,
        transparent: true,
        width: props.width,
    };

    const app = new PIXI.Application({...stageProps});
    app.view.id = ID.pixiJsCanvas;

    const posenetModel = posenetModule;

    useEffect (() => {
        document.getElementById(ID.pixiJsContainer).appendChild(app.view);
    }, [app, props])

    return (
        <div id={ID.pixiJsContainer}>
            <PixiInteraction
                app={app}
                interactionType={interaction.hand}
                posenetModel={posenetModel}
            />
        </div>
    );
}
