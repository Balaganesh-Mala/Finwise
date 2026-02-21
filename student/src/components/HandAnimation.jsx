import React, { useMemo } from 'react';

// ─── Finger → Keys Mapping ────────────────────────────────────────────────────
const FINGER_KEYS = {
    left: {
        pinky: ['a', 'q', 'z', '1', '`'],
        ring: ['s', 'w', 'x', '2'],
        middle: ['d', 'e', 'c', '3'],
        index: ['f', 'r', 't', 'g', 'v', 'b', '4', '5'],
        thumb: [' '],
    },
    right: {
        thumb: [' '],
        index: ['j', 'h', 'u', 'y', 'n', 'm', '6', '7'],
        middle: ['k', 'i', '8'],
        ring: ['l', 'o', '9'],
        pinky: ['p', ';', '/', "'", '[', ']', '\\', '0', '-', '='],
    },
};

// Which finger to use for a given key
const getFingerForKey = (key) => {
    const k = key?.toLowerCase() || '';
    for (const [finger, keys] of Object.entries(FINGER_KEYS.left)) {
        if (keys.includes(k)) return { hand: 'left', finger };
    }
    for (const [finger, keys] of Object.entries(FINGER_KEYS.right)) {
        if (keys.includes(k)) return { hand: 'right', finger };
    }
    return null;
};

// ─── Finger colors ─────────────────────────────────────────────────────────────
const FINGER_COLORS = {
    pinky: '#A78BFA',   // purple
    ring: '#60A5FA',   // blue
    middle: '#34D399',   // green
    index: '#FBBF24',   // amber
    thumb: '#94A3B8',   // slate
};

// ─── Hand SVG (generic, reused for both hands) ────────────────────────────────
const HandSVG = ({ side, activeFinger }) => {
    // Finger paths approximated as rounded rectangles + palm
    // side: 'left' | 'right'. We mirror the right hand.
    const transform = side === 'right' ? 'scale(-1,1) translate(-120,0)' : '';

    const fingers = [
        { name: 'pinky', x: 0, y: 30, w: 18, h: 60, rx: 9 },
        { name: 'ring', x: 22, y: 10, w: 18, h: 80, rx: 9 },
        { name: 'middle', x: 44, y: 0, w: 18, h: 90, rx: 9 },
        { name: 'index', x: 66, y: 15, w: 18, h: 75, rx: 9 },
        { name: 'thumb', x: 88, y: 55, w: 16, h: 50, rx: 8, rotate: side === 'left' ? 15 : -15 },
    ];

    return (
        <svg viewBox="0 0 120 160" style={{ width: 110, height: 160 }} aria-label={`${side} hand`}>
            <g transform={transform}>
                {/* Palm */}
                <rect x={0} y={90} width={106} height={65} rx={14} fill="#F3F4F6" stroke="#E5E7EB" strokeWidth={1.5} />

                {fingers.map((f) => {
                    const isActive = activeFinger === f.name;
                    return (
                        <g key={f.name}
                            transform={f.rotate ? `rotate(${f.rotate}, ${f.x + f.w / 2}, ${f.y + f.h})` : ''}>
                            <rect
                                x={f.x}
                                y={f.y}
                                width={f.w}
                                height={f.h}
                                rx={f.rx}
                                fill={isActive ? FINGER_COLORS[f.name] : '#F3F4F6'}
                                stroke={isActive ? FINGER_COLORS[f.name] : '#D1D5DB'}
                                strokeWidth={isActive ? 2 : 1}
                                style={{
                                    transition: 'fill 0.2s, stroke 0.2s',
                                    filter: isActive ? `drop-shadow(0 0 8px ${FINGER_COLORS[f.name]})` : 'none',
                                }}
                            />
                            {isActive && (
                                <rect
                                    x={f.x}
                                    y={f.y}
                                    width={f.w}
                                    height={f.h}
                                    rx={f.rx}
                                    fill="none"
                                    stroke={FINGER_COLORS[f.name]}
                                    strokeWidth={2}
                                    opacity={0.6}
                                    style={{
                                        animation: 'fingerPulse 1s ease-in-out infinite',
                                    }}
                                />
                            )}
                        </g>
                    );
                })}
            </g>
        </svg>
    );
};

/**
 * HandAnimation — Shows left and right hand SVGs, glowing the correct finger for the next key.
 * Props:
 *   nextKey {string} — next character the student needs to type
 */
const HandAnimation = ({ nextKey = '' }) => {
    const fingerInfo = useMemo(() => getFingerForKey(nextKey), [nextKey]);

    return (
        <div className="w-full flex flex-col items-center py-2">
            <style>{`
                @keyframes fingerPulse {
                    0%, 100% { opacity: 0.9; transform: scaleX(1); }
                    50% { opacity: 0.4; transform: scaleX(1.05); }
                }
            `}</style>

            {fingerInfo && (
                <div className="mb-2 px-3 py-1 bg-indigo-50 rounded-full text-xs font-semibold text-indigo-600 border border-indigo-100">
                    Use your{' '}
                    <span style={{ color: FINGER_COLORS[fingerInfo.finger] }} className="font-bold">
                        {fingerInfo.finger}
                    </span>{' '}
                    finger ({fingerInfo.hand} hand)
                </div>
            )}

            <div className="flex items-end gap-10">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400 font-medium">Left Hand</span>
                    <HandSVG
                        side="left"
                        activeFinger={fingerInfo?.hand === 'left' ? fingerInfo.finger : null}
                    />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400 font-medium">Right Hand</span>
                    <HandSVG
                        side="right"
                        activeFinger={fingerInfo?.hand === 'right' ? fingerInfo.finger : null}
                    />
                </div>
            </div>
        </div>
    );
};

export default HandAnimation;
