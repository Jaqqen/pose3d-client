import { estimatePoseOnImage } from "components/pose/PoseHandler";
import { Sprite, utils } from "pixi.js";
import { showClass } from "shared/ClassName";
import { controllerId } from "shared/IdConstants";
import { appMode, assetRsrc, body } from "shared/Indentifiers";
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

export const getHandByRsrcName = (app, rsrcName, _appMode) => {
    const hand = {
        go: null,
    };

    hand.go = new Sprite(utils.TextureCache[rsrcName]);

    if (_appMode === appMode.WEBCAM) {
        hand.go.x = app.view.width/2;
        hand.go.y = hand.go.height * (-1);
    } else if (_appMode === appMode.CONTROLLER) {
        hand.go.x = app.view.width/2 + hand.go.getBounds().width;
        if (rsrcName === assetRsrc.leftHand) {
            hand.go.x = (app.view.width/2) - (hand.go.getBounds().width * 2);
        }
        hand.go.y = app.view.height/2 + 20;
    }

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

let controllerRAF;
const handsController = {
    speed: 11,
};
const controllerFn = () => {
    const axes = navigator.getGamepads()[0].axes;

    if (leftHand !== null) {
        if (axes[0] !== 0) { leftHand.go.x += axes[0] * handsController.speed; }
        if (axes[1] !== 0) { leftHand.go.y += axes[1] * handsController.speed; }
    }

    if (rightHand !== null) {
        if (axes[2] !== 0) { rightHand.go.x += axes[2] * handsController.speed; }
        if (axes[3] !== 0) { rightHand.go.y += axes[3] * handsController.speed; }
    }
    controllerRAF = requestAnimationFrame(controllerFn);
};

export const renderHandsWithController = (guiHands) => {
    const guiHandsSpeed = guiHands.add(handsController, 'speed');
    guiHandsSpeed.setValue(handsController.speed);
    window.addEventListener("gamepadconnected", function (e) {
        document.querySelector("#" + controllerId.connected).classList.add(showClass);
        document.querySelector("#" + controllerId.disconnected).classList.remove(showClass);

        controllerFn();
    });
    window.addEventListener("gamepaddisconnected", function (e) {
        cancelAnimationFrame(controllerRAF);
        document.querySelector("#" + controllerId.connected).classList.remove(showClass);
        document.querySelector("#" + controllerId.disconnected).classList.add(showClass);

        console.log("Gamepad disconnected");
    });
};

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