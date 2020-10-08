import React, { Component } from 'react';
import PoseCam from './PoseCam';
import { getPosenetModel } from "components/pose/PoseHandler";
import * as CLASSNAME from 'shared/ClassName';
import PoseCanvas from 'components/pose/PoseCanvas';
import PoseImg from 'components/pose/PoseImg';

export default class PoseMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            container: {
                height: 0,
                width: 0,
            },
            _posenetModel: null,
            hasImageSrcLoaded: false,
            hasVideoSrcLoaded: false,
            _srcRef: null,
            srcPanelIdentifier: 'video',
        };

        //? bindings
        this.getPosenetModel = this.getPosenetModel.bind(this);
        this.getImageSrcOnLoad = this.getImageSrcOnLoad.bind(this);
        this.getVideoSrcOnPlay = this.getVideoSrcOnPlay.bind(this);
        this.getPoseCanvas = this.getPoseCanvas.bind(this);
        this.getSrcPanel = this.getSrcPanel.bind(this);

        //? references
        this.srcContainerRef = React.createRef();
    }

    componentDidMount() {
        this.getPosenetModel();
    }

    async getPosenetModel() {
        const posenetModel = await getPosenetModel();

        this.setState({ _posenetModel: posenetModel, });
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
        const { hasImageSrcLoaded, hasVideoSrcLoaded, _posenetModel, _srcRef } = this.state;

        let srcType = null;
        if (hasVideoSrcLoaded) srcType = 'video';
        if (hasImageSrcLoaded) srcType = 'image';

        if (srcType !== null) {
            return (
                <PoseCanvas
                    srcType={srcType}
                    srcRef={_srcRef}
                    _posenetModel={_posenetModel}
                />
            );
        }
        return null;
    }

    getSrcPanel() {
        const { srcPanelIdentifier } = this.state;

        if (srcPanelIdentifier === 'image') {
            return (
                <PoseImg
                    getImageSrcOnLoad={this.getImageSrcOnLoad}
                />
            );
        } else if (srcPanelIdentifier === 'video') {
            return (
                <PoseCam
                    getVideoSrcOnPlay={this.getVideoSrcOnPlay}
                />
            );
        } else {
            return null;
        }
    }

    getPoseMainContentPanel() {
        const { _posenetModel, container } = this.state;

        if (_posenetModel) {
            return (
                <div
                    style={{ height: container.height + 'px', width: container.width + 'px'}}
                    className={CLASSNAME.poseMainContainer}
                >
                    {this.getPoseCanvas()}
                    {this.getSrcPanel()}
                </div>
            )
        }

        return null;
    }

    render() { return this.getPoseMainContentPanel(); }
}