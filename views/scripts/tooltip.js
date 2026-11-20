// One floating tooltip for every [data-tooltip] element. Fixed-positioned on the page,
// so it is never clipped by scrollable panels (preview canvas, builder column).
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.setAttribute("role", "tooltip");
tooltip.hidden = true;

let tooltipOwner = null;

function showTooltip(element) {
	tooltipOwner = element;
	tooltip.textContent = element.dataset.tooltip;
	// Native fullscreen only paints the fullscreen element, so the tooltip must live inside it
	(document.fullscreenElement || document.body).append(tooltip);
	tooltip.hidden = false;

	const ownerRect = element.getBoundingClientRect();
	const tooltipRect = tooltip.getBoundingClientRect();
	const centeredLeft = ownerRect.left + ownerRect.width / 2 - tooltipRect.width / 2;
	const left = Math.min(Math.max(8, centeredLeft), innerWidth - tooltipRect.width - 8);
	const topAbove = ownerRect.top - tooltipRect.height - 6;

	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${topAbove >= 8 ? topAbove : ownerRect.bottom + 6}px`;
}

function hideTooltip() {
	tooltipOwner = null;
	tooltip.hidden = true;
}

// pointermove (not pointerover) so the tooltip comes back after a click without leaving the icon
document.addEventListener("pointermove", (event) => {
	const hovered = !event.buttons && event.pointerType === "mouse" && event.target.closest("[data-tooltip]");

	if (hovered && hovered !== tooltipOwner) {
		showTooltip(hovered);
	} else if (!hovered && tooltipOwner) {
		hideTooltip();
	}
});

document.addEventListener("focusin", (event) => {
	const focused = event.target.closest("[data-tooltip]");

	if (focused?.matches(":focus-visible")) {
		showTooltip(focused);
	}
});

document.addEventListener("focusout", hideTooltip);
document.addEventListener("pointerdown", hideTooltip); // don't float over a drag or a click
addEventListener("scroll", hideTooltip, { capture: true, passive: true });
