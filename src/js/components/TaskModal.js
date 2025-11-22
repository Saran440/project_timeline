import { store } from '../store.js';

export class TaskModal {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
        this.projectId = null;
        this.taskId = null; // If editing
    }

    open(projectId, task = null) {
        this.projectId = projectId;
        this.taskId = task ? task.id : null;
        this.render(task);
        this.overlay.classList.remove('hidden');
    }

    close() {
        this.overlay.classList.add('hidden');
        this.overlay.innerHTML = '';
    }

    render(task) {
        const isEdit = !!task;
        this.overlay.innerHTML = `
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${isEdit ? 'Edit Task' : 'New Task'}</h3>
                    <button id="modal-close" class="btn btn-ghost"><i data-lucide="x"></i></button>
                </div>
                <form id="task-form">
                    <div class="input-group">
                        <label>Task Name</label>
                        <input type="text" name="name" class="input-field" value="${task ? task.name : ''}" required autofocus>
                    </div>
                    <div class="input-group">
                        <label>Start Date</label>
                        <input type="date" name="start" class="input-field" value="${task ? task.start : new Date().toISOString().split('T')[0]}" required style="color-scheme: dark;">
                    </div>
                    <div class="input-group">
                        <label>Duration (Days)</label>
                        <input type="number" name="duration" class="input-field" value="${task ? task.duration : 1}" min="0" required>
                    </div>
                    <div class="input-group" style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" name="isMilestone" id="isMilestone" ${task && task.type === 'milestone' ? 'checked' : ''}>
                        <label for="isMilestone" style="margin: 0; cursor: pointer;">Mark as Milestone</label>
                    </div>
                    <div class="modal-actions">
                        ${isEdit ? `<button type="button" id="btn-delete-task" class="btn btn-ghost" style="color: var(--hue-danger)">Delete</button>` : ''}
                        <button type="submit" class="btn btn-primary">Save Task</button>
                    </div>
                </form>
            </div>
        `;

        // Re-initialize icons in modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Bind events
        document.getElementById('modal-close').onclick = () => this.close();

        // Milestone toggle logic
        const milestoneCb = document.getElementById('isMilestone');
        const durationInput = document.querySelector('input[name="duration"]');

        // Initial state check
        if (milestoneCb.checked) {
            durationInput.value = 0;
            durationInput.disabled = true;
        }

        milestoneCb.onchange = (e) => {
            if (e.target.checked) {
                durationInput.value = 0;
                durationInput.disabled = true;
            } else {
                durationInput.value = 1;
                durationInput.disabled = false;
            }
        };

        if (isEdit) {
            document.getElementById('btn-delete-task').onclick = () => {
                if (confirm('Delete this task?')) {
                    store.deleteTask(this.projectId, this.taskId);
                    this.close();
                }
            };
        }

        document.getElementById('task-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const isMilestone = formData.get('isMilestone') === 'on';

            const data = {
                name: formData.get('name'),
                start: formData.get('start'),
                duration: isMilestone ? 0 : parseInt(formData.get('duration')),
                type: isMilestone ? 'milestone' : 'task'
            };

            if (isEdit) {
                store.updateTask(this.projectId, this.taskId, data);
            } else {
                store.addTask(this.projectId, data);
            }
            this.close();
        };
    }
}
