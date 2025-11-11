<?php
	$icons = explode(",", $_GET["icons"] ?? "") ?? [];
	$maxPerRow = $_GET["max_per_row"] ?? 10;
	$backgroundColor = "#" . (isset($_GET["background_color"]) ? $_GET["background_color"] : "252525");

	if (count($_GET) === 0) {
		include __DIR__ . "/views/index.php";
		exit;
	}

	header("Content-Type: image/svg+xml");
?>

<svg
	width="<?= $maxPerRow * 60 ?>"
	height="<?= (ceil(count($icons) / $maxPerRow)) * 60 ?>"
	viewBox="0 0 <?= $maxPerRow * 300 ?> <?= (ceil(count($icons) / $maxPerRow)) * 300 ?>"
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
		<g transform="translate(<?php echo ($i % $maxPerRow) * 300; ?>, <?php echo floor($i / $maxPerRow) * 300; ?>)">
			<?php echo str_replace("{color}", $backgroundColor, file_get_contents("icons/" . strtolower(trim($icons[$i])) . ".svg")) ?>
		</g>
	<?php } ?>
</svg>
