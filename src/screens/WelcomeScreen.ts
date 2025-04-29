export class WelcomeScreen {
    element: HTMLElement;

    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'welcome-screen';

        const experimentTitle = ['Đường sức từ của nam châm',
                                'Từ trường Trái Đất và la bàn', 
                                'Nam châm điện - Cuộn dây có dòng điện', 
                                'Hiện tượng cảm ứng điện từ (Faraday)'
                            ];

        for (let i = 1; i <= 4; i++) {
            const container = document.createElement('div');
            container.className = 'welcome-picture-container';

            const anchor = document.createElement('a');
            anchor.href = `/src/UI/subscreen${i}.html`;

            const img = document.createElement('img');
            img.src = `/background/${i}.png`; // ✅ updated path and name
            // img.alt = `Subscreen ${i}`;
            img.className = 'welcome-picture';
            // img.onclick = () => this.onSelectScreen(i);
            anchor.appendChild(img);
            container.appendChild(anchor);

            // Text overlay
            const text = document.createElement('div');
            text.className = 'welcome-text';
            text.innerText = experimentTitle[i-1]; // Add custom text for each image
            container.appendChild(text);
            this.element.appendChild(container);
        }
    }
}
