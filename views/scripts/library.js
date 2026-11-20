// Icon library: search, "selected only" filter, category navigation and scroll-spy.
import { $, $$ } from "./utils.js";
import { isSelected, subscribe, toggleIcon } from "./state.js";

const iconItems = $$(".icon_item");
const categorySections = $$(".category");
const sideLinks = $$(".side_link");
const searchInput = $("#search_input");
const selectedOnlyToggle = $("#selected_only");
const categoryJumpSelect = $("#jump");

export const knownIcons = new Set(iconItems.map((item) => item.dataset.icon));

iconItems.forEach((item) => item.addEventListener("click", () => toggleIcon(item.dataset.icon)));

subscribe(() => {
	iconItems.forEach((item) => item.setAttribute("aria-pressed", isSelected(item.dataset.icon)));

	if (selectedOnlyToggle.checked) {
		filterIcons();
	}
});

/* ---------- Filtering ---------- */

function matchesFilter(item, query) {
	const matchesQuery = !query || item.dataset.search.includes(query);
	const matchesSelection = !selectedOnlyToggle.checked || isSelected(item.dataset.icon);

	return matchesQuery && matchesSelection;
}

// Shows the matching icons of a section and updates its counters. Returns how many are visible.
function filterSection(section, query) {
	let visibleInSection = 0;

	section.querySelectorAll(".icon_item").forEach((item) => {
		const isMatch = matchesFilter(item, query);
		item.hidden = !isMatch;
		visibleInSection += isMatch;
	});

	const sideLink = $(`.side_link[data-cat="${section.dataset.cat}"]`);
	section.hidden = !visibleInSection;
	section.querySelector("h2 .count").textContent = visibleInSection;
	sideLink.classList.toggle("empty", !visibleInSection);
	sideLink.querySelector(".count").textContent = visibleInSection;

	return visibleInSection;
}

function libraryTitle(query) {
	if (query) {
		return `Results for “${query}”`;
	}

	return selectedOnlyToggle.checked ? "Selected icons" : "All icons";
}

function filterIcons() {
	const query = searchInput.value.trim().toLowerCase();
	const totalVisible = categorySections.reduce((total, section) => total + filterSection(section, query), 0);
	const isFiltered = query || selectedOnlyToggle.checked;

	$("#clear_search").hidden = !searchInput.value;
	$("#library_title").textContent = libraryTitle(query);
	$("#library_status").textContent = isFiltered
		? `${totalVisible} icon${totalVisible === 1 ? "" : "s"} found`
		: `${iconItems.length} icons · click to add, Enter in search adds the first match`;
	$("#empty_list").hidden = totalVisible > 0;
	$("#empty_query").textContent = query ? `“${query}”` : "your filter";
	$("#propose_link").hidden = !query;
	$("#propose_link").href = `https://github.com/SkyWors/UrSkill/issues/new?title=${encodeURIComponent(`Icon request: ${query}`)}`;
	highlightCurrentCategory();
}

// Bring the results into view without jumping above the library (the builder sits above it on mobile)
function scrollToResults() {
	const libraryTop = $(".library").getBoundingClientRect().top + scrollY - $(".navbar").offsetHeight;

	if (scrollY > libraryTop) {
		scrollTo({ top: libraryTop });
	}
}

searchInput.addEventListener("input", () => {
	filterIcons();
	scrollToResults();
});

searchInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		// Add the first match, then select the text so the next search can be typed right away
		const firstMatch = iconItems.find((item) => !item.hidden);

		if (firstMatch) {
			toggleIcon(firstMatch.dataset.icon);
		}

		searchInput.select();
	} else if (event.key === "Escape") {
		clearSearch();
	}
});

function clearSearch() {
	searchInput.value = "";
	filterIcons();
	searchInput.focus();
}

$("#clear_search").addEventListener("click", clearSearch);

selectedOnlyToggle.addEventListener("change", () => {
	filterIcons();
	scrollToResults();
});

document.addEventListener("keydown", (event) => {
	if (event.key === "/" && !event.target.matches("input, textarea, select")) {
		event.preventDefault();
		searchInput.focus();
		searchInput.select();
	}
});

// Same as the original app: ready to type on load (not on touch, it would pop the keyboard)
if (matchMedia("(pointer: fine)").matches) {
	searchInput.focus({ preventScroll: true });
}

/* ---------- Category navigation ---------- */

const stickyBarsHeight = () => $(".navbar").offsetHeight + $(".library_toolbar").offsetHeight;

// Anchor jumps must land below both sticky bars, whose height changes when the toolbar wraps
new ResizeObserver(() => document.documentElement.style.setProperty("--sticky-h", `${stickyBarsHeight()}px`))
	.observe($(".library_toolbar"));

categoryJumpSelect.addEventListener("change", () => {
	$(`#cat-${categoryJumpSelect.value}`)?.scrollIntoView();
	categoryJumpSelect.value = "";
});

// Highlight the category at the top of the viewport. Read-only: never scrolls anything itself.
let highlightScheduled = false;

function highlightCurrentCategory() {
	highlightScheduled = false;
	const activationLineY = stickyBarsHeight() + 48;
	const visibleSections = categorySections.filter((section) => !section.hidden);
	const currentSection = visibleSections.filter((section) => section.getBoundingClientRect().top <= activationLineY).at(-1)
		?? visibleSections[0];

	sideLinks.forEach((link) => link.classList.toggle("active", link.dataset.cat === currentSection?.dataset.cat));
}

addEventListener("scroll", () => {
	if (!highlightScheduled) {
		requestAnimationFrame(highlightCurrentCategory);
	}

	highlightScheduled = true;
}, { passive: true });

filterIcons();
