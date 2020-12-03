import * as posenet from "@tensorflow-models/posenet";

import { logError } from "shared/P3dcLogger";

let posenetModel = null;

export const getPosenetModel = async () => {
    return await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: { width: 257, height: 200 },
        quantBytes: 2,
    });
};

export const setposenetModel = (model) => {
    posenetModel = model;
};

export let estimatePoseOnImage = (imageElement) => {
    try {
        if ((imageElement !== null && imageElement !== undefined) &&
            (posenetModel !== null && posenetModel !== undefined)) {
            const p = new Promise((resolve) => {
                resolve(
                    posenetModel.estimateSinglePose(imageElement, {
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