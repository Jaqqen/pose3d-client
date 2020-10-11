import { getCurrentTime } from "shared/Utils";

const logType = {
    DEBUG: 'DEBUG',
    ERROR: 'ERROR',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
}

export const logInfo = (text, loggingOject) => {
    logBuilder(logType.INFO, text, loggingOject);
};

export const logError = (text, loggingOject) => {
    logBuilder(logType.ERROR, text, loggingOject);
};

export const logSuccess = (text, loggingOject) => {
    logBuilder(logType.SUCCESS, text, loggingOject);
};

export const logDebug = (text, loggingOject) => {
    logBuilder(logType.DEBUG, text, loggingOject);
};

const logBuilder = (type, text, loggingOject) => {
    let bgColor = null;
    let fontColor = null;
    let logLabel;
    if (type) logLabel = type;
    else logLabel = '#L#A#B#E#L#';

    switch (type) {
        case logType.DEBUG:
            bgColor = '#fca652';
            fontColor = '#222222';
            break;
        case logType.ERROR:
            bgColor = '#e32249';
            fontColor = '#FCF6F5';
            break;
        case logType.INFO:
            bgColor = '#4f81c7';
            fontColor = '#FCF6F5';
            break;
        case logType.SUCCESS:
            bgColor = '#96bb7c';
            fontColor = '#000000';
            break;
        default:
            bgColor = '#434e52';
            fontColor = '#222222';
            break;
    }

    const labelStyle = [
        'background-color: ' + bgColor,
        'border: 2px solid white',
        'color: ' + fontColor,
        'font-size: 1.2em',
        'padding: 7px',
        'font-weight: 600'
    ].join(';');

    const textStyle = [
        'background-color: ' + bgColor,
        'color: ' + fontColor,
        'font-size: 1.1em',
        'padding: 4px'
    ].join(';');

    console.log('%c' + logLabel + ' --- ' + getCurrentTime(), labelStyle);
    console.log('%c' + text, textStyle);
    if (loggingOject !== null || loggingOject !== undefined) console.log(loggingOject);

}