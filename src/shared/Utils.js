export const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
};

export const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
};

export const getRandomArbitrary = (min, max) => {
    return Math.random() * (max - min) + min;
};

export const getRandomArbitraryInStep = (min, max, step) => {
    const range = (max - min) / step;
    return Math.floor(Math.random() * range) * step + min;
}

export const getInterpolatedValues = (a, b, frac) => {
    let nx = a.x;
    let ny = b.x;
    if (Math.abs(a.x - b.x) <= 800 && Math.abs(a.y - b.y) <= 800) {
        nx = a.x+(b.x-a.x)*frac;
        ny = a.y+(b.y-a.y)*frac;
    }

    return {x: nx, y: ny};
};

export const getRandomChoiceOfArray = (_array) => {
    let rand = Math.random();
    rand *= _array.length;
    return _array[Math.round(rand)];
};