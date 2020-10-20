import * as posenet from "@tensorflow-models/posenet";

import { posenetModule } from "components/pose/PosenetModelModule";

export const getPosenetModel = async () => {
    return await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: { width: 257, height: 200 },
        quantBytes: 2,
    });
};

export let estimatePoseOnImage = (poseNet, imageElement) => {
    const p = new Promise((resolve) => {
        resolve(
            poseNet.estimateSinglePose(imageElement, {
                flipHorizontal: false,
                maxDetections: 5,
                scoreThreshold: 0.1,
                nmsRadius: 20,
            })
        );
    });

    return p;
};

export const captureVideo = async (ctx, dimensions, _srcRef, renderFunction) => {
    _srcRef.onplay = () => {
        const step = async () => {
            let coordinates = await estimatePoseOnImage(posenetModule, _srcRef);
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);
            renderFunction(coordinates, ctx)
            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };
};