import * as CLASSNAME from 'shared/ClassName';

import React, { Component } from 'react';
import PoseCam from './PoseCam';
import PoseCanvas from 'components/pose/PoseCanvas';
import PoseImg from 'components/pose/PoseImg';

import { media } from 'shared/Indentifiers';

export default class PoseMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            areJointsTracked: false,
            _srcRef: null,
            container: {
                height: 0,
                width: 0,
            },
            hasImageSrcLoaded: false,
            hasVideoSrcLoaded: false,
            isMirrored: true,
            srcPanelIdentifier: media.video,
        };

        //? bindings
        this.getImageSrcOnLoad = this.getImageSrcOnLoad.bind(this);
        this.getVideoSrcOnPlay = this.getVideoSrcOnPlay.bind(this);
        this.getPoseCanvas = this.getPoseCanvas.bind(this);
        this.getSrcPanel = this.getSrcPanel.bind(this);

        //? references
        this.srcContainerRef = React.createRef();
    }

    getImageSrcOnLoad(srcRef) {
        const { container } = this.state;
        const { getPixiJSMainDimensions } = this.props;

        const _height = srcRef.height;
        const _width = srcRef.width;

        getPixiJSMainDimensions(_width, _height);

        this.setState({
            container: {
                ...container,
                height: _height,
                width: _width,
            },
            hasImageSrcLoaded: true,
            _srcRef: srcRef,
        });
    }

    getVideoSrcOnPlay(srcRef) {
        const { container } = this.state;
        const { getPixiJSMainDimensions } = this.props;

        const _height = srcRef.height;
        const _width = srcRef.width;

        getPixiJSMainDimensions(_width, _height);

        this.setState({
            container: {
                ...container,
                height: _height,
                width: _width,
            },
            hasVideoSrcLoaded: true,
            _srcRef: srcRef,
        });
    }

    getPoseCanvas() {
        const { hasImageSrcLoaded, hasVideoSrcLoaded, _srcRef, isMirrored } = this.state;

        let srcType = null;
        if (hasVideoSrcLoaded) srcType = media.video;
        if (hasImageSrcLoaded) srcType = media.image;

        if (srcType !== null) {
            return (
                <PoseCanvas
                    isMirrored={isMirrored}
                    srcType={srcType}
                    srcRef={_srcRef}
                />
            );
        }
        return null;
    }

    getSrcPanel() {
        const { srcPanelIdentifier, isMirrored } = this.state;

        if (srcPanelIdentifier === media.image) {
            return (
                <PoseImg
                    getImageSrcOnLoad={this.getImageSrcOnLoad}
                />
            );
        } else if (srcPanelIdentifier === media.video) {
            return (
                <PoseCam
                    getVideoSrcOnPlay={this.getVideoSrcOnPlay}
                    isMirrored={isMirrored}
                />
            );
        } else {
            return null;
        }
    }

    getPoseMainContentPanel() {
        const { container, areJointsTracked } = this.state;

        return (
            <div
                style={{ height: container.height + 'px', width: container.width + 'px'}}
                className={CLASSNAME.poseMainContainer}
            >
                {
                    areJointsTracked ? 
                        this.getPoseCanvas()
                        :
                        null
                }

                {this.getSrcPanel()}
            </div>
        )
    }

    render() { return this.getPoseMainContentPanel(); }
}