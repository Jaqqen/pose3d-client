import { Container, Graphics } from "pixi.js";
import { assetRsrc, goLabels, listenerKeys } from "shared/Indentifiers";
import { logError } from "shared/P3dcLogger";
import { appViewDimension } from "./PixiJSMain";
import { uiMenuViewConstants } from "components/pixi.js/ViewConstants";
import { uiMenuButton, UI_MIN_BLUR } from "./PixiJSButton";
import { addPixiTick, removePixiTick } from "./SharedTicks";
import { menu } from "shared/IdConstants";
import { testForAABB } from "./PixiJSCollision";
import { menuCollRes } from "./PixiJSMenu";

const btnProp = goLabels.menu.ui.element.button;
const btnFunc = goLabels.menu.ui.element.func;
const TRIGGERED = 'PULLER_TRIGGERED';
const NOT_TRIGGERED = 'PULLER_NOT_TRIGGERED';
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
                    appViewDimension.width - uiMenuObj[btnProp].width - 3*uiMenuViewConstants.offsetW
                );

                const halfHeightAndOffset = ((uiMenuObj[btnProp].height/2) + offsetH);
                if (uiMenuObj.orderN === 1) {
                    uiMenuObj[btnProp].y = uiMenuObj.orderN * halfHeightAndOffset;
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

    getAsFunctionItemTupleArray(app) {
        const uiMenuGOs =  this.containerItemObjs.map(child => [child[btnFunc], child[btnProp]]);
        uiMenuGOs.push([() => this.closeRadialMenuOnComplete(app), this.cancelButton]);

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
        this.radialAccessPuller.puller.y = y || appViewDimension.height/2 - this.radialAccessPuller.puller.height/2;

        return this.radialAccessPuller.puller;
    }

    getRadialAccessPullerTick(app, hands, mainTickKey, currentMainTick, menuGOs) {
        const hoveringHands = Object.values(hands).filter(hand => {
            if (hand.hasOwnProperty('go')) return testForAABB(hand.go, this.radialAccessPuller.puller);
            else return testForAABB(hand, this.radialAccessPuller.puller);
        });

        if (hoveringHands.length === 1) {
            if (this.radialAccessPuller.state === NOT_TRIGGERED && !this.isMenuOpen) {
                const isOnTriggerdPosition = (this.radialAccessButton.x <= appViewDimension.width
                    - this.radialAccessButton.width/2 - 20
                );
                if (isOnTriggerdPosition) {
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

    getRadialAccessButton() {
        if (this.radialAccessButton === null) {
            this.radialAccessButton = uiMenuButton(assetRsrc.ui.menu, 'menuSuffix', 'Menu');
            this.radialAccessButton.x = appViewDimension.width - this.radialAccessButton.width/2 + 50;
            this.radialAccessButton.y = appViewDimension.height/2;
        }

        return this.radialAccessButton;
    }

    openRadialMenuOnComplete(app, mainTickKey, hands) {
        removePixiTick(app, mainTickKey);
        this.isMenuOpen = true;

        this.pixiMenuContainer = this.getContainerAsPixiContainer(menu.container.ui);
        app.stage.addChild(this.pixiMenuContainer);

        const uiMenuTick = () => {
            menuCollRes(app, this.getAsFunctionItemTupleArray(app), hands);
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

    setTextAlphaOnHover(itemChildren) {
        const menuText = itemChildren.find(child => 
            child && child.name && child.name.includes(menu.button.ui.buttonName)
        )
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