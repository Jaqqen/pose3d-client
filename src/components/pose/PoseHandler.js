import * as posenet from "@tensorflow-models/posenet";

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