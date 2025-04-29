// Connector.ts
import { Point } from './interface';

export class Connector {
        private svg: SVGSVGElement;
        private line: SVGLineElement;

        constructor() {
                this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                this.svg.classList.add('connector');
                this.svg.style.width = '100%';
                this.svg.style.height = '100%';
                document.body.appendChild(this.svg);

                this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                this.line.setAttribute('stroke', '#2196F3');
                this.line.setAttribute('stroke-width', '2');
                this.svg.appendChild(this.line);
        }

        update(start: Point, end: Point) {
                this.line.setAttribute('x1', start.x.toString());
                this.line.setAttribute('y1', start.y.toString());
                this.line.setAttribute('x2', end.x.toString());
                this.line.setAttribute('y2', end.y.toString());
        }

        remove() {
                this.svg.remove();
        }
}