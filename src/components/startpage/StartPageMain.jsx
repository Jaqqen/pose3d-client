import * as CLASSNAME from 'shared/ClassName';

import React, { Component } from 'react'
import { asset } from 'shared/Indentifiers';

export default class StartPageMain extends Component {
    render() {
        return (
            <div className={CLASSNAME.startpageMainContainer}>
                <h1> Welcome to Pose3D </h1>
                <p>
                    Please follow the instructions before clicking on <b>Start</b>
                </p>
                <br/>
                <p>
                    Please use your <b>left hand</b> to navigate throughout the menu.
                </p>
                <img alt="leftHand" src={asset.hand.left} />
                <div className={CLASSNAME.startpageMainButtonContainer}>
                    <button autoFocus={true} onClick={this.props.renderMainAppPanel} >Start</button>
                </div>
            </div>
        )
    }
}
