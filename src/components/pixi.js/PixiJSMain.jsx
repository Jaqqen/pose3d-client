import PixiStage from 'components/pixi.js/PixiStage';
import React, { Component } from 'react';

export default class PixiJSMain extends Component {
    render() {
        const { height, width, } = this.props;

        return (
            <div>
                <PixiStage height={height} width={width} />
            </div>
        )
    }
}