export class Sidebar {
        constructor(
                private readonly container: HTMLElement,
                onInfo: () => void
        ) {
                const infoButton = this.createRow('Information', onInfo);
                infoButton.id = 'info-button'; // this makes it a nice row
                infoButton.className = 'sidebar-row sidebar-info-button'; // this makes it a nice row
                this.container.appendChild(infoButton);
        }

        public addImage(type: string, src: string): void {
                const img = document.createElement('img');
                img.src = src;
                img.alt = type;
                img.id = type; // Set the id to the type
                img.className = 'sidebar-image';
                img.draggable = true; // <-- make it draggable
                img.title = type; // Set the title to the alt text

                img.addEventListener('dragstart', (e) => {
                        e.dataTransfer?.setData('text/plain', type); // Save type info for dropping
                });

                this.container.appendChild(img);
        }

        public removeImage(type: string): void {
                const img = document.getElementById(type);
                if (img) {
                        this.container.removeChild(img);
                }
        }

        private createRow(text: string, onClick: () => void): HTMLElement {
                const row = document.createElement('div');
                row.className = 'sidebar-row';
                row.innerText = text;
                row.onclick = onClick;
                return row;
        }
}