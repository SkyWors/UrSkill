// Badge builder: preview grid (fixed slots), settings and embed output.
import { $, $$, toast } from "./utils.js";
import { importBadge, moveIcon, removeIconAt, resetBadge, selectedCount, setOption, snippet, state, subscribe } from "./state.js";
import { knownIcons } from "./library.js";

const preview = $("#preview");
const canvas = $("#canvas");
const perRowInput = $("#row_number");
const bgColorInput = $("#bg_color");
const snippetOutput = $("#result_url");

const GAP_RATIO = 44 / 256; // same spacing as the generated SVG (300px pitch for 256px icons)
const MAX_TILE = 48;
const MAX_TILE_FULLSCREEN = 128;

/* ---------- Preview ---------- */

// Size tiles so a whole row fits the panel, like the real badge would scale
// In fullscreen the canvas has a fixed height, so tiles also fit vertically: no scrollbar can
// appear, which would shrink the width, refit the tiles and loop (scrollbar flicker).
function fitTiles() {
	const perRow = state.perRow;
	const tileSizeFor = (availableSpace, tileCount) => availableSpace / (tileCount + (tileCount - 1) * GAP_RATIO);
	let tileSize = tileSizeFor(canvas.clientWidth - 32, perRow);

	if (isFullscreen()) {
		const rowCount = Math.ceil(state.icons.length / perRow) + 1;
		tileSize = Math.min(tileSize, tileSizeFor(canvas.clientHeight - 32, rowCount));
	}

	tileSize = Math.max(20, Math.min(isFullscreen() ? MAX_TILE_FULLSCREEN : MAX_TILE, tileSize));
	preview.style.setProperty("--tile", `${tileSize}px`);
}

new ResizeObserver(fitTiles).observe(canvas);

function createSlot(index, iconName) {
	const slot = document.createElement("div");
	slot.className = "slot";
	slot.dataset.index = index;

	if (iconName) {
		slot.classList.add("filled");
		slot.tabIndex = 0;
		slot.dataset.tooltip = iconName;
		slot.setAttribute("aria-label", `${iconName}, position ${index + 1}`);
		slot.innerHTML = `<img src="icons/${iconName}.svg" alt=""><button type="button" class="remove" tabindex="-1" aria-label="Remove ${iconName}"><i class="ri-close-line"></i></button>`;
	}

	return slot;
}

function renderPreview() {
	const { icons, perRow } = state;
	// Current rows + one spare row to drop icons into
	const slotCount = (Math.ceil(icons.length / perRow) + 1) * perRow;
	const isEmpty = !selectedCount();

	preview.style.setProperty("--per-row", perRow);
	preview.replaceChildren(...Array.from({ length: slotCount }, (_, index) => createSlot(index, icons[index])));
	preview.hidden = isEmpty;
	$("#canvas_empty").hidden = !isEmpty;
	fitTiles();
}

// Same maths as index.php, so users know the real rendered size
function badgeSizeLabel() {
	const slotCount = state.icons.length;

	if (!slotCount) {
		return "";
	}

	const perRow = state.perRow;
	const width = (Math.min(perRow, slotCount) * 300 - 44) * (10 / 44);
	const height = (Math.ceil(slotCount / perRow) * 300 - 44) * (10 / 44);

	return ` · ${Math.round(width)} × ${Math.round(height)} px`;
}

preview.addEventListener("click", (event) => {
	const removeButton = event.target.closest(".remove");

	if (removeButton) {
		removeIconAt(Number(removeButton.closest(".slot").dataset.index));
	}
});

/* Pointer drag (mouse + touch). Drop on an empty slot moves, on an icon swaps. */
let drag = null;

function isPointInside(element, x, y) {
	const rect = element.getBoundingClientRect();

	return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

preview.addEventListener("pointerdown", (event) => {
	const slot = event.target.closest(".slot.filled");

	if (!slot || event.target.closest(".remove") || event.button > 0) {
		return;
	}

	slot.setPointerCapture(event.pointerId);
	drag = { slot, fromIndex: Number(slot.dataset.index), startX: event.clientX, startY: event.clientY, targetSlot: null };
	slot.classList.add("dragging");
});

preview.addEventListener("pointermove", (event) => {
	if (!drag) {
		return;
	}

	drag.slot.style.translate = `${event.clientX - drag.startX}px ${event.clientY - drag.startY}px`;
	const hoveredSlot = $$(".slot", preview).find((slot) => slot !== drag.slot && isPointInside(slot, event.clientX, event.clientY));
	drag.targetSlot?.classList.remove("over");
	drag.targetSlot = hoveredSlot;
	hoveredSlot?.classList.add("over");
});

function endDrag() {
	if (!drag) {
		return;
	}

	const { fromIndex, targetSlot } = drag;
	drag = null;

	if (targetSlot) {
		moveIcon(fromIndex, Number(targetSlot.dataset.index));
	} else {
		renderPreview();
	}
}

preview.addEventListener("pointerup", endDrag);
preview.addEventListener("pointercancel", endDrag);

preview.addEventListener("keydown", (event) => {
	const slot = event.target.closest(".slot.filled");

	if (!slot) {
		return;
	}

	const fromIndex = Number(slot.dataset.index);
	const arrowOffsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -state.perRow, ArrowDown: state.perRow };

	if (event.key in arrowOffsets) {
		const toIndex = fromIndex + arrowOffsets[event.key];

		if (toIndex < 0) {
			return;
		}

		event.preventDefault();
		moveIcon(fromIndex, toIndex);
		$(`.slot[data-index="${toIndex}"]`, preview)?.focus();
	} else if (event.key === "Delete" || event.key === "Backspace") {
		event.preventDefault();
		removeIconAt(fromIndex);
		$(".slot.filled", preview)?.focus();
	}
});

