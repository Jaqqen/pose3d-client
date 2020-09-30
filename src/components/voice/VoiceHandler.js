 
import React, { useEffect } from 'react'
import { voiceHanlder } from 'shared/IdConstants';

export default function VoiceHandler() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.start();

    let registeredSpeechRecogAlternatives = {};
    let currentSpeechRecogSession = 0;
    let isError = false;

    const setRegisteredSpeechRecogAlternatives = (_recogObjectKey, _speechRecogFirstAlternative) => {
        registeredSpeechRecogAlternatives = {
            ...registeredSpeechRecogAlternatives,
            [currentSpeechRecogSession]: {
                ...registeredSpeechRecogAlternatives[currentSpeechRecogSession],
                [_recogObjectKey]: _speechRecogFirstAlternative
            }
        }
    };

    const setSpeechRecogSession = () => {
        if (Object.keys(registeredSpeechRecogAlternatives[currentSpeechRecogSession]).length === 0) {
            delete registeredSpeechRecogAlternatives[currentSpeechRecogSession];
        }

        if (isError) {
            setIsError(false);
        } else {
            currentSpeechRecogSession = currentSpeechRecogSession + 1;
        }

        registeredSpeechRecogAlternatives = {
            ...registeredSpeechRecogAlternatives,
            [currentSpeechRecogSession]: {}
        };

        recognition.start();
    };

    const setIsError = (isErrorValue) => {
        isError = isErrorValue;
    }

    useEffect(() => {
        recognition.onstart = () => {
            console.log('VoiceHandler has entered: ONSTART');
        };

        recognition.onresult = (eventResult) => {
            const results = eventResult.results;
            for (let key in Object.keys(results)) {
                const speechRecogFirstAlternative = results[key][0];
                if (speechRecogFirstAlternative !== null ||
                    speechRecogFirstAlternative !== undefined) {
                    setRegisteredSpeechRecogAlternatives(key, speechRecogFirstAlternative);
                }
            }
            console.log(registeredSpeechRecogAlternatives);
        };

        recognition.onend = () => {
            console.info('VOICE IS DYING....');
            setSpeechRecogSession();
        };

        recognition.onerror = (eventError) => {
            setIsError(true);
            console.error(eventError);
        };

    })

    return (
        <span id={voiceHanlder}>V2E</span>
    )
}