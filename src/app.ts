import { WelcomeScreen } from './screens/WelcomeScreen';
// import { SubScreen1 } from './screens/SubScreen1';
// import { SubScreen2 } from './screens/SubScreen2';
// import { SubScreen3 } from './screens/SubScreen3';
// import { SubScreen4 } from './screens/SubScreen4';
import './style/main.css'; // Import your CSS file

class App {
    private root: HTMLElement;

    constructor() {
        this.root = document.getElementById('root')!;
        this.loadScreen();
    }

    private loadScreen() {
        const screen = localStorage.getItem('currentScreen');
        if (screen === 'welcome') {
            this.showWelcome();
        } else if (screen?.startsWith('subscreen')) {
            const id = parseInt(screen.replace('subscreen', ''));
            this.showSubscreen(id);
        } else {
            this.showWelcome();
        }
    }

    showWelcome() {
        localStorage.setItem('currentScreen', 'welcome');
        const welcome = new WelcomeScreen();
        this.root.innerHTML = '';
        this.root.appendChild(welcome.element);
    }
}

new App();
