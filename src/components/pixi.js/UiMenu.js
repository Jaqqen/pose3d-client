import { Container, Graphics, utils } from "pixi.js";
import { assetRsrc, goLabels, listenerKeys } from "shared/Indentifiers";
import { logError } from "shared/P3dcLogger";
import { appViewDimension } from "./PixiJSMain";
import { uiMenuViewConstants } from "components/pixi.js/ViewConstants";
import { uiMenuButton } from "./PixiJSButton";
import { addPixiTick, removePixiTick } from "./SharedTicks";
import { appContainerName, menu } from "shared/IdConstants";
import { testForAABB } from "./PixiJSCollision";
import { menuCollRes } from "./PixiJSMenu";

const btnProp = goLabels.menu.ui.element.button;
const btnFunc = goLabels.menu.ui.element.func;
const TRIGGERED = 'PULLER_TRIGGERED';
const NOT_TRIGGERED = 'PULLER_NOT_TRIGGERED';
export class UiMenu {
    constructor(container=[]) {
        this.container = container;
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
                return this.container;
            }
            if (elementObj.hasOwnProperty(btnProp) && elementObj.hasOwnProperty(btnFunc)) {
                const orderNum = (this.container.length > 0)
                    ? Math.max(...this.container.map(o => o.orderN))
                    : 0;
                const uiMenuObj = {
                    [btnProp]: elementObj[btnProp],
                    orderN: orderNum + 1,
                    [btnFunc]: elementObj[btnFunc],
                };
                const offsetH = 80;
                uiMenuObj[btnProp].x = appViewDimension.width + uiMenuObj[btnProp].width + 10;
                const halfHeightAndOffset = ((uiMenuObj[btnProp].height/2) + offsetH);
                if (uiMenuObj.orderN === 1) {
                    uiMenuObj[btnProp].y = uiMenuObj.orderN * halfHeightAndOffset;
                } else {
                    uiMenuObj[btnProp].y = this.container
                        .find(_uiMenuObj => _uiMenuObj.orderN === orderNum)[btnProp]
                        .y + halfHeightAndOffset + offsetH;
                }

                this.container.push(uiMenuObj);
            }

