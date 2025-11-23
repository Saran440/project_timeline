import { store } from '../store.js';

export class ProjectModal {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
    }

    open() {
        this.render();
        this.overlay.classList.remove('hidden');
        // Focus input
        setTimeout(() => {
            const input = this.overlay.querySelector('input[name="projectName"]');
            if (input) input.focus();
        }, 50);
    }

    close() {
        this.overlay.classList.add('hidden');
        this.overlay.innerHTML = '';
    }

    render() {
        this.overlay.innerHTML = `
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Create New Project</h3>
                    <button id="modal-close-project" class="btn btn-ghost"><i data-lucide="x"></i></button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1rem; color: var(--color-text-muted);">Enter the details for your new project to get started.</p>
                    <form id="project-form">
                        <div class="input-group">
                            <label>Project Name</label>
                            <input type="text" name="projectName" class="input-field" placeholder="e.g., Website Redesign" required>
                        </div>
                        <div class="modal-actions">
                            <button type="button" id="btn-cancel-project" class="btn btn-ghost">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Project</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Bind events
        document.getElementById('modal-close-project').onclick = () => this.close();
        document.getElementById('btn-cancel-project').onclick = () => this.close();

        document.getElementById('project-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const name = formData.get('projectName');

            if (name) {
                store.addProject(name);
                this.close();
                // Auto-select the new project (optional, but good UX)
                // Store adds it to the end, so we could find it.
                // For now, store.addProject doesn't return ID, but we can assume it's the last one.
                const projects = store.state.projects;
                if (projects.length > 0) {
                    store.setActiveProject(projects[projects.length - 1].id);
                }
            }
        };
    }
}
