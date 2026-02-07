<?php
	ob_start(callback: "ob_gzhandler");

	$iconFiles = glob(pattern: __DIR__ . "/../icons/*.svg");
?>

<!DOCTYPE html>
<html lang="fr" data-theme="system">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="darkreader-lock">
		<title><?= APP_NAME ?></title>
		<link rel="stylesheet" href="../views/styles/style.css">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.css">
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap">
		<script src="../views/scripts/scripts.js" defer></script>
		<script src="../views/scripts/theme.js" defer></script>
	</head>
	<body>
		<noscript>
			<p>Please enable JavaScript to use this application.</p>
		</noscript>

		<button type="toggle" class="theme_button"><i class="ri-sun-line"></i></button>

		<div class="title">
			<i class="ri-wrench-line" alt="<?= APP_NAME ?> Logo"></i>
			<h1><?= APP_NAME ?></h1>
		</div>

		<div class="result_list"></div>

		<textarea id="result_url" class="result_url" spellcheck="false"></textarea>

		<div class="controls_container">
			<input id="row_number" type="number" min="1" step="1" />
			<input id="bg_color" type="color" />
			<i class="ri-loop-left-line button reset" id="reset"></i>
		</div>

		<div class="icon_container">
			<div class="search_container">
				<input type="text" id="search_input" class="search_input" spellcheck="false" placeholder="Search between <?= count(value: $iconFiles) ?> icons..." autofocus />
				<i class="ri-close-large-line button clear_search" id="clear_search" title="Clear search bar"></i>
			</div>
			<div class="icons_list">
				<?php
					foreach ($iconFiles as $filePath) {
						$iconName = basename(path: $filePath, suffix: ".svg");
				?>
					<div class="icon_item" id="icon_item" tabindex="0" data-icon="<?= htmlspecialchars(string: $iconName) ?>" alt="<?= htmlspecialchars(string: $iconName) ?>">
						<?= file_get_contents(filename: $filePath) ?>
					</div>
				<?php
					}
				?>
			</div>
			<p class="empty_list">No icons found.</p>
		</div>

		<div data-aliases='<?= str_replace(search: ["\n", "\t"], replace: "", subject: file_get_contents(filename: __DIR__ . "/../assets/aliases.json")) ?>'></div>

		<footer>
			<i class="ri-wrench-line" alt="<?= APP_NAME ?> Logo"></i> <a href="https://github.com/SkyWors/UrSkill" target="_blank"><?= APP_NAME ?></a> - Développé avec 🧡 par <a class="link" href="https://github.com/SkyWors" target="_blank">SkyWors</a>
		</footer>
	</body>
</html>

<?php ob_end_flush(); ?>
