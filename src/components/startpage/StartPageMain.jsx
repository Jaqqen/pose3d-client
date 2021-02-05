import React, { Component } from 'react';
import * as CLASSNAME from 'shared/ClassName';
import { controllerId, kbAndMouse, startWebcamId } from 'shared/IdConstants';
import { asset } from 'shared/Indentifiers';
import bgGif from 'static/img/StartPageMainBackground.gif';

export default class StartPageMain extends Component {
    render() {
        const { renderAppWithWebcam, renderAppWithController, renderAppWithKbAndMouse, } = this.props;

        return (
            <div style={{
                backgroundImage: `url(${bgGif})`,
                backgroundSize: '100vw',
                maxHeight: '100vh',
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                zIndex: 2
            }}>
                <div className={CLASSNAME.startpageMainContainer}>
                    <div style={{margin: 'auto', width: 'fit-content',}}>
                        <h1 style={{fontSize: '2.5em',}}> Welcome to Save the Blob </h1>
                        <p>
                            Please follow the instructions before clicking on <b>Start</b>
                        </p>
                        <p style={{width: '40vw', lineHeight: 1.5}}>
                            For an <b>optimal</b> gaming experience with the webcam, please make sure that your room is sufficiently illuminated.
                            <br/>
                            <b>Additionally</b>, make sure that your upper body can be easily seen in the webcam by taking a distance between 1,5 - 3 meters.
                            <br/>
                            <b>To check this out</b>, you can set the webcam opacity after entering the game through the black menu in the top-right.
                            <br/>
                            <b>Also</b>, if the music is too loud/quiet, you can set the volume through the black-menu in the top-right.
                        </p>
                        <p>
                            The controls on:
                            <br/>
                            <b>➤ Keyboard and Mouse</b>: WASD-Keys and Mouse-Cursor
                            <br/>
                            <b>➤ Controller</b>: Both joysticks
                        </p>
                        <br/>
                        <p>
                            Please use <b>both ingame-hands</b> to navigate throughout the menu.
                            <br/>
                            Please <b>be aware</b> that the game might take up to 3-5 minutes to load.
                        </p>
                        <div style={{display: 'flex',}}>
                            <img alt="leftHand" src={asset.hand.left.default} />
                            <img alt="rightHand" src={asset.hand.right.default} />
                        </div>
                        <h2 style={{
                            fontSize: '2em',
                            margin: 'auto',
                            marginTop: '36px',
                            width: 'fit-content',
                        }}>Start with...</h2>
                        <div className={CLASSNAME.startpageMainButtonContainer}>
                            <button id={startWebcamId} autoFocus={true} onClick={renderAppWithWebcam}>
                                Webcam
                            </button>
                            <button id={controllerId.start} onClick={renderAppWithController}>
                                Controller
                            </button>
                            <button id={kbAndMouse.start} onClick={renderAppWithKbAndMouse}>
                                Keyboard & Mouse
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
