import * as CLASSNAME from 'shared/ClassName.js';

import React, { Component } from 'react';

import { captureVideo, estimatePoseOnImage } from 'components/pose/PoseHandler';
import { drawJoints } from "shared/DrawHandler";
import { media } from 'shared/Indentifiers';
import { posenetModule } from './PosenetModelModule';

export default class PoseCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _srcRef: props.srcRef,
        };

        //? bindings
        this.drawGrid = this.drawGrid.bind(this);
        this.getPoseCoordinates = this.getPoseCoordinates.bind(this);
        this.setDimensions = this.setDimensions.bind(this);
        
        //? references
        this.canvasRef = React.createRef();
    }

    async componentDidMount() {
        const { srcType } = this.props;
        const { _srcRef } = this.state;

        const ctx = this.canvasRef.current.getContext("2d");

        //? sets dimensions to src dimensions
        const dimensions = this.setDimensions();

        //? draws grid for tests/check-ups - OPTIONAL
        // this.drawGrid(ctx);

        //? get coordinates
        if (srcType === media.image) {
            const poseCoordinates = await this.getPoseCoordinates();
            if (poseCoordinates !== null) drawJoints(poseCoordinates, ctx);
        }
        if (srcType === media.video) {
            captureVideo(ctx, dimensions, _srcRef, drawJoints);
        }
    }

    setDimensions() {
        const { _srcRef } = this.state;

        const width = _srcRef.width;
        const height = _srcRef.height;

        this.canvasRef.current.width = width;
        this.canvasRef.current.height = height;

        return {
            height: height,
            width: width,
        };
    }

    async getPoseCoordinates() {
        const { _srcRef } = this.state;

        let coordinates = await estimatePoseOnImage(posenetModule, _srcRef);
        return coordinates;
    }

    drawGrid(context) {
        const { _srcRef } = this.state

        const w = _srcRef.width;
        const h = _srcRef.height;

        //? vertical lines
        for (let x = 0; x <= w; x += 10) {
            context.moveTo(x, 0);
            context.lineTo(x, h);
        }

        //? horizontal lines
        for (let y = 0; y <= h; y += 10) {
            context.moveTo(0, y);
            context.lineTo(w, y);
        }

        context.strokeStyle = "black";
        context.stroke();
    }

    render() {
        const { isMirrored } = this.props;

        return (
            <React.Fragment>
                <div className={isMirrored ? CLASSNAME.canvasContainerFlipped : CLASSNAME.canvasContainer}>
                    <canvas
                        ref={this.canvasRef}
                        width={100}
                        height={100}
                    />
                </div>
            </React.Fragment>
        )
    }
}
