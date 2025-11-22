import { getTimelineRange, getDaysDiff, formatDate } from '../utils.js';
import { TaskModal } from './TaskModal.js';
import { store } from '../store.js';

export class GanttChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.modal = new TaskModal();
        this.viewMode = 'Day'; // Day, Month, Year
        this.setupViewControls();
    }

    setupViewControls() {
        if (document.getElementById('gantt-controls')) return;

        const controls = document.createElement('div');
        controls.id = 'gantt-controls';
        controls.className = 'gantt-controls';
        controls.style.padding = '0 0 1rem 0';
        controls.style.display = 'flex';
        controls.style.gap = '1rem';
        controls.innerHTML = `
            <select id="view-mode-select" class="input-field" style="width: auto;">
                <option value="Day">Day View</option>
                <option value="Month">Month View</option>
                <option value="Year">Year View</option>
            </select>
        `;
        this.container.parentNode.insertBefore(controls, this.container);

        document.getElementById('view-mode-select').addEventListener('change', (e) => {
            this.viewMode = e.target.value;
        });
    }

    getColumnConfig(days) {
        if (this.viewMode === 'Month') {
            const weeks = Math.ceil(days / 7);
            return { count: weeks, unit: 'Week', px: 60, daysPerCol: 7 };
        } else if (this.viewMode === 'Year') {
            const months = Math.ceil(days / 30);
            return { count: months, unit: 'Month', px: 80, daysPerCol: 30 };
        }
        return { count: days, unit: 'Day', px: 40, daysPerCol: 1 };
    }

    render(project) {
        const select = document.getElementById('view-mode-select');
        if (select) this.viewMode = select.value;

        if (!project) {
            this.container.innerHTML = `<div class="empty-state"><p>Select a project to view timeline</p></div>`;
            return;
        }

        if (project.tasks.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state" style="flex-direction: column; gap: 1rem;">
                    <p>No tasks yet.</p>
                    <button id="btn-add-first-task" class="btn btn-primary">Add Task</button>
                </div>
            `;
            document.getElementById('btn-add-first-task').onclick = () => this.modal.open(project.id);
            return;
        }

        const { start, end, days } = getTimelineRange(project.tasks);
        const colConfig = this.getColumnConfig(days);

        const grid = document.createElement('div');
        grid.className = 'gantt-grid';
        grid.style.gridTemplateColumns = `200px repeat(${colConfig.count}, minmax(${colConfig.px}px, 1fr))`;

        // Header
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'gantt-header-cell';
        emptyHeader.textContent = 'Task';
        emptyHeader.style.position = 'sticky';
        emptyHeader.style.left = '0';
        emptyHeader.style.zIndex = '10';
        grid.appendChild(emptyHeader);

        for (let i = 0; i < colConfig.count; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + (i * colConfig.daysPerCol));
            const cell = document.createElement('div');
            cell.className = 'gantt-header-cell';
            cell.textContent = this.viewMode === 'Day' ? formatDate(d) : (this.viewMode === 'Month' ? `W${i + 1}` : d.toLocaleDateString('en-US', { month: 'short' }));
            grid.appendChild(cell);
        }

        // Tasks Loop
        project.tasks.forEach((task, index) => {
            // Task Name Cell with Drag Handle
            const nameCell = document.createElement('div');
            nameCell.className = 'gantt-header-cell task-name-cell';
            nameCell.style.textAlign = 'left';
            nameCell.style.position = 'sticky';
            nameCell.style.left = '0';
            nameCell.style.zIndex = '5';
            nameCell.style.background = 'var(--color-bg-surface)';
            nameCell.style.display = 'flex';
            nameCell.style.alignItems = 'center';
            nameCell.style.gap = '0.5rem';

            const handle = document.createElement('span');
            handle.innerHTML = `<i data-lucide="grip-vertical" style="width: 14px; height: 14px; opacity: 0.5; cursor: grab;"></i>`;
            nameCell.appendChild(handle);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = task.name;
            nameSpan.style.flex = '1';
            nameSpan.style.overflow = 'hidden';
            nameSpan.style.textOverflow = 'ellipsis';
            nameCell.appendChild(nameSpan);

            // Drag Events
            nameCell.draggable = true;
            nameCell.ondragstart = (e) => {
                e.dataTransfer.setData('text/plain', index);
                e.dataTransfer.effectAllowed = 'move';
                nameCell.style.opacity = '0.5';
            };
            nameCell.ondragend = () => {
                nameCell.style.opacity = '1';
            };
            nameCell.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                nameCell.style.background = 'var(--color-bg-surface-hover)';
            };
            nameCell.ondragleave = () => {
                nameCell.style.background = 'var(--color-bg-surface)';
            };
            nameCell.ondrop = (e) => {
                e.preventDefault();
                nameCell.style.background = 'var(--color-bg-surface)';
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                if (fromIndex !== index) {
                    store.reorderTask(project.id, fromIndex, index);
                }
            };

            grid.appendChild(nameCell);

            const rowIndex = index + 2;
            nameCell.style.gridRow = rowIndex;

            // Calculate Grid Position
            const taskStart = new Date(task.start);
            let offsetDays = getDaysDiff(start, taskStart);
            let colStart = Math.floor(offsetDays / colConfig.daysPerCol) + 2;
            let colSpan = Math.max(1, Math.ceil(task.duration / colConfig.daysPerCol));

            if (colStart < 2) colStart = 2;

            // Ghost Bar (History)
            if (task.history && task.history.length > 0) {
                const lastHistory = task.history[task.history.length - 1];
                const ghostStart = new Date(lastHistory.start);
                let ghostOffset = getDaysDiff(start, ghostStart);
                let ghostColStart = Math.floor(ghostOffset / colConfig.daysPerCol) + 2;
                let ghostColSpan = Math.max(1, Math.ceil(lastHistory.duration / colConfig.daysPerCol));

                if (ghostColStart >= 2) {
                    const ghost = document.createElement('div');
                    ghost.className = 'gantt-ghost';
                    ghost.style.gridColumn = `${ghostColStart} / span ${ghostColSpan}`;
                    ghost.style.gridRow = rowIndex;
                    ghost.innerHTML = `<span>${lastHistory.duration}d</span>`;
                    ghost.title = `Previous: ${lastHistory.duration} days`;
                    grid.appendChild(ghost);
                }
            }

            // Actual Task/Milestone
            const bar = document.createElement('div');
            if (task.type === 'milestone') {
                bar.className = 'gantt-milestone';
                bar.style.gridColumn = `${colStart} / span 1`;
                bar.title = `${task.name} (Milestone)`;
            } else {
                bar.className = 'gantt-bar';
                bar.style.gridColumn = `${colStart} / span ${colSpan}`;
                bar.innerHTML = `<span class="gantt-bar-label">${task.name}</span>`;
            }

            bar.style.gridRow = rowIndex;
            bar.onclick = () => this.modal.open(project.id, task);
            grid.appendChild(bar);
        });

        // Add Button
        const addBtnRow = document.createElement('div');
        addBtnRow.style.gridColumn = '1 / -1';
        addBtnRow.style.padding = '1rem';
        addBtnRow.innerHTML = `<button class="btn btn-ghost" style="width: 100%">+ Add Task</button>`;
        addBtnRow.querySelector('button').onclick = () => this.modal.open(project.id);
        grid.appendChild(addBtnRow);

        this.container.innerHTML = '';
        this.container.appendChild(grid);
    }

    renderMulti(projects) {
        const select = document.getElementById('view-mode-select');
        if (select) this.viewMode = select.value;

        if (!projects || projects.length === 0) {
            this.container.innerHTML = `<div class="empty-state"><p>No projects to display.</p></div>`;
            return;
        }

        const allTasks = projects.flatMap(p => p.tasks);
        if (allTasks.length === 0) {
            this.container.innerHTML = `<div class="empty-state"><p>No tasks across any projects.</p></div>`;
            return;
        }

        const { start, end, days } = getTimelineRange(allTasks);
        const colConfig = this.getColumnConfig(days);

        const grid = document.createElement('div');
        grid.className = 'gantt-grid';
        grid.style.gridTemplateColumns = `200px repeat(${colConfig.count}, minmax(${colConfig.px}px, 1fr))`;

        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'gantt-header-cell';
        emptyHeader.textContent = 'Project / Task';
        emptyHeader.style.position = 'sticky';
        emptyHeader.style.left = '0';
        emptyHeader.style.zIndex = '10';
        grid.appendChild(emptyHeader);

        for (let i = 0; i < colConfig.count; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + (i * colConfig.daysPerCol));
            const cell = document.createElement('div');
            cell.className = 'gantt-header-cell';
            cell.textContent = this.viewMode === 'Day' ? formatDate(d) : (this.viewMode === 'Month' ? `W${i + 1}` : d.toLocaleDateString('en-US', { month: 'short' }));
            grid.appendChild(cell);
        }

        let currentRow = 2;

        projects.forEach(project => {
            const sectionHeader = document.createElement('div');
            sectionHeader.style.gridColumn = `1 / -1`;
            sectionHeader.style.gridRow = currentRow;
            sectionHeader.style.background = 'var(--color-bg-surface-hover)';
            sectionHeader.style.padding = '0.5rem 1rem';
            sectionHeader.style.fontWeight = 'bold';
            sectionHeader.style.color = 'var(--color-primary)';
            sectionHeader.style.borderTop = '1px solid var(--color-border)';
            sectionHeader.style.borderBottom = '1px solid var(--color-border)';
            sectionHeader.textContent = project.name;
            grid.appendChild(sectionHeader);
            currentRow++;

            project.tasks.forEach(task => {
                const nameCell = document.createElement('div');
                nameCell.className = 'gantt-header-cell';
                nameCell.style.textAlign = 'left';
                nameCell.style.position = 'sticky';
                nameCell.style.left = '0';
                nameCell.style.zIndex = '5';
                nameCell.style.background = 'var(--color-bg-surface)';
                nameCell.style.gridRow = currentRow;
                nameCell.textContent = task.name;
                grid.appendChild(nameCell);

                const taskStart = new Date(task.start);
                let offsetDays = getDaysDiff(start, taskStart);
                let colStart = Math.floor(offsetDays / colConfig.daysPerCol) + 2;
                let colSpan = Math.max(1, Math.ceil(task.duration / colConfig.daysPerCol));

                if (colStart < 2) colStart = 2;

                // Ghost Bar (History) for Multi View
                if (task.history && task.history.length > 0) {
                    const lastHistory = task.history[task.history.length - 1];
                    const ghostStart = new Date(lastHistory.start);
                    let ghostOffset = getDaysDiff(start, ghostStart);
                    let ghostColStart = Math.floor(ghostOffset / colConfig.daysPerCol) + 2;
                    let ghostColSpan = Math.max(1, Math.ceil(lastHistory.duration / colConfig.daysPerCol));

                    if (ghostColStart >= 2) {
                        const ghost = document.createElement('div');
                        ghost.className = 'gantt-ghost';
                        ghost.style.gridColumn = `${ghostColStart} / span ${ghostColSpan}`;
                        ghost.style.gridRow = currentRow;
                        ghost.innerHTML = `<span>${lastHistory.duration}d</span>`;
                        grid.appendChild(ghost);
                    }
                }

                const bar = document.createElement('div');
                if (task.type === 'milestone') {
                    bar.className = 'gantt-milestone';
                    bar.style.gridColumn = `${colStart} / span 1`;
                } else {
                    bar.className = 'gantt-bar';
                    bar.style.gridColumn = `${colStart} / span ${colSpan}`;
                    bar.innerHTML = `<span class="gantt-bar-label">${task.name}</span>`;
                }

                bar.style.gridRow = currentRow;
                bar.onclick = () => this.modal.open(project.id, task);

                grid.appendChild(bar);
                currentRow++;
            });
        });

        this.container.innerHTML = '';
        this.container.appendChild(grid);
    }
}
