import { dia, highlighters, linkTools } from '@joint/core';
import { Coil, Edge, LED, LEDReverse, PowerSupply } from './electric/LinkableElement';
import { Compass } from './magnet/compass';
import { HangingMagnetElement } from './magnet/hanging-magnet-element';
import { SpeedTrackingElement } from './SpeedTrackingElement';

export class Diagram {
    private readonly graph: dia.Graph;
    private readonly paper: dia.Paper;
    private readonly container: HTMLElement;

    constructor(container: HTMLElement) {
        this.graph = new dia.Graph();
        
        this.container = container;

        this.paper = new dia.Paper({
            el: container,
            model: this.graph,
            width: container.clientWidth,
            height: container.clientHeight,
            gridSize: 10,
            drawGrid: true,
            background: { color: '#f8f9fa' },
            interactive: true,

            // Enhanced connection configuration
            defaultLink: () => new Edge(),

            snapLinks: { radius: 30 },
            overflow: true,
            defaultConnector: {
                name: 'straight',
                args: {
                    cornerType: 'cubic',
                    cornerRadius: 4,
                },
            },
            highlighting: {
                default: {
                    name: 'mask',
                    options: {
                        padding: 2,
                        attrs: {
                            stroke: '#EA3C24',
                            strokeWidth: 2,
                        },
                    },
                },
            },

            validateConnection: (
                sourceView,
                sourceMagnet,
                targetView,
                targetMagnet,
                end
            ) => {
                const source = sourceView.model;
                const target = targetView.model;
                if (source.isLink() || target.isLink()) return false;
                if (targetMagnet === sourceMagnet) return false;
                if (end === 'target' ? targetMagnet : sourceMagnet) {

                    const event = new CustomEvent('connection-valid', {
                        detail: {
                            source: sourceView.model,
                            target: targetView.model,
                            sourcePort: sourceMagnet?.getAttribute('port'),
                            targetPort: targetMagnet?.getAttribute('port')
                        }
                    });
                    container.dispatchEvent(event);

                    return true;
                }
                if (source === target) return false;
                return end === 'target'
                    ? !target.hasPorts()
                    : !source.hasPorts();
            },
        });

        this.paper.on('link:mouseenter', (linkView) => {
            linkView.addTools(
                new dia.ToolsView({
                    tools: [
                        new linkTools.Remove(),
                        new linkTools.TargetArrowhead(),
                    ],
                })
            );
        });

        this.paper.on('link:mouseleave', (linkView) => {
            linkView.removeTools();
        });

        this.paper.on('link:pointerdown', (linkView) => {
            highlighters.addClass.add(linkView, 'line', 'active-link', {
                className: 'active-link'
            });
        });

        this.paper.on('link:pointerup', (linkView) => {
            highlighters.addClass.remove(linkView);
        });

        this.initializeEventHandlers();
    }


    private initializeEventHandlers(): void {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.paper.setDimensions(
                this.paper.el.clientWidth,
                this.paper.el.clientHeight
            );
        });

        // Double-click to create elements

    }

    public addElement<T extends dia.Element>(element: T): T {

        element.addTo(this.graph);

        if (element instanceof SpeedTrackingElement) {
            element.bindPaperEvents?.(this.paper);
        }

        if (element instanceof Coil) {
            element.bindPaperEvents?.(this.paper);
            element.bindConnectionEvents?.(this.container);
        }

        if (element instanceof PowerSupply) {
            element.bindPaperEvents?.(this.paper);
            element.setContainer(this.container);
        }

        if (element instanceof LED) {
            element.setPaper?.(this.paper);
            element.bindConnectionEvents?.(this.container);
        }

        if (element instanceof LEDReverse) {
            element.setPaper?.(this.paper);
            element.bindConnectionEvents?.(this.container);
        }

        // if (element instanceof Earth) {
        //     element.bindPaperEvents?.(this.paper);
        // }

        if (element instanceof Compass) {
            element.bindPaperEvents?.(this.paper);
        }

        if (element instanceof HangingMagnetElement) {
            element.bindConnectionEvents?.(this.container);
        }


        return element;
    }

    public getAllElements(): dia.Element[] {
        return this.graph.getElements();
    }

    // Additional useful methods
    public clearDiagram(): void {
        this.graph.clear();
    }

    public toJSON(): string {
        return JSON.stringify(this.graph.toJSON());
    }

    public fromJSON(json: string): void {
        this.graph.fromJSON(JSON.parse(json));
    }
}