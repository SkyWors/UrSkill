<?php
	ob_start(callback: "ob_gzhandler");

	$iconFiles = glob(__DIR__ . "/../icons/*.svg");
?>

<!DOCTYPE html>
<html lang="fr">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="darkreader-lock">
		<title><?= APP_NAME ?></title>
		<link rel="stylesheet" href="../views/style.css">
		<script src="../views/scripts.js" defer></script>
	</head>
	<body>
		<div class="title">
			<img src="assets/urskill.png" alt="<?= APP_NAME ?> Logo">
			<h1><?= APP_NAME ?></h1>
		</div>

		<div class="result_list"></div>

		<textarea id="result_url" class="result_url"></textarea>

		<div class="controls_container">
			<input id="row_number" type="number" min="1" step="1" />
			<input id="bg_color" type="color" />
			<img class="button reset" id="reset" src="assets/reset.png" alt="Reset" title="Reset settings"/>
		</div>

		<div class="icon_container">
			<div class="search_container">
				<input type="text" id="search_input" class="search_input" placeholder="Search between <?= count($iconFiles) ?> icons..." autofocus />
				<img class="button clear_search" id="clear_search" src="assets/clean.png" alt="Clear" title="Clean search bar" />
			</div>
			<div class="icons_list">
				<?php
					foreach ($iconFiles as $filePath) {
						$iconName = basename($filePath, ".svg");
				?>
					<div class="icon_item" id="icon_item" tabindex="0" data-icon="<?= htmlspecialchars($iconName) ?>" alt="<?= htmlspecialchars($iconName) ?>">
						<?= file_get_contents($filePath) ?>
					</div>
				<?php
					}
				?>
			</div>
			<p class="empty_list">No icons found.</p>
		</div>

		<div data-aliases='<?= str_replace(["\n", "\t"], "", file_get_contents(__DIR__ . "/../assets/aliases.json")) ?>'></div>

		<footer>
			<img src="assets/urskill.png" alt="<?= APP_NAME ?> Logo"> <a href="https://github.com/SkyWors/UrSkill" target="_blank"><?= APP_NAME ?></a> - Développé avec 🧡 par <a class="link" href="https://github.com/SkyWors" target="_blank">SkyWors</a>
		</footer>
	</body>
</html>

<?php ob_end_flush(); ?>
