
import { shapes } from '@joint/core';
import * as joint from '@joint/core';
import { ElementFactory } from '../ElementFactory';

/**
 * A linkable rectangle element with advanced interaction capabilities
 */

const BG_COLOR = "#f4f7f6";
const portRadius = 8;
const portAttrs = {
        circle: {
                cursor: 'crosshair',
                fill: '#4D64DD',
                stroke: '#F4F7F6',
                magnet: 'active',
                r: portRadius,
        },
};

export const NodeElement = shapes.standard.Rectangle.define(
        'Node',
        {
                z: 2,
                attrs: {
                        root: {
                                highlighterSelector: 'body',
                                magnetSelector: 'body',
                        },
                        body: {
                                fill: 'rgba(70,101,229,0.15)',
                                stroke: '#4665E5',
                                strokeWidth: 1,
                                rx: 2,
                                ry: 2,
                        },
                        image: {
                                'xlinkHref': '/assets/bar-magnet.png',
                                width: 220,
                                height: 50,
                                preserveAspectRatio: 'xMidYMid slice',
                                cursor: 'move',
                                'data-role': 'magnet-image'
                        },
                },
                ports: {
                        groups: {
                                top: {
                                        position: 'top',
                                        attrs: portAttrs,
                                },
                                bottom: {
                                        position: 'bottom',
                                        attrs: portAttrs,
                                },
                                right: {
                                        position: 'right',
                                        attrs: portAttrs,
                                },
                                left: {
                                        position: 'left',
                                        attrs: portAttrs,
                                },
                        },
                },
        },
        null,
        {
                PORT_RADIUS: portRadius,
        }
);


export class Edge extends shapes.standard.Link {
        constructor() {
                super({
                        z: 1,
                        attrs: {
                                line: {
                                        stroke: '#464454',
                                        strokeWidth: 1,
                                        targetMarker: { d: 'M 5 2.5 0 0 5 -2.5 Z' },
                                },
                        },
                });
        }


}


export class NodeElement2 extends shapes.standard.Rectangle {
        static PORT_RADIUS = portRadius;

        constructor() {
                super();

                // Set default size for the rectangle
                this.resize(220, 50); // Match image dimensions

                // Define element attributes
                this.attr({
                        image: {
                                'xlinkHref': '/assets/bar-magnet.png',
                                width: 220,
                                height: 50,
                                preserveAspectRatio: 'xMidYMid slice',
                                cursor: 'move'
                        },
                        root: {
                                highlighterSelector: 'body',
                                magnetSelector: 'body',
                        },
                        body: {
                                fill: 'rgba(70,101,229,0.15)',
                                stroke: '#4665E5',
                                strokeWidth: 1,
                                rx: 2,
                                ry: 2,
                                width: 220,     // Explicit width
                                height: 50      // Explicit height
                        }

                });

                this.prop({
                        z: 2,
                        ports: {
                                groups: {
                                        top: {
                                                position: 'top',
                                                attrs: portAttrs,
                                        },
                                        bottom: {
                                                position: 'bottom',
                                                attrs: portAttrs,
                                        },
                                        right: {
                                                position: 'right',
                                                attrs: portAttrs,
                                        },
                                        left: {
                                                position: 'left',
                                                attrs: portAttrs,
                                        },
                                },
                        }
                })

                // Add ports
                this.addPorts([
                        {
                                id: 'top-port',
                                group: 'top',
                                args: { y: -portRadius / 2 } // Position outside the element
                        },
                        {
                                id: 'bottom-port',
                                group: 'bottom',
                                args: { y: portRadius / 2 + this.size().height } // Position outside the element
                        },
                        {
                                id: 'left-port',
                                group: 'left',
                                args: { x: -portRadius / 2 }
                        },
                        {
                                id: 'right-port',
                                group: 'right',
                                args: { x: portRadius / 2 + this.size().width }
                        }
                ]);

                this.markup = [
                        { tagName: 'image', selector: 'image' }
                ];
        }
}



export class Coil extends shapes.standard.Rectangle {
        static PORT_RADIUS = portRadius;
        private fieldVisuals: SVGSVGElement[] = [];
        private fieldOffsets: { verticalOffset: number }[] = [];
        private fieldsVisible = false;
        private isConnected = false;
        private connectCount = 0;
        private maxReactionDistance = 400;

