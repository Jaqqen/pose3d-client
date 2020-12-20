import * as CLASSNAME from 'shared/ClassName';
import { asset } from 'shared/Indentifiers';

import React, { Component } from 'react'
import { controllerId, startWebcamId } from 'shared/IdConstants';

export default class StartPageMain extends Component {
    render() {
        const { renderAppWithWebcam, renderAppWithController, } = this.props;

        return (
            <div className={CLASSNAME.startpageMainContainer}>
                <h1 style={{fontSize: '2.5em',}}> Welcome to Pose3D </h1>
                <p>
                    Please follow the instructions before clicking on <b>Start</b>
                </p>
                <br/>
                <p>
                    Please use <b>both hands</b> to navigate throughout the menu.
                </p>
                <div style={{display: 'flex',}}>
                    <img alt="leftHand" src={asset.hand.left.default} />
                    <img alt="rightHand" src={asset.hand.right.default} />
                </div>
                <h2 style={{
                    fontSize: '2em',
                    margin: 'auto',
                    marginTop: '36px',
                    width: 'fit-content',
                }}>Start with...</h2>
                <div className={CLASSNAME.startpageMainButtonContainer}>
                    <button id={startWebcamId} autoFocus={true} onClick={renderAppWithWebcam}>
                        Webcam
                    </button>
                    <button id={controllerId.start} onClick={renderAppWithController}>
                        Controller
                    </button>
                </div>
            </div>
        )
    }
}
