/**
 * dripService.js
 * Calculates how many topics a student has unlocked based on:
 *  - enrollmentDate (the date they were assigned to a batch)
 *  - Weekday-only progression (Mon–Fri, skip Sat/Sun)
 *  - Skip admin-marked holidays
 *
 * Returns: number of unlocked topics (1-indexed)
 * Topic with unlockOrder <= unlockedCount is accessible to the student
 */

/**
 * Count working days elapsed since enrollmentDate up to today (inclusive of enrollment day = Day 1)
 * @param {Date} enrollmentDate
 * @param {Date[]} holidays - Array of holiday Date objects (dates to skip)
 * @returns {number} number of working days elapsed (minimum 1 on enrollment day)
 */
function countWorkingDays(enrollmentDate, holidays = []) {
    const start = new Date(enrollmentDate);
    // Normalize to midnight UTC so date comparisons work cleanly
    start.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (today < start) return 0; // Enrollment is in the future

    // Build a Set of holiday date strings for O(1) lookup
    const holidaySet = new Set(
        holidays.map(h => {
            const d = new Date(h);
            d.setUTCHours(0, 0, 0, 0);
            return d.toISOString().split('T')[0];
        })
    );

    let workingDays = 0;
    const cursor = new Date(start);

    while (cursor <= today) {
        const dayOfWeek = cursor.getUTCDay(); // 0=Sun, 6=Sat
        const dateStr = cursor.toISOString().split('T')[0];

        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(dateStr)) {
            workingDays++;
        }

        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return workingDays;
}

module.exports = { countWorkingDays };
