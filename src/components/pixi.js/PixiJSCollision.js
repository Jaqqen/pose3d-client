// import * as PIXI from 'pixi.js';

// const groundDotsNoneResourceName = 'groundDotsNone';
// const dummyResourceName = 'characterDummy';
// const meteorResourceName = 'meteor';


// Options for how objects interact
// How fast the red square moves
// const movementSpeed = 0.05;

// Strength of the impulse push between two objects
// const impulsePower = 5;

// Test For Hit
// A basic AABB check between two different squares
export const testForAABB = (object1, object2) => {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width
        && bounds1.x + bounds1.width > bounds2.x
        && bounds1.y < bounds2.y + bounds2.height
        && bounds1.y + bounds1.height > bounds2.y;
};

// Calculates the results of a collision, allowing us to give an impulse that
// shoves objects apart
// const collisionResponse = (object1, object2) => {
//     if (!object1 || !object2) {
//         return new PIXI.Point(0);
//     }

//     const vCollision = new PIXI.Point(
//         object2.x - object1.x,
//         object2.y - object1.y,
//     );

//     const distance = Math.sqrt(
//         Math.pow((object2.x - object1.x), 2) +
//         Math.pow((object2.y - object1.y), 2),
//     );

//     const vCollisionNorm = new PIXI.Point(
//         vCollision.x / distance,
//         vCollision.y / distance,
//     );

//     const vRelativeVelocity = new PIXI.Point(
//         object1.acceleration.x - object2.acceleration.x,
//         object1.acceleration.y - object2.acceleration.y,
//     );

//     const speed = vRelativeVelocity.x * vCollisionNorm.x
//         + vRelativeVelocity.y * vCollisionNorm.y;

//     const impulse = impulsePower * speed / (object1.mass + object2.mass);

//     return new PIXI.Point(
//         impulse * vCollisionNorm.x,
//         impulse * vCollisionNorm.y,
//     );
// };

// Calculate the distance between two given points
// const distanceBetweenTwoPoints = (p1, p2) => {
//     const a = p1.x - p2.x;
//     const b = p1.y - p2.y;

//     return Math.hypot(a, b);
// };

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