# Orion Project Manager

A premium, web-based project management tool featuring a Gantt chart timeline, multi-project support, and plan revision history. Built with Vanilla JavaScript and CSS for maximum performance and no-build simplicity.

## Features

-   **Project Management**: Create and organize multiple projects.
-   **Gantt Chart Timeline**: Visual timeline view using CSS Grid.
-   **Task Management**: Add, edit, and delete tasks with start dates and durations.
-   **Multi-Project View**: Aggregate view to see timelines across all projects simultaneously.
-   **Revision History**: Save snapshots of your project state to restore later (currently supports saving snapshots).
-   **Local Persistence**: All data is saved automatically to your browser's `localStorage`.

## How to Run

This is a **No-Build** application. You do not need Node.js or any package manager.

1.  Clone the repository:
    ```bash
    git clone https://github.com/Saran440/project_timeline.git
    ```
2.  Navigate to the folder.
3.  Open `index.html` in your web browser (Chrome, Edge, Firefox, etc.).

That's it!

## Usage Guide

### Creating a Project
1.  Click the **+ New Project** button in the sidebar.
2.  Enter a name for your project.

### Adding Tasks
1.  Select a project from the sidebar.
2.  Click the **+ Add Task** button (or the button at the bottom of the timeline).
3.  Enter the task name, start date, and duration in days.
4.  The task will appear as a bar on the Gantt chart.

### Managing Revisions
1.  Click the **Revisions** button in the top header.
2.  Confirm to save a snapshot of the current project state.

### Viewing All Projects
1.  Click the **All Projects** button in the header.
2.  This view shows a combined timeline of all your active projects.

## Tech Stack

-   **Core**: HTML5, Vanilla JavaScript (ES Modules)
-   **Styling**: Vanilla CSS (Variables, Flexbox, Grid, Glassmorphism)
-   **Icons**: Lucide (via CDN)
-   **State**: Custom Pub/Sub Store
