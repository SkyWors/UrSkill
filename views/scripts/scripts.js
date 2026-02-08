const windowWitdh = document.body.clientWidth;
const darkModeMql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

let icons = [];
let maxPerRow = windowWitdh >= 600 ? 10 : 5;
let rowBackgroundColor = "#252525";

if (darkModeMql && !darkModeMql.matches) {
	rowBackgroundColor = "#decfcf";
}

let latestClosest;

const rowInput = document.getElementById("row_number");
const bgColorInput = document.getElementById("bg_color");
const resultTextarea = document.getElementById("result_url");
const searchInput = document.getElementById("search_input");
const cleanSearchButton = document.getElementById("clear_search");
const resetButton = document.getElementById("reset");

window.addEventListener("load", () => {
	window.scrollTo(0, 0);
});

resetButton.addEventListener("click", () => {
	if (!confirm("Are you sure you want to reset your settings?")) {
		return;
	}

	localStorage.removeItem("profile");

	icons = [];
	maxPerRow = windowWitdh >= 600 ? 10 : 5;
	rowBackgroundColor = "#252525";
	if (darkModeMql && !darkModeMql.matches) {
		rowBackgroundColor = "#decfcf";
	}

	rowInput.value = maxPerRow;
	bgColorInput.value = rowBackgroundColor;

	const iconItems = document.querySelectorAll(".icon_item");
	iconItems.forEach((item) => {
		item.classList.remove("selected");
		item.style.backgroundColor = rowBackgroundColor;
	});

	generateImage();
});

if (localStorage.getItem("profile")) {
	const savedProfile = localStorage.getItem("profile");
	savedIcons = JSON.parse(savedProfile).icons;
	if (savedIcons && Array.isArray(savedIcons)) {
		icons = savedIcons;
	}

	const iconItems = document.querySelectorAll(".icon_item");
	iconItems.forEach((item) => {
		const iconName = item.dataset.icon;
		if (icons.includes(iconName)) {
			item.classList.add("selected");
		}
	});

	maxPerRow = JSON.parse(savedProfile).max_per_row || maxPerRow;
	rowBackgroundColor = JSON.parse(savedProfile).background_color || rowBackgroundColor;
}

const aliases = JSON.parse(document.querySelector("div[data-aliases]").dataset.aliases);

generateImage();

searchInput.addEventListener("input", (event) => {
	const filter = event.target.value.toLowerCase();
	const iconItems = document.querySelectorAll(".icon_item");
	let empty = true;

	iconItems.forEach((item) => {
		const iconName = item.dataset.icon.toLowerCase();
		if (
			iconName.includes(filter)
			|| (
				aliases[iconName]
				&& aliases[iconName].some(alias => alias.includes(filter))
			)
		) {
			item.style.display = "";
			empty = false;
		} else {
			item.style.display = "none";
		}
	});

	if (empty) {
		document.querySelector(".empty_list").style.display = "block";
	} else {
		document.querySelector(".empty_list").style.display = "none";
	}
});

resultTextarea.addEventListener("change", () => {
	const url = new URL(resultTextarea.value.replace('<img src="', "").replace('" />', "").replace(' ', ""));
	const iconsParam = url.searchParams.get("icons");
	const maxPerRowParam = url.searchParams.get("max_per_row");
	const backgroundColorParam = url.searchParams.get("background_color");

	icons = iconsParam ? iconsParam.split(",") : [];
	maxPerRow = maxPerRowParam ? Number.parseInt(maxPerRowParam) : 10;
	rowBackgroundColor = backgroundColorParam ? `#${backgroundColorParam}` : ((darkModeMql && !darkModeMql.matches) ? "#252525" : "#decfcf");

	rowInput.value = maxPerRow;
	bgColorInput.value = rowBackgroundColor;

	const iconItems = document.querySelectorAll(".icon_item");
	iconItems.forEach((item) => {
		const iconName = item.dataset.icon;
		if (icons.includes(iconName)) {
			item.classList.add("selected");
		} else {
			item.classList.remove("selected");
		}
		item.style.backgroundColor = rowBackgroundColor;
	});

	generateImage();
});

cleanSearchButton.addEventListener("click", () => {
	searchInput.value = "";
	const event = new Event("input");
	searchInput.dispatchEvent(event);
	searchInput.focus();
});

const iconItems = document.querySelectorAll(".icon_item");
iconItems.forEach((item) => {
	item.style.backgroundColor = rowBackgroundColor;
	item.addEventListener("click", () => {
		const iconName = item.dataset.icon;
		const index = icons.indexOf(iconName);
		if (index === -1) {
			icons[icons.length] = iconName;
			item.classList.add("selected");
		} else {
			icons[index] = null;

			item.classList.remove("selected");
		}
		generateImage();
	});
	item.addEventListener("mouseover", () => {
		const iconName = item.dataset.icon;
		const tooltip = document.createElement("div");
		tooltip.classList = "icon_tooltip";
		tooltip.innerText = upperCaseFirstLetter(iconName);
		item.appendChild(tooltip);
	});
	item.addEventListener("mouseout", () => {
		const tooltip = item.querySelectorAll(".icon_tooltip");
		if (tooltip) {
			tooltip.forEach((tip) => {
				tip.remove();
			});
		}
	});
});

