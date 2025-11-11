let icons = [];
let maxPerRow = 10;
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
	iconItems.forEach((item) => {
		const iconName = item.getAttribute("data-icon").toLowerCase();
		if (iconName.includes(filter)) {
			item.style.display = "";
		} else {
			item.style.display = "none";
		}
	});
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
			const img = document.createElement("img");
			img.src = `${window.origin}/icons/${icons[i]}.svg`;
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

document.addEventListener('dragstart', (e) => {
	if (e.target.closest('.result_item') && e.target.closest('.result_item').draggable) {
		draggedElement = e.target.closest('.result_item');
		e.target.style.cursor = 'grabbing';
	}
});

document.addEventListener('dragend', (e) => {
	if (e.target.closest('.result_item')) {
		e.target.style.cursor = 'grab';
	}
	draggedElement = null;
});

document.addEventListener('dragover', (e) => {
	if (e.target.closest('.result_item')) {
		e.preventDefault();
		if (latestClosest && latestClosest !== e.target) {
			latestClosest.style.backgroundColor = rowBackgroundColor;
		}
		latestClosest = e.target;
		e.target.style.backgroundColor = "#555";
		e.target.style.borderRadius = "10px";
	}
});

document.addEventListener('drop', (e) => {
	e.preventDefault();
	const closestSpace = e.target.closest('.result_item');

	if (closestSpace && draggedElement && closestSpace !== draggedElement) {
		const resultList = document.querySelector('.result_list');
		Array.from(resultList.children).forEach(child => {
			if (child.tagName === 'DIV' && !child.classList.contains('result_item')) {
				child.remove();
			}
		});

		const draggedIndex = Array.from(resultList.children).indexOf(draggedElement);
		const targetIndex = Array.from(resultList.children).indexOf(closestSpace);

		const temp = icons[draggedIndex];
		icons[draggedIndex] = icons[targetIndex];
		icons[targetIndex] = temp;
	}

	generateImage();
});
