(function () {
    const STORAGE_KEY = "attendanceTrackerApiRecords";

    function read() {
        try {
            const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(records) ? records : [];
        } catch (error) {
            return [];
        }
    }

    function recordDate(record) {
        return record.date || record.sessionDate || "";
    }

    function recordKey(record) {
        return [record.courseId, recordDate(record), record.studentId].join("|");
    }

    function merge(serverRecords = []) {
        const merged = new Map();
        [...serverRecords, ...read()].forEach((record) => {
            if (!record || !record.courseId || !record.studentId) return;
            const key = recordKey(record);
            const previous = merged.get(key);
            const previousTime = Date.parse(previous?.updatedAt || "") || 0;
            const recordTime = Date.parse(record.updatedAt || "") || 0;
            if (!previous || recordTime >= previousTime) {
                merged.set(key, {
                    ...previous,
                    ...record,
                    date: recordDate(record),
                    sessionDate: recordDate(record)
                });
            }
        });
        return [...merged.values()];
    }

    function save(records) {
        const current = new Map(read().map((record) => [recordKey(record), record]));
        (Array.isArray(records) ? records : [records]).forEach((record) => {
            if (!record || !record.courseId || !record.studentId) return;
            const date = recordDate(record);
            current.set(recordKey(record), {
                ...record,
                date,
                sessionDate: date,
                updatedAt: record.updatedAt || new Date().toISOString()
            });
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...current.values()]));
    }

    window.AttendanceStore = { merge, save };
})();
