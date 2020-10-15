import React, { Component } from 'react'
import Webcam from 'react-webcam';

export default class PoseCam extends Component {
    constructor(props) {
        super(props);

        //? bindings
        this.setSrcReferenceInPoseMain = this.setSrcReferenceInPoseMain.bind(this);

        //? references
        this.webcamRef = React.createRef();
    }

    componentDidMount() {
        this.setSrcReferenceInPoseMain();
    }

    setSrcReferenceInPoseMain() {
        const { getVideoSrcOnPlay } = this.props

        const webcamVideo = this.webcamRef.current.video;

        webcamVideo.addEventListener('loadedmetadata', () => {
            webcamVideo.height = webcamVideo.clientHeight;
            getVideoSrcOnPlay(webcamVideo);
        });
    }

    render() {
        const { isMirrored } = this.props;

        return (
            <React.Fragment>
                <Webcam
                    audio={false}
                    mirrored={isMirrored}
                    ref={this.webcamRef}
                    screenshotFormat='image/jpeg'
                    screenshotQuality={1}
                    width={document.body.clientWidth * 0.7}
                />
            </React.Fragment>
        );
    }
}
