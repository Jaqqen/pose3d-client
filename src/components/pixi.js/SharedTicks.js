export let pixiTicks = {};

export const addPixiTick = (app, _key, tickFunction) => {
    pixiTicks = {
        ...pixiTicks,
        [_key]: tickFunction,
    };

    app.ticker.add(pixiTicks[_key]);
};

export const removePixiTick = (app, _key) => {
    app.ticker.remove(pixiTicks[_key]);

    delete pixiTicks[_key];
};

export let cachedPixiTicksFromScene = {};

export const addPixiTickFromSceneToCache = (_key, tickFunction) => {
    cachedPixiTicksFromScene = {
        ...cachedPixiTicksFromScene,
        [_key]: tickFunction,
    };
};

export const removeCachedPixiTickFromScene = (_key) => {
    delete cachedPixiTicksFromScene[_key];
};

export const clearAllCachedPixiTicksFromScene = (app) => {
    const cachedTickKeys = Object.keys(cachedPixiTicksFromScene);
    for(let _key of cachedTickKeys) {
        removePixiTick(app, pixiTicks[_key]);
        delete cachedPixiTicksFromScene[_key];
    }
};

export let pixiTimeouts = {};

export const addPixiTimeout = (_key, timeoutId) => {
    pixiTimeouts = {
        ...pixiTimeouts,
        [_key]: timeoutId,
    };
};

export const clearAllPixiTimeouts = () => {
    const pixiTimeoutKeys = Object.keys(pixiTimeouts);
    for(let _key of pixiTimeoutKeys) {
        clearTimeout(pixiTimeouts[_key]);
        delete pixiTimeouts[_key];
    }
};

export const clearPixiTimeoutWithKey = (_key) => {
    clearTimeout(pixiTimeouts[_key]);

    delete pixiTimeouts[_key];
};