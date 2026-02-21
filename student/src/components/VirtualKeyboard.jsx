import React, { useEffect, useState } from 'react';

// ─── QWERTY Layout Definition ─────────────────────────────────────────────────
const ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    ['Space'],
];

// Width multipliers for special keys
const KEY_WIDTH = {
    'Backspace': 2.2,
    'Tab': 1.6,
    '\\': 1.6,
    'CapsLock': 1.9,
    'Enter': 2.1,
    'Shift': 2.5,
    'Space': 8.5,
};

const DEFAULT_WIDTH = 1;
const KEY_H = 48;
const KEY_W_UNIT = 46;
const GAP = 6;

/**
 * VirtualKeyboard — SVG-based QWERTY keyboard
 * Props:
 *   nextKey    {string} — key to press next (highlighted blue)
 *   pressedKey {string} — key just pressed correctly (highlighted yellow/green)
 *   errorKey   {string} — key that was pressed incorrectly (highlighted red)
 */
const VirtualKeyboard = ({ nextKey = '', pressedKey = '', errorKey = '' }) => {
    // Track an animation flash state for press feedback
    const [flashKey, setFlashKey] = useState('');
    const [flashType, setFlashType] = useState(''); // 'correct' | 'error'

    useEffect(() => {
        if (pressedKey) {
            setFlashKey(pressedKey.toLowerCase());
            setFlashType('correct');
            const t = setTimeout(() => setFlashKey(''), 200);
            return () => clearTimeout(t);
        }
    }, [pressedKey]);

    useEffect(() => {
        if (errorKey) {
            setFlashKey(errorKey.toLowerCase());
            setFlashType('error');
            const t = setTimeout(() => setFlashKey(''), 300);
            return () => clearTimeout(t);
        }
    }, [errorKey]);

    const getKeyStyle = (key) => {
        const k = key.toLowerCase();
        const nk = (nextKey || '').toLowerCase();
        const isNext = k === nk || (nk === ' ' && k === 'space');
        const isFlash = k === flashKey;

        if (isFlash && flashType === 'error') {
            return {
                fill: '#FEE2E2',
                stroke: '#EF4444',
                strokeWidth: 2,
                filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.7))',
                transform: 'scale(0.95)',
            };
        }
        if (isFlash && flashType === 'correct') {
            return {
                fill: '#D1FAE5',
                stroke: '#10B981',
                strokeWidth: 2,
                filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.7))',
            };
        }
        if (isNext) {
            return {
                fill: '#DBEAFE',
                stroke: '#3B82F6',
                strokeWidth: 2,
                filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
            };
        }
        return {
            fill: '#F9FAFB',
            stroke: '#E5E7EB',
            strokeWidth: 1,
        };
    };

    const getTextStyle = (key) => {
        const k = key.toLowerCase();
        const nk = (nextKey || '').toLowerCase();
        const isNext = k === nk || (nk === ' ' && k === 'space');
        const isFlash = k === flashKey;

        if (isFlash && flashType === 'error') return { fill: '#DC2626', fontWeight: 'bold' };
        if (isFlash && flashType === 'correct') return { fill: '#065F46', fontWeight: 'bold' };
        if (isNext) return { fill: '#1D4ED8', fontWeight: 'bold' };
        return { fill: '#6B7280' };
    };

    const getLabel = (key) => {
        if (key === 'Space') return '⎵ Space';
        if (key === 'Backspace') return '⌫';
        if (key === 'Enter') return '↵ Enter';
        if (key === 'CapsLock') return 'Caps';
        if (key === 'Tab') return 'Tab';
        if (key === 'Shift') return '⇧';
        return key;
    };

    // Calculate total width of each row
    const calcRowWidth = (row) =>
        row.reduce((acc, k) => acc + (KEY_WIDTH[k] || DEFAULT_WIDTH) * KEY_W_UNIT + GAP, -GAP);

    const maxWidth = Math.max(...ROWS.map(calcRowWidth));

    // Render
    const rows = [];
    let rowY = 0;
    ROWS.forEach((row, ri) => {
        let x = 0;
        const rowW = calcRowWidth(row);
        const rowOffset = (maxWidth - rowW) / 2;
        x = rowOffset;

        row.forEach((key, ki) => {
            const w = (KEY_WIDTH[key] || DEFAULT_WIDTH) * KEY_W_UNIT;
            const style = getKeyStyle(key);
            const textStyle = getTextStyle(key);
            const fontSize = key.length > 3 ? 9 : key.length > 1 ? 10 : 13;

            rows.push(
                <g key={`${ri}-${ki}`} style={{ transition: 'transform 0.1s ease', transformOrigin: `${x + w / 2}px ${rowY + KEY_H / 2}px` }}>
                    <rect
                        x={x}
                        y={rowY}
                        width={w}
                        height={KEY_H}
                        rx={6}
                        ry={6}
                        style={{ transition: 'fill 0.15s, stroke 0.15s, filter 0.15s', ...style }}
                    />
                    <text
                        x={x + w / 2}
                        y={rowY + KEY_H / 2 + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={fontSize}
                        fontFamily="ui-monospace, monospace"
                        style={{ transition: 'fill 0.15s', userSelect: 'none', ...textStyle }}
                    >
                        {getLabel(key)}
                    </text>
                </g>
            );
            x += w + GAP;
        });
        rowY += KEY_H + GAP;
    });

    const totalH = rowY - GAP;

    return (
        <div className="w-full flex justify-center py-4">
            <svg
                viewBox={`0 0 ${maxWidth} ${totalH}`}
                style={{ width: '100%', maxWidth: 680, height: 'auto' }}
                aria-label="Virtual Keyboard"
            >
                {rows}
            </svg>
        </div>
    );
};

export default VirtualKeyboard;
