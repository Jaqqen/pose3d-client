import { estimatePoseOnImage } from "components/pose/PoseHandler";
import { Sprite, utils } from "pixi.js";
import { showClass } from "shared/ClassName";
import { controllerId, pixiJsCanvas } from "shared/IdConstants";
import { appMode, assetRsrc, body, localStorageKeys } from "shared/Indentifiers";
import { 
    getInterpolatedValues, setDatGuiControllerListener, setDatGuiControllerValWithLocalStorage 
} from "shared/Utils";
import { appViewDimension } from "./PixiJSMain";

export let leftHand = null;
export const setLeftHand = (_leftHand) => { leftHand = _leftHand; };

export let rightHand = null;
export const setRightHand = (_rightHand) => { rightHand = _rightHand; };

let leftHandBaseTexture = null;


export const getHandByRsrcName = (rsrcName, _appMode) => {
    const hand = {
        go: null,
        lifeCounter: 0,
    };

    hand.go = new Sprite(utils.TextureCache[rsrcName]);
    hand.go.anchor.set(0.5);

    const initializeHandsForNonWebcam = () => {
        hand.go.x = appViewDimension.width/2 + hand.go.getBounds().width;
        if (rsrcName === assetRsrc.leftHand.default) {
            hand.go.x = (appViewDimension.width/2) - (hand.go.getBounds().width * 2);
        }
        hand.go.y = appViewDimension.height/2 + 20;
    };

    if (_appMode === appMode.WEBCAM) {
        hand.go.x = appViewDimension.width/2;
        hand.go.y = hand.go.height * (-1);
    } else if (_appMode === appMode.CONTROLLER) {
        initializeHandsForNonWebcam()
    } else if (_appMode === appMode.KB_AND_MOUSE) {
        initializeHandsForNonWebcam();
    }

    hand.go.zIndex = 99;
    if (rsrcName === assetRsrc.leftHand.default && leftHand === null) {
        leftHandBaseTexture = utils.BaseTextureCache[rsrcName];
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
    driftTreshold: 0.1
};
const controllerFn = () => {
    const axes = navigator.getGamepads()[0].axes;

    if (leftHand !== null) {
        if (
            appViewDimension.width > leftHand.go.x || leftHand.go.x > 0 ||
            appViewDimension.height > leftHand.go.y || leftHand.go.y > 0
        ) {
            if (
                axes[0] >= handsController.driftTreshold ||
                axes[0] <= -handsController.driftTreshold
            ) { leftHand.go.x += axes[0] * handsController.speed; }
            if (
                axes[1] >= handsController.driftTreshold ||
                axes[1] <= -handsController.driftTreshold
            ) { leftHand.go.y += axes[1] * handsController.speed; }
        }
    }

    if (rightHand !== null) {
        if (
            appViewDimension.width > rightHand.go.x || rightHand.go.x > 0 ||
            appViewDimension.height > rightHand.go.y || rightHand.go.y > 0
        ) {
            if (
                axes[2] >= handsController.driftTreshold ||
                axes[2] <= -handsController.driftTreshold
            ) { rightHand.go.x += axes[2] * handsController.speed; }
            if (
                axes[3] >= handsController.driftTreshold ||
                axes[3] <= -handsController.driftTreshold
            ) { rightHand.go.y += axes[3] * handsController.speed; }
        }
    }
    controllerRAF = requestAnimationFrame(controllerFn);
};

export const renderHandsWithController = (guiHands) => {
    const guiHandsSpeed = guiHands.add(handsController, 'speed', 0, 30, 1);
    const guiHandsSpeedKey = localStorageKeys.handsSpeed;
    setDatGuiControllerListener(guiHandsSpeed, guiHandsSpeedKey);
    setDatGuiControllerValWithLocalStorage(guiHandsSpeed, guiHandsSpeedKey, handsController.speed);

    const guiHandsDriftTreshold = guiHands.add(handsController, 'driftTreshold', 0, 1, 0.01);
    const guiHandsDriftTresholdKey = localStorageKeys.handsDriftTreshold;
    setDatGuiControllerListener(guiHandsDriftTreshold, guiHandsDriftTresholdKey);
    setDatGuiControllerValWithLocalStorage(
        guiHandsDriftTreshold, guiHandsDriftTresholdKey, handsController.driftTreshold
    );



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

const handsKbAndMouse = {
    keyboard: {
        speed: 10,
        isKeydownRAFTriggered: false,
    },
};
let leftHandKbAndMouseRAF = null;
export const renderHandsWithKeyboardAndMouse = (app, guiHands) => {
    const guiKbHandSpeed = guiHands.add(handsKbAndMouse.keyboard, 'speed', 0, 30, 1);
    const guiKbHandSpeedKey = localStorageKeys.kbAndMouse.kbHandSpeed;
    setDatGuiControllerListener(guiKbHandSpeed, guiKbHandSpeedKey);
    setDatGuiControllerValWithLocalStorage(guiKbHandSpeed, guiKbHandSpeedKey, handsKbAndMouse.keyboard.speed);

    document.querySelector('#' + pixiJsCanvas).onmousemove = () => {
        if (rightHand !== null) {
            const mouseCoords = app.renderer.plugins.interaction.mouse.global;

            if (
                appViewDimension.width > mouseCoords.x || mouseCoords.x > 0 ||
                appViewDimension.height > mouseCoords.y || mouseCoords.y > 0
            ) {
                rightHand.go.x = mouseCoords.x;
                rightHand.go.y = mouseCoords.y;
            }
        }
    };

    const pressedKeys = {};

    document.onkeydown = (e) => {
        if (leftHand !== null) {
            if (
                appViewDimension.width > leftHand.go.x || leftHand.go.x > 0 ||
                appViewDimension.height > leftHand.go.y || leftHand.go.y > 0
            ) {
                const coordsRAF = () => {
                    let _y_ = 0;
                    let _x_ = 0;

                    if (pressedKeys.KeyW) {
                        _y_ = -handsKbAndMouse.keyboard.speed;
                    }
                    if (pressedKeys.KeyS) {
                        _y_ = handsKbAndMouse.keyboard.speed;
                    }

                    if(pressedKeys.KeyA) {
                        _x_ = -handsKbAndMouse.keyboard.speed;
                    }
                    if (pressedKeys.KeyD) {
                        _x_ = handsKbAndMouse.keyboard.speed;
                    }
                    leftHand.go.x += parseInt(_x_);
                    leftHand.go.y += parseInt(_y_);

                    leftHandKbAndMouseRAF = requestAnimationFrame(coordsRAF);
                }

                pressedKeys[e.code] = true;
                if (!handsKbAndMouse.keyboard.isKeydownRAFTriggered) {
                    coordsRAF();
                    handsKbAndMouse.keyboard.isKeydownRAFTriggered = true;
                };
            }
        }
    }

    document.onkeyup = (e) => {
        if (leftHandKbAndMouseRAF !== null) {
            cancelAnimationFrame(leftHandKbAndMouseRAF);
        };
        handsKbAndMouse.keyboard.isKeydownRAFTriggered = false;
        pressedKeys[e.code] = false;

        const found = Object.values(pressedKeys).find(element => element === true);
        if (found !== undefined) document.dispatchEvent(new KeyboardEvent('keydown'));
    }
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
            x: keypoint.x,
            y: keypoint.y,
        };
    }

    return {x: appViewDimension.width/2, y: (leftHandBaseTexture.height * (-1)),};
};

const getHandPositions = (coordinates, handType) => {
    const kPWrist = coordinates.keypoints.find(kPt => kPt.part === handType );
    if (kPWrist.score > 0.4) return kPWrist.position;

    return null;
};

// export const manageHandLife = (hand) => {
//     switch (hand.lifeCounter) {
//         case 1:
//             hand.go.texture = utils.TextureCache[assetRsrc.han]
//             break;
//         case 2:
            
//             break;
//         case 3:
            
//             break;
//         case 4:
            
//             break;
//         default:
//             break;
//     }
// };