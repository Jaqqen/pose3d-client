import 'App.css';
import { appClassName, controllerClass, showClass } from 'shared/ClassName';

import PixiJSMain from 'components/pixi.js/PixiJSMain';
import React, { Component } from 'react';
import StartPageMain from 'components/startpage/StartPageMain';
import Webcam from 'react-webcam';

import { appMode, client } from 'shared/Indentifiers';
import { getPosenetModel, setPosenetModel } from 'components/pose/PoseHandler';
import { audioId, controllerId, kbAndMouse, poseWebcam, startWebcamId } from 'shared/IdConstants';
import { audioOnClick, getShowAudioClassByLocalStorage } from 'components/pixi.js/PixiJSAudio';

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

        this.disableButtonsWhenOptionConfirmed = this.disableButtonsWhenOptionConfirmed.bind(this);
        this.renderAppWithController = this.renderAppWithController.bind(this);
        this.renderAppWithKbAndMouse = this.renderAppWithKbAndMouse.bind(this);
        this.renderAppWithWebcam = this.renderAppWithWebcam.bind(this);
    }

    disableButtonsWhenOptionConfirmed() {
        document.querySelector('#' + startWebcamId).disabled = true;
        document.querySelector('#' + kbAndMouse.start).disabled = true;
        document.querySelector('#' + controllerId.start).disabled = true;
    }

    async renderAppWithWebcam() {
        const startWebcam = window.confirm("Enable Webcam to start tracking?");
        if (startWebcam) {
            this.disableButtonsWhenOptionConfirmed();

            const model = await getPosenetModel();
            setPosenetModel(model);
            this.setState({ hasMainAppStarted: appMode.WEBCAM, });
        }
    }

    async renderAppWithController() {
        const startController = window.confirm("Start playing with a controller?");
        if (startController) {
            this.disableButtonsWhenOptionConfirmed();

            const model = await getPosenetModel();
            setPosenetModel(model);
            this.setState({ hasMainAppStarted: appMode.CONTROLLER, });
        }
    }

    async renderAppWithKbAndMouse() {
        const startKbAndMouse = window.confirm("Start playing with keyboard and mouse?");
        if (startKbAndMouse) {
            this.disableButtonsWhenOptionConfirmed();

            const model = await getPosenetModel();
            setPosenetModel(model);
            this.setState({ hasMainAppStarted: appMode.KB_AND_MOUSE, });
        }
    }

    getContentPanel() {
        const { hasMainAppStarted, pixiJSMain, } = this.state;

        if (hasMainAppStarted === appMode.WEBCAM) {
            return (
                <div className={appClassName}>
                    <div id={audioId.container}>
                        <img
                            id={audioId.paused} alt={"audio"}
                            className={getShowAudioClassByLocalStorage().pauseImg}
                            src={client.icon.pause}
                            onClick={audioOnClick.pause}
                        />
                        <img
                            id={audioId.playing} alt={"audio"}
                            className={getShowAudioClassByLocalStorage().playImg}
                            src={client.icon.play}
                            onClick={audioOnClick.play}
                        />
                    </div>
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
                            src={client.icon.controller}
                        />
                        <img
                            id={controllerId.disconnected} alt={"controller disabled"}
                            className={`${controllerClass} ${showClass}`}
                            src={client.icon.controllerDisconnected}
                        />
                    </div>
                    <div id={audioId.container}>
                        <img
                            id={audioId.paused} alt={"audio"}
                            className={getShowAudioClassByLocalStorage().pauseImg}
                            src={client.icon.pause}
                            onClick={audioOnClick.pause}
                        />
                        <img
                            id={audioId.playing} alt={"audio"}
                            className={getShowAudioClassByLocalStorage().playImg}
                            src={client.icon.play}
                            onClick={audioOnClick.play}
                        />
                    </div>
                    <PixiJSMain
                        height={pixiJSMain.height}
                        width={pixiJSMain.width}
                        appMode={appMode.CONTROLLER}
                    />
                </div>
            );
        } else if (hasMainAppStarted === appMode.KB_AND_MOUSE) {
            return (
                <div className={appClassName}>
                    <div id={kbAndMouse.container}>
                        <img
                            id={kbAndMouse.default} alt={"keyboard_and_mouse"}
                            src={client.icon.keyboardAndMouse}
                        />
                    </div>
                    <div id={audioId.container}>
                        <img
                            id={audioId.paused} alt={"audio"}
                            className={getShowAudioClassByLocalStorage().pauseImg}
                            src={client.icon.pause}
                            onClick={audioOnClick.pause}
                        />
                        <img
                            id={audioId.playing} alt={"audio"}
                            className={getShowAudioClassByLocalStorage().playImg}
                            src={client.icon.play}
                            onClick={audioOnClick.play}
                        />
                    </div>
                    <PixiJSMain
                        height={pixiJSMain.height}
                        width={pixiJSMain.width}
                        appMode={appMode.KB_AND_MOUSE}
                    />
                </div>
            );
        }

        return (
            <StartPageMain
                renderAppWithWebcam={this.renderAppWithWebcam}
                renderAppWithController={this.renderAppWithController}
                renderAppWithKbAndMouse={this.renderAppWithKbAndMouse}
            />
        );
    }

    render() { return this.getContentPanel(); }
}
