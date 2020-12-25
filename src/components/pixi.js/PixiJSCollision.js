import * as ID from 'shared/IdConstants';
import { goLabels } from 'shared/Indentifiers';
import { reduceLifeByOne } from './PixiJSGameObjects';
import { appViewDimension } from './PixiJSMain';

export const testForAABB = (object1, object2) => {
    const b1 = object1.getBounds();
    const b2 = object2.getBounds();

    return  b1.x < b2.x + b2.width && b1.x + b1.width > b2.x &&
            b1.y < b2.y + b2.height && b1.y + b1.height > b2.y;
};

export const checkCollision = (hand, collisionGOs, character, lifebarsContainer) => {
        const collGOsInFrame = collisionGOs.filter(collisionGo => (
            appViewDimension.width > collisionGo[goLabels.interactive.go].x &&
            collisionGo[goLabels.interactive.go].x > 0 &&
            appViewDimension.height > collisionGo[goLabels.interactive.go].y &&
            collisionGo[goLabels.interactive.go].y > 0
        ));
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

                    let verticalSpeed = 9;
                    if (hitGO.y < hand.go.y) { verticalSpeed *= -1; }

                    hitGO.acceleration.set(horizontalSpeed, verticalSpeed);

                    // hand.lifeCounter++;
                }
            }

            if (character.id !== ID.levels.charOnCooldown) {
                if (testForAABB(character, gameObj[goLabels.interactive.go])) {
                    reduceLifeByOne(lifebarsContainer, character);
                }
            }
        });
};

// let characterRef = useRef(null);

//Set Animation
// let jumping = false;
// let walking = false;

// const axis = 'y';
// const direction = -1;
// const gravity = 1;
// const power = 20;
// const jumpAt = 0;

// const setJumpAt = (jumpAtValue) => {
//     jumpAt = jumpAtValue;
// };

// const jump = () => {
//     if (jumping) return;
//     jumping = true;

//     let time = 0;

//     const tick = deltaMs => {
//         const jumpHeight = (-gravity / 2) * Math.pow(time, 2) + power * time;

//         if (jumpHeight < 0) {
//             jumping = false;
//             props.app.ticker.remove(tick);
//             characterRef.current.y = jumpAt;
//             return;
//         }

//         characterRef.current.y = jumpAt + (jumpHeight * direction);
//         time += deltaMs;
//     }

//     props.app.ticker.add(tick);
// }