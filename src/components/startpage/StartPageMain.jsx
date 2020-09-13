import React, { Component } from 'react'
import * as CLASSNAME from 'shared/ClassName';

export default class StartPageMain extends Component {
    render() {
        return (
            <div className={CLASSNAME.startpageMainContainer}>
                <h1> Welcome to Pose3D </h1>
                <p>
                    Please follow the instructions in the following page after clicking on <b>Start</b>
                </p>
                <div className={CLASSNAME.startpageMainButtonContainer}>
                    <button onClick={this.props.renderMainAppPanel} >Start</button>
                </div>
            </div>
        )
    }
}
