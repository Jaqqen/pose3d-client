import gsap from 'gsap/gsap-core';
import { goLabels } from 'shared/Indentifiers';
import { getRAD } from 'shared/Utils';
import { reduceLifeByOne } from './PixiJSGameObjects';
import { manageHandLife } from './PixiJSHands';
import { appViewDimension } from './PixiJSMain';

export const testForAABB = (object1, object2) => {
    const b1 = object1.getBounds();
    const b2 = object2.getBounds();

    return  b1.x < b2.x + b2.width && b1.x + b1.width > b2.x &&
            b1.y < b2.y + b2.height && b1.y + b1.height > b2.y;
};

const getCollisionInFrame = (collisionGos) => {
    return collisionGos.filter(collisionGo => (
        appViewDimension.width > collisionGo[goLabels.interactive.go].x &&
        collisionGo[goLabels.interactive.go].x > 0 &&
        appViewDimension.height > collisionGo[goLabels.interactive.go].y &&
        collisionGo[goLabels.interactive.go].y > 0
    ));
};

export let setHitTween;
export let setCooldownTween;
export const checkCollision = (app, hand, collisionGOs, handStatus) => {
    if (!handStatus.isOnCooldown) {
        const collGOsInFrame = getCollisionInFrame(collisionGOs);

        collGOsInFrame.forEach(gameObj => {
            if (
                appViewDimension.width > hand.go.x && hand.go.x > 0 &&
                appViewDimension.height > hand.go.y && hand.go.y > 0
            ) {
                if (
                    testForAABB(gameObj[goLabels.interactive.go], hand.go) &&
                    gameObj[goLabels.interactive.go].id === goLabels.interactive.go
                ) {
                    const hitGO = gameObj[goLabels.interactive.go];
                    hitGO.id = goLabels.interactive.collDis;

                    let horizontalSpeed = -9;
                    if (hitGO.x < hand.go.x) { horizontalSpeed *= -1; }

                    let verticalSpeed = -9;
                    if (hitGO.y < hand.go.y) { verticalSpeed *= -1; }

                    hitGO.acceleration.set(horizontalSpeed, verticalSpeed);

                    if (!handStatus.isHit && !handStatus.isOnCooldown) {
                        setHitTween = gsap.to(handStatus, {
                            isHit: false,
                            duration: 1.3,
                        });
                        if (hand.lifeCounter < 5) {
                            handStatus.isHit = true;
                            hand.lifeCounter++;
                            manageHandLife(hand, handStatus.whichHand);
                        }

                        if (hand.lifeCounter >= 5) {
                            setHitTween
                                .pause()
                                .time(0);
                            handStatus.isOnCooldown = true;

                            setCooldownTween = gsap.to(handStatus, {
                                duration: 4,
                                angle: 280,
                                onStart: () => {
                                    app.stage.addChild(handStatus.cooldownCircle);
                                },
                                onUpdate: () => {
                                    handStatus.cooldownCircle
                                        .clear()
                                        .lineStyle(10, 0xff961f)
                                        .arc(
                                            hand.go.x + (handStatus.whichHand === 'rightHand' ? 5 : -5),
                                            hand.go.y + (handStatus.whichHand === 'rightHand' ? 5 : -5),
                                            30,
                                            -95 * getRAD(), handStatus.angle * getRAD()
                                        );
                                },
                                onComplete: () => {
                                    hand.go.alpha = 1;
                                    hand.lifeCounter = 0;
                                    handStatus.isOnCooldown = false;
                                    handStatus.isHit = false;
                                    handStatus.cooldownCircle.clear();
                                    handStatus.angle = -95;
                                    app.stage.removeChild(handStatus.cooldownCircle);
                                },
                            });
                        }
                    }
                }
            }
        });
    }
};

export const checkPlayerEnvironment = (collisionGOs, player, lifebarsContainer) => {
    const collGOsInFrame = getCollisionInFrame(collisionGOs);

    collGOsInFrame.forEach(gameObj => {
        const character = player.character.getChildByName('animSpriteCharName');
        if (character) {
            if (getIsCollGoInRange(character, gameObj[goLabels.interactive.go])) {
                player.playStatusAnimation('status_surprise');
            }

            if (
                !player.isDamaged &&
                testForAABB(character, gameObj[goLabels.interactive.go])
            ) {
                reduceLifeByOne(lifebarsContainer, player);
            }
        }
    });
};

const getIsCollGoInRange = (charObj, collObj) => {
    return  Math.abs(charObj.getBounds().x - collObj.getBounds().x) <= 200 ||
            Math.abs(charObj.getBounds().y - collObj.getBounds().y) <= 200;
};