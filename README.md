# Boat Shooting Prototype

This repository contains a lightweight prototype for a browser-based shooting game built with [PlayCanvas](https://playcanvas.com/) and a PHP backend for score ranking.

## Features

- **Opening Movie** -> **Gameplay** -> **Ranking** -> **Ending Movie** -> **SNS Sharing**
- Minimal PlayCanvas setup using the FPS Starter Kit (assets should be added to `public`)
- Simple ranking API using PHP and MySQL for LAMP environments
- Designed for mobile browsers

## Setup

1. Install Apache, PHP, and MySQL.
2. Create a MySQL database and user:

```sql
CREATE DATABASE boatshooting;
CREATE USER 'boatuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON boatshooting.* TO 'boatuser'@'localhost';
```

3. Create the `scores` table:

```sql
USE boatshooting;
CREATE TABLE scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  score INT NOT NULL,
  created_at DATETIME NOT NULL
);
```

4. Place the contents of the `public` directory in your web server's document root.
   To try the full ranking flow locally you need a PHP server. A simple option is
   to run `php -S localhost:8000` from the repository root and access
   `http://localhost:8000/public/`. Running `python -m http.server` only serves
   static files and will not execute the PHP scripts used for score submission.
5. Update credentials in `server/config.php` if necessary.

## Running

Open `public/index.html` in your browser. The page displays an opening screen. Tapping **Start Game** launches the PlayCanvas app. After the game ends, scores are exchanged with the PHP backend via AJAX, and a ranking list is displayed. The ending screen provides options to restart and share the game on Twitter.

## Notes

- Actual PlayCanvas assets (FPS Starter Kit) should be imported into the project on [playcanvas.com](https://playcanvas.com/) and linked in `public/game.js`.
- The included JavaScript and PHP are simplified for demonstration and do not represent a complete production-ready game.
