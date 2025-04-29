import * as joint from '@joint/core';
import { ElementFactory } from '../ElementFactory';


const BG_COLOR = "#f4f7f6";
const portRadius = 8;
const PIVOT_RADIUS = 10;
const PIVOT_COLOR = '#FF6B6B';
const portAttrs = {
    circle: {
        cursor: 'crosshair',
        fill: '#4D64DD',
        stroke: '#F4F7F6',
        magnet: 'active',
        r: portRadius,
    },
};

export class HangingMagnetElement extends joint.shapes.standard.Rectangle {
    static PORT_RADIUS = portRadius;
    protected paper?: joint.dia.Paper;
    private container: HTMLElement;
    private isConnected: boolean = false;
    private maxSwing: number = 100;
    private _poleS: { x: number; y: number } = { x: 0, y: 0 };
    private _poleN: { x: number; y: number } = { x: 0, y: 0 };
    private imageSize: { width: number; height: number } = { width: 220, height: 50 }; // Default image size
    private centerX: number | undefined; // Center position under pivot
    private currentX: number | undefined; // Current x-position relative to center
    private damping: number = 0.0;
    private centerPoint: number = 0; // pivot.x - width/3
    private currentXOffset: number = 0;
    private currentVelocity = 0;
    private strengthMultiplier: number = 500;

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

    constructor() {
        super();

        // Set default size for the rectangle
        this.resize(300, 220); // Match image dimensions

        // Define element attributes
        this.attr({
            image: {
                'xlinkHref': '/assets/bar-magnet.png',
                width: 220,
                height: 50,
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
                        // Custom position for top-center of BODY
                        position: {
                            name: 'absolute',
                            args: {
                                x: 110,  // 220 / 2 = 110 (center of body width)
                                y: -portRadius // Place port just above body's top edge
                            }
                        },
                        attrs: portAttrs
                    },
                    // ... (other groups)
                }
            }
        });

        // Add ports
        this.addPorts([
            {
                id: 'top-port',
                group: 'top',
                args: { y: -portRadius / 2 } // Position outside the element
            }
        ]);

        this.markup = [
            { tagName: 'image', selector: 'image' }
        ];
    }

    setContainer(container: HTMLElement) {
        this.container = container;
    }

    public moveHorizontal(deltaX: number): void {
        const currentPosition = this.position();
        const newX = currentPosition.x + deltaX;

        // Free movement if no pivot connected
        this.position(newX, currentPosition.y);
    }

    // Optional: Add directional methods with default step size
    public moveLeft(step: number = 10): void {
        this.moveHorizontal(-step);
    }

    public moveRight(step: number = 10): void {
        this.moveHorizontal(step);
    }

    protected updatePolePositions() {
        const pos = this.position();
        this.poleS = { x: pos.x, y: pos.y + this.imageSize.height / 2 };
        this.poleN = { x: pos.x + this.imageSize.width, y: pos.y + this.imageSize.height / 2 };
    }

    bindConnectionEvents(container: HTMLElement) {
        container.addEventListener('connection-valid', (e: Event) => {
            const customEvent = e as CustomEvent;
            const { source, target } = (e as CustomEvent).detail;

            // Check if this node is involved in the connection
            if (this.id === source.id || this.id === target.id) {
                // console.log('Connection valid:', source, target);
                this.isConnected = true;
                this.resetPosition();
                this.updatePolePositions();
            }
        }
        );

    }

    public resetPosition(): void {
        if (this.isConnected) {
            const pivot = ElementFactory.pivotList[0];
            if (pivot) {
                const pivotPosition = pivot.position();
                this.position(pivotPosition.x - this.size().width / 3, this.position().y);
            }
        }
    }

    public calculateAndMove(
        otherN: { x: number; y: number },
        otherS: { x: number; y: number }
    ): void {
        const pivot = ElementFactory.pivotList[0];
        if (!pivot) return;

        // 1. Update center point based on current pivot position
        this.updateCenterPoint(pivot);

        // 2. Calculate net horizontal force
        const force = this.calculateNetForce(otherN, otherS);

        // 3. Apply physics with damping
        this.currentVelocity = (this.currentVelocity + force) * 0.92;

        // 4. Calculate new position with constraints
        let newOffset = this.currentXOffset + this.currentVelocity;
        newOffset = this.clamp(newOffset, -this.maxSwing, this.maxSwing);

        // 5. Update actual position
        this.position(this.centerPoint + newOffset, this.position().y);
        this.currentXOffset = newOffset;
        this.updatePolePositions();
    }

    //--------------------------------------------------
    // Helper Methods
    //--------------------------------------------------
    private updateCenterPoint(pivot: PivotPointElement): void {
        const pivotPos = pivot.position();
        const elementWidth = this.size().width;
        this.centerPoint = pivotPos.x - (elementWidth / 3);
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    private calculateNetForce(
        otherN: { x: number; y: number },
        otherS: { x: number; y: number }
    ): number {
        let totalForce = 0;

        const pairs = [
            { thisPole: this.poleN, otherPole: otherN, type: 'NN' },
            { thisPole: this.poleN, otherPole: otherS, type: 'NS' },
            { thisPole: this.poleS, otherPole: otherN, type: 'SN' },
            { thisPole: this.poleS, otherPole: otherS, type: 'SS' }
        ];

        pairs.forEach(pair => {
            const dx = pair.otherPole.x - pair.thisPole.x;
            const dy = pair.otherPole.y - pair.thisPole.y;
            const distance = Math.hypot(dx, dy) || 1;

            // Amplified force calculation
            const forceType = pair.type === 'NS' || pair.type === 'SN' ? 1 : -1;
            const strength = (forceType * this.strengthMultiplier) / (distance * distance);

            totalForce += strength * (dx / distance); // Horizontal component
        });

        return totalForce;
    }
}

export class PivotPointElement extends joint.dia.Element {
    static PIVOT_RADIUS = PIVOT_RADIUS;

    constructor(position?: { x: number; y: number }) {
        super();

        this.set({
            type: 'pivot',
            size: { width: PIVOT_RADIUS * 2, height: PIVOT_RADIUS * 2 },
            position: position || { x: 0, y: 0 },
            attrs: {
                body: {
                    cursor: 'move',
                    fill: PIVOT_COLOR,
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                    r: PIVOT_RADIUS
                },
            },
            ports: {
                groups: {
                    bottom: {
                        position: 'bottom', // Port at bottom for connections
                        attrs: {
                            circle: {
                                r: 4,
                                magnet: 'passive',
                                fill: PIVOT_COLOR,
                                stroke: '#FFFFFF'
                            }
                        }
                    }
                }
            }
        });

        // Add port for connecting links
        this.addPort({
            id: 'pivot-port',
            group: 'bottom'
        });

        // Define markup (circle shape)
        this.markup = [{
            tagName: 'circle',
            selector: 'body',
            attributes: {
                'cx': PIVOT_RADIUS,
                'cy': PIVOT_RADIUS
            }
        }];
    }

    // Optional: Add methods for pivot-specific logic
    setPosition(x: number, y: number): void {
        this.position(x, y);
    }
}