        private _poleN: { x: number; y: number } = { x: 0, y: 0 };
        private _poleS: { x: number; y: number } = { x: 0, y: 0 };
        private reversed = false;
        protected paper?: joint.dia.Paper;
        private iconsVisible = false;
        private toggleFieldIcon?: HTMLElement;
        private isBeingDragged = false;

        get poleN(): { x: number; y: number } {
                return this._poleN;
        }

        set poleN(value: { x: number; y: number }) {
                this._poleN = value;
        }

        get poleS(): { x: number; y: number } {
                return this._poleS;
        }

        set poleS(value: { x: number; y: number }) {
                this._poleS = value;
        }

        constructor() {
                super();

                // Set default size for the rectangle
                this.resize(220, 50); // Match image dimensions

                // Define element attributes
                this.attr({
                        image: {
                                'xlinkHref': '/assets/coil.png',
                                width: 220,
                                height: 50,
                                preserveAspectRatio: 'xMidYMid slice',
                                cursor: 'move'
                        },
                        root: {
                                highlighterSelector: 'body',
                                magnetSelector: 'body',
                        },
                        body: {
                                fill: 'rgba(70,101,229,0.15)',
                                stroke: '#4665E5',
                                strokeWidth: 1,
                                rx: 2,
                                ry: 2,
                                width: 220,     // Explicit width
                                height: 50      // Explicit height
                        }

                });

                this.prop({
                        z: 2,
                        ports: {
                                groups: {
                                        top: {
                                                position: 'top',
                                                attrs: portAttrs,
                                        },
                                        bottom: {
                                                position: 'bottom',
                                                attrs: portAttrs,
                                        },
                                        right: {
                                                position: 'right',
                                                attrs: portAttrs,
                                        },
                                        left: {
                                                position: 'left',
                                                attrs: portAttrs,
                                        },
                                },
                        }
                })

                // Add ports
                this.addPorts([
                        {
                                id: 'left-port',
                                group: 'left',
                                args: { x: -portRadius / 2 }
                        },
                        {
                                id: 'right-port',
                                group: 'right',
                                args: { x: portRadius / 2 + this.size().width }
                        }
                ]);

                this.markup = [
                        { tagName: 'image', selector: 'image' }
                ];

                // Initialize poles
                this.updatePolePositions();
        }

        bindPaperEvents(paper: joint.dia.Paper): void {
                const view = paper.findViewByModel(this);
                this.paper = paper;

                view.on('element:pointerclick', () => {
                        this.toggleControlIcons(paper);
                });

                // Add drag start/end events to track when magnet is being dragged
                view.on('element:pointerdown', () => {
                        this.isBeingDragged = true;
                });

                view.on('element:pointerup', () => {
                        this.isBeingDragged = false;
                });

                view.on('element:pointermove', () => {
                        this.updatePolePositions();
                });


        }

        bindConnectionEvents(container: HTMLElement) {
                container.addEventListener('connection-valid', (e: Event) => {
                        const customEvent = e as CustomEvent;
                        const { source, target } = (e as CustomEvent).detail;

                        // Check if this node is involved in the connection
                        if (this.id === source.id || this.id === target.id) {
                                // console.log('Connection valid:', source, target);
                                this.connectCount++;
                                if (this.connectCount == 2) {
                                        this.isConnected = true;
                                }
                        }
                }
                );

        }

        public setReversed(reversed: boolean) {
                this.reversed = reversed;
                this.updatePolePositions();
                if (this.fieldsVisible) {
                        this.hideField();
                        if (this.paper?.el) {
                                this.showField(this.paper.el);
                        }
                }
        }

        public setSpeedAndPosition(speed: number, poleS: { x: number; y: number }, poleN: { x: number; y: number }) {
                console.log('Speed set to:', speed);
                const distanceToPoleN = Math.sqrt(Math.pow(this.poleN.x - this.position().x, 2) + Math.pow(this.poleN.y - this.position().y, 2));
                const distanceToPoleS = Math.sqrt(Math.pow(this.poleS.x - this.position().x, 2) + Math.pow(this.poleS.y - this.position().y, 2));

                if (distanceToPoleN < distanceToPoleS) {
                        console.log('current: ', -1 * speed);
                        ElementFactory.LEDList.forEach((led) => {
                                led.lightOn(-1 * speed);
                        });
                        ElementFactory.LEDReverseList.forEach((led) => {
                                led.lightOn(-1 * speed);
                        });
                } else {
                        console.log('current: ', speed);
                        ElementFactory.LEDList.forEach((led) => {
                                led.lightOn(speed);
                        });
                        ElementFactory.LEDReverseList.forEach((led) => {
                                led.lightOn(speed);
                        });
                }
        }

