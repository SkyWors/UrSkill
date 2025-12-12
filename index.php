<?php
	define("APP_NAME", "UrSkill");

	if (empty($_GET)) {
		include __DIR__ . "/views/index.php";
		exit;
	}

	$icons = explode(",", $_GET["icons"] ?? "") ?? [];
	$maxPerRow = $_GET["max_per_row"] ?? 10;
	$backgroundColor = "#" . (isset($_GET["background_color"]) ? $_GET["background_color"] : "252525");

	$iconSize = 10; // Icons are 256px x 256px, we reduce this size to match default browser display
	$space = 300; // 300 is the number of pixel from x = 0 of the icon to x = 0 of the next icon, distance between icons are 300 - 256px (~ 14.7%)

	$viewBoxWidth = min($maxPerRow * $space, count($icons) * $space) - ($space - 256);
	$viewBoxHeight = (ceil(count($icons) / $maxPerRow)) * $space - ($space - 256);
	$width = $viewBoxWidth * ($iconSize / ($space - 256));
	$height = $viewBoxHeight * ($iconSize / ($space - 256));

	header("Content-Type: image/svg+xml");
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
	<?php
		for ($i = 0; $i < count($icons); $i++) {
			if (trim($icons[$i]) === "") {
				continue;
			}
	?>
		<g transform="translate(<?php echo ($i % $maxPerRow) * $space; ?>, <?php echo floor($i / $maxPerRow) * $space; ?>)">
			<?php echo str_replace("{color}", $backgroundColor, file_get_contents("icons/" . strtolower(trim($icons[$i])) . ".svg")) ?>
		</g>
	<?php } ?>
</svg>
