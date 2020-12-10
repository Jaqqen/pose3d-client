import 'App.css';
import { appClassName, controllerClass, showClass } from 'shared/ClassName';

import PixiJSMain from 'components/pixi.js/PixiJSMain';
import React, { Component } from 'react';
import StartPageMain from 'components/startpage/StartPageMain';
import Webcam from 'react-webcam';

import { appMode, client_ui } from 'shared/Indentifiers';
import { getPosenetModel, setPosenetModel } from 'components/pose/PoseHandler';
import { controllerId, poseWebcam, startWebcamId } from 'shared/IdConstants';

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
            document.querySelector('#' + controllerId.start).disabled = true;

            const model = await getPosenetModel();
            setPosenetModel(model);
            this.setState({ hasMainAppStarted: appMode.WEBCAM, });
        }
    }

    async renderAppWithController() {
        const startController = window.confirm("Start playing with a controller?");
        if (startController) {
            document.querySelector('#' + startWebcamId).disabled = true;
            document.querySelector('#' + controllerId.start).disabled = true;

            const model = await getPosenetModel();
            setPosenetModel(model);
            this.setState({ hasMainAppStarted: appMode.CONTROLLER, });
        }
    }

    getContentPanel() {
        const { hasMainAppStarted, pixiJSMain, } = this.state;

        if (hasMainAppStarted === appMode.WEBCAM) {
            return (
                <div className={appClassName}>
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
                        appMode={appMode.WEBCAM}
                    />
                </div>
            );
        } else if (hasMainAppStarted === appMode.CONTROLLER) {
            return (
                <div className={appClassName}>
                    <div id={controllerId.container}>
                        <img
                            id={controllerId.connected} alt={"controller"}
                            className={`${controllerClass}`}
                            src={client_ui.icon.controller}
                        />
                        <img
                            id={controllerId.disconnected} alt={"controller disabled"}
                            className={`${controllerClass} ${showClass}`}
                            src={client_ui.icon.controllerDisconnected}
                        />
                    </div>
                    <PixiJSMain
                        height={pixiJSMain.height}
                        width={pixiJSMain.width}
                        appMode={appMode.CONTROLLER}
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
