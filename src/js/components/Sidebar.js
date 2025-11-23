import { store } from '../store.js';
import { ProjectModal } from './ProjectModal.js';

export class Sidebar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.projectModal = new ProjectModal();
        this.setupListeners();
    }

    setupListeners() {
        document.getElementById('btn-new-project').addEventListener('click', () => {
            this.projectModal.open();
        });
    }

    render(state) {
        this.container.innerHTML = '';

        state.projects.forEach(project => {
            const el = document.createElement('div');
            el.className = `project-item ${state.activeProjectId === project.id ? 'active' : ''}`;
            el.innerHTML = `
                <div class="project-info" style="flex: 1; display: flex; flex-direction: column; cursor: pointer;">
                    <span>${project.name}</span>
                    <span style="font-size: 0.8em; opacity: 0.7">${project.tasks.length} tasks</span>
                </div>
                <button class="btn-delete-project btn-ghost" style="padding: 4px; color: var(--hue-danger);" title="Delete Project">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            `;

            // Bind click to select project
            el.querySelector('.project-info').addEventListener('click', () => {
                store.setActiveProject(project.id);
            });

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
