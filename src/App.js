import 'App.css';
import * as CLASSNAME from 'shared/ClassName';

import PixiJSMain from 'components/pixi.js/PixiJSMain';
import React, { Component } from 'react';
import StartPageMain from 'components/startpage/StartPageMain';
import DatGui from "shared/DatGui";
import Webcam from 'react-webcam';

import { appMode } from 'shared/Indentifiers';
import { getPosenetModel, setposenetModel } from 'components/pose/PoseHandler';
import { poseWebcam, startWebcamId } from 'shared/IdConstants';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.initState = {
            hasMainAppStarted: appMode._START_PAGE_,
            pixiJSMain: {
                height: 0,
                width: 0,
            },
        };
        this.state = { ...this.initState };

        this.renderAppWithWebcam = this.renderAppWithWebcam.bind(this);
        this.renderAppWithController = this.renderAppWithController.bind(this);
    }

    async renderAppWithWebcam() {
        const startWebcam = window.confirm("Enable Webcam to start tracking?");
        if (startWebcam) {
            document.querySelector('#' + startWebcamId).disabled = true;
            const model = await getPosenetModel();
            setposenetModel(model);
            this.setState({ hasMainAppStarted: appMode.WEBCAM, });
        }
    }

    async renderAppWithController() {
        const model = await getPosenetModel();
        setposenetModel(model);
        this.setState({ hasMainAppStarted: appMode.CONTROLLER, });
    }

    getContentPanel() {
        const { hasMainAppStarted, pixiJSMain, } = this.state;

        if (hasMainAppStarted === appMode.WEBCAM) {
            return (
                <div className={CLASSNAME.appClassName}>
                    <Webcam
                        audio={false}
                        id={poseWebcam}
                        mirrored={true}
                        ref={this.webcamRef}
                        screenshotFormat='image/jpeg'
                        screenshotQuality={1}
                    />
                    <PixiJSMain
                        height={pixiJSMain.height}
                        width={pixiJSMain.width}
                    />
                </div>
            );
        } else if (hasMainAppStarted === appMode.CONTROLLER) {
            return (
                <div className={CLASSNAME.appClassName}>
                    <PixiJSMain
                        height={pixiJSMain.height}
                        width={pixiJSMain.width}
                    />
                </div>
            );
        }

        return (
            <StartPageMain
                renderAppWithWebcam={this.renderAppWithWebcam}
                renderAppWithController={this.renderAppWithController}
            />
        );
    }

    render() { return this.getContentPanel(); }
}
