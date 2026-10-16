// Quote every CSV cell, including multiline descriptions. Spreadsheet formulas
// are neutralized even when preceded by whitespace or control characters.
export function appCsvCell(value) {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
}
export function appTasksCsv(tasks) {
    const fields = ['id', 'user_id', 'title', 'description', 'priority', 'status', 'stage', 'due_date', 'completed_at', 'created_at', 'updated_at'];
    return '\uFEFF' + [fields.map(appCsvCell).join(','), ...tasks.map(task => fields.map(field => appCsvCell(task[field])).join(','))].join('\r\n');
}
