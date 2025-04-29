import * as joint from '@joint/core';

export class SpeedTrackingElement extends joint.shapes.standard.Rectangle {
    protected lastTime: number = 0;

    setLastTime(time: number): void {
        this.lastTime = time;
    }

    getLastTime(): number {
        return this.lastTime;
    }
    protected lastPosition: { x: number, y: number } | null = null;

    getLastPosition(): { x: number, y: number } | null {
        return this.lastPosition;
    }

    setLastPosition(position: { x: number, y: number } | null): void {
        this.lastPosition = position;
    }

    constructor() {
        super();
        this.resize(120, 50);
        this.attr({
            label: {
                text: 'New Box',
                fontSize: 14,
                body: { fill: '#6c9bd1' }
            },
            body: { fill: '#6c9bd1' }
        });
    }

    bindPaperEvents(paper: joint.dia.Paper): void {
        const view = paper.findViewByModel(this);

        // Double click for editing
        view.on('element:pointerdblclick', () => this.enableInlineEdit(paper));

        // Drag start
        view.on('element:pointerdown', () => {
            this.lastTime = Date.now();
            this.lastPosition = this.position();
        });

        // Drag move
        // view.on('element:pointermove', () => {
        //     if (!this.lastPosition) return;
        //     const now = Date.now();
        //     const pos = this.position();
        //     const dt = (now - this.lastTime) / 1000;
        //     const dx = pos.x - this.lastPosition.x;
        //     const dy = pos.y - this.lastPosition.y;
        //     const dist = Math.sqrt(dx * dx + dy * dy)*dx/Math.abs(dx);
        //     const speed = (dist / dt).toFixed(1);
        //     console.log(`[${this.id}] Speed: ${speed} px/s`);
        //     this.lastPosition = pos;
        //     this.lastTime = now;
        // });

        // Drag end
        view.on('pointerup', () => {
            this.lastPosition = null;
        });
    }

    private enableInlineEdit(paper: joint.dia.Paper): void {
        const pos = this.position();
        const size = this.size();
        const paperRect = paper.el.getBoundingClientRect();
        const currentText = this.attr('label/text') || '';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.style.position = 'absolute';
        input.style.left = `${paperRect.left + pos.x}px`;
        input.style.top = `${paperRect.top + pos.y + size.height / 2 - 10}px`;
        input.style.width = `${size.width}px`;
        input.style.height = `20px`;
        input.style.textAlign = 'center';
        input.style.fontSize = '14px';
        input.style.border = '1px solid #aaa';
        input.style.zIndex = '1000';

        document.body.appendChild(input);
        input.focus();
        input.select();

        const cleanup = () => input.remove();

        const commit = () => {
            if (input.value !== currentText) {
                this.attr('label/text', input.value);
            }
            cleanup();
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') cleanup();
        });

        setTimeout(() => {
            const onDocClick = (e: MouseEvent) => {
                if (e.target !== input) {
                    cleanup();
                    document.removeEventListener('click', onDocClick);
                }
            };
            document.addEventListener('click', onDocClick);
        }, 0);
    }
}
