import React, { useMemo, useEffect, useState } from 'react';
import { KEYBOARD_ROWS, SVG_W, SVG_H, KEY_HEIGHT } from './keyboardLayout';
import { getFingerForKey } from './fingerMap';

// ──────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Do NOT import keyboard.css here.
// CSS classes on SVG <g> elements (transform-box: fill-box) cause React 19 to
// throw "Illegal constructor" in strict mode.
// All animations below use inline style={{ animation }} instead.
// ──────────────────────────────────────────────────────────────────────────────

const BLUE = '#2c9eff';
const RED = '#ef4444';
const KEY_BG = '#ffffff';
const KEY_BD = '#d1d5db';
const KEY_TXT = '#374151';

// Keyframe definitions injected as a single <style> tag (safe, no CSS file import)
const KEYFRAME_CSS = `
@keyframes _tkPulse { 0%,100%{opacity:.82} 50%{opacity:1} }
@keyframes _tkError { 0%,100%{opacity:.85} 33%{opacity:.25} 66%{opacity:.9} }
@keyframes _tkShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
`;

// Home-row finger X centers (Caps=84px wide, then each key = 48 units, center = x+22)
// A=106, S=154, D=202, F=250, G=298, H=346, J=394, K=442, L=490, ;=538
const HR_X = (i) => 84 + i * 48 + 22;
const HOME_Y = 108; // y start of home row row in SVG

const LEFT_FINGERS = {
    pinky: { cx: HR_X(0), top: HOME_Y - 55, h: 80, r: 10 }, // A
    ring: { cx: HR_X(1), top: HOME_Y - 72, h: 97, r: 10 }, // S
    middle: { cx: HR_X(2), top: HOME_Y - 86, h: 111, r: 11 }, // D
    index: { cx: HR_X(3), top: HOME_Y - 72, h: 97, r: 10 }, // F
};
const RIGHT_FINGERS = {
    index: { cx: HR_X(6), top: HOME_Y - 72, h: 97, r: 10 }, // J
    middle: { cx: HR_X(7), top: HOME_Y - 86, h: 111, r: 11 }, // K
    ring: { cx: HR_X(8), top: HOME_Y - 72, h: 97, r: 10 }, // L
    pinky: { cx: HR_X(9), top: HOME_Y - 55, h: 80, r: 10 }, // ;
};

const LEFT_PALM = { x: HR_X(0) - 26, y: HOME_Y + KEY_HEIGHT - 4, w: HR_X(3) - HR_X(0) + 52, h: 60, r: 20 };
const RIGHT_PALM = { x: HR_X(6) - 26, y: HOME_Y + KEY_HEIGHT - 4, w: HR_X(9) - HR_X(6) + 52, h: 60, r: 20 };

const LEFT_THUMB = { cx: HR_X(3) - 30, top: HOME_Y + KEY_HEIGHT + 8, h: 36, r: 9, angle: -30 };
const RIGHT_THUMB = { cx: HR_X(6) + 30, top: HOME_Y + KEY_HEIGHT + 8, h: 36, r: 9, angle: 30 };

const FINGER_W = 21;
const BASE_OP = 0.28;

