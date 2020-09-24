import React, { Component } from 'react'

export default class PoseImg extends Component {
    constructor(props) {
        super(props);
        //? bindings
        this.setSrcReferenceInPoseMain = this.setSrcReferenceInPoseMain.bind(this);

        //? references
        this.imageRef = React.createRef();
    }

    setSrcReferenceInPoseMain() {
        const { getImageSrcOnLoad } = this.props

        getImageSrcOnLoad(this.imageRef.current);
    }

    render() {

        return (
            <React.Fragment>
                <img
                    onLoad={this.setSrcReferenceInPoseMain}
                    ref={this.imageRef}
                    alt={"obama"}
                    id={"xyz2"}
                    style= {{ maxHeight:'500px', }}
                    src={require("static/img//locals/dURRLkVfHr7ZRqTSHeHTEj-1366-80.jpg")}
                />
            </React.Fragment>
        );
    }
}
