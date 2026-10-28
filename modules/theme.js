export function initializeTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme") || "light";

    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeButton(themeToggle, savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeButton(themeToggle, newTheme);
    });
}

function updateThemeButton(themeToggle, theme) {
    themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}