// ─── Plain function that builds an array of SVG elements for one hand ──────────
// Returns an array — safe to render inside a JSX <g> via {array}.
const buildHand = (fingers, palm, thumb, activeFinger, errorFinger) => {
    const els = [];

    // Palm
    els.push(
        <rect key="palm"
            x={palm.x} y={palm.y} width={palm.w} height={palm.h} rx={palm.r}
            fill="#f8d7b0" stroke="#e8c090" strokeWidth={1} opacity={BASE_OP}
        />
    );

    // Thumb (angled with SVG transform attribute — NOT CSS transform)
    if (thumb) {
        const active = activeFinger === 'thumb';
        const error = errorFinger === 'thumb';
        const fill = error ? RED : active ? BLUE : '#f8d7b0';
        const op = active || error ? 0.9 : BASE_OP;
        const anim = active ? '_tkPulse 1.3s ease-in-out infinite'
            : error ? '_tkError 0.35s ease-out'
                : 'none';
        els.push(
            <g key="thumb"
                transform={`rotate(${thumb.angle}, ${thumb.cx}, ${thumb.top + thumb.h})`}>
                <rect
                    x={thumb.cx - FINGER_W / 2} y={thumb.top}
                    width={FINGER_W} height={thumb.h} rx={thumb.r}
                    fill={fill}
                    stroke={active || error ? fill : '#e8c090'}
                    strokeWidth={active || error ? 1.5 : 0.5}
                    opacity={op}
                    style={{ animation: anim, transition: 'fill 0.2s, opacity 0.2s' }}
                />
            </g>
        );
    }

    // 4 main fingers — inline style animation, no CSS class
    Object.entries(fingers).forEach(([name, f]) => {
        if (!f) return;
        const active = activeFinger === name;
        const error = errorFinger === name;
        const fill = error ? RED : active ? BLUE : '#f8d7b0';
        const op = active || error ? 0.88 : BASE_OP;
        const stroke = active || error ? fill : '#e8c090';
        const anim = active ? '_tkPulse 1.3s ease-in-out infinite'
            : error ? '_tkError 0.35s ease-out'
                : 'none';

        els.push(
            <g key={name}>
                {/* Finger body */}
                <rect
                    x={f.cx - FINGER_W / 2} y={f.top}
                    width={FINGER_W} height={f.h + 15} rx={f.r}
                    fill={fill} stroke={stroke}
                    strokeWidth={active || error ? 1.5 : 0.5}
                    opacity={op}
                    style={{ animation: anim, transition: 'fill 0.2s, opacity 0.2s' }}
                />
                {/* Fingertip highlight sheen */}
                <rect
                    x={f.cx - FINGER_W / 2 + 5} y={f.top + 2}
                    width={FINGER_W - 10} height={12} rx={6}
                    fill="rgba(255,255,255,0.35)" opacity={op}
                    style={{ pointerEvents: 'none' }}
                />
            </g>
        );
    });

    return els;
};

// ─── Main Component ─────────────────────────────────────────────────────────────
/**
 * TypingKeyboard
 * Props:
 *   nextKey   {string} — next character the student must press (blue key + finger)
 *   errorKey  {string} — key pressed incorrectly (red flash, auto-clears after 350ms)
 *   showHands {bool}   — whether to show the semi-transparent hand overlay
 */
