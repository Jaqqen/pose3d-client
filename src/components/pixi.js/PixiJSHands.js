import { estimatePoseOnImage } from "components/pose/PoseHandler";
import { Sprite, utils } from "pixi.js";
import { assetRsrc, body } from "shared/Indentifiers";
import { getInterpolatedValues } from "shared/Utils";

export let leftHand = null;
export const setLeftHand = (_leftHand) => { leftHand = _leftHand; };

export let rightHand = null;
export const setRightHand = (_rightHand) => { rightHand = _rightHand; };

let leftHandBaseTexture = null;

let appViewDimension = {
    height: null,
    width: null,
};

export const getHandByRsrcName = (app, rsrcName) => {
    const hand = {
        go: null,
    };

    hand.go = new Sprite(utils.TextureCache[rsrcName]);
    hand.go.x = app.view.width/2;
    hand.go.y = hand.go.height * (-1);
    hand.go.zIndex = 99;
    if (rsrcName === assetRsrc.leftHand && leftHand === null) {
        leftHandBaseTexture = utils.BaseTextureCache[rsrcName];
        appViewDimension = {
            height: app.view.height,
            width: app.view.width,
        };
    };
    return hand;
};

export const getHands = (asGo = true) => {
    if (leftHand !== null && rightHand !== null) {
        if (asGo) {
            return {
                right: rightHand.go,
                left: leftHand.go,
            };
        }

        return {
            right: rightHand,
            left: leftHand,
        };
    }

    return null;
};

export const renderHands = (src) => {
    src.height = src.clientHeight;
    src.width = src.clientWidth;
    const step = async () => {
        let coordinates = await estimatePoseOnImage(src);
        if (coordinates !== null) setHandsPositions(coordinates);
        requestAnimationFrame(step);
    };
    step();
}

const setHandsPositions = (coordinates) => {
    if (leftHand !== null) {
        const {x: inX, y: inY} = getInterpolatedValues(
            {x: leftHand.go.x, y: leftHand.go.y},
            getCenterKPtOfHand(getHandPositions(coordinates, body.left.wrist)),
            0.4
        );
        leftHand.go.x = inX;
        leftHand.go.y = inY;
    }
    if (rightHand !== null) {
        const {x: inX, y: inY} = getInterpolatedValues(
            {x: rightHand.go.x, y: rightHand.go.y},
            getCenterKPtOfHand(getHandPositions(coordinates, body.right.wrist)),
            0.4
        );
        rightHand.go.x = inX;
        rightHand.go.y = inY;
    }
};

const getCenterKPtOfHand = (keypoint) => {
    if (keypoint !== null) {
        return {
            x: keypoint.x - (leftHandBaseTexture.width/2),
            y: keypoint.y - (leftHandBaseTexture.height * 1.5)
        };
    }

    return {x: appViewDimension.width/2, y: (leftHandBaseTexture.height * (-1)),};
};

const getHandPositions = (coordinates, handType) => {
    const kPWrist = coordinates.keypoints.find(kPt => kPt.part === handType );
    if (kPWrist.score > 0.6) return kPWrist.position;

    return null;
};