        private toggleControlIcons(paper: joint.dia.Paper) {
                if (this.iconsVisible) {
                        this.toggleFieldIcon?.remove();
                        this.toggleFieldIcon = undefined;
                        this.iconsVisible = false;
                        return;
                }

                const pos = this.position();
                const paperRect = paper.el.getBoundingClientRect();

                // Create toggle field visibility icon
                const toggleIcon = document.createElement('img');
                toggleIcon.src = '/icon/CodiconEye.svg';
                toggleIcon.title = 'Toggle Magnetic Field';
                toggleIcon.style.position = 'absolute';
                toggleIcon.style.left = `${paperRect.left + pos.x + this.size().width / 2 + 10}px`;
                toggleIcon.style.top = `${paperRect.top + pos.y - 30}px`;
                toggleIcon.style.width = '20px';
                toggleIcon.style.cursor = 'pointer';
                toggleIcon.style.zIndex = '1000';
                toggleIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.fieldsVisible ? this.hideField() : this.showField(paper.el);
                        this.toggleControlIcons(paper); // Refresh icon layout
                });

                document.body.appendChild(toggleIcon);

                this.toggleFieldIcon = toggleIcon;
                this.iconsVisible = true;
        }

        private updatePolePositions() {
                const pos = this.position();
                this.poleS = this.reversed
                        ? { x: pos.x + this.size().width, y: pos.y + this.size().height / 2 }
                        : { x: pos.x, y: pos.y + this.size().height / 2 };
                this.poleN = this.reversed
                        ? { x: pos.x, y: pos.y + this.size().height / 2 }
                        : { x: pos.x + this.size().width, y: pos.y + this.size().height / 2 };
        }

        public reversePolarity() {
                this.reversed = !this.reversed;
                this.updatePolePositions();

                const view = this.paper?.findViewByModel(this);
                const imageEl = view?.el.querySelector('[data-role="magnet-image"]') as SVGImageElement | null;

                if (imageEl) {
                        const transform = this.reversed ? 'scaleX(-1)' : 'scaleX(1)';
                        imageEl.setAttribute('transform', transform);
                }
        }

        public showField(container: HTMLElement) {
                this.hideField();
                // if (!this.imageSize) return;
                if (!this.isConnected) return;

                const pos = this.position();
                this.updatePolePositions();

                const numberOfClosedArcs = 5;
                const arcSpacing = 20;
                const arcOffsetStart = this.size().height + 10;

                this.fieldOffsets = [];

                for (let i = 0; i < numberOfClosedArcs; i++) {
                        const offset = arcOffsetStart + i * arcSpacing;
                        this.createMagneticFieldArc(container, this.poleN, this.poleS, offset);
                        this.createMagneticFieldArc(container, this.poleN, this.poleS, -offset);
                        this.fieldOffsets.push({ verticalOffset: offset }, { verticalOffset: -offset });
                }

                const straightLength = 300; // you can make this configurable

                // Line: From N pole to right
                this.fieldOffsets.push({ verticalOffset: 1 });
                this.createMagneticFieldLine(
                        container,
                        !this.reversed ? { x: this.poleN.x + straightLength, y: this.poleN.y } : { x: this.poleN.x - straightLength, y: this.poleN.y },
                        this.poleN,
                        this.reversed
                );

                // Line: From right of S pole back to S pole
                this.fieldOffsets.push({ verticalOffset: -1 });
                this.createMagneticFieldLine(
                        container,
                        this.poleS,
                        !this.reversed ? { x: this.poleS.x - straightLength, y: this.poleS.y } : { x: this.poleS.x + straightLength, y: this.poleS.y },
                        this.reversed
                );

                this.fieldsVisible = true;
                this.listenToPositionChanges();
        }

        public hideField() {
                this.fieldVisuals.forEach(svg => svg.remove());
                this.fieldVisuals = [];
                this.fieldOffsets = [];
                this.fieldsVisible = false;
                this.off('change:position');
        }

        private listenToPositionChanges() {
                const update = () => {
                        const pos = this.position();
                        this.updatePolePositions();
                        const straightLength = 300;

                        this.fieldVisuals.forEach((svg, i) => {
                                const path = svg.querySelector('path');
                                const offset = this.fieldOffsets[i].verticalOffset;


                                if (offset === 1) {
                                        const d = !this.reversed
                                                ? `M ${this.poleN.x + straightLength} ${this.poleN.y} L ${this.poleN.x} ${this.poleN.y}`
                                                : `M ${this.poleN.x - straightLength} ${this.poleN.y} L ${this.poleN.x} ${this.poleN.y}`;
                                        path?.setAttribute("d", d);
                                } else if (offset === -1) {
                                        const d = !this.reversed
                                                ? `M ${this.poleS.x} ${this.poleS.y} L  ${this.poleS.x - straightLength} ${this.poleS.y}`
                                                : `M ${this.poleS.x} ${this.poleS.y} L ${this.poleS.x + straightLength} ${this.poleS.y} `;
                                        path?.setAttribute("d", d);
                                } else {
                                        // Updated calculation for elliptical arc
                                        const dx = Math.abs(this.poleN.x - this.poleS.x);
                                        const dy = Math.abs(offset);
                                        const rx = 2 * dx; // Key fix: rx = 2*dx (so dx = rx/2)
                                        const ry = Math.max(dy, 20);
                                        const largeArcFlag = 1; // Force larger arc
                                        const sweepFlag = offset > 0 ? 1 : 0;

                                        const d = `M ${this.poleN.x} ${this.poleN.y} 
                                                   A ${rx} ${ry} 0 ${largeArcFlag} ${sweepFlag} ${this.poleS.x} ${this.poleS.y}`;
                                        path?.setAttribute("d", d);
                                }
                        });
                };

                this.on('change:position', update);
        }


        private createMagneticFieldArc(
                container: HTMLElement,
                start: { x: number; y: number },
                end: { x: number; y: number },
                verticalOffset: number
        ) {
                const svgNS = "http://www.w3.org/2000/svg";
                const xlinkNS = "http://www.w3.org/1999/xlink";

                // Create SVG container
                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute("class", "magnetic-field-svg");
                svg.style.position = "absolute";
                svg.style.left = "0";
                svg.style.top = "0";
                svg.style.overflow = "visible";
                svg.style.pointerEvents = "none";

                // Create path element
                const path = document.createElementNS(svgNS, "path");
                const pathId = `field-path-${Date.now()}-${Math.random()}`;

                // Calculate ellipse parameters
                const dx = end.x - start.x; // Horizontal distance between points
                const rx = Math.abs(dx) * 2; // rx = 2 * dx (so dx = rx/2)
                const ry = Math.max(Math.abs(verticalOffset), 20);

                // Arc configuration for larger arc (4:1 ratio)
                const largeArcFlag = 1; // Force larger arc
                const sweepFlag = verticalOffset > 0 ? 1 : 0; // Curve direction

                // Build path data
                const d = `M ${start.x} ${start.y} 
                           A ${rx} ${ry} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;

                path.setAttribute("id", pathId);
                path.setAttribute("d", d);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", "rgba(0, 153, 255, 0.4)");
                path.setAttribute("stroke-width", "2");

                // Animated arrow (unchanged from original)
                const arrowImage = document.createElementNS(svgNS, "image");
                arrowImage.setAttributeNS(xlinkNS, "xlink:href", "/assets/arrow-right.svg");
                arrowImage.setAttribute("width", "16");
                arrowImage.setAttribute("height", "16");
                arrowImage.setAttribute("x", "-8");
                arrowImage.setAttribute("y", "-8");

                const animateMotion = document.createElementNS(svgNS, "animateMotion");
                animateMotion.setAttribute("repeatCount", "indefinite");
                animateMotion.setAttribute("dur", "2s");
                animateMotion.setAttribute("rotate", "auto");

                const mpath = document.createElementNS(svgNS, "mpath");
                mpath.setAttributeNS(xlinkNS, "xlink:href", `#${pathId}`);
                animateMotion.appendChild(mpath);

                const g = document.createElementNS(svgNS, "g");
                g.appendChild(arrowImage);
                g.appendChild(animateMotion);

                svg.appendChild(path);
                svg.appendChild(g);
                container.appendChild(svg);

                this.fieldVisuals.push(svg);
        }

        private createMagneticFieldLine(
                container: HTMLElement,
                start: { x: number; y: number },
                end: { x: number; y: number },
                isReversed: boolean
        ) {
                const svgNS = "http://www.w3.org/2000/svg";
                const xlinkNS = "http://www.w3.org/1999/xlink";

                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute("class", "magnetic-field-line-svg");
                svg.style.position = "absolute";
                svg.style.left = "0";
                svg.style.top = "0";
                svg.style.overflow = "visible";
                svg.style.pointerEvents = "none";

                const path = document.createElementNS(svgNS, "path");
                const pathId = `field-line-path-${Date.now()}-${Math.random()}`;

                const d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
                path.setAttribute("id", pathId);
                path.setAttribute("d", d);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", "rgba(0, 153, 255, 0.4)");
                path.setAttribute("stroke-width", "2");

                const arrowImage = document.createElementNS(svgNS, "image");
                !isReversed ? arrowImage.setAttributeNS(xlinkNS, "xlink:href", "/assets/arrow-left.svg") : arrowImage.setAttributeNS(xlinkNS, "xlink:href", "/assets/arrow-right.svg");;
                arrowImage.setAttribute("width", "16");
                arrowImage.setAttribute("height", "16");
                arrowImage.setAttribute("x", "-8");
                arrowImage.setAttribute("y", "-8");

                const animateMotion = document.createElementNS(svgNS, "animateMotion");
                animateMotion.setAttribute("repeatCount", "indefinite");
                animateMotion.setAttribute("dur", "3s");

                const mpath = document.createElementNS(svgNS, "mpath");
                mpath.setAttributeNS(xlinkNS, "xlink:href", `#${pathId}`);

                animateMotion.appendChild(mpath);
                arrowImage.appendChild(animateMotion);
                svg.appendChild(path);
                svg.appendChild(arrowImage);
                container.appendChild(svg);

                this.fieldVisuals.push(svg);
        }
}