const TypingKeyboard = ({ nextKey = '', errorKey = '', showHands = true }) => {
    const [flashErrorKey, setFlashErrorKey] = useState('');

    useEffect(() => {
        if (errorKey) {
            setFlashErrorKey(errorKey);
            const t = setTimeout(() => setFlashErrorKey(''), 350);
            return () => clearTimeout(t);
        }
    }, [errorKey]);

    const nk = nextKey?.toLowerCase() || '';
    const ek = flashErrorKey?.toLowerCase() || '';

    const fingerInfo = useMemo(() => getFingerForKey(nk), [nk]);
    const errFingerInfo = useMemo(() => getFingerForKey(ek), [ek]);

    // ── Keyboard keys ────────────────────────────────────────────────────────
    const keyElements = KEYBOARD_ROWS.flat().map((k) => {
        const kLow = k.key.toLowerCase();
        const isNext = kLow === nk || (nk === ' ' && k.key === ' ');
        const isError = kLow === ek || (ek === ' ' && k.key === ' ');

        const fill = isError ? '#fee2e2' : isNext ? '#dbeafe' : KEY_BG;
        const stroke = isError ? RED : isNext ? BLUE : KEY_BD;
        const strokeW = isNext || isError ? 2 : 1;
        const textFill = isError ? RED : isNext ? '#1d4ed8' : KEY_TXT;
        const glow = isNext
            ? `drop-shadow(0 0 7px ${BLUE}99)`
            : isError
                ? `drop-shadow(0 0 7px ${RED}99)`
                : 'none';
        // Key shake on error — inline style, no CSS class
        const shakeAnim = isError ? '_tkShake 0.25s ease-in-out' : 'none';

        const lab = String(k.label);
        const fs = lab.length > 4 ? 9 : lab.length > 2 ? 10 : 12;

        return (
            <g key={k.key} style={{ filter: glow, animation: shakeAnim }}>
                <rect
                    x={k.x} y={k.y} width={k.w} height={k.h} rx={6} ry={6}
                    fill={fill} stroke={stroke} strokeWidth={strokeW}
                    style={{ transition: 'fill 0.15s, stroke 0.15s' }}
                />
                <text
                    x={k.cx} y={k.cy + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={fs}
                    fontFamily="ui-monospace, 'Courier New', monospace"
                    fontWeight={isNext ? 700 : 500}
                    fill={textFill}
                    style={{ userSelect: 'none', transition: 'fill 0.15s', pointerEvents: 'none' }}
                >
                    {lab}
                </text>
            </g>
        );
    });

    // ── Hand overlay ─────────────────────────────────────────────────────────
    const leftActFing = fingerInfo?.hand === 'left' ? fingerInfo.finger : null;
    const rightActFing = fingerInfo?.hand === 'right' ? fingerInfo.finger : null;
    const leftErrFing = errFingerInfo?.hand === 'left' ? errFingerInfo.finger : null;
    const rightErrFing = errFingerInfo?.hand === 'right' ? errFingerInfo.finger : null;

    const leftHand = showHands ? buildHand(LEFT_FINGERS, LEFT_PALM, LEFT_THUMB, leftActFing, leftErrFing) : null;
    const rightHand = showHands ? buildHand(RIGHT_FINGERS, RIGHT_PALM, RIGHT_THUMB, rightActFing, rightErrFing) : null;

    return (
        <div className="w-full flex flex-col items-center select-none">
            {/* Single injected <style> for keyframe definitions — safe alternative to CSS file */}
            <style>{KEYFRAME_CSS}</style>

            {/* Finger label badge */}
            {showHands && fingerInfo && (
                <div
                    className="mb-2 px-3 py-1 rounded-full text-xs font-bold border"
                    style={{ background: '#eff6ff', color: BLUE, borderColor: '#bfdbfe' }}
                >
                    {fingerInfo.hand === 'left' ? '🖐 Left' : '🤚 Right'}{' '}
                    <span style={{ textTransform: 'capitalize' }}>{fingerInfo.finger}</span> finger
                    {nk === ' ' ? ' — Space bar' : ` — "${nextKey.toUpperCase()}"`}
                </div>
            )}

            {/* Single SVG: keyboard + hands share same coordinate space */}
            <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                style={{ width: '100%', maxWidth: 730, height: 'auto', display: 'block' }}
                aria-label="Interactive typing keyboard"
            >
                {/* Background */}
                <rect x={0} y={0} width={SVG_W} height={SVG_H} rx={12} fill="#f3f4f6" />

                {/* Keys */}
                <g>{keyElements}</g>

                {/* Hands overlay (semi-transparent, above keys) */}
                {showHands && (
                    <g>
                        {leftHand}
                        {rightHand}
                    </g>
                )}
            </svg>

            {/* Legend */}
            {showHands && (
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#f8d7b0', opacity: 0.6, border: '1px solid #e8c090' }} />
                        Resting finger
                    </span>
                    <span className="flex items-center gap-1">
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: BLUE }} />
                        Active finger
                    </span>
                    <span className="flex items-center gap-1">
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: RED }} />
                        Error
                    </span>
                </div>
            )}
        </div>
    );
};

export default TypingKeyboard;
