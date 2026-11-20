export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let toastHideTimer;

export function toast(message) {
	const toastElement = $("#toast");
	toastElement.textContent = message;
	// Native fullscreen only paints the fullscreen element, so the toast must live inside it
	(document.fullscreenElement || document.body).append(toastElement);
	toastElement.hidden = false;
	clearTimeout(toastHideTimer);

	toastHideTimer = setTimeout(() => {
		toastElement.hidden = true;
	}, 1800);
}
