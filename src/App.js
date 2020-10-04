import 'App.css';
import * as CLASSNAME from 'shared/ClassName';

import PixiJSMain from 'components/pixi.js/PixiJSMain';
import PoseMain from "components/pose/PoseMain";
import React, { Component } from 'react';
import StartPageMain from 'components/startpage/StartPageMain';
import VoiceHandler from 'components/voice/VoiceHandler';


export default class App extends Component {
    constructor(props) {
        super(props);
        this.initState = {
            hasMainAppStarted: false,
            pixiJSMain: {
                height: 0,
                width: 0,
            },
        };
        this.state = { ...this.initState };

        this.getPixiJSMainDimensions = this.getPixiJSMainDimensions.bind(this);
        this.renderMainAppPanel = this.renderMainAppPanel.bind(this);
    }

    renderMainAppPanel() {
        const startWebcam = window.confirm("Enable Webcam to start tracking?");
        this.setState({ hasMainAppStarted: startWebcam, });
    } 

    getPixiJSMainDimensions(_width, _height) {
        const { pixiJSMain } = this.state;

        this.setState({
            pixiJSMain: {
                ...pixiJSMain,
                height: _height,
                width: _width,
            },
        });
    } 

    getContentPanel() {
        const { hasMainAppStarted, pixiJSMain, } = this.state;

        if (hasMainAppStarted) {
            if (pixiJSMain.height !== 0 && pixiJSMain.width !== 0) {
                return (
                    <div className={CLASSNAME.app}>
                        <PoseMain 
                            getPixiJSMainDimensions={this.getPixiJSMainDimensions}
                        />
                        <VoiceHandler />
                        <PixiJSMain 
                            height={pixiJSMain.height}
                            width={pixiJSMain.width}
                        />
                    </div>
                );
            }

            return (
                <React.Fragment>
                    <div className={`${CLASSNAME.app} ${CLASSNAME.appLoading}`}>
                        <PoseMain 
                            getPixiJSMainDimensions={this.getPixiJSMainDimensions}
                        />
                    </div>
                    <div
                        className={CLASSNAME.loadingScreen}
                    >
                        .-`´-. Loading... .-`´-.
                    </div>
                </React.Fragment>
            );
        }

        return <StartPageMain renderMainAppPanel={this.renderMainAppPanel} />;
    }

    render() { return this.getContentPanel(); }
}
