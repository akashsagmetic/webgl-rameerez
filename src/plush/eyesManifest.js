export const EYES_MANIFEST = {
  sheet: "eyes.webp", // or eyes.jpg depending on your file name
  grid: [3, 6],
  eyes: [
    // Left eye [u, v, w, h] - shifted slightly down and made narrower/tighter
    [0.370, 0.360, 0.095, 0.055],
    // Right eye [u, v, w, h] - shifted slightly down and made narrower/tighter
    [0.535, 0.360, 0.095, 0.055],
  ],
  centres: [
    [0.417, 0.388],
    [0.583, 0.388],
  ],
  cells: [
    "rest", "look-e", "look-ese",
    "look-se", "look-sse", "look-s",
    "look-ssw", "look-sw", "look-wsw",
    "look-w", "look-wnw", "look-nw",
    "look-nnw", "look-n", "look-nne",
    "look-ne", "closed", "half",
  ],
  looks: {
    "look-e":   [1.0, 0.0],
    "look-ese": [0.924, 0.383],
    "look-se":  [0.707, 0.707],
    "look-sse": [0.383, 0.924],
    "look-s":   [0.0, 1.0],
    "look-ssw": [-0.383, 0.924],
    "look-sw":  [-0.707, 0.707],
    "look-wsw": [-0.924, 0.383],
    "look-w":   [-1.0, 0.0],
    "look-wnw": [-0.924, -0.383],
    "look-nw":  [-0.707, -0.707],
    "look-nnw": [-0.383, -0.924],
    "look-n":   [0.0, -1.0],
    "look-nne": [0.383, -0.924],
    "look-ne":  [0.707, -0.707],
  },
  blink: { shut: "closed", half: "half" },
};