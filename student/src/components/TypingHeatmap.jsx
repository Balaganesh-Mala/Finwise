import React, { useState } from 'react';

// QWERTY layout for the heatmap (same structure as VirtualKeyboard but display-only)
const ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    ['Space'],
];

// Interpolate green (0 errors) → yellow → red (many errors)
const errorToColor = (count, maxCount) => {
    if (!count || count === 0) return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' }; // green
    const ratio = Math.min(count / Math.max(maxCount, 1), 1);
    if (ratio < 0.4) return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' }; // yellow
    if (ratio < 0.75) return { bg: '#FED7AA', text: '#9A3412', border: '#FB923C' }; // orange
    return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }; // red
};

/**
 * TypingHeatmap — A color-coded keyboard showing per-key error frequency.
 * Props:
 *   errorMap {Object} — { a: 3, s: 1, k: 12, ... }
 */
const TypingHeatmap = ({ errorMap = {} }) => {
    const [tooltip, setTooltip] = useState(null);

    const maxErrors = Math.max(...Object.values(errorMap), 1);
    const totalErrors = Object.values(errorMap).reduce((a, b) => a + b, 0);
    const topErrors = Object.entries(errorMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-700">Error Heatmap</h4>
                <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-400">{totalErrors} total errors</span>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-200 border border-green-300" />
                        <span className="text-gray-400">Good</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300" />
                        <span className="text-gray-400">Fair</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-200 border border-red-300" />
                        <span className="text-gray-400">Weak</span>
                    </div>
                </div>
            </div>

            {/* Keyboard rows */}
            <div className="space-y-1.5 relative">
                {ROWS.map((row, ri) => (
                    <div key={ri} className="flex justify-center gap-1.5">
                        {row.map((key) => {
                            const k = key.toLowerCase();
                            const count = errorMap[k] || 0;
                            const colors = errorToColor(count, maxErrors);
                            const isSpace = key === 'Space';

                            return (
                                <div
                                    key={key}
                                    className="relative"
                                    onMouseEnter={() => setTooltip({ key, count })}
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-md font-mono font-semibold select-none cursor-default transition-all duration-200"
                                        style={{
                                            width: isSpace ? 180 : 36,
                                            height: 36,
                                            background: colors.bg,
                                            color: colors.text,
                                            border: `1.5px solid ${colors.border}`,
                                            fontSize: isSpace ? 11 : 13,
                                        }}
                                    >
                                        {isSpace ? '⎵ SPACE' : key.toUpperCase()}
                                    </div>

                                    {/* Tooltip */}
                                    {tooltip?.key === key && (
                                        <div
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none"
                                            style={{ fontSize: 11 }}
                                        >
                                            {count === 0
                                                ? `"${key}" — No errors 🎉`
                                                : `"${key}" — Mistyped ${count} time${count !== 1 ? 's' : ''}`}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Top Weak Keys */}
            {topErrors.length > 0 && topErrors[0][1] > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-700 mb-2">Most Missed Keys</p>
                    <div className="flex flex-wrap gap-2">
                        {topErrors.map(([key, count]) => count > 0 && (
                            <span key={key} className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-md border border-red-200 text-xs font-mono font-bold text-red-600">
                                {key.toUpperCase()}
                                <span className="text-red-400 font-normal">×{count}</span>
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-red-400 mt-2">Practice these keys more to improve your accuracy.</p>
                </div>
            )}
        </div>
    );
};

export default TypingHeatmap;
