import * as dat from 'dat.gui';
import React, { Fragment } from 'react';

//! needs wiring to components - POSTPONED to different Ticket
//! written in: P3DC-6_Dat_Gui_integration
export default function DatGui() {
    const testObj = {
        name: 'jaqqen',
        num: 23,
        winner: true,
        size: 10,
        width: 33,
        nameX: 'test',
        color: '#FF0000'
    };

    const gui = new dat.GUI({ name: 'My GUI' });
    gui.domElement.id = "some-id";

    gui.add(testObj, 'name');
    gui.add(testObj, 'num');
    gui.add(testObj, 'winner');
    const testFolder = gui.addFolder('testter')
    testFolder.open()
    testFolder.add(testObj, 'size');
    testFolder.add(testObj, 'nameX');
    testFolder.add(testObj, 'width');
    testFolder.addColor(testObj, 'color')

    return (
        <Fragment></Fragment>
    )
}
