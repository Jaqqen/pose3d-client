import { body } from 'shared/Indentifiers';

export const drawJoints = (coordinates, ctx) => {
    let keypoints = coordinates.keypoints;

    keypoints.forEach((keypoint) => {
        if (keypoint.score >= 0.5) {
            const { x, y } = keypoint.position;

            drawJointByPart(x, y, keypoint.part, ctx);
        }
    });
};

const drawJointByPart = (x, y, jointPart, ctx) => {
    if (jointPart === body.nose) {
        drawJoint(x, y, 'red', ctx);
    } else if (jointPart === body.left.eye || jointPart === body.right.eye) {
        drawJoint(x, y, 'blue', ctx);
    } else if (jointPart === body.left.ear || jointPart === body.right.ear) {
        drawJoint(x, y, 'green', ctx);
    } else if (jointPart === body.left.shoulder || jointPart === body.right.shoulder) {
        drawJoint(x, y, 'orange', ctx);
    } else if (jointPart === body.left.elbow || jointPart === body.right.elbow) {
        drawJoint(x, y, 'violet', ctx);
    } else if (jointPart === body.left.wrist || jointPart === body.right.wrist) {
        drawJoint(x, y, 'magenta', ctx);
    } else if (jointPart === body.left.hip || jointPart === body.right.hip) {
        drawJoint(x, y, 'black', ctx);
    } else if (jointPart === body.left.knee || jointPart === body.right.knee) {
        drawJoint(x, y, 'yellow', ctx);
    } else if (jointPart === body.left.ankle || jointPart === body.right.ankle) {
        drawJoint(x, y, 'cyan', ctx);
    }
};

const drawJoint = (x, y, color, ctx) =>  {
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