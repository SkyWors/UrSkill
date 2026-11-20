// Single source of truth for the badge. Every change goes through commit(), which saves and notifies the UI.
// `icons` is a list of fixed slots: null is an empty slot, so icons never move unless the user moves them.

const defaultPerRow = () => (document.body.clientWidth >= 600 ? 10 : 5);
const defaultBg = () => (matchMedia("(prefers-color-scheme: dark)").matches ? "#252525" : "#decfcf");

export const state = {
	icons: [],
	perRow: defaultPerRow(),
	bg: defaultBg(),
	format: "html",
};

try {
	const savedProfile = JSON.parse(localStorage.getItem("profile"));

	if (Array.isArray(savedProfile?.icons)) {
		state.icons = savedProfile.icons.map((iconName) => iconName || null);
	}

	state.perRow = Number(savedProfile?.max_per_row) || state.perRow;
	state.bg = savedProfile?.background_color || state.bg;
} catch {
	// No saved profile, or storage is blocked: keep the defaults
}

const listeners = [];
export const subscribe = (listener) => listeners.push(listener);

export function commit() {
	const icons = state.icons;

	// Fill sparse holes, then drop trailing empty slots
	for (let i = 0; i < icons.length; i++) {
		icons[i] ??= null;
	}

	while (icons.length && !icons[icons.length - 1]) {
		icons.pop();
	}

	try {
		localStorage.setItem("profile", JSON.stringify({ icons, max_per_row: state.perRow, background_color: state.bg }));
	} catch {
		// Storage is blocked (private mode): the badge still works, it just isn't remembered
	}

	listeners.forEach((listener) => listener(state));
}

export const selectedCount = () => state.icons.filter(Boolean).length;
export const isSelected = (iconName) => state.icons.includes(iconName);

export function toggleIcon(iconName) {
	const index = state.icons.indexOf(iconName);

	if (index === -1) {
		state.icons.push(iconName);
	} else {
		state.icons[index] = null;
	}

	commit();
}

export function removeIconAt(index) {
	state.icons[index] = null;
	commit();
}

// Move to an empty slot, or swap with the icon already there
export function moveIcon(fromIndex, toIndex) {
	if (toIndex < 0 || fromIndex === toIndex) {
		return;
	}

	[state.icons[fromIndex], state.icons[toIndex]] = [state.icons[toIndex] ?? null, state.icons[fromIndex]];
	commit();
}

export function resetBadge() {
	try {
		localStorage.removeItem("profile");
	} catch {
		// Storage is blocked: nothing to remove
	}

	Object.assign(state, { icons: [], perRow: defaultPerRow(), bg: defaultBg() });
	commit();
}

export function setOption(key, value) {
	state[key] = value;
	commit();
}

export function badgeUrl() {
	const iconsParam = state.icons.map((iconName) => iconName ?? "").join(",");
	const params = `icons=${iconsParam}&max_per_row=${encodeURIComponent(state.perRow)}&background_color=${encodeURIComponent(state.bg.replace("#", ""))}`;

	return `${window.origin}?${params}`;
}

export function snippet() {
	const url = badgeUrl();

	if (state.format === "markdown") {
		return `![My skills](${url})`;
	}

	if (state.format === "url") {
		return url;
	}

	return `<img src="${url}" />`;
}

// Accepts a bare URL, an <img> tag or a Markdown image. Unknown icon names are dropped. Throws on garbage.
export function importBadge(pastedText, knownIcons) {
	const urlText = (pastedText.match(/https?:\/\/[^\s"')]+/) || [pastedText])[0].replaceAll("&amp;", "&");
	const params = new URL(urlText).searchParams;
	const backgroundColor = params.get("background_color");

	state.icons = (params.get("icons") || "")
		.split(",")
		.map((iconName) => iconName.trim().toLowerCase() || null)
		.map((iconName) => (knownIcons.has(iconName) ? iconName : null));
	state.perRow = Number.parseInt(params.get("max_per_row")) || 10;
	state.bg = backgroundColor ? `#${backgroundColor}` : defaultBg();
	commit();

	return selectedCount();
}
