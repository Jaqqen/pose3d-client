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
}