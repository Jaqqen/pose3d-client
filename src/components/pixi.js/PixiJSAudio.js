import { audioClass, showAudioClass } from "shared/ClassName";
import { audioId } from "shared/IdConstants";
import { asset, levelSceneViews, localStorageKeys, menuViews } from "shared/Indentifiers";

const isAudioPlayingKey = localStorageKeys.isAudioPlaying;
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
                my_audio.element.volume = audioInitVolume;
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
                    my_audio.element.volume = 0.05;
                    my_audio.element.pause();
                    my_audio.element.load();
                    if (shouldPlayAudio() === "true") my_audio.element.play();

                    my_audio.currentView = _currentView;
                }
            }
        }
    }
}

export const audioOnClick = {
    pause: () => {
        my_audio.element.pause();
        localStorage.setItem(isAudioPlayingKey, false);
        document.querySelector("#" + audioId.paused).classList.remove(showAudioClass);
        document.querySelector("#" + audioId.playing).classList.add(showAudioClass);
    },
    play: () => {
        my_audio.element.play();
        localStorage.setItem(isAudioPlayingKey, true);
        document.querySelector("#" + audioId.playing).classList.remove(showAudioClass);
        document.querySelector("#" + audioId.paused).classList.add(showAudioClass);
    },
};

const shouldPlayAudio = () => {
    const _isAudioPlaying = localStorage.getItem(isAudioPlayingKey);
    if (_isAudioPlaying === null) {
        localStorage.setItem(isAudioPlayingKey, true);
        return true
    };

    return _isAudioPlaying;
}

export const getShowAudioClassByLocalStorage = () => {
    if (localStorage.getItem(isAudioPlayingKey) === "true") {
        return {
            pauseImg: audioClass + " " + showAudioClass,
            playImg: audioClass,
        };
    }

    return {
        pauseImg: audioClass,
        playImg: audioClass + " " + showAudioClass,
    };
}