export class PowerSupply extends shapes.standard.Rectangle {
        static PORT_RADIUS = portRadius;

        private reversed = false;
        private iconsVisible = false;
        private reverseIcon?: HTMLElement;
        protected paper?: joint.dia.Paper;
        private container: HTMLElement;

        constructor() {
                super();

                // Set default size for the rectangle
                this.resize(300, 220); // Match image dimensions

                // Define element attributes
                this.attr({
                        image: {
                                'xlinkHref': '/assets/power-source.png',
                                width: 300,
                                height: 200,
                                preserveAspectRatio: 'xMidYMid slice',
                                cursor: 'move',
                                'data-role': 'power-image'
                        },
                        root: {
                                highlighterSelector: 'body',
                                magnetSelector: 'body',
                        },
                        body: {
                                fill: 'rgba(70,101,229,0.15)',
                                stroke: '#4665E5',
                                strokeWidth: 1,
                                rx: 2,
                                ry: 2,
                                width: 220,     // Explicit width
                                height: 50      // Explicit height
                        }

                });

                this.prop({
                        z: 2,
                        ports: {
                                groups: {
                                        top: {
                                                position: 'top',
                                                attrs: portAttrs,
                                        },
                                        bottom: {
                                                position: 'bottom',
                                                attrs: portAttrs,
                                        },
                                        right: {
                                                position: 'right',
                                                attrs: portAttrs,
                                        },
                                        left: {
                                                position: 'left',
                                                attrs: portAttrs,
                                        },
                                },
                        }
                })

                // Add ports
                this.addPorts([
                        {
                                id: 'left-port',
                                group: 'left',
                                args: { x: -portRadius / 2 }
                        },
                        {
                                id: 'right-port',
                                group: 'right',
                                args: { x: portRadius / 2 + this.size().width }
                        }
                ]);

                this.markup = [
                        { tagName: 'image', selector: 'image' }
                ];
        }