// Fullscreen the whole builder (preview + settings + output): native API when available,
// CSS overlay otherwise (e.g. iPhone Safari)
const builder = $("#builder");
const fullscreenButton = $("#fullscreen");
const isFullscreen = () => builder.classList.contains("fullscreen");

function setFullscreen(enabled) {
	builder.classList.toggle("fullscreen", enabled);
	fullscreenButton.setAttribute("aria-pressed", enabled);
	fullscreenButton.querySelector("i").className = enabled ? "ri-fullscreen-exit-line" : "ri-fullscreen-line";
	fullscreenButton.title = enabled ? "Exit fullscreen (Esc)" : "Fullscreen";
	fitTiles();
}

fullscreenButton.addEventListener("click", () => {
	if (isFullscreen()) {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		}

		setFullscreen(false);
	} else {
		builder.requestFullscreen?.().catch(() => {});
		setFullscreen(true);
	}
});

document.addEventListener("fullscreenchange", () => {
	if (!document.fullscreenElement && isFullscreen()) {
		setFullscreen(false);
	}
});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && isFullscreen() && !document.fullscreenElement) {
		setFullscreen(false);
	}
});

$("#reset").addEventListener("click", () => {
	if (confirm("Remove all icons and reset settings?")) {
		resetBadge();
	}
});

// Page background behind the badge, to check it on light and dark READMEs
function setCanvasMode(mode) {
	canvas.dataset.canvas = mode;
	$$("[data-canvas]").forEach((button) => button.setAttribute("aria-pressed", button.dataset.canvas === mode));

	try {
		localStorage.setItem("canvas", mode);
	} catch {
		// Storage is blocked: the mode just isn't remembered
	}
}

function savedCanvasMode() {
	try {
		return localStorage.getItem("canvas");
	} catch {
		return null;
	}
}

$$("[data-canvas]").forEach((button) => button.addEventListener("click", () => setCanvasMode(button.dataset.canvas)));
setCanvasMode(savedCanvasMode() || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

/* ---------- Settings ---------- */

function setPerRow(value) {
	const perRow = Number.parseInt(value);

	if (perRow > 0) {
		setOption("perRow", perRow);
	} else {
		perRowInput.value = state.perRow;
	}
}

perRowInput.addEventListener("change", () => setPerRow(perRowInput.value));
$$("[data-step]").forEach((button) => button.addEventListener("click", () => setPerRow(state.perRow + Number(button.dataset.step))));
bgColorInput.addEventListener("input", () => setOption("bg", bgColorInput.value));

/* ---------- Output ---------- */

const FORMAT_LABELS = { html: "HTML", markdown: "Markdown", url: "URL" };

$$("[data-format]").forEach((tab) => tab.addEventListener("click", () => setOption("format", tab.dataset.format)));
snippetOutput.addEventListener("focus", () => snippetOutput.select());

async function copySnippet() {
	try {
		await navigator.clipboard.writeText(snippet());
	} catch {
		snippetOutput.select();
		document.execCommand("copy"); // fallback for non-secure contexts
	}

	toast(`${FORMAT_LABELS[state.format]} copied to clipboard`);
}

$$("#copy, [data-copy]").forEach((button) => button.addEventListener("click", copySnippet));

$("#import_form").addEventListener("submit", (event) => {
	event.preventDefault();
	const importInput = $("#import_input");

	try {
		const importedCount = importBadge(importInput.value.trim(), knownIcons);
		importInput.value = "";
		toast(`Imported ${importedCount} icon${importedCount === 1 ? "" : "s"}`);
	} catch {
		toast("That doesn't look like a badge URL");
	}
});

/* ---------- Render ---------- */

subscribe(() => {
	const iconCount = selectedCount();

	document.documentElement.style.setProperty("--icon-bg", state.bg);
	perRowInput.value = state.perRow;
	bgColorInput.value = state.bg;
	$("#bg_hex").textContent = state.bg;
	$("#badge_meta").textContent = `${iconCount} icon${iconCount === 1 ? "" : "s"}${badgeSizeLabel()}`;
	$("#mobile_count").textContent = iconCount;
	$$("[data-format]").forEach((tab) => tab.setAttribute("aria-selected", tab.dataset.format === state.format));
	snippetOutput.value = snippet();
	renderPreview();
});
