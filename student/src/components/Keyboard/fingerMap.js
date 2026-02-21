/**
 * fingerMap.js — Maps each key to its hand + finger name.
 * Used by TypingKeyboard to highlight the correct finger when nextKey changes.
 */

export const fingerMap = {
    // Left Pinky
    '`': { hand: 'left',  finger: 'pinky' },
    '1': { hand: 'left',  finger: 'pinky' },
    'q': { hand: 'left',  finger: 'pinky' },
    'a': { hand: 'left',  finger: 'pinky' },
    'z': { hand: 'left',  finger: 'pinky' },
    tab:    { hand: 'left',  finger: 'pinky' },
    caps:   { hand: 'left',  finger: 'pinky' },
    'shift-l': { hand: 'left', finger: 'pinky' },

    // Left Ring
    '2': { hand: 'left', finger: 'ring' },
    'w': { hand: 'left', finger: 'ring' },
    's': { hand: 'left', finger: 'ring' },
    'x': { hand: 'left', finger: 'ring' },

    // Left Middle
    '3': { hand: 'left', finger: 'middle' },
    'e': { hand: 'left', finger: 'middle' },
    'd': { hand: 'left', finger: 'middle' },
    'c': { hand: 'left', finger: 'middle' },

    // Left Index
    '4': { hand: 'left', finger: 'index' },
    '5': { hand: 'left', finger: 'index' },
    'r': { hand: 'left', finger: 'index' },
    't': { hand: 'left', finger: 'index' },
    'f': { hand: 'left', finger: 'index' },
    'g': { hand: 'left', finger: 'index' },
    'v': { hand: 'left', finger: 'index' },
    'b': { hand: 'left', finger: 'index' },

    // Thumbs (Space)
    ' ': { hand: 'right', finger: 'thumb' },

    // Right Index
    '6': { hand: 'right', finger: 'index' },
    '7': { hand: 'right', finger: 'index' },
    'y': { hand: 'right', finger: 'index' },
    'u': { hand: 'right', finger: 'index' },
    'h': { hand: 'right', finger: 'index' },
    'j': { hand: 'right', finger: 'index' },
    'n': { hand: 'right', finger: 'index' },
    'm': { hand: 'right', finger: 'index' },

    // Right Middle
    '8':  { hand: 'right', finger: 'middle' },
    'i':  { hand: 'right', finger: 'middle' },
    'k':  { hand: 'right', finger: 'middle' },
    ',':  { hand: 'right', finger: 'middle' },

    // Right Ring
    '9':  { hand: 'right', finger: 'ring' },
    'o':  { hand: 'right', finger: 'ring' },
    'l':  { hand: 'right', finger: 'ring' },
    '.':  { hand: 'right', finger: 'ring' },

    // Right Pinky
    '0':  { hand: 'right', finger: 'pinky' },
    '-':  { hand: 'right', finger: 'pinky' },
    '=':  { hand: 'right', finger: 'pinky' },
    'p':  { hand: 'right', finger: 'pinky' },
    '[':  { hand: 'right', finger: 'pinky' },
    ']':  { hand: 'right', finger: 'pinky' },
    '\\': { hand: 'right', finger: 'pinky' },
    ';':  { hand: 'right', finger: 'pinky' },
    "'":  { hand: 'right', finger: 'pinky' },
    '/':  { hand: 'right', finger: 'pinky' },
    enter:    { hand: 'right', finger: 'pinky' },
    backspace: { hand: 'right', finger: 'pinky' },
    'shift-r': { hand: 'right', finger: 'pinky' },
};

/**
 * Get the {hand, finger} assignment for a given character.
 * Returns null for unrecognised keys.
 */
export const getFingerForKey = (key) => {
    if (!key) return null;
    return fingerMap[key.toLowerCase()] || null;
};
