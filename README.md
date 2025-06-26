# Boat Shooting Prototype

This repository contains a lightweight prototype for a browser-based shooting game built with [PlayCanvas](https://playcanvas.com/). It originally included a PHP backend for ranking, but scores are now kept only on the client.

## Features

- **Opening Movie** -> **Gameplay** -> **Ending Movie** -> **SNS Sharing**
- Minimal PlayCanvas setup using the FPS Starter Kit (assets should be added to `public`)
- Designed for mobile browsers with on-screen joystick and touch look controls

## Setup

1. Place the contents of the `public` directory in your web server's document root.
   Because scores are stored only in the browser, no PHP or database setup is required.

## Running

Open `public/index.html` in your browser. The page displays an opening screen. Tapping **Start Game** launches the PlayCanvas app. After the game ends, a score is shown on the ending screen and can be shared on Twitter. On touch devices, a joystick is shown for movement and dragging the right side rotates the camera. A quick tap on the right fires a shot.

## Notes

- Actual PlayCanvas assets (FPS Starter Kit) should be imported into the project on [playcanvas.com](https://playcanvas.com/) and linked in `public/game.js`.
- The included JavaScript and PHP are simplified for demonstration and do not represent a complete production-ready game.
