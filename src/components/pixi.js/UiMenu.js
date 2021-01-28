import { Container, Graphics } from "pixi.js";
import { assetRsrc, goLabels, listenerKeys } from "shared/Indentifiers";
import { logError } from "shared/P3dcLogger";
import { appViewDimension } from "./PixiJSMain";
import { uiMenuViewConstants } from "components/pixi.js/ViewConstants";
import { uiMenuButton, UI_MIN_BLUR } from "./PixiJSButton";
import { 
    addPixiTick, addPixiTickFromSceneToCache, cachedPixiTicksFromScene, clearAllPixiTimeouts, 
    pixiTicks, removeCachedPixiTickFromScene, removePixiTick, sceneTweens 
} from "./SharedTicks";
import { menu } from "shared/IdConstants";
import { setCooldownTween, setHitTween, testForAABB } from "./PixiJSCollision";
import { menuCollRes } from "./PixiJSMenu";
import { setIsHoverOnOpen, setStoredHoverOnOpen } from "./PixiJSMenu";

const btnProp = goLabels.menu.ui.element.button;
const btnFunc = goLabels.menu.ui.element.func;
const TRIGGERED = 'PULLER_TRIGGERED';
const NOT_TRIGGERED = 'PULLER_NOT_TRIGGERED';

const isButtonOnTriggerPosition = (button) => {
    return button.x <= appViewDimension.width - button.width/2 - 20;
}
const getColumnMultiplyer = (orderN) => {
    switch (orderN) {
        case 1:
        case 2:
        case 3:
            return 1;
        case 4:
        case 5:
        case 6:
            return 2;
        case 7:
        case 8:
        case 9:
            return 3;
        case 10:
        case 11:
        case 12:
            return 4;
        default:
            return null;
    }
};
export class UiMenu {
    constructor(container=[]) {
        this.containerItemObjs = container;
        this.cancelButton = uiMenuButton(assetRsrc.ui.close, 'cancelSuffix', 'Cancel');
        this.pixiMenuContainer = null;
        this.radialAccessButton = null;
        this.radialAccessPuller = {
            puller: null,
            state: null,
        };
        this.main = {
            tickKey: null,
            tickFn: null,
        };
        this.isMenuOpen = false;
        this.scene = {
            tickKey: null,
            tickFn: null,
        };
    }

    addMenuItem(elementObj=null) {
        try {
            if (elementObj === null) {
                return this.containerItemObjs;
            }
            if (elementObj.hasOwnProperty(btnProp) && elementObj.hasOwnProperty(btnFunc)) {
                const orderNum = (this.containerItemObjs.length > 0)
                    ? Math.max(...this.containerItemObjs.map(o => o.orderN))
                    : 0;
                const uiMenuObj = {
                    [btnProp]: elementObj[btnProp],
                    orderN: orderNum + 1,
                    [btnFunc]: elementObj[btnFunc],
                };
                const offsetH = 70;
                uiMenuObj[btnProp].x = (
                    appViewDimension.width
                    - getColumnMultiplyer(uiMenuObj.orderN) * (
                        uiMenuObj[btnProp].width + 3 * uiMenuViewConstants.offsetW
                    )
                );

                const halfHeightAndOffset = ((uiMenuObj[btnProp].height/2) + offsetH);
                if (uiMenuObj.orderN % 3 === 1) {
                    uiMenuObj[btnProp].y = halfHeightAndOffset;
                } else {
                    uiMenuObj[btnProp].y = this.containerItemObjs
                        .find(_uiMenuObj => _uiMenuObj.orderN === orderNum)[btnProp]
                        .y + halfHeightAndOffset + offsetH;
                }

                this.containerItemObjs.push(uiMenuObj);
            }

            return this.containerItemObjs;
        } catch (error) {
            logError(error);
        }
    }

    addMenuItemsArray(elementArray=null) {
        try {
            if (elementArray === null) {
                return this.containerItemObjs;
            }
            if (Array.isArray(elementArray)) {
                for (let childElem of elementArray) {
                    this.addMenuItem(childElem);
                }
            }

            return this.containerItemObjs;
        } catch (error) {
            logError(error);
        }
    }

    getAsFunctionItemTupleArray(app, isForScene) {
        const uiMenuGOs =  this.containerItemObjs.map(child => [child[btnFunc], child[btnProp]]);
        if (isForScene) {
            uiMenuGOs.push([() => this.closeSceneRadialMenuOnComplete(app), this.cancelButton]);
        } else {
            uiMenuGOs.push([() => this.closeRadialMenuOnComplete(app), this.cancelButton]);
        }

        return uiMenuGOs;
    }

