import * as joint from '@joint/core';
import { Earth } from './Earth';
import { SpeedTrackingElement } from '../SpeedTrackingElement';
import { ElementFactory } from '../ElementFactory';

export class Compass extends SpeedTrackingElement {

    private paper?: joint.dia.Paper;
    private currentAngle: number = 0;

    constructor() {
        super();

        const compassSize = { width: 60, height: 60 };

        this.resize(compassSize.width, compassSize.height);

        this.attr({
            image: {
                'xlinkHref': '/assets/compass-icon.svg',
                width: compassSize.width,
                height: compassSize.height,
                cursor: 'move',
            }
        });

        this.removeAttr('body');
        this.markup = [{ tagName: 'image', selector: 'image' }];
    }

    override bindPaperEvents(paper: joint.dia.Paper) {
        this.paper = paper;
        super.bindPaperEvents(paper);
        const view = paper.findViewByModel(this);


        view.on('element:pointermove', () => {
            ElementFactory.EarthList.forEach(earth => {

                this.pointTo(earth.poleN.x, earth.poleN.y);
            }
            );
        });
    }

    public pointTo(targetX: number, targetY: number): void {
        const bbox = this.getBBox();

        // 1. Calculate center point
        const center = {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
        };

        // 2. Calculate angle with north correction
        const dx = targetX - center.x;
        const dy = targetY - center.y;
        const angleRad = Math.atan2(dy, dx);
        let angleDeg = angleRad * (180 / Math.PI) - 90; // Subtract 90° for north-facing

        // 3. Normalize to 0-360° range
        angleDeg = (angleDeg + 360) % 360;

        // 4. Set rotation center and apply
        this.attr('rotateCenter', {
            x: bbox.width / 2,
            y: bbox.height / 2
        });

        this.rotate(angleDeg, true);
    }

    public resetRotation(): void {
        this.rotate(-this.currentAngle, true);
        this.currentAngle = 0;
    }
}
