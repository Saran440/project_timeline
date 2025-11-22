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
                <div style="flex: 1; display: flex; flex-direction: column;" onclick="store.setActiveProject('${project.id}')">
                    <span>${project.name}</span>
                    <span style="font-size: 0.8em; opacity: 0.7">${project.tasks.length} tasks</span>
                </div>
                <button class="btn-delete-project btn-ghost" style="padding: 4px; color: var(--hue-danger);" title="Delete Project">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            `;

            // Bind delete click
            const deleteBtn = el.querySelector('.btn-delete-project');
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Delete project "${project.name}"?`)) {
                    store.deleteProject(project.id);
                }
            };

            this.container.appendChild(el);
        });
    }
}
