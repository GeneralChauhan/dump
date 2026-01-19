create me  a drawing app with mediapipe capabilities.

## Setup
Only one full-screen needed, where the users could draw with their finger. Make it full-width and height, and white background

Overlay the camera feed with really low opaque.
There should be floating toolbar at the top of the screen with 5 button.

The first button should open a modal, which can be closable with an x or by clicking away That model should allow users to choose a color. Use a library like react-color. The icon for that button is jsut a circle with the chosen color

The next button should open a slider, which allows the user to change the width of the pen/eraser stroke. Use the line-squiggle icon from lucide

The next two button is actually a toggle, which would allow to choose between the pen or an eraser. On toggled, the button should have a slight gray background, otherwise white

The last button should reset the whole canvas to empty

When the stroke or color chooser panel is open, we should be able to close them by clicking away

## Gestures:
The pen/eraser should be at the top of the pointing finger of the user.

When the user pinches, we draw/erase onto the canvas.

When we don't draw, but the cursor follows the pointing finger, make the cursor a bit opaque.

When we pinch, make it full color.

Flip the x axis of the camera feed, so it's properly mirrored

Make sure the cursor and the finger is properly mapped, even when the container/screen is smaller than the full width of the camera feed. Meaning, it should work when we resize too.

The cursor should have the same color as the chosen color. Add a bit of shadow it to when we don't draw, so we see it even when we draw to a place with the same color

Ideally, the gestures should work on the toolbar too!