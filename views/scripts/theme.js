const themeButton = document.querySelector(".theme_button");
const html = document.documentElement;
const themeList = ["light", "dark", "system"];
const themeIcon = ["ri-sun-line", "ri-moon-line", "ri-progress-4-line"];
const currentTheme = localStorage.getItem("theme") || "system";

html.setAttribute("data-theme", currentTheme);
updateThemeButton(themeList.indexOf(currentTheme));

themeButton.addEventListener("click", () => {
	const themeIndex = (themeList.indexOf(html.getAttribute("data-theme")) + 1) % themeList.length;
	const nextTheme = themeList[themeIndex];

	html.setAttribute("data-theme", nextTheme);
	localStorage.setItem("theme", nextTheme);

	updateThemeButton(themeIndex)
});

async function updateThemeButton(themeIndex) {
	themeButton.children[0].className = themeIcon[themeIndex];
}
