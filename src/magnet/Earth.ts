import { ElementFactory } from '../ElementFactory';
import { SpeedTrackingElement } from '../SpeedTrackingElement';
import * as joint from '@joint/core';

export class Earth extends SpeedTrackingElement {
        private fieldVisuals: SVGSVGElement[] = [];
        private fieldOffsets: { verticalOffset: number }[] = [];
        private readonly imageSize = { width: 300, height: 300 };
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
        private fieldsVisible = false;
        private paper?: joint.dia.Paper;
        // private reverseIcon?: HTMLElement;
        private toggleFieldIcon?: HTMLElement;
        private iconsVisible = false;

        constructor() {
                super();
                this.resize(this.imageSize.width, this.imageSize.height);

                this.attr({
                        image: {
                                'xlinkHref': '/assets/earth.png',
                                width: this.imageSize.width,
                                height: this.imageSize.height,
                                preserveAspectRatio: 'xMidYMid slice',
                                cursor: 'move',
                                'data-role': 'magnet-image'
                        },
                        label: {
                                text: 'Earth',
                                fontSize: 14,
                                fill: '#000',
                                textAnchor: 'middle',
                                x: this.imageSize.width / 2,
                                y: this.imageSize.height + 20
                        }
                });

                this.removeAttr('body');
                this.markup = [
                        { tagName: 'image', selector: 'image' },
                        { tagName: 'text', selector: 'label' }
                ];

        }

        override bindPaperEvents(paper: joint.dia.Paper) {
                this.paper = paper;
                super.bindPaperEvents(paper);
                const view = paper.findViewByModel(this);
                view.on('element:pointerclick', () => {
                        this.toggleControlIcons(paper);
                });

                view.on('element:pointermove', () => {
                    ElementFactory.compassList.forEach(compass => {
                        
                        compass.pointTo(this.poleN.x, this.poleN.y);
                    }
                    );
                });
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

                const toggleIcon = document.createElement('img');
                toggleIcon.src = this.fieldsVisible ? '/icon/CodiconEyeClosed.svg' : '/icon/CodiconEye.svg';
                toggleIcon.title = this.fieldsVisible ? 'Hide Magnetic Field' : 'Show Magnetic Field';
                toggleIcon.style.position = 'absolute';
                toggleIcon.style.left = `${paperRect.left + pos.x + this.imageSize.width / 2 - 20}px`;
                toggleIcon.style.top = `${paperRect.top + pos.y - 20}px`;
                toggleIcon.style.width = '20px';
                toggleIcon.style.cursor = 'pointer';
                toggleIcon.style.zIndex = '1000';
                toggleIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.fieldsVisible ? this.hideField() : this.showField(paper.el);
                        this.toggleControlIcons(paper);
                });

                document.body.appendChild(toggleIcon);

                this.toggleFieldIcon = toggleIcon;
                this.iconsVisible = true;
        }

        public showField(container: HTMLElement) {
                this.hideField();
                if (!this.imageSize) return;

                const pos = this.position();
                const yCenter = pos.y;

                // For U-magnet, poles are on the inner tips of the "U"
                this.poleS = { x: pos.x + this.imageSize.width / 2 + 20, y: yCenter }

                this.poleN = { x: pos.x + this.imageSize.width / 2 - 20, y: yCenter + this.imageSize.height }

                const numberOfClosedArcs = 5;
                const arcSpacing = 20;
                const arcOffsetStart = this.imageSize.height / 4;

                this.fieldOffsets = [];

                for (let i = 0; i < numberOfClosedArcs; i++) {
                        const offset = arcOffsetStart + i * arcSpacing;
                        this.createMagneticFieldArc(container, this.poleN, this.poleS, offset);
                        this.createMagneticFieldArc(container, this.poleN, this.poleS, -offset);
                        this.fieldOffsets.push({ verticalOffset: offset }, { verticalOffset: -offset });
                }

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
                        const yCenter = pos.y

                        this.poleS = { x: pos.x + this.imageSize.width / 2 + 20, y: yCenter }

                        this.poleN = { x: pos.x + this.imageSize.width / 2 - 20, y: yCenter + this.imageSize.height }

                        this.fieldVisuals.forEach((svg, i) => {
                                const path = svg.querySelector('path');
                                const offset = this.fieldOffsets[i].verticalOffset;
                                const dx = Math.abs(this.poleN.x - this.poleS.x);
                                const dy = Math.abs(offset);
                                const rx = dx * 2;
                                const ry = Math.max(dy, 20);
                                const sweepFlag = offset > 0 ? 1 : 0;

                                const d = `M ${this.poleN.x} ${this.poleN.y} A ${rx} ${ry} 0 0 ${sweepFlag} ${this.poleS.x} ${this.poleS.y}`;
                                path?.setAttribute("d", d);
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

                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute("class", "magnetic-field-svg");
                svg.style.position = "absolute";
                svg.style.left = `0`;
                svg.style.top = `0`;
                svg.style.overflow = "visible";
                svg.style.pointerEvents = "none";

                const path = document.createElementNS(svgNS, "path");
                const pathId = `field-path-${Date.now()}-${Math.random()}`;

                const dx = Math.abs(end.x - start.x);
                const dy = Math.abs(verticalOffset);
                const rx = dx * 2;
                const ry = Math.max(dy, 20);
                const sweepFlag = verticalOffset > 0 ? 1 : 0;

                const d = `M ${start.x} ${start.y} A ${rx} ${ry} 0 0 ${sweepFlag} ${end.x} ${end.y}`;
                path.setAttribute("id", pathId);
                path.setAttribute("d", d);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", "rgba(0, 153, 255, 0.4)");
                path.setAttribute("stroke-width", "2");

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
}
