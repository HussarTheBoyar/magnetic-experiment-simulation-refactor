import * as joint from '@joint/core';; // Import JointJS core library
import '../style/subScreen.css'; // Make sure style.css is imported
import '../style/sidebar.css'; // Import specific styles for SubScreen1
import { Diagram } from '../Diagram';
import { Sidebar } from '../Sidebar';
import { ElementFactory } from '../ElementFactory';

const container = document.getElementById('paper-container')!;
const noteContent = document.getElementById('note-panel')!;
const diagram = new Diagram(container);

const sidebar = new Sidebar(document.getElementById('sidebar')!, showInfo);

sidebar.addImage('Cuộn Dây', '/assets/coil.png');
sidebar.addImage('Nguồn điện', '/assets/power-source.png');
// container.appendChild(sidebar.element);
container.addEventListener('dragover', e => e.preventDefault());

container.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer?.getData('text/plain');
    if (type) {
        const shape = ElementFactory.create(type, e.offsetX, e.offsetY);
        diagram.addElement(shape);
        sidebar.removeImage(type); // Remove the image from the sidebar after dropping
    }
});

function showInfo() {
    const isVisible = noteContent.style.display === 'block';
    const infoButton = document.getElementById('info-button')!;

    if (isVisible) {
        noteContent.style.display = 'none';
        infoButton.textContent = 'Information';
    } else {
        noteContent.style.display = 'block';
        infoButton.textContent = 'Close';
    }
}
