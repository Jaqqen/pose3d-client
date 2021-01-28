import { utils } from "pixi.js";
import { menu } from "shared/IdConstants";
import { asset, assetRsrc, levelSceneViews, localStorageKeys, menuViews } from "shared/Indentifiers";

const isAudioPlayingKey = localStorageKeys.isAudioPlaying;
const audioVolumeKey = localStorageKeys.audioVolume;
export const audioInitVolume = 0.06;
export let my_audio = {
    element: new Audio(),
    currentView: null,
};

export const changeAudio = (_currentView) => {
    if (my_audio.currentView === null && _currentView === null) {
        my_audio.element.src = asset.audio.bgm.menu;
        my_audio.element.loop = true;
        my_audio.element.load();
        my_audio.currentView = _currentView;
    } else {
        const foundMV = Object.keys(menuViews).find(k => menuViews[k] === _currentView);
        if (foundMV !== undefined) {
            const foundMV2 = Object.keys(menuViews).find(k => menuViews[k] === my_audio.currentView);
            if (foundMV2 === undefined) {
                my_audio.element.src = asset.audio.bgm.menu;
                my_audio.element.volume = parseInt(localStorage.getItem(audioVolumeKey)) || audioInitVolume;
                my_audio.element.pause();
                my_audio.element.load();
                if (shouldPlayAudio() === "true") my_audio.element.play();

                my_audio.currentView = _currentView;
            }
        } else {
            const foundLScV = Object.keys(levelSceneViews).find(k => levelSceneViews[k] === _currentView);
            if (foundLScV !== undefined) {
                const foundLScV2 = Object.keys(levelSceneViews).find(k => levelSceneViews[k] === my_audio.currentView);
                if (foundLScV2 === undefined) {
                    my_audio.element.src = asset.audio.bgm.levelScene;
                    my_audio.element.volume = parseInt(localStorage.getItem(audioVolumeKey)) || 0.05;
                    my_audio.element.pause();
                    my_audio.element.load();
                    if (shouldPlayAudio() === "true") my_audio.element.play();

                    my_audio.currentView = _currentView;
                }
            }
        }
    }
};

export const audioOnClick = {
    pause: (audioButton) => {
        my_audio.element.pause();
        localStorage.setItem(isAudioPlayingKey, false);
        audioButton
            .getChildByName(menu.button.ui.spriteName + 'audioSuffix')
            .texture = utils.TextureCache[assetRsrc.ui.play];
    },
    play: (audioButton) => {
        my_audio.element.play();
        localStorage.setItem(isAudioPlayingKey, true);
        audioButton
            .getChildByName(menu.button.ui.spriteName + 'audioSuffix')
            .texture = utils.TextureCache[assetRsrc.ui.pause];
    },
    audioUiButtonOnComplete: (audioButton) => {
        const isAudioPlaying = shouldPlayAudio();
        if (isAudioPlaying === "true") {
            audioOnClick.pause(audioButton);
        }
        if (isAudioPlaying === "false") {
            audioOnClick.play(audioButton);
        }
    },
};

export const shouldPlayAudio = () => {
    const _isAudioPlaying = localStorage.getItem(isAudioPlayingKey);
    if (_isAudioPlaying === null) {
        localStorage.setItem(isAudioPlayingKey, true);
        return true
    };

    return _isAudioPlaying;
};

export const playSoundEffectWithRsrc = (rsrc) => {
    if (shouldPlayAudio() === "true") {
        const rsrcSfx = new Audio();
        rsrcSfx.src = rsrc;
        rsrcSfx.volume = parseInt(localStorage.getItem(audioVolumeKey)) + 0.1 || audioInitVolume + 0.1;
        rsrcSfx.pause();
        rsrcSfx.load();
        rsrcSfx.play();
    }
};