import { ElementFactory } from '../ElementFactory';
import { SpeedTrackingElement } from '../SpeedTrackingElement';
import * as joint from '@joint/core';

export class BarMagnetElement extends SpeedTrackingElement {
        private fieldVisuals: SVGSVGElement[] = [];
        private fieldOffsets: { verticalOffset: number }[] = [];
        protected readonly imageSize = { width: 220, height: 50 };
        private _poleS: { x: number; y: number } = { x: 0, y: 0 };
        private _poleN: { x: number; y: number } = { x: 0, y: 0 };

        get poleS(): { x: number; y: number } {
                return this._poleS;
        }

        set poleS(value: { x: number; y: number }) {
                this._poleS = value;
        }

        get poleN(): { x: number; y: number } {
                return this._poleN;
        }

        set poleN(value: { x: number; y: number }) {
                this._poleN = value;
        }
        private reversed = false;
        private fieldsVisible = false;
        protected paper?: joint.dia.Paper;
        private reverseIcon?: HTMLElement;
        private toggleFieldIcon?: HTMLElement;
        private iconsVisible = false;
        private isBeingDragged = false;

        constructor() {
                super();
                this.resize(this.imageSize.width, this.imageSize.height);

                this.attr({
                        image: {
                                'xlinkHref': '/assets/bar-magnet.png',
                                width: this.imageSize.width,
                                height: this.imageSize.height,
                                preserveAspectRatio: 'xMidYMid slice',
                                cursor: 'move',
                                'data-role': 'magnet-image'
                        },
                        label: {
                                text: 'Magnet',
                                fontSize: 14,
                                fill: '#000',
                                textAnchor: 'middle',
                                x: this.imageSize.width / 2,
                                y: this.imageSize.height + 10
                        }
                });

                this.removeAttr('body');
                this.markup = [
                        { tagName: 'image', selector: 'image' },
                        { tagName: 'text', selector: 'label' }
                ];
                const pos = this.position();
                this._poleN = { x: pos.x, y: pos.y + this.imageSize.height / 2 };
                this._poleS = { x: pos.x + this.imageSize.width, y: pos.y + this.imageSize.height / 2 };
        }

        override bindPaperEvents(paper: joint.dia.Paper) {
                this.paper = paper;
                super.bindPaperEvents(paper);
                const view = paper.findViewByModel(this);

                view.on('element:pointerclick', (evt: joint.dia.Event) => {
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

                // Drag move
                view.on('element:pointermove', () => {
                        if (!this.lastPosition) return;
                        const now = Date.now();
                        const pos = this.position();
                        const dt = (now - this.lastTime) / 1000;
                        const dx = pos.x - this.lastPosition.x;
                        const dy = pos.y - this.lastPosition.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) * dx / Math.abs(dx);
                        const speed = (dist / dt).toFixed(1);
                        console.log(`[${this.id}] Speed: ${speed} px/s`);
                        this.lastPosition = pos;
                        this.lastTime = now;

                        ElementFactory.coilList.forEach(coil => {
                                coil.setSpeedAndPosition(dist / dt, this.poleS, this.poleN);
                        });
                });
        }


        protected updatePolePositions() {
                const pos = this.position();
                this.poleS = this.reversed
                        ? { x: pos.x + this.imageSize.width, y: pos.y + this.imageSize.height / 2 }
                        : { x: pos.x, y: pos.y + this.imageSize.height / 2 };
                this.poleN = this.reversed
                        ? { x: pos.x, y: pos.y + this.imageSize.height / 2 }
                        : { x: pos.x + this.imageSize.width, y: pos.y + this.imageSize.height / 2 };
                ElementFactory.hangingMagnetElementList.forEach(hangingMagnet => {
                        hangingMagnet.calculateAndMove(this.poleN, this.poleS);
                });
        }

        private toggleControlIcons(paper: joint.dia.Paper) {
                if (this.iconsVisible) {
                        this.reverseIcon?.remove();
                        this.toggleFieldIcon?.remove();
                        this.reverseIcon = undefined;
                        this.toggleFieldIcon = undefined;
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
                reverseIcon.style.left = `${paperRect.left + pos.x + this.imageSize.width / 2 - 40}px`;
                reverseIcon.style.top = `${paperRect.top + pos.y - 30}px`;
                reverseIcon.style.width = '20px';
                reverseIcon.style.cursor = 'pointer';
                reverseIcon.style.zIndex = '1000';
                reverseIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.reversePolarity();
                        this.toggleControlIcons(paper); // refresh icon layout
                });

                // Create toggle field visibility icon
                const toggleIcon = document.createElement('img');
                toggleIcon.src = this.fieldsVisible ? '/icon/CodiconEyeClosed.svg' : '/icon/CodiconEye.svg';
                toggleIcon.title = this.fieldsVisible ? 'Hide Magnetic Field' : 'Show Magnetic Field';
                toggleIcon.style.position = 'absolute';
                toggleIcon.style.left = `${paperRect.left + pos.x + this.imageSize.width / 2 + 10}px`;
                toggleIcon.style.top = `${paperRect.top + pos.y - 30}px`;
                toggleIcon.style.width = '20px';
                toggleIcon.style.cursor = 'pointer';
                toggleIcon.style.zIndex = '1000';
                toggleIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.fieldsVisible ? this.hideField() : this.showField(paper.el);
                        this.toggleControlIcons(paper); // refresh icon layout
                });

                document.body.appendChild(reverseIcon);
                document.body.appendChild(toggleIcon);

                this.reverseIcon = reverseIcon;
                this.toggleFieldIcon = toggleIcon;
                this.iconsVisible = true;
        }

        private reversePolarity() {
                this.reversed = !this.reversed;

                if (!this.paper) return;

                const view = this.paper.findViewByModel(this);
                const imageEl = view?.el.querySelector('[data-role="magnet-image"]') as SVGImageElement | null;

                if (imageEl) {
                        const transform = this.reversed ? 'scaleX(-1)' : 'scaleX(1)';
                        imageEl.setAttribute('transform', transform);
                        const imageSrc = this.reversed ? '/assets/bar-magnet-reversed.png' : '/assets/bar-magnet.png';
                        imageEl.setAttribute('xlink:href', imageSrc);
                }

                if (this.fieldsVisible && this.fieldVisuals.length > 0) {
                        const container = this.fieldVisuals[0].parentElement!;
                        this.showField(container);
                }
        }

        public showField(container: HTMLElement) {
                this.hideField();
                if (!this.imageSize) return;

                const pos = this.position();
                this.updatePolePositions();

                const numberOfClosedArcs = 5;
                const arcSpacing = 20;
                const arcOffsetStart = this.imageSize.height + 10;

                this.fieldOffsets = [];

                for (let i = 0; i < numberOfClosedArcs; i++) {
                        const offset = arcOffsetStart + i * arcSpacing;
                        this.createMagneticFieldArc(container, this.poleN, this.poleS, offset);
                        this.createMagneticFieldArc(container, this.poleN, this.poleS, -offset);
                        this.fieldOffsets.push({ verticalOffset: offset }, { verticalOffset: -offset });
                }

                const straightLength = 300; // you can make this configurable
                this.fieldOffsets.push({ verticalOffset: 1 });
                // Line: From N pole to right
                this.createMagneticFieldLine(
                        container,
                        !this.reversed ? { x: this.poleN.x + straightLength, y: this.poleN.y } : { x: this.poleN.x - straightLength, y: this.poleN.y },
                        this.poleN,
                        this.reversed
                );
                this.fieldOffsets.push({ verticalOffset: -1 });
                // Line: From right of S pole back to S pole
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