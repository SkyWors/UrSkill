<?php
	define(constant_name: "APP_NAME", value: "UrSkill");

	if (empty($_GET)) {
		include __DIR__ . "/views/index.php";
		exit;
	}

	$icons = explode(separator: ",", string: $_GET["icons"] ?? "") ?? [];
	$maxPerRow = $_GET["max_per_row"] ?? 10;

	if ($maxPerRow <= 0) {
		$maxPerRow = 1;
	}

	$backgroundColor = "#" . ($_GET["background_color"] ?? "252525");

	$displaySize = 10; // Icons are 256px x 256px, we reduce this size to match default browser display
	$iconPitch = 300; // 300 is the number of pixel from x = 0 of the icon to x = 0 of the next icon, distance between icons are 300 - 256px (~ 14.7%)

	$viewBoxWidth = min($maxPerRow * $iconPitch, count(value: $icons) * $iconPitch) - ($iconPitch - 256);
	$viewBoxHeight = (ceil(num: count(value: $icons) / $maxPerRow)) * $iconPitch - ($iconPitch - 256);
	$width = $viewBoxWidth * ($displaySize / ($iconPitch - 256));
	$height = $viewBoxHeight * ($displaySize / ($iconPitch - 256));

	header(header: "Content-Type: image/svg+xml");
?>

<svg
	width="<?= $width ?>"
	height="<?= $height ?>"
	viewBox="0 0 <?= $viewBoxWidth ?> <?= $viewBoxHeight ?>"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	version="1.1"
>
	<title>UrSkill Icons</title>

	<?php
		for ($i = 0; $i < count(value: $icons); $i++) {
			if (trim(string: $icons[$i]) === "") {
				continue;
			}
	?>
		<g transform="translate(<?= ($i % $maxPerRow) * $iconPitch ?>, <?= floor(num: $i / $maxPerRow) * $iconPitch ?>)">
			<?= str_replace(
				search: "{color}",
				replace: $backgroundColor,
				subject: file_get_contents(filename: "icons/" . strtolower(string: trim(string: $icons[$i])) . ".svg")
			) ?>
		</g>
	<?php } ?>
</svg>
