import { store } from './store.js';
import { Sidebar } from './components/Sidebar.js';
import { GanttChart } from './components/GanttChart.js';

class App {
    constructor() {
        this.sidebar = new Sidebar('project-list');
        this.gantt = new GanttChart('gantt-container');
        this.init();
    }

    init() {
        // Subscribe to store changes
        store.subscribe((state) => {
            this.render(state);
        });

        // Initial Render
        this.render(store.state);

        // Global Listeners
        const btnRevisions = document.getElementById('btn-revisions');
        if (btnRevisions) {
            btnRevisions.addEventListener('click', () => {
                const pid = store.state.activeProjectId;
                if (pid && pid !== 'ALL') {
                    const action = prompt("Type 'save' to save a snapshot, or 'restore' to restore the last one.");
                    if (action === 'save') {
                        store.createRevision(pid);
                        alert('Revision saved!');
                    } else if (action === 'restore') {
                        const revs = store.state.revisions.filter(r => r.projectId === pid);
                        if (revs.length > 0) {
                            const last = revs[revs.length - 1];
                            if (confirm(`Restore snapshot from ${new Date(last.timestamp).toLocaleString()}?`)) {
                                store.restoreRevision(last.id);
                                alert('Restored!');
                            }
                        } else {
                            alert('No revisions found.');
                        }
                    }
                } else {
                    alert('Select a project first.');
                }
            });
        }

        const btnViewAll = document.getElementById('btn-view-all');
        if (btnViewAll) {
            btnViewAll.addEventListener('click', () => {
                store.setActiveProject('ALL');
            });
        }

        // Theme Toggle
        const btnTheme = document.getElementById('btn-theme');
        if (btnTheme) {
            btnTheme.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('orion_theme', next);
                // Update icon
                this.updateThemeIcon(next);
            });
        }

        // Init Theme
        const savedTheme = localStorage.getItem('orion_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        // Refresh Button
        const btnRefresh = document.getElementById('btn-refresh');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => {
                if (confirm('Reload data from storage?')) {
                    location.reload();
                }
            });
        }
    }

    updateThemeIcon(theme) {
        const btn = document.getElementById('btn-theme');
        if (btn) {
            // Sun for light, Moon for dark
            btn.innerHTML = theme === 'light' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    render(state) {
        this.sidebar.render(state);

        if (state.activeProjectId === 'ALL') {
            document.getElementById('active-project-name').textContent = 'All Projects Timeline';
            this.gantt.renderMulti(state.projects);
        } else {
            const activeProject = state.projects.find(p => p.id === state.activeProjectId);
            if (activeProject) {
                document.getElementById('active-project-name').textContent = activeProject.name;
                this.gantt.render(activeProject);
            } else {
                document.getElementById('active-project-name').textContent = 'Orion Project Manager';
                this.gantt.render(null);
            }
        }

        // Re-run icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Start App
const app = new App();
