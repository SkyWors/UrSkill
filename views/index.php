<html lang="fr">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>UrSkill</title>
		<link rel="stylesheet" href="../views/style.css">
		<script src="../views/scripts.js" defer></script>
	</head>
	<body>
		<div class="title">
			<img src="urskill.png">
			<h1>UrSkill</h1>
		</div>

		<div class="result_list"></div>

		<textarea id="result_url" class="result_url"></textarea>

		<div class="controls_container">
			<input id="row_number" type="number" min="1" step="1" />
			<input id="bg_color" type="color" />
		</div>

		<div class="icon_container">
			<input type="text" id="search_input" class="search_input" placeholder="Rechercher..." />
			<div class="icons_list">
				<?php
					$iconFiles = glob(__DIR__ . "/../icons/*.svg");
					foreach ($iconFiles as $filePath) {
						$iconName = basename($filePath, ".svg");
				?>
					<div class="icon_item" id="icon_item" data-icon="<?= htmlspecialchars($iconName) ?>" title="<?= htmlspecialchars($iconName) ?>">
						<?= file_get_contents($filePath) ?>
					</div>
				<?php
					}
				?>
			</div>
			<p class="empty_list">No icons found.</p>
		</div>

		<footer>
			<img src="urskill.png"> <a href="https://github.com/SkyWors/UrSkill" target="_blank">UrSkill</a> - Développé avec 🧡 par <a class="link" href="https://github.com/SkyWors" target="_blank">SkyWors</a>
		</footer>
	</body>
</html>
