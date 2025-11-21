import { store } from '../store.js';

export class Sidebar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.setupListeners();
    }

    setupListeners() {
        document.getElementById('btn-new-project').addEventListener('click', () => {
            const name = prompt("Enter project name:");
            if (name) {
                store.addProject(name);
            }
        });
    }

    render(state) {
        this.container.innerHTML = '';

        state.projects.forEach(project => {
            const el = document.createElement('div');
            el.className = `project-item ${state.activeProjectId === project.id ? 'active' : ''}`;
            el.innerHTML = `
                <span>${project.name}</span>
                <span style="font-size: 0.8em; opacity: 0.7">${project.tasks.length} tasks</span>
            `;
            el.onclick = () => store.setActiveProject(project.id);
            this.container.appendChild(el);
        });
    }
}
