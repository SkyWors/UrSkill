const windowWitdh = document.body.clientWidth;

let icons = [];
let maxPerRow = windowWitdh >= 600 ? 10 : 5;
let rowBackgroundColor = "#252525";

let latestClosest;

const rowInput = document.getElementById("row_number");
const bgColorInput = document.getElementById("bg_color");
const resultTextarea = document.getElementById("result_url");
const searchInput = document.getElementById("search_input");

generateImage();

searchInput.addEventListener("input", (event) => {
	const filter = event.target.value.toLowerCase();
	const iconItems = document.querySelectorAll(".icon_item");
	let empty = true;

	iconItems.forEach((item) => {
		const iconName = item.getAttribute("data-icon").toLowerCase();
		if (iconName.includes(filter)) {
			item.style.display = "";
			empty = false;
		} else {
			item.style.display = "none";
		}
	});

	if (!empty) {
		document.querySelector(".empty_list").style.display = "none";
	} else {
		document.querySelector(".empty_list").style.display = "block";
	}
});

resultTextarea.addEventListener("change", () => {
	const url = new URL(resultTextarea.value);
	const iconsParam = url.searchParams.get("icons");
	const maxPerRowParam = url.searchParams.get("max_per_row");
	const backgroundColorParam = url.searchParams.get("background_color");

	icons = iconsParam ? iconsParam.split(",") : [];
	maxPerRow = maxPerRowParam ? parseInt(maxPerRowParam) : 10;
	rowBackgroundColor = backgroundColorParam ? `#${backgroundColorParam}` : "#252525";

	rowInput.value = maxPerRow;
	bgColorInput.value = rowBackgroundColor;

	const iconItems = document.querySelectorAll(".icon_item");
	iconItems.forEach((item) => {
		const iconName = item.getAttribute("data-icon");
		if (icons.includes(iconName)) {
			item.classList.add("selected");
		} else {
			item.classList.remove("selected");
		}
		item.style.backgroundColor = rowBackgroundColor;
	});

	generateImage();
});

const iconItems = document.querySelectorAll(".icon_item");
iconItems.forEach((item) => {
	item.style.backgroundColor = rowBackgroundColor;
	item.addEventListener("click", () => {
		const iconName = item.getAttribute("data-icon");
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
});

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

	for (i=0; i<((Math.ceil(icons.length/maxPerRow) || 1) +1) * maxPerRow; i++) {
		if (i%maxPerRow === 0) {
			const breakDiv = document.createElement("div");
			breakDiv.style = "flex-basis: 100%; height: 0;";
			resultDiv.appendChild(breakDiv);
		}
		const div = document.createElement("div");
		div.classList = "result_item";
		if (icons[i]) {
			const divContainer = document.querySelector(`.icon_item[data-icon="${icons[i]}"]`);
			const img = divContainer.querySelector("svg").cloneNode(true);
			img.style.width = "100%";
			img.style.height = "100%";
			img.style.objectFit = "contain";

			div.style.boxShadow = "none";
			div.draggable = true;
			div.style.cursor = "grab";
			div.appendChild(img);
		}
		div.style.backgroundColor = rowBackgroundColor;
		resultDiv.appendChild(div);
	}

	resultTextarea.style.height = "1px";
	resultTextarea.style.height = (5 + resultTextarea.scrollHeight) + "px";
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
