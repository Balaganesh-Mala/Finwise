/**
 * keyboardLayout.js
 * Defines the QWERTY key rows and each key's SVG x/y position + width
 * based on a unit = 48 grid (key=44px wide, gap=4px).
 *
 * SVG coordinate space: viewBox "0 0 728 260"
 * Row y positions (top edge): [0, 54, 108, 162, 216]
 * KEY_H = 46, each row is 46px tall.
 */

const KEY_H  = 46;   // key height
const KEY_W  = 44;   // single key width
const UNIT   = 48;   // key + gap
const GAP    = 4;    const ROW_Y  = [0, 54, 108, 162, 216]; // y start of each row

// Helper: build a row of keys given starting x and key specs [{key, label?, w?}]
const buildRow = (rowIndex, specs) => {
    const y = ROW_Y[rowIndex];
    let x = 0;
    return specs.map((spec) => {
        const w = spec.w ? spec.w * UNIT - GAP : KEY_W;
        const entry = {
            key:   spec.key,
            label: spec.label || spec.key,
            x,
            y,
            w,
            h:     KEY_H,
            cx:    x + w / 2,   // horizontal center (for hand alignment)
            cy:    y + KEY_H / 2,
        };
        x += (spec.w ? spec.w * UNIT : UNIT);
        return entry;
    });
};

// ── Row definitions ────────────────────────────────────────────────────────────
export const KEYBOARD_ROWS = [
    buildRow(0, [
        { key: '`',         label: '`',         w: 1    },
        { key: '1',         label: '1'                  },
        { key: '2',         label: '2'                  },
        { key: '3',         label: '3'                  },
        { key: '4',         label: '4'                  },
        { key: '5',         label: '5'                  },
        { key: '6',         label: '6'                  },
        { key: '7',         label: '7'                  },
        { key: '8',         label: '8'                  },
        { key: '9',         label: '9'                  },
        { key: '0',         label: '0'                  },
        { key: '-',         label: '-'                  },
        { key: '=',         label: '='                  },
        { key: 'backspace', label: '⌫ Bksp',    w: 2    },
    ]),
    buildRow(1, [
        { key: 'tab',  label: 'Tab',    w: 1.5  },
        { key: 'q',    label: 'Q'               },
        { key: 'w',    label: 'W'               },
        { key: 'e',    label: 'E'               },
        { key: 'r',    label: 'R'               },
        { key: 't',    label: 'T'               },
        { key: 'y',    label: 'Y'               },
        { key: 'u',    label: 'U'               },
        { key: 'i',    label: 'I'               },
        { key: 'o',    label: 'O'               },
        { key: 'p',    label: 'P'               },
        { key: '[',    label: '['               },
        { key: ']',    label: ']'               },
        { key: '\\',   label: '\\',    w: 1.5  },
    ]),
    buildRow(2, [   // HOME ROW
        { key: 'caps',  label: 'Caps',   w: 1.75 },
        { key: 'a',     label: 'A'               },
        { key: 's',     label: 'S'               },
        { key: 'd',     label: 'D'               },
        { key: 'f',     label: 'F'               },
        { key: 'g',     label: 'G'               },
        { key: 'h',     label: 'H'               },
        { key: 'j',     label: 'J'               },
        { key: 'k',     label: 'K'               },
        { key: 'l',     label: 'L'               },
        { key: ';',     label: ';'               },
        { key: "'",     label: "'"               },
        { key: 'enter', label: '↵ Enter', w: 2.25 },
    ]),
    buildRow(3, [
        { key: 'shift-l', label: '⇧',   w: 2.25 },
        { key: 'z',       label: 'Z'             },
        { key: 'x',       label: 'X'             },
        { key: 'c',       label: 'C'             },
        { key: 'v',       label: 'V'             },
        { key: 'b',       label: 'B'             },
        { key: 'n',       label: 'N'             },
        { key: 'm',       label: 'M'             },
        { key: ',',       label: ','             },
        { key: '.',       label: '.'             },
        { key: '/',       label: '/'             },
        { key: 'shift-r', label: '⇧',   w: 2.75 },
    ]),
    buildRow(4, [
        { key: 'ctrl',  label: 'Ctrl',  w: 1.25 },
        { key: 'alt',   label: 'Alt',   w: 1.25 },
        { key: ' ',     label: '',      w: 6.5  },
        { key: 'alt-r', label: 'Alt',   w: 1.25 },
        { key: 'ctrl-r',label: 'Ctrl',  w: 1.25 },
    ]),
];

// Flat lookup: key → { x, y, w, h, cx, cy }
export const KEY_POSITIONS = {};
KEYBOARD_ROWS.flat().forEach(k => { KEY_POSITIONS[k.key] = k; });

// Total SVG dimensions
export const SVG_W = 728;
export const SVG_H = 262;   // 5 rows × (46 + 8 gap) = 270 → trim a little
export const KEY_HEIGHT = KEY_H;
