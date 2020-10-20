import * as PIXI from 'pixi.js';

import React, { Fragment, useEffect, useState, useRef } from 'react';
import { estimatePoseOnImage } from 'components/pose/PoseHandler';
import { asset, body, interaction } from 'shared/Indentifiers';
import { posenetModule } from 'components/pose/PosenetModelModule';
import { useCallback } from 'react';
import * as ID from 'shared/IdConstants';

export default function PixiInteraction(props) {
    const [videoSrc] = useState(document.getElementById(ID.poseWebcam));
    let leftHandCoordinates = useRef([-1000, -1000]);
    let rightHandCoordinates = useRef([-1000, -1000]);
    let leftHand = useRef(null);
    let rightHand = useRef(null);
    let handSpriteCenter = useRef(null);

    const renderBodyPart = useCallback((interactionType, app, coordinates) => {

        const setCoordinates = (keypoint) => {
            return [
                (app.view.width - keypoint.position.x),
                keypoint.position.y
            ];
        };

        coordinates.keypoints.forEach((keypoint) => {
            if (keypoint.score > 0.55) {
                if (interactionType === interaction.hand) {
                    if (keypoint.part === body.left.wrist) {
                        leftHandCoordinates.current = setCoordinates(keypoint);
                    }
                    if (keypoint.part === body.right.wrist) {
                        rightHandCoordinates.current = setCoordinates(keypoint);
                    }
                }
            }
        });

        const addItemRefForHandStage = (itemRef, isLeftHand) => {
            if (itemRef.current === null) {
                app.loader.load((loader, resources) => {
                    if (isLeftHand) {
                        itemRef.current = new PIXI.Sprite(resources.leftHand.texture);
                    } else {
                        itemRef.current = new PIXI.Sprite(resources.rightHand.texture);
                    }

                    handSpriteCenter.current = [
                        itemRef.current._texture.baseTexture.width/2,
                        itemRef.current._texture.baseTexture.height/2,
                    ];

                    app.stage.addChild(itemRef.current);
                });
            }
        };

        addItemRefForHandStage(leftHand, true);
        addItemRefForHandStage(rightHand, false);

        app.loader.load((loader, resources) => {
            app.ticker.add(() => {
                if (leftHandCoordinates.current !== null) {
                    leftHand.current.x = leftHandCoordinates.current[0]-handSpriteCenter.current[0];
                    leftHand.current.y = leftHandCoordinates.current[1]-handSpriteCenter.current[1];
                } 
                if (rightHandCoordinates.current !== null) {
                    rightHand.current.x = rightHandCoordinates.current[0]-handSpriteCenter.current[0];
                    rightHand.current.y = rightHandCoordinates.current[1]-handSpriteCenter.current[1];
                }
            });
        });
    }, []);

    const getCoordinatesFromVideo = useCallback((app, src) => {
        const { interactionType } = props;

        src.onplay = () => {
            const step = async () => {
                let coordinates = await estimatePoseOnImage(posenetModule, src);
                if (coordinates !== null) renderBodyPart(interactionType, app, coordinates);
                requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        };
    }, [props, renderBodyPart]);

    useEffect(() => {
        const { app } = props;

        if (app) {
            app.loader
                .add('leftHand', asset.hand.left)
                .add('rightHand', asset.hand.right);

            getCoordinatesFromVideo(app, videoSrc);
        }
    }, [props, getCoordinatesFromVideo, videoSrc]);

    return (
        <Fragment></Fragment>
    )
}