        bindPaperEvents(paper: joint.dia.Paper): void {
                this.paper = paper;
                const view = paper.findViewByModel(this);

                view.on('element:pointerclick', () => {
                        this.toggleControlIcons(paper);
                });
        }

        setContainer(container: HTMLElement) {
                this.container = container;
        }

        private toggleControlIcons(paper: joint.dia.Paper) {
                if (this.iconsVisible) {
                        this.reverseIcon?.remove();
                        this.reverseIcon = undefined;
                        this.iconsVisible = false;
                        return;
                }

                const pos = this.position();
                const paperRect = paper.el.getBoundingClientRect();

                // Create reverse polarity icon
                const reverseIcon = document.createElement('img');
                reverseIcon.src = '/icon/CodiconRefresh.svg';
                reverseIcon.title = 'Reverse Polarity';
                reverseIcon.style.position = 'absolute';
                reverseIcon.style.left = `${paperRect.left + pos.x + this.size().width / 2 - 20}px`;
                reverseIcon.style.top = `${paperRect.top + pos.y - 30}px`;
                reverseIcon.style.width = '20px';
                reverseIcon.style.cursor = 'pointer';
                reverseIcon.style.zIndex = '1000';
                reverseIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.reversePolarity();
                        this.toggleControlIcons(paper); // Refresh icon layout
                });

                document.body.appendChild(reverseIcon);

                this.reverseIcon = reverseIcon;
                this.iconsVisible = true;
        }

        private reversePolarity() {
                this.reversed = !this.reversed;

                if (!this.paper) return;

                const view = this.paper.findViewByModel(this);
                const imageEl = view?.el.querySelector('[data-role="power-image"]') as SVGImageElement | null;

                if (imageEl) {
                        const transform = this.reversed ? 'scaleX(-1)' : 'scaleX(1)';
                        imageEl.setAttribute('transform', transform);
                        const imageSrc = this.reversed ? '/assets/power-source-reversed.png' : '/assets/power-source.png';
                        imageEl.setAttribute('xlink:href', imageSrc);
                }

                // Fire event through the shared paper
                ElementFactory.coilList.forEach((coil) => {
                        coil.setReversed(this.reversed);
                })

        }
}


