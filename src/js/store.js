/**
 * Simple Pub/Sub Store for State Management
 */
import { generateId } from './utils.js';

const STORAGE_KEY = 'orion_pm_data';

const defaultState = {
    projects: [], // { id, name, tasks: [] }
    activeProjectId: null,
    revisions: [] // { id, timestamp, projectId, data: {} }
};

class Store {
    constructor() {
        this.state = this.loadState();
        this.listeners = new Set();
    }

    loadState() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : defaultState;
        } catch (e) {
            console.error("Failed to load state", e);
            return defaultState;
        }
    }

    saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.notify();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // --- Actions ---

    addProject(name) {
        const newProject = {
            id: generateId(),
            name,
            tasks: []
        };
        this.state.projects.push(newProject);
        // Auto-select if first project
        if (!this.state.activeProjectId) {
            this.state.activeProjectId = newProject.id;
        }
        this.saveState();
    }

    setActiveProject(id) {
        this.state.activeProjectId = id;
        this.saveState();
    }

    addTask(projectId, task) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project) {
            project.tasks.push({
                id: generateId(),
                ...task // name, start, duration
            });
            this.saveState();
        }
    }

    updateTask(projectId, taskId, updates) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project) {
            const taskIndex = project.tasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                project.tasks[taskIndex] = { ...project.tasks[taskIndex], ...updates };
                this.saveState();
            }
        }
    }

    deleteTask(projectId, taskId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project) {
            project.tasks = project.tasks.filter(t => t.id !== taskId);
            this.saveState();
        }
    }

    createRevision(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project) {
            const revision = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                projectId,
                data: JSON.parse(JSON.stringify(project)) // Deep copy
            };
            this.state.revisions.push(revision);
            this.saveState();
        }
    }

    restoreRevision(revisionId) {
        const revision = this.state.revisions.find(r => r.id === revisionId);
        if (revision) {
            const projectIndex = this.state.projects.findIndex(p => p.id === revision.projectId);
            if (projectIndex > -1) {
                // Restore the project data from the revision
                this.state.projects[projectIndex] = JSON.parse(JSON.stringify(revision.data));
                this.saveState();
            }
        }
    }
}

export const store = new Store();
