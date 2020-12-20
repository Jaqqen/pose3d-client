import { showAudioClass } from "shared/ClassName";
import { audioId } from "shared/IdConstants";
import { asset, levelSceneViews, menuViews } from "shared/Indentifiers";

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
                my_audio.element.volume = 0.06;
                my_audio.element.pause();
                my_audio.element.load();
                my_audio.element.play();
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
                    my_audio.element.play();
                    my_audio.currentView = _currentView;
                }
            }
        }
    }
}

export const audioOnClick = {
    pause: () => {
        my_audio.element.pause();
        document.querySelector("#" + audioId.paused).classList.remove(showAudioClass);
        document.querySelector("#" + audioId.playing).classList.add(showAudioClass);
    },
    play: () => {
        my_audio.element.play();
        document.querySelector("#" + audioId.playing).classList.remove(showAudioClass);
        document.querySelector("#" + audioId.paused).classList.add(showAudioClass);
    },
};