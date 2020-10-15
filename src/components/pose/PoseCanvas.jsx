import React, { Component } from 'react';
import { estimatePoseOnImage } from 'components/pose/PoseHandler';
import * as CLASSNAME from 'shared/ClassName.js';

export default class PoseCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _srcRef: props.srcRef,
            _posenetModel: props._posenetModel,
        };

        //? bindings
        this.captureVideo = this.captureVideo.bind(this);
        this.drawGrid = this.drawGrid.bind(this);
        this.drawJoint = this.drawJoint.bind(this);
        this.drawJoints = this.drawJoints.bind(this);
        this.drawJointByPart = this.drawJointByPart.bind(this);
        this.getPoseCoordinates = this.getPoseCoordinates.bind(this);
        this.setDimensions = this.setDimensions.bind(this);
        
        //? references
        this.canvasRef = React.createRef();
    }

    async componentDidMount() {
        const { srcType } = this.props;

        const ctx = this.canvasRef.current.getContext("2d");

        //? sets dimensions to src dimensions
        const dimensions = this.setDimensions();

        //? draws grid for tests/check-ups - OPTIONAL
        // this.drawGrid(ctx);

        //? get coordinates
        if (srcType === 'image') {
            const poseCoordinates = await this.getPoseCoordinates();
            this.drawJoints(poseCoordinates, ctx);
        }
        if (srcType === 'video') {
            this.captureVideo(ctx, dimensions);
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

    captureVideo(ctx, dimensions) {
        const { _posenetModel, _srcRef } = this.state;

        _srcRef.onplay = () => {
            const step = async () => {
                let coordinates = await estimatePoseOnImage(_posenetModel, _srcRef);
                ctx.clearRect(0, 0, dimensions.width, dimensions.height);
                this.drawJoints(coordinates, ctx)
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
    }

    async getPoseCoordinates() {
        const { _posenetModel, _srcRef } = this.state;

        let coordinates = await estimatePoseOnImage(_posenetModel, _srcRef);
        return coordinates;
    }

    drawJoints(coordinates, ctx) {
        let keypoints = coordinates.keypoints;

        keypoints.forEach((keypoint) => {
            if (keypoint.score >= 0.5) {
                const { x, y } = keypoint.position;

                this.drawJointByPart(x, y, keypoint.part, ctx);
            }
        });
    }

    drawJointByPart(x, y, jointPart, ctx) {
        if (jointPart === 'nose') {
            this.drawJoint(x, y, 'red', ctx);
        } else if (jointPart === 'leftEye' || jointPart === 'rightEye') {
            this.drawJoint(x, y, 'blue', ctx);
        } else if (jointPart === 'leftEar' || jointPart === 'rightEar') {
            this.drawJoint(x, y, 'green', ctx);
        } else if (jointPart === 'leftShoulder' || jointPart === 'rightShoulder') {
            this.drawJoint(x, y, 'orange', ctx);
        } else if (jointPart === 'leftElbow' || jointPart === 'rightElbow') {
            this.drawJoint(x, y, 'violet', ctx);
        } else if (jointPart === 'leftWrist' || jointPart === 'rightWrist') {
            this.drawJoint(x, y, 'magenta', ctx);
        } else if (jointPart === 'leftHip' || jointPart === 'rightHip') {
            this.drawJoint(x, y, 'black', ctx);
        } else if (jointPart === 'leftKnee' || jointPart === 'rightKnee') {
            this.drawJoint(x, y, 'yellow', ctx);
        } else if (jointPart === 'leftAnkle' || jointPart === 'rightAnkle') {
            this.drawJoint(x, y, 'cyan', ctx);
        }
    }

    drawJoint(x, y, color, ctx) {
        const wholeValue = (floatValue) => {
            return (floatValue % Math.trunc(floatValue) > 0.5) 
                ? Math.ceil(floatValue)
                : Math.floor(floatValue);
        };

        ctx.beginPath();
        ctx.arc(wholeValue(x), wholeValue(y), 6, 0, 2*Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    };

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