export class LED extends shapes.standard.Rectangle {
        static PORT_RADIUS = portRadius;
        private isLighting = false;
        protected paper?: joint.dia.Paper;
        private connectCount = 0;
        private isConnected: boolean = false;

        constructor() {
                super();

                // Set default size for the rectangle
                this.resize(220, 50); // Match image dimensions

                // Define element attributes
                this.attr({
                        image: {
                                'xlinkHref': '/assets/LED.png',
                                width: 220,
                                height: 140,
                                preserveAspectRatio: 'xMidYMid slice',
                                cursor: 'move',
                                'data-role': 'LED-image'
                        },
                        root: {
                                highlighterSelector: 'body',
                                magnetSelector: 'body',
                        },
                        body: {
                                fill: 'rgba(70,101,229,0.15)',
                                stroke: '#4665E5',
                                strokeWidth: 1,
                                rx: 2,
                                ry: 2,
                                width: 220,     // Explicit width
                                height: 50      // Explicit height
                        }

                });

                this.prop({
                        z: 2,
                        ports: {
                                groups: {
                                        top: {
                                                position: 'top',
                                                attrs: portAttrs,
                                        },
                                        bottom: {
                                                position: 'bottom',
                                                attrs: portAttrs,
                                        },
                                        right: {
                                                position: 'right',
                                                attrs: portAttrs,
                                        },
                                        left: {
                                                position: 'left',
                                                attrs: portAttrs,
                                        },
                                },
                        }
                })

                // Add ports
                this.addPorts([
                        {
                                id: 'left-port',
                                group: 'left',
                                args: { x: -portRadius / 2, y: this.size().height / 2 }
                        },
                        {
                                id: 'right-port',
                                group: 'right',
                                args: { x: portRadius / 2 + this.size().width, y: this.size().height / 2 }
                        }
                ]);

                this.markup = [
                        { tagName: 'image', selector: 'image' }
                ];
        }

        setPaper(paper: joint.dia.Paper) {
                this.paper = paper;
        }

        private light() {
                this.isLighting = !this.isLighting;

                if (!this.paper) return;

                const view = this.paper.findViewByModel(this);
                const imageEl = view?.el.querySelector('[data-role="LED-image"]') as SVGImageElement | null;

                if (imageEl) {
                        const transform = this.isLighting ? 'scaleX(-1)' : 'scaleX(1)';
                        imageEl.setAttribute('transform', transform);
                        const imageSrc = this.isLighting ? '/assets/LED.png' : '/assets/LED-light.png';
                        imageEl.setAttribute('xlink:href', imageSrc);
                }
        }

