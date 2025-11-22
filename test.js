// Test Script for Orion Project Manager
// Run this in the browser console to verify features

console.log("Starting Orion Test Script...");

// 1. Clear existing data (Optional, but good for clean test)
// localStorage.clear();
// location.reload(); 
// (Commented out to avoid data loss, but recommended for fresh test)

import { store } from './src/js/store.js';

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    // 2. Create a Project
    console.log("Creating Project 'Test Project'...");
    store.addProject("Test Project");
    const project = store.state.projects.find(p => p.name === "Test Project");
    const pid = project.id;
    store.setActiveProject(pid);
    console.log("Active Project set to:", pid);

    // 3. Add Tasks
    console.log("Adding Tasks...");
    store.addTask(pid, { name: "Task A", start: new Date().toISOString().split('T')[0], duration: 3 });
    store.addTask(pid, { name: "Task B", start: new Date().toISOString().split('T')[0], duration: 5 });
    store.addTask(pid, { name: "Task C", start: new Date().toISOString().split('T')[0], duration: 2 });

    // 4. Verify Reordering (Simulate)
    console.log("Reordering Task A to bottom...");
    store.reorderTask(pid, 0, 2); // Move index 0 to 2
    console.log("Tasks order:", store.state.projects.find(p => p.id === pid).tasks.map(t => t.name));

    // 5. Verify Revision (Edit Duration)
    console.log("Editing Task B duration to create revision...");
    const taskB = store.state.projects.find(p => p.id === pid).tasks.find(t => t.name === "Task B");
    store.updateTask(pid, taskB.id, { ...taskB, duration: 8 });
    console.log("Task B History:", store.state.projects.find(p => p.id === pid).tasks.find(t => t.name === "Task B").history);

    // 6. Add Milestone
    console.log("Adding Milestone...");
    store.addTask(pid, { name: "Milestone X", start: new Date().toISOString().split('T')[0], duration: 0, type: 'milestone' });

    console.log("Test Complete. Please check the UI.");
}

// Expose runTest to window so user can call it
window.runTest = runTest;

console.log("Test script loaded. Type 'runTest()' to execute.");