    getMenuItemsAsArray() {
        const menuItemsArray = this.containerItemObjs.map(child => child[btnProp]);
        menuItemsArray.push(this.cancelButton);
        return menuItemsArray;
    }

    getContainerAsPixiContainer(_id) {
        const pixiMenuContainer = new Container();
        pixiMenuContainer.sortableChildren = true;
        pixiMenuContainer.id = _id;

        const dimming = new Graphics();
        dimming.beginFill(0x444444, 0.6);
        dimming.drawRect(0, 0, appViewDimension.width, appViewDimension.height);
        dimming.endFill();
        dimming.zIndex = -50;
        pixiMenuContainer.addChild(dimming);

        this.containerItemObjs.forEach(uiMenuObj => {
            pixiMenuContainer.addChild(uiMenuObj[btnProp]);
        });

        this.cancelButton.x = appViewDimension.width - this.radialAccessButton.width/2 - 20;
        this.cancelButton.y = appViewDimension.height/2;
        pixiMenuContainer.addChild(this.cancelButton);

        return pixiMenuContainer;
    }

    getRadialAccessPuller(x, y) {
        this.radialAccessPuller.puller = new Graphics();

        this.radialAccessPuller.puller.beginFill(0xff0000, 0);
        this.radialAccessPuller.puller.drawRect(0,0, 120, 200);
        this.radialAccessPuller.puller.endFill();

        this.radialAccessPuller.state = NOT_TRIGGERED;

        this.radialAccessPuller.puller.x = x || appViewDimension.width - this.radialAccessPuller.puller.width;
        this.radialAccessPuller.puller.y = y || appViewDimension.height*0.13 - this.radialAccessPuller.puller.height/2;

        return this.radialAccessPuller.puller;
    }

    getRadialAccessButton() {
        if (this.radialAccessButton === null) {
            this.radialAccessButton = uiMenuButton(assetRsrc.ui.menu, 'menuSuffix', 'Menu');
            this.radialAccessButton.x = appViewDimension.width - this.radialAccessButton.width/2 + 50;
            this.radialAccessButton.y = appViewDimension.height*0.13;
            this.radialAccessButton.zIndex = 30;
        }

        return this.radialAccessButton;
    }

    getHoveringHandsContent(hands) {
        return Object.values(hands)
            .filter(hand => {
                if (hand.hasOwnProperty('go')) {
                    return testForAABB(hand.go, this.radialAccessPuller.puller);
                } else {
                    return testForAABB(hand, this.radialAccessPuller.puller);
                }
            });
    }

    getPreparedHandsFromScene(hands) {
        return {
            left: hands.left.go,
            right: hands.right.go,
        };
    }

    getRadialAccessPullerTick(app, hands, mainTickKey, currentMainTick, menuGOs) {
        const hoveringHands = this.getHoveringHandsContent(hands);

        if (hoveringHands.length === 1) {
            if (this.radialAccessPuller.state === NOT_TRIGGERED && !this.isMenuOpen) {
                if (isButtonOnTriggerPosition(this.radialAccessButton)) {
                    this.radialAccessPuller.state = TRIGGERED;
                    (this.main.tickKey === null) && (this.main.tickKey = mainTickKey);
                    (this.main.tickFn === null) && (this.main.tickFn = currentMainTick);
                    const openingMenuTick = () => {
                        menuCollRes(app, [
                            ...menuGOs,
                            [
                                () => this.openRadialMenuOnComplete(app, mainTickKey, hands),
                                this.radialAccessButton
                            ]
                        ], hands);
                    };
                    removePixiTick(app, mainTickKey);
                    addPixiTick(app, mainTickKey, openingMenuTick);
                } else {
                    this.radialAccessButton.x += -5;
                }
            }
        } else {
            if (!this.isMenuOpen) {
                if ((
                    this.radialAccessButton.x 
                        <= appViewDimension.width 
                        - this.radialAccessButton.width/2 + 50
                )) {
                    (this.main.tickKey !== null) && (this.main.tickKey = null);
                    (this.main.tickFn !== null) && (this.main.tickFn = null);
                    if (this.radialAccessPuller.state !== NOT_TRIGGERED) {
                        this.radialAccessPuller.state = NOT_TRIGGERED;
                        removePixiTick(app, mainTickKey);
                        addPixiTick(app, mainTickKey, currentMainTick);
                    }
                    this.radialAccessButton.x += 5;
                    const currentBlurObj = this.radialAccessButton
                        .getChildByName(menu.button.ui.shadowCircleName)
                        .filters[0];
                    if (currentBlurObj.blur >= UI_MIN_BLUR) {
                        currentBlurObj.blur += -2;
                    }
                }
            }
        }
    }

