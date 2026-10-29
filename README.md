# 🎬 Movie Finder

A responsive movie search app built with vanilla HTML, CSS, and JavaScript. Search for any movie, browse the newest releases, save favorites and bookmarks, and view details in a clean pop-up, in light or dark mode.

**Live demo:** [movie-app-six-black.vercel.app](https://movie-app-six-black.vercel.app)

---

## Features

- **Movie search** with live suggestions as you type
- **Clear search** button for quick resets
- **Newest Movies** section highlighting the latest releases
- **Filter by category:** All, Favorites, or Bookmarks
- **Movie cards** showing the poster, title, rating, description, and genre
- **Details dialog** with more information about a selected movie
- **Load more** button to browse additional results
- **Dark / light mode** toggle
- **Accessible markup:** ARIA roles and labels, a live status region, and keyboard-friendly controls
- **Responsive layout** for desktop and mobile

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES modules)
- Deployed on [Vercel](https://vercel.com)

## Project Structure

```
Movie-App/
├── img/            # Images and posters
├── modules/        # JavaScript modules used by script.js
├── index.html      # App markup
├── script.js       # Main application logic
└── styles.css      # Styling and themes
```

## Getting Started

### Prerequisites

A modern web browser. Because the app uses ES modules (`<script type="module">`), it needs to be served over HTTP rather than opened directly from the file system.

### Run locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/ed-29/Movie-App.git
   cd Movie-App
   ```

2. **Start a local server** (any of these works)

   ```bash
   # Option 1: Node
   npx serve

   # Option 2: VS Code
   # Install the "Live Server" extension, then right-click index.html → "Open with Live Server"
   ```

3. **Open the app** at the address your server prints (for example `http://localhost:3000`).

## Usage

1. Type a movie title in the search bar and pick a suggestion, or press **Search**.
2. Click a movie card to open its details.
3. Use the **All / Favorites / Bookmarks** tabs to filter your list.
4. Click **Load more movies** to see additional results.
5. Switch between light and dark themes with the theme toggle in the navigation bar.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## Author

**ed-29** · [GitHub](https://github.com/ed-29)
