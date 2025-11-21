export function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDaysDiff(start, end) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((new Date(end) - new Date(start)) / oneDay));
}

export function addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

export function getTimelineRange(tasks) {
    if (!tasks || tasks.length === 0) {
        // Default to this week if no tasks
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 2);
        const end = new Date(today);
        end.setDate(today.getDate() + 12);
        return { start, end, days: 14 };
    }

    let minDate = new Date(tasks[0].start);
    let maxDate = new Date(tasks[0].start);
    maxDate.setDate(maxDate.getDate() + parseInt(tasks[0].duration));

    tasks.forEach(t => {
        const s = new Date(t.start);
        const e = new Date(t.start);
        e.setDate(e.getDate() + parseInt(t.duration));
        if (s < minDate) minDate = s;
        if (e > maxDate) maxDate = e;
    });

    // Add padding
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 5);

    const days = getDaysDiff(minDate, maxDate);
    return { start: minDate, end: maxDate, days };
}