            return this.container;
        } catch (error) {
            logError(error);
        }
    }

    addMenuItemsArray(elementArray=null) {
        try {
            if (elementArray === null) {
                return this.container;
            }
            if (Array.isArray(elementArray)) {
                for (let childElem of elementArray) {
                    this.addMenuItem(childElem);
                }
            }

            return this.container;
        } catch (error) {
            logError(error);
        }
    }

    getAsMenuGOs() {
        return this.container.map(child => [child[btnFunc], child[btnProp]]);
    }

    getMenuItemsAsArray() {
        const menuItemsArray = this.container.map(child => child[btnProp]);
        menuItemsArray.push(this.radialAccessButton);
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

        this.container.forEach(uiMenuObj => {
            pixiMenuContainer.addChild(uiMenuObj[btnProp]);
        });

        this.pixiMenuContainer = pixiMenuContainer;

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
                    const radialOnCompleteOpening = () => {
                        this.openRadialMenuOnComplete(app, mainTickKey, hands);
                    };
                    const openingMenuTick = () => {
                        menuCollRes(app, [
                            ...menuGOs,
                            [() => radialOnCompleteOpening(), this.radialAccessButton]
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
                    let currentBlur = this.radialAccessButton.children
                        .find(shadow => 
                            shadow && shadow.name && shadow.name === menu.button.ui.shadowCircleName
                        )
                        .filters[0].blur;
                    if (currentBlur >= 12) {
                        currentBlur += 4
                    }

                    const _radialAccessBtnName = this.radialAccessButton.children
                        .find(child => child.name && child.name.includes(menu.button.ui.buttonName));
                    (_radialAccessBtnName.alpha > 0 ) && (_radialAccessBtnName.alpha += -0.2);
                }
            }
        }
    }

    getRadialAccessButton() {
        this.radialAccessButton = uiMenuButton(assetRsrc.ui.menu, 'menuSuffix', 'Cancel');
        this.radialAccessButton.x = appViewDimension.width - this.radialAccessButton.width/2 + 50;
        this.radialAccessButton.y = appViewDimension.height/2;

        return this.radialAccessButton;
    }

    openRadialMenuOnComplete(app, mainTickKey, hands) {
        removePixiTick(app, mainTickKey);
        this.isMenuOpen = true;

        const uiMenuPixiContainer = this.getContainerAsPixiContainer(menu.container.ui);
        uiMenuPixiContainer
            .children
            .filter(_child => _child.id && _child.id.includes(menu.button.ui.idPrefix))
            .forEach(uiBtn => (
                uiBtn.x = appViewDimension.width - uiBtn.width - 3*uiMenuViewConstants.offsetW
            ));
        app.stage.addChild(uiMenuPixiContainer);

        this.setRadialAccessButtonByState(app, this.isMenuOpen);

        const uiMenuGOs = [
            ...this.getAsMenuGOs(),
            [() => this.closeRadialMenuOnComplete(app, uiMenuPixiContainer), this.radialAccessButton]
        ];
        const uiMenuTick = () => {
            menuCollRes(app, uiMenuGOs, hands);
        };

        addPixiTick(app, listenerKeys.menu.uiMenuViewTick, uiMenuTick);

        const _onMenuItemHoverTick = () => {
            this.onMenuItemHoverTick(app, this.getMenuItemsAsArray(), hands);
        };
        addPixiTick(app, listenerKeys.menu.uiMenuShowTextTick, _onMenuItemHoverTick);
    }

    closeRadialMenuOnComplete(app, uiMenuContainer) {
        removePixiTick(app, listenerKeys.menu.uiMenuShowTextTick);
        removePixiTick(app, listenerKeys.menu.uiMenuViewTick);

        app.stage.removeChild(uiMenuContainer);

        this.isMenuOpen = false;

        this.setRadialAccessButtonByState(app, this.isMenuOpen);
        addPixiTick(app, this.main.tickKey, this.main.tickFn);
    }

    setRadialAccessButtonByState(app, menuState) {
        if (menuState) {
            this.radialAccessButton
                .children
                .find(child => child.name && child.name.includes(menu.button.ui.spriteName))
                .texture = utils.TextureCache[assetRsrc.ui.close];
            app.stage.children
                .find(stageChild => stageChild && stageChild.name === appContainerName)
                .removeChild(this.radialAccessButton);
            app.stage.addChild(this.radialAccessButton);
        } else {
            this.radialAccessButton
                .children
                .find(child => child.name && child.name.includes(menu.button.ui.spriteName))
                .texture = utils.TextureCache[assetRsrc.ui.menu];
            app.stage.removeChild(this.radialAccessButton);
            app.stage.children
                .find(stageChild => stageChild && stageChild.name === appContainerName)
                .addChild(this.radialAccessButton);
        }
    }

    onMenuItemHoverTick(app, menuItems, hands) {
        const menuItemsOnLeftHand = menuItems.filter(item => testForAABB(hands.left, item));
        const menuItemsOnRightHand = menuItems.filter(item => testForAABB(hands.right, item));

        if (menuItemsOnLeftHand.length + menuItemsOnRightHand.length === 1) {
            if (menuItemsOnLeftHand.length === 1) {
                const menuText = menuItemsOnLeftHand[0].children
                    .find(child => 
                        child && child.name && child.name.includes(menu.button.ui.buttonName)
                    )
                if (menuText !== undefined && menuText.alpha !== 1) {
                    menuText.alpha += 0.2;
                }
            }

            if (menuItemsOnRightHand.length === 1) {
                const menuText = menuItemsOnRightHand[0].children
                    .find(child => 
                        child && child.name && child.name.includes(menu.button.ui.buttonName)
                    )
                if (menuText !== undefined && menuText.alpha !== 1) {
                    menuText.alpha += 0.2;
                }
            }
        }

        if (menuItemsOnLeftHand.length + menuItemsOnRightHand.length <= 0) {
            const uiMenuContainer = app.stage.children
                .find(child =>
                    child && child.id && child.id === menu.container.ui
                );

            const uiBtns = uiMenuContainer.children
                .filter(_child => _child.id && _child.id.includes(menu.button.ui.idPrefix));

            const uiBtnNames = uiBtns
                .map(uiBtn => (
                    uiBtn.children.find(btnComp =>
                        btnComp && btnComp.name && btnComp.name.includes(menu.button.ui.buttonName)
                    )
                ))
                .filter(comp => comp !== undefined);

            const _radialAccessBtnName = this.radialAccessButton.children
                .find(child => child.name && child.name.includes(menu.button.ui.buttonName));

            [...uiBtnNames, _radialAccessBtnName].forEach(uiBtnName => {
                if (uiBtnName && uiBtnName.alpha && uiBtnName.alpha > 0) {
                    uiBtnName.alpha += -0.2;
                }
            });
        }
    }
}