        public lightOn(speed: number) {


                if (!this.paper) return;
                if (speed > 0 && this.isConnected) {
                        this.isLighting = true;
                        this.light();
                } else {
                        this.isLighting = false;
                        this.light();
                }

        }

        bindConnectionEvents(container: HTMLElement) {
                container.addEventListener('connection-valid', (e: Event) => {
                        const customEvent = e as CustomEvent;
                        const { source, target } = (e as CustomEvent).detail;

                        // Check if this node is involved in the connection
                        if (this.id === source.id || this.id === target.id) {
                                // console.log('Connection valid:', source, target);
                                this.connectCount++;
                                if (this.connectCount == 2) {
                                        this.isConnected = true;
                                }
                        }
                }
                );

        }

}


export class LEDReverse extends shapes.standard.Rectangle {
        static PORT_RADIUS = portRadius;
        private isLighting = false;
        protected paper?: joint.dia.Paper;
        private connectCount = 0;
        private isConnected: boolean = false;

        constructor() {
                super();

                // Set default size for the rectangle
                this.resize(220, 50); // Match image dimensions

                // Define element attributes
                this.attr({
                        image: {
                                'xlinkHref': '/assets/LED-reverse.png',
                                width: 220,
                                height: 140,
                                preserveAspectRatio: 'xMidYMid slice',
                                cursor: 'move',
                                'data-role': 'LED-image'
                        },
                        root: {
                                highlighterSelector: 'body',
                                magnetSelector: 'body',
                        },
                        body: {
                                fill: 'rgba(70,101,229,0.15)',
                                stroke: '#4665E5',
                                strokeWidth: 1,
                                rx: 2,
                                ry: 2,
                                width: 220,     // Explicit width
                                height: 50      // Explicit height
                        }

                });

                this.prop({
                        z: 2,
                        ports: {
                                groups: {
                                        top: {
                                                position: 'top',
                                                attrs: portAttrs,
                                        },
                                        bottom: {
                                                position: 'bottom',
                                                attrs: portAttrs,
                                        },
                                        right: {
                                                position: 'right',
                                                attrs: portAttrs,
                                        },
                                        left: {
                                                position: 'left',
                                                attrs: portAttrs,
                                        },
                                },
                        }
                })

                // Add ports
                this.addPorts([
                        {
                                id: 'left-port',
                                group: 'left',
                                args: { x: -portRadius / 2 }
                        },
                        {
                                id: 'right-port',
                                group: 'right',
                                args: { x: portRadius / 2 + this.size().width }
                        }
                ]);

                this.markup = [
                        { tagName: 'image', selector: 'image' }
                ];
        }

        setPaper(paper: joint.dia.Paper) {
                this.paper = paper;
        }

        private light() {
                this.isLighting = !this.isLighting;

                if (!this.paper) return;

                const view = this.paper.findViewByModel(this);
                const imageEl = view?.el.querySelector('[data-role="LED-image"]') as SVGImageElement | null;

                if (imageEl) {
                        const transform = this.isLighting ? 'scaleX(-1)' : 'scaleX(1)';
                        imageEl.setAttribute('transform', transform);
                        const imageSrc = this.isLighting ? '/assets/LED-reverse.png' : '/assets/LED-reverse-light.png';
                        imageEl.setAttribute('xlink:href', imageSrc);
                }
        }

        public lightOn(speed: number) {


                if (!this.paper) return;
                if (speed < 0 && this.isConnected) {
                        this.isLighting = true;
                        this.light();
                } else {
                        this.isLighting = false;
                        this.light();
                }

        }

        bindConnectionEvents(container: HTMLElement) {
                container.addEventListener('connection-valid', (e: Event) => {
                        const customEvent = e as CustomEvent;
                        const { source, target } = (e as CustomEvent).detail;

                        // Check if this node is involved in the connection
                        if (this.id === source.id || this.id === target.id) {
                                // console.log('Connection valid:', source, target);
                                this.connectCount++;
                                if (this.connectCount == 2) {
                                        this.isConnected = true;
                                }
                        }
                }
                );

        }

}