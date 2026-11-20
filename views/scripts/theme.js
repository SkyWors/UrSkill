const themeButton = document.querySelector(".theme_button");
const rootElement = document.documentElement;
const themes = ["light", "dark", "system"];
const themeIcons = ["ri-sun-line", "ri-moon-line", "ri-progress-4-line"];
const savedTheme = localStorage.getItem("theme") || "system";

rootElement.setAttribute("data-theme", savedTheme);
updateThemeButton(themes.indexOf(savedTheme));

themeButton.addEventListener("click", () => {
	const nextThemeIndex = (themes.indexOf(rootElement.getAttribute("data-theme")) + 1) % themes.length;
	const nextTheme = themes[nextThemeIndex];

	rootElement.setAttribute("data-theme", nextTheme);
	localStorage.setItem("theme", nextTheme);

	updateThemeButton(nextThemeIndex);
});

function updateThemeButton(themeIndex) {
	themeButton.children[0].className = themeIcons[themeIndex];
}
