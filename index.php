<?php
	define(constant_name: "APP_NAME", value: "UrSkill");

	if (empty($_GET)) {
		include __DIR__ . "/views/index.php";
		exit;
	}

	$icons = explode(separator: ",", string: $_GET["icons"] ?? "") ?? [];
	$maxPerRow = isset($_GET["max_per_row"]) ? ($_GET["max_per_row"] > 0 ? $_GET["max_per_row"] : 1) : 10;
	$backgroundColor = "#" . (isset($_GET["background_color"]) ? $_GET["background_color"] : "252525");

	$iconSize = 10; // Icons are 256px x 256px, we reduce this size to match default browser display
	$space = 300; // 300 is the number of pixel from x = 0 of the icon to x = 0 of the next icon, distance between icons are 300 - 256px (~ 14.7%)

	$viewBoxWidth = min($maxPerRow * $space, count(value: $icons) * $space) - ($space - 256);
	$viewBoxHeight = (ceil(num: count(value: $icons) / $maxPerRow)) * $space - ($space - 256);
	$width = $viewBoxWidth * ($iconSize / ($space - 256));
	$height = $viewBoxHeight * ($iconSize / ($space - 256));

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
		<g transform="translate(<?= ($i % $maxPerRow) * $space; ?>, <?php echo floor(num: $i / $maxPerRow) * $space; ?>)">
			<?= str_replace(
				search: "{color}",
				replace: $backgroundColor,
				subject: file_get_contents(filename: "icons/" . strtolower(string: trim(string: $icons[$i])) . ".svg")
			) ?>
		</g>
	<?php } ?>
</svg>
