export const TARGET_FPS = 30;
export const GRAVITY = 6.67408e-8;
export const GLOBAL_DRAG = 0.1;

// general debug switch
export const DEBUG = true;
// toggles vector validation in various functions that tend to produce
// infinite or NaN results; when enabled, vectors are checked and if invalid
// the function is rerun step by step and logged to identify trouble spots
export const VALIDATE_VECTORS = DEBUG || true;
