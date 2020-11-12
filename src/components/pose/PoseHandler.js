import * as posenet from "@tensorflow-models/posenet";

import { posenetModule } from "components/pose/PosenetModelModule";
import { logError } from "shared/P3dcLogger";

export const getPosenetModel = async () => {
    return await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: { width: 257, height: 200 },
        quantBytes: 2,
    });
};

export let estimatePoseOnImage = (poseNet, imageElement) => {
    try {
        if ((imageElement !== null && imageElement !== undefined) &&
            (poseNet !== null && poseNet !== undefined)) {
            const p = new Promise((resolve) => {
                resolve(
                    poseNet.estimateSinglePose(imageElement, {
                        flipHorizontal: true,
                    })
                );
            });
    
            return p;
        }
    } catch (error) {
        logError("Could not estimate Pose: ", error);
        return null;
    }

    return null;
};

export const captureVideo = async (ctx, dimensions, _srcRef, renderFunction) => {
    _srcRef.onplay = () => {
        const step = async () => {
            let coordinates = await estimatePoseOnImage(posenetModule, _srcRef);
            if (coordinates !== null) {
                ctx.clearRect(0, 0, dimensions.width, dimensions.height);
                renderFunction(coordinates, ctx)
            }
            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };
};