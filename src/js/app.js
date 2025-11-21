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
        document.getElementById('btn-revisions').addEventListener('click', () => {
            const pid = store.state.activeProjectId;
            if (pid && pid !== 'ALL') {
                if (confirm('Save a snapshot of the current plan?')) {
                    store.createRevision(pid);
                    alert('Revision saved!');
                }
            }
        });

        document.getElementById('btn-view-all').addEventListener('click', () => {
            store.setActiveProject('ALL');
        });
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
