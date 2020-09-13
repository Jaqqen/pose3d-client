import React, { Component } from 'react';
import 'App.css';
import PoseMain from "components/pose/PoseMain";
import VModelMain from "components/vmodel/VModelMain";
import StartPageMain from 'components/startpage/StartPageMain';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.initState = {
            hasMainAppStarted: false,
        };
        this.state = { ...this.initState };

        this.renderMainAppPanel = this.renderMainAppPanel.bind(this);
    }

    renderMainAppPanel() {
        const startWebcam = window.confirm("Enable Webcam to start tracking?");
        this.setState({ hasMainAppStarted: startWebcam, });
    }

    getContentPanel() {
        if (this.state.hasMainAppStarted) {
            return (
                <div className="App">
                    <PoseMain />
                    <VModelMain />
                </div>
            );
        }

        return <StartPageMain renderMainAppPanel={this.renderMainAppPanel} />;
    }

    render() { return this.getContentPanel(); }
}