    getSceneRadialAccessPullerTick(
        app, hands, sceneTickKey, sceneTick, worldGoObjs, interactiveObjs, menuCollTickKey
    ) {
        const hoveringHands = this.getHoveringHandsContent(hands);

        if (hoveringHands.length === 1) {
            if (this.radialAccessPuller.state === NOT_TRIGGERED && !this.isMenuOpen) {
                if (isButtonOnTriggerPosition(this.radialAccessButton)) {
                    this.radialAccessPuller.state = TRIGGERED;
                    (this.scene.tickKey === null) && (this.scene.tickKey = sceneTickKey);
                    (this.scene.tickFn === null) && (this.scene.tickFn = sceneTick);
                    const preparedHands = this.getPreparedHandsFromScene(hands);
                    const openingMenuTick = () => {
                        menuCollRes(app, [[
                            () => this.openSceneRadialMenuOnComplete(
                                app, sceneTickKey, preparedHands, worldGoObjs, interactiveObjs
                            ),
                            this.radialAccessButton
                        ]], preparedHands);
                    };
                    removePixiTick(app, menuCollTickKey);
                    addPixiTick(app, listenerKeys.menu.openingMenuTick, openingMenuTick);
                } else {
                    this.radialAccessButton.x += -5;
                }
            }
        } else {
            if (!this.isMenuOpen) {
                if ((
                    this.radialAccessButton.x 
                        <= appViewDimension.width 
                        - this.radialAccessButton.width/2 + 50
                )) {
                    (this.scene.tickKey !== null) && (this.scene.tickKey = null);
                    (this.scene.tickFn !== null) && (this.scene.tickFn = null);
                    if (this.radialAccessPuller.state !== NOT_TRIGGERED) {
                        this.radialAccessPuller.state = NOT_TRIGGERED;
                        removePixiTick(app, listenerKeys.menu.openingMenuTick);
                        addPixiTick(
                            app,
                            menuCollTickKey,
                            () => menuCollRes(app, [], this.getPreparedHandsFromScene(hands))
                        );
                    }
                    this.radialAccessButton.x += 5;
                    const currentBlurObj = this.radialAccessButton
                        .getChildByName(menu.button.ui.shadowCircleName)
                        .filters[0];
                    if (currentBlurObj.blur >= UI_MIN_BLUR) {
                        currentBlurObj.blur += -2;
                    }
                }
            }
        }
    }

    openRadialMenuOnComplete(app, mainTickKey, hands) {
        removePixiTick(app, mainTickKey);
        this.isMenuOpen = true;

        this.pixiMenuContainer = this.getContainerAsPixiContainer(menu.container.ui);
        app.stage.addChild(this.pixiMenuContainer);

        //* is setting isHoveringOverMenu in PixiJSMenu
        setIsHoverOnOpen(true);
        //* is setting storedHoverMenuItem in PixiJSMenu
        setStoredHoverOnOpen(this.cancelButton);

        const uiMenuTick = () => {
            menuCollRes(app, this.getAsFunctionItemTupleArray(app, false), hands);
        };

        addPixiTick(app, listenerKeys.menu.uiMenuViewTick, uiMenuTick);

        const _onMenuItemHoverTick = () => {
            this.onMenuItemHoverTick(this.getMenuItemsAsArray(), hands);
        };
        addPixiTick(app, listenerKeys.menu.uiMenuShowTextTick, _onMenuItemHoverTick);
    }