document.addEventListener("keydown", (event) => {
	if (
		event.key === " "
		&& document.hasFocus
		&& document.activeElement.classList.contains("icon_item")
	) {
		event.preventDefault();
		document.activeElement.click();
	}
});

function upperCaseFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

rowInput.value = maxPerRow;
rowInput.addEventListener("change", (event) => {
	if (!/^[0-9]*$/.test(event.target.value)) {
		return;
	}

	maxPerRow = event.target.value;
	generateImage();
});

bgColorInput.value = rowBackgroundColor;
bgColorInput.addEventListener("change", (event) => {
	rowBackgroundColor = event.target.value;
	iconItems.forEach((item) => {
		item.style.backgroundColor = rowBackgroundColor;
	});
	generateImage();
});

function generateImage() {
	while (
		(
			icons.length > 0
			&& (
				icons[icons.length - 1] === null
				|| icons[icons.length - 1] === undefined
				|| icons[icons.length - 1] === ""
			)
		)
	) {
		icons.pop();
	}

	const resultDiv = document.querySelector(".result_list");
	const iconsParam = icons.join(",");
	const url = `<img src="${window.origin}?icons=${iconsParam}&max_per_row=${encodeURIComponent(maxPerRow)}&background_color=${encodeURIComponent(rowBackgroundColor.replace("#", ""))}" />`;
	const textResult = document.getElementById("result_url");
	textResult.value = url;

	resultDiv.innerHTML = "";

	for (let i = 0; i < ((Math.ceil(icons.length / maxPerRow) || 1) + 1) * maxPerRow; i++) {
		if (i % maxPerRow === 0) {
			const breakDiv = document.createElement("div");
			breakDiv.style = "flex-basis: 100%; height: 0;";
			resultDiv.appendChild(breakDiv);
		}
		const div = document.createElement("div");
		div.classList = "result_item";
		if (icons[i]) {
			const divContainer = document.querySelector(`.icon_item[data-icon="${icons[i]}"]`);
			if (divContainer) {
				const img = divContainer.querySelector("svg").cloneNode(true);
				img.style.width = "100%";
				img.style.height = "100%";
				img.style.objectFit = "contain";

				div.draggable = true;
				div.style.cursor = "grab";
				div.appendChild(img);
			}
		}
		div.style.backgroundColor = rowBackgroundColor;
		resultDiv.appendChild(div);
	}

	localStorage.setItem("profile", JSON.stringify({
		icons: icons,
		max_per_row: maxPerRow,
		background_color: rowBackgroundColor,
	}));
}

let draggedElement = null;

function dragStart(e) {
	if (e.target.closest('.result_item') && e.target.closest('.result_item').draggable) {
		draggedElement = e.target.closest('.result_item');
		e.target.style.cursor = 'grabbing';
	}
}

function touchStart(e) {
	const touch = e.touches[0];
	const element = document.elementFromPoint(touch.clientX, touch.clientY);

	if (element && element.closest('.result_item') && element.closest('.result_item').draggable) {
		draggedElement = element.closest('.result_item');
		e.preventDefault();
	}
}

function dragEnd(e) {
	if (draggedElement) {
		draggedElement.style.cursor = 'grab';
		draggedElement.style.opacity = '1';
	}

	if (latestClosest instanceof HTMLElement) {
		latestClosest.style.backgroundColor = rowBackgroundColor;

		if (latestClosest && draggedElement && latestClosest !== draggedElement) {

			const resultList = document.querySelector('.result_list');
			Array.from(resultList.children).forEach(child => {
				if (child.tagName === 'DIV' && !child.classList.contains('result_item')) {
					child.remove();
				}
			});

			const draggedIndex = Array.from(resultList.children).indexOf(draggedElement);
			const targetIndex = Array.from(resultList.children).indexOf(latestClosest);

			const temp = icons[draggedIndex];
			icons[draggedIndex] = icons[targetIndex];
			icons[targetIndex] = temp;
		}

		generateImage();
	}

	draggedElement = null;
	latestClosest = null;
}

function dragOver(e) {
	e.preventDefault();

	if (e.target.closest('.result_item')) {
		if (latestClosest && latestClosest !== e.target.closest('.result_item')) {
			latestClosest.style.backgroundColor = rowBackgroundColor;
		}

		latestClosest = e.target.closest('.result_item');
		latestClosest.style.backgroundColor = "#555";
		latestClosest.style.borderRadius = "10px";
	}
}

function touchMove(e) {
	if (!draggedElement) return;

	e.preventDefault();

	const touch = e.touches[0];
	const element = document.elementFromPoint(touch.clientX, touch.clientY);

	if (element && element.closest('.result_item')) {
		const targetElement = element.closest('.result_item');
		if (latestClosest && latestClosest !== targetElement) {
			latestClosest.style.backgroundColor = rowBackgroundColor;
		}
		latestClosest = targetElement;
		latestClosest.style.backgroundColor = "#555";
		latestClosest.style.borderRadius = "10px";
	}
}

document.addEventListener('dragstart', dragStart);
document.addEventListener('dragend', dragEnd);
document.addEventListener('dragover', dragOver);

document.addEventListener('touchstart', touchStart, { passive: false });
document.addEventListener('touchend', dragEnd);
document.addEventListener('touchmove', touchMove, { passive: false });
