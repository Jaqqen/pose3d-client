import { logError } from "shared/P3dcLogger";

const { Texture, Rectangle, AnimatedSprite, Container } = require("pixi.js");

export const CHAR_STATE = {
    IDLE: 'IDLE',
    JUMPING: 'JUMPING',
    WALKING: 'WALKING',
};
const initTimeout = 700;
export class PixiGameChar {
    constructor(
        spriteSheet=null, cuttingH=null, cuttingW=null, animationSpeed=0.5, animationLoop=false
    ) {
        this.character = new Container();
        this.character.name = 'pixiGameCharName';
        this.spriteSheet = spriteSheet;
        this.spriteAnimations = {
            textures: {},
            initName: null
        };
        this.cuttingWidth = cuttingW;
        this.cuttingHeight = cuttingH;
        this.animationSpeed = animationSpeed;
        this.animationLoop = animationLoop;
        this.isAnimationPlaying = false;
        this.isDamaged = false;
        this.status = {
            currentStatusName: null,
            isStatusOn: false,
            timeout: initTimeout,
            timeoutId: null,
        };
        this.state = CHAR_STATE.IDLE;
    }

    cutByCuttingDimensionsWithDefinedAnimations(_definedAnimationsObj, initName) {
        if (this.spriteSheet) {
            if (_definedAnimationsObj) {
                for (const [animName, coord] of Object.entries(_definedAnimationsObj)) {
                    this.spriteAnimations.textures[animName] = [];
                    if (this.spriteAnimations.initName === null && initName !== null) {
                        this.spriteAnimations.initName = initName;
                    }

                    try {
                        const startX = coord.startColumn ?? 0;
                        for (let i = startX; i <= coord.endColumn; i++) {
                            this.spriteAnimations.textures[animName].push(
                                new Texture(
                                    this.spriteSheet,
                                    new Rectangle(
                                        i * this.cuttingWidth,
                                        coord.row * this.cuttingHeight,
                                        this.cuttingWidth,
                                        this.cuttingHeight
                                    )
                                )
                            );
                        }
                    } catch (error) {
                        logError('cutting Spritesheet:', error);
                        return false;
                    }
                }

                return true;
            }
        }

        return false;
    }

    createCharacter(_definedAnimationsObj, initAnim) {
        const isCut = this.cutByCuttingDimensionsWithDefinedAnimations(_definedAnimationsObj, initAnim);

        if (isCut) {
            const initAnim = this.spriteAnimations.textures[this.spriteAnimations.initName];
            const animSpriteChar = new AnimatedSprite(initAnim);
            animSpriteChar.animationSpeed = this.animationSpeed;
            animSpriteChar.scale.set(1.7);
            animSpriteChar.loop = this.animationLoop;
            animSpriteChar.name = 'animSpriteCharName';

            this.character.addChild(animSpriteChar);

            for (const statusKey in this.spriteAnimations.textures) {
                if (statusKey.toLowerCase().includes('status_')) {
                    const statusAnim = new AnimatedSprite(this.spriteAnimations.textures[statusKey]);
                    statusAnim.name = statusKey;

                    this.character.addChild(statusAnim);
                    this.character
                        .getChildByName(statusKey)
                        .position
                        .set(animSpriteChar.width/2 + 3, - (animSpriteChar.height/2 + 3));

                    this.character.getChildByName(statusKey).visible = false;
                    this.character.getChildByName(statusKey).scale.set(2);
                }
            }

            return this.character;
        }

        return null;
    }

    playAnimation(stateToTrans, animName) {
        if (this.state !== stateToTrans) {
            const mainBody = this.character.getChildByName('animSpriteCharName');
            mainBody.textures = this.spriteAnimations.textures[animName];

            mainBody.play();
        }
    }

    playStatusAnimation(statusName) {
        if (this.spriteAnimations.textures[statusName]) {
            if (!this.status.isStatusOn) {
                this.status.isStatusOn = true;
    
                const statusObj = this.character.getChildByName(statusName);
                statusObj.animationSpeed = this.animationSpeed;
                statusObj.loop = false;
                statusObj.visible = true;
                statusObj.play();
                this.status.currentStatusName = statusName;
    
                this.cancelStatusAnimation();
            }
        }
    }

    cancelStatusAnimation() {
        this.status.timeoutId = setTimeout(() => {
            this.cancelStatusAnimationNoDelay();
        }, this.status.timeout);
    }

    cancelStatusAnimationNoDelay() {
        const statusObj = this.character.getChildByName(this.status.currentStatusName);
        statusObj.stop();
        statusObj.visible = false;

        clearTimeout(this.status.timeoutId);
        this.status.isStatusOn = false;
        this.status.timeout = initTimeout;
        this.status.timeoutId = null;
        this.status.currentStatusName = null;
    }

    setDamageState(isActive) {
        if (isActive) {
            this.character
                .getChildByName('animSpriteCharName')
                .tint = 0xFFFFFF;
            this.isDamaged = false;
        } else {
            this.character
                .getChildByName('animSpriteCharName')
                .tint = 0xa20a0a;
            this.isDamaged = true;
        }
    }
}