    openSceneRadialMenuOnComplete(app, mainTickKey, hands, worldGoObjs, interactiveObjs) {
        this.isMenuOpen = true;
        removePixiTick(app, mainTickKey);
        removePixiTick(app, listenerKeys.menu.openingMenuTick);
        clearAllPixiTimeouts();

        if (interactiveObjs && interactiveObjs.length > 0) {
            interactiveObjs.forEach(interactiveObj => {
                const _key = interactiveObj[goLabels.interactive.tick];
                addPixiTickFromSceneToCache(_key, pixiTicks[_key]);
                removePixiTick(app, _key);
            });
        }

        if (worldGoObjs && Object.getOwnPropertyNames(worldGoObjs).length > 0) {
            for (let _key of Object.keys(worldGoObjs)) {
                addPixiTickFromSceneToCache(_key, worldGoObjs[_key]);
                removePixiTick(app, _key)
            }
        }

        if (sceneTweens && Object.keys(sceneTweens).length > 0) {
            for (const key of Object.keys(sceneTweens)) {
                if (sceneTweens[key] && sceneTweens[key].isActive()) {
                    sceneTweens[key].pause();
                }
            }
        }

        if (setHitTween && setHitTween.isActive()) {
            setHitTween.pause();
        }
        if (setCooldownTween && setCooldownTween.isActive()) {
            setCooldownTween.pause();
        }

        this.pixiMenuContainer = this.getContainerAsPixiContainer(menu.container.ui);
        app.stage.addChild(this.pixiMenuContainer);

        //* is setting isHoveringOverMenu in PixiJSMenu
        setIsHoverOnOpen(true);
        //* is setting storedHoverMenuItem in PixiJSMenu
        setStoredHoverOnOpen(this.cancelButton);

        const uiMenuTick = () => {
            menuCollRes(app, this.getAsFunctionItemTupleArray(app, true), hands);
        };

        addPixiTick(app, listenerKeys.menu.uiMenuViewTick, uiMenuTick);

        const _onMenuItemHoverTick = () => {
            this.onMenuItemHoverTick(this.getMenuItemsAsArray(), hands);
        };
        addPixiTick(app, listenerKeys.menu.uiMenuShowTextTick, _onMenuItemHoverTick);
    }

    closeRadialMenuOnComplete(app) {
        removePixiTick(app, listenerKeys.menu.uiMenuShowTextTick);
        removePixiTick(app, listenerKeys.menu.uiMenuViewTick);

        app.stage.removeChild(this.pixiMenuContainer);

        this.isMenuOpen = false;

        addPixiTick(app, this.main.tickKey, this.main.tickFn);
    }

    closeSceneRadialMenuOnComplete(app) {
        removePixiTick(app, listenerKeys.menu.uiMenuShowTextTick);
        removePixiTick(app, listenerKeys.menu.uiMenuViewTick);

        app.stage.removeChild(this.pixiMenuContainer);

        this.isMenuOpen = false;

        if (Object.keys(cachedPixiTicksFromScene).length !== 0) {
            const cachedTickKeys = Object.keys(cachedPixiTicksFromScene);
            for (let key of cachedTickKeys) {
                addPixiTick(app, key, cachedPixiTicksFromScene[key]);
                removeCachedPixiTickFromScene(key);
            }
        }

        if (sceneTweens && Object.keys(sceneTweens).length > 0) {
            for (const key of Object.keys(sceneTweens)) {
                if (sceneTweens[key] && sceneTweens[key].paused()) {
                    sceneTweens[key].play();
                }
            }
        }

        if (setHitTween && setHitTween.paused()) {
            setHitTween.play();
        }
        if (setCooldownTween && setCooldownTween.paused()) {
            setCooldownTween.play();
        }

        addPixiTick(app, this.scene.tickKey, this.scene.tickFn);
    }

    setTextAlphaOnHover(itemChildren) {
        const menuText = itemChildren.find(child => 
            child && child.name && child.name.includes(menu.button.ui.buttonName)
        );

        if (menuText !== undefined && menuText.alpha !== 1) {
            menuText.alpha += 0.2;
        }
    }

    onMenuItemHoverTick(menuItems, hands) {
        const menuItemsOnLeftHand = menuItems.filter(item => testForAABB(hands.left, item));
        const menuItemsOnRightHand = menuItems.filter(item => testForAABB(hands.right, item));

        if (menuItemsOnLeftHand.length + menuItemsOnRightHand.length === 1) {
            if (menuItemsOnLeftHand.length === 1) {
                this.setTextAlphaOnHover(menuItemsOnLeftHand[0].children);
            }

            if (menuItemsOnRightHand.length === 1) {
                this.setTextAlphaOnHover(menuItemsOnRightHand[0].children);
            }
        }

        if (menuItemsOnLeftHand.length + menuItemsOnRightHand.length <= 0) {
            const menuUiButtons = this.containerItemObjs.map(uiMenuObj => uiMenuObj[btnProp]);
            const uiBtnNames = menuUiButtons
                .map(uiBtn => (
                    uiBtn.children.find(btnComp =>
                        btnComp && btnComp.name && btnComp.name.includes(menu.button.ui.buttonName)
                    )
                ))
                .filter(comp => comp !== undefined);

            const cancelButtonName = this.cancelButton.children
                .find(child => child.name && child.name.includes(menu.button.ui.buttonName));

            [...uiBtnNames, cancelButtonName].forEach(uiBtnName => {
                if (uiBtnName && uiBtnName.alpha && uiBtnName.alpha > 0) {
                    uiBtnName.alpha += -0.2;
                }
            });
        }
    }
}