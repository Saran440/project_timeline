import { getTimelineRange, getDaysDiff, formatDate } from '../utils.js';
import { TaskModal } from './TaskModal.js';

export class GanttChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.modal = new TaskModal();
    }

    render(project) {
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

        // Create Grid Container
        const grid = document.createElement('div');
        grid.className = 'gantt-grid';
        // Column 1: Task Name (200px), Rest: Days
        grid.style.gridTemplateColumns = `200px repeat(${days}, minmax(40px, 1fr))`;

        // 1. Header Row
        // Empty top-left cell
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'gantt-header-cell';
        emptyHeader.textContent = 'Task';
        emptyHeader.style.position = 'sticky';
        emptyHeader.style.left = '0';
        emptyHeader.style.zIndex = '10';
        grid.appendChild(emptyHeader);

        // Date Headers
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const cell = document.createElement('div');
            cell.className = 'gantt-header-cell';
            cell.textContent = formatDate(d);
            grid.appendChild(cell);
        }

        // 2. Task Rows
        project.tasks.forEach(task => {
            // Task Name Cell
            const nameCell = document.createElement('div');
            nameCell.className = 'gantt-header-cell';
            nameCell.style.textAlign = 'left';
            nameCell.style.position = 'sticky';
            nameCell.style.left = '0';
            nameCell.style.zIndex = '5';

            // We need to place the bar in the correct "Row". 
            // CSS Grid auto-placement fills cells. 
            // To make it look like a row, we need to fill the empty cells or use a different layout.
            // Actually, standard Grid places items in the next available cell.
            // If we want a "Row" per task, we need to ensure the bar is on the same visual row as the name.
            // Easier approach: The "Grid" is just the timeline. The "Name" is a separate column?
            // No, let's use `display: contents` or just flat children.
            // If we just append the bar, it will try to fit in the next cell (column 2).
            // If we set grid-column, it will span.
            // But we need to make sure it stays on the SAME ROW as the name.
            // CSS Grid doesn't natively link "Name Cell" and "Bar" unless they are in a wrapper with `subgrid` (not widely supported) or we manually manage row indices.

            // FIX: Use `grid-row` explicitly?
            // We are iterating tasks. Let's assign a row index.
            // Header is row 1. Task 1 is row 2.
            const rowIndex = project.tasks.indexOf(task) + 2;
            nameCell.style.gridRow = rowIndex;
            bar.style.gridRow = rowIndex;

            grid.appendChild(bar);

            // Fill background cells for grid lines?
            // We can use a pseudo-element or background-image on the container for lines.
            // Or just let the gaps do the work.
        });

        // Add "Add Task" button at the bottom
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
        if (!projects || projects.length === 0) {
            this.container.innerHTML = `<div class="empty-state"><p>No projects to display.</p></div>`;
            return;
        }

        // Flatten tasks to calculate global range
        const allTasks = projects.flatMap(p => p.tasks);
        if (allTasks.length === 0) {
            this.container.innerHTML = `<div class="empty-state"><p>No tasks across any projects.</p></div>`;
            return;
        }

        const { start, end, days } = getTimelineRange(allTasks);

        const grid = document.createElement('div');
        grid.className = 'gantt-grid';
        grid.style.gridTemplateColumns = `200px repeat(${days}, minmax(40px, 1fr))`;

        // Header
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'gantt-header-cell';
        emptyHeader.textContent = 'Project / Task';
        emptyHeader.style.position = 'sticky';
        emptyHeader.style.left = '0';
        emptyHeader.style.zIndex = '10';
        grid.appendChild(emptyHeader);

        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const cell = document.createElement('div');
            cell.className = 'gantt-header-cell';
            cell.textContent = formatDate(d);
            grid.appendChild(cell);
        }

        let currentRow = 2;

        projects.forEach(project => {
            // Project Section Header
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
                let colStart = offsetDays + 2;

                // Safety check: ensure bar doesn't overlap name column
                if (colStart < 2) colStart = 2;

                const bar = document.createElement('div');
                bar.className = 'gantt-bar';
                bar.style.gridColumn = `${colStart} / span ${task.duration}`;
                bar.style.gridRow = currentRow;
                bar.innerHTML = `<span class="gantt-bar-label">${task.name}</span>`;
                bar.onclick = () => this.modal.open(project.id, task);

                grid.appendChild(bar);
                currentRow++;
            });
        });

        this.container.innerHTML = '';
        this.container.appendChild(grid);
    }
}
