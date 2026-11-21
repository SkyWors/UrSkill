<?php
	ob_start(callback: "ob_gzhandler");

	$iconNames = array_map(
		callback: fn($iconPath) => basename(path: $iconPath, suffix: ".svg"),
		array: glob(pattern: __DIR__ . "/../icons/*.svg")
	);
	$aliases = json_decode(json: file_get_contents(filename: __DIR__ . "/../assets/aliases.json"), associative: true);
	$categories = json_decode(json: file_get_contents(filename: __DIR__ . "/../assets/categories.json"), associative: true);

	// Keep only existing icons, put uncategorised ones in "Other"
	$categories = array_map(
		callback: fn($categoryIcons) => array_values(array: array_intersect($categoryIcons, $iconNames)),
		array: $categories
	);
	$uncategorisedIcons = array_values(array: array_diff($iconNames, ...array_values(array: $categories)));

	if ($uncategorisedIcons) {
		$categories["Other"] = $uncategorisedIcons;
	}

	$categories = array_filter(array: $categories);

	$slug = fn($text) => trim(string: preg_replace(pattern: "/[^a-z0-9]+/", replacement: "-", subject: strtolower(string: $text)), characters: "-");
	$escape = fn($text) => htmlspecialchars(string: $text);

	// Remix Icon class per category, a folder for "Other" and any category added later
	const CATEGORY_ICONS = [
		"Languages" => "ri-code-s-slash-line",
		"Frontend" => "ri-layout-line",
		"Backend" => "ri-server-line",
		"Mobile & Desktop" => "ri-device-line",
		"Databases" => "ri-database-2-line",
		"Cloud & DevOps" => "ri-cloud-line",
		"Tools & Testing" => "ri-tools-line",
		"Editors & IDEs" => "ri-terminal-box-line",
		"AI" => "ri-sparkling-line",
		"Data" => "ri-bar-chart-box-line",
		"Design & Creative" => "ri-palette-line",
		"Office & Productivity" => "ri-briefcase-line",
		"Operating Systems" => "ri-computer-line",
		"Browsers" => "ri-global-line",
		"Social & Community" => "ri-chat-smile-2-line",
		"Game Dev" => "ri-gamepad-line",
		"Minecraft" => "ri-box-3-line",
		"Security" => "ri-shield-keyhole-line",
		"Hardware & Network" => "ri-cpu-line",
	];
	$categoryIcon = fn($categoryName) => CATEGORY_ICONS[$categoryName] ?? "ri-folder-line";

	define(constant_name: "ISSUE_URL", value: "https://github.com/SkyWors/UrSkill/issues/new?title=" . rawurlencode("Icon request: "));
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="darkreader-lock">
		<title><?= APP_NAME ?> - Skill icon badge generator</title>
		<meta name="description" content="Build an SVG badge of your skills from <?= count($iconNames) ?> icons and embed it anywhere.">
		<link rel="icon" href="assets/logo.svg" type="image/svg+xml">
		<link rel="icon" href="favicon.ico" sizes="any">
		<script>document.documentElement.dataset.theme = localStorage.getItem("theme") || "system";</script>
		<link rel="stylesheet" href="views/styles/style.css">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.css">
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap">
		<script type="module" src="views/scripts/main.js"></script>
		<script src="views/scripts/theme.js" defer></script>
	</head>
	<body>
		<noscript><p>Please enable JavaScript to use this application.</p></noscript>

		<header class="navbar">
			<div class="navbar_inner">
				<a class="brand" href="./">
					<img class="brand_mark" src="assets/logo.svg" alt="<?= APP_NAME ?> logo" width="30" height="30">
					<span class="brand_name"><?= APP_NAME ?></span>
					<span class="tag"><?= count($iconNames) ?> icons</span>
				</a>

				<nav class="nav_links">
					<a class="nav_link" href="<?= ISSUE_URL ?>" target="_blank"><i class="ri-lightbulb-line"></i><span>Propose an icon</span></a>
					<button type="button" class="nav_link" id="api_open"><i class="ri-code-s-slash-line"></i><span>API</span></button>
					<a class="nav_link" href="https://github.com/SkyWors/UrSkill" target="_blank"><i class="ri-github-line"></i><span>GitHub</span></a>
					<button type="button" class="icon_button theme_button" title="Theme: light / dark / system"><i class="ri-sun-line"></i></button>
				</nav>
			</div>
		</header>

		<div class="layout">
			<aside class="sidebar" aria-label="Categories">
				<p class="sidebar_title">Categories</p>
				<nav>
					<?php foreach ($categories as $categoryName => $categoryIcons) { ?>
						<a class="side_link" href="#cat-<?= $slug($categoryName) ?>" data-cat="<?= $slug($categoryName) ?>">
							<span class="side_name"><i class="<?= $categoryIcon($categoryName) ?>" aria-hidden="true"></i><?= $escape($categoryName) ?></span><span class="count"><?= count($categoryIcons) ?></span>
						</a>
					<?php } ?>
				</nav>
			</aside>

			<main class="library" aria-label="Icon library">
				<div class="library_toolbar">
					<div class="field search">
						<i class="ri-search-line"></i>
						<input type="search" id="search_input" spellcheck="false" autocomplete="off"
							placeholder="Search icons, aliases, categories…" aria-label="Search icons" />
						<kbd class="search_hint" title="Press / to search">/</kbd>
						<button type="button" class="icon_button clear_search" id="clear_search" title="Clear search (Esc)" hidden><i class="ri-close-line"></i></button>
					</div>
					<div class="library_tools">
						<select class="field jump" id="jump" aria-label="Jump to category">
							<option value="">Jump to category…</option>
							<?php foreach ($categories as $categoryName => $categoryIcons) { ?>
								<option value="<?= $slug($categoryName) ?>"><?= $escape($categoryName) ?></option>
							<?php } ?>
						</select>
						<label class="switch">
							<input type="checkbox" id="selected_only" />
							<span class="switch_track"></span>
							Selected only
						</label>
					</div>
				</div>

				<div class="library_head">
					<div>
						<h1 id="library_title">All icons</h1>
						<p class="muted" id="library_status"><?= count($iconNames) ?> icons · click to add, Enter in search adds the first match</p>
					</div>
					<a class="button" href="<?= ISSUE_URL ?>" target="_blank"><i class="ri-lightbulb-line"></i> Missing an icon?</a>
				</div>

				<?php foreach ($categories as $categoryName => $categoryIcons) { ?>
					<section class="category" id="cat-<?= $slug($categoryName) ?>" data-cat="<?= $slug($categoryName) ?>">
						<h2><button type="button" class="category_toggle" aria-expanded="true"><i class="ri-arrow-down-s-line"></i> <i class="<?= $categoryIcon($categoryName) ?>" aria-hidden="true"></i> <?= $escape($categoryName) ?> <span class="count"><?= count($categoryIcons) ?></span></button></h2>
						<div class="icons_grid">
							<?php foreach ($categoryIcons as $icon) {
								$searchText = strtolower(implode(separator: "|", array: [$icon, ...($aliases[$icon] ?? []), $categoryName]));
							?>
								<button type="button" class="icon_item" data-icon="<?= $escape($icon) ?>" data-search="<?= $escape($searchText) ?>" aria-pressed="false" data-tooltip="<?= $escape($icon) ?>">
									<span class="icon_tile"><img src="icons/<?= $escape($icon) ?>.svg" alt="" loading="lazy" width="40" height="40"></span>
									<span class="icon_name"><?= $escape($icon) ?></span>
								</button>
							<?php } ?>
						</div>
					</section>
				<?php } ?>

				<div class="empty_list" id="empty_list" hidden>
					<i class="ri-search-line"></i>
					<p>No icons match <strong id="empty_query"></strong>.</p>
					<a class="button primary" id="propose_link" href="<?= ISSUE_URL ?>" target="_blank"><i class="ri-lightbulb-line"></i> Propose this icon</a>
				</div>
			</main>

			<aside class="builder" id="builder" aria-label="Your badge">
				<section class="panel preview_panel" id="preview_panel">
					<header class="panel_head">
						<div>
							<h2>Preview</h2>
							<p class="muted" id="badge_meta"></p>
						</div>
						<div class="panel_tools">
							<div class="segmented" role="group" aria-label="Preview page background">
								<button type="button" data-canvas="light" title="Preview on a light page"><i class="ri-sun-line"></i></button>
								<button type="button" data-canvas="dark" title="Preview on a dark page"><i class="ri-moon-line"></i></button>
							</div>
							<button type="button" class="icon_button" id="fullscreen" title="Fullscreen (Esc to exit)" aria-pressed="false"><i class="ri-fullscreen-line"></i></button>
						</div>
					</header>

					<div class="canvas" id="canvas">
						<div class="preview" id="preview"></div>
						<p class="canvas_empty" id="canvas_empty">Your badge is empty.<br>Pick icons from the library.</p>
					</div>

					<footer class="panel_foot">
						<p class="muted">Drag to move · drop on an icon to swap · <kbd>←</kbd><kbd>→</kbd> <kbd>Del</kbd> on a focused icon</p>
						<button type="button" class="button" id="reset" title="Remove all icons and reset settings"><i class="ri-delete-bin-line"></i> Reset</button>
					</footer>
				</section>

				<section class="panel settings">
					<div class="setting">
						<label class="label" for="row_number">Icons per row</label>
						<span class="field stepper">
							<button type="button" class="icon_button" data-step="-1" aria-label="Fewer per row"><i class="ri-subtract-line"></i></button>
							<input id="row_number" type="number" min="1" step="1" inputmode="numeric" />
							<button type="button" class="icon_button" data-step="1" aria-label="More per row"><i class="ri-add-line"></i></button>
						</span>
					</div>
					<div class="setting">
						<label class="label" for="bg_color">Tile background</label>
						<span class="field color_field">
							<input id="bg_color" type="color" />
							<code id="bg_hex"></code>
						</span>
					</div>
				</section>

				<section class="panel">
					<div class="tabs" role="tablist" aria-label="Embed format">
						<button type="button" role="tab" data-format="html">HTML</button>
						<button type="button" role="tab" data-format="markdown">Markdown</button>
						<button type="button" role="tab" data-format="url">URL</button>
					</div>
					<div class="field code_box">
						<textarea id="result_url" readonly spellcheck="false" rows="3" aria-label="Embed code"></textarea>
					</div>
					<button type="button" class="button primary block" id="copy"><i class="ri-file-copy-line"></i> Copy code</button>

					<details class="import">
						<summary>Import an existing badge</summary>
						<form id="import_form">
							<input class="field" type="text" id="import_input" spellcheck="false" placeholder="Paste a URL, <img> or Markdown" />
							<button type="submit" class="button">Load</button>
						</form>
					</details>
				</section>
			</aside>
		</div>

		<div class="mobile_bar">
			<a href="#builder"><strong id="mobile_count">0</strong> selected · View badge</a>
			<button type="button" class="button primary" data-copy><i class="ri-file-copy-line"></i> Copy</button>
		</div>

		<div class="toast" id="toast" role="status" hidden></div>

		<dialog class="dialog" id="api_dialog">
			<div class="dialog_body">
			<header class="panel_head">
				<h2>Direct URL usage</h2>
				<form method="dialog"><button class="icon_button" aria-label="Close"><i class="ri-close-line"></i></button></form>
			</header>
			<p>The badge is a plain SVG generated from query parameters, so you can also write the URL by hand:</p>
			<pre><code><?= $escape("https://{$_SERVER["HTTP_HOST"]}/?icons=python,javascript,react&max_per_row=10&background_color=252525") ?></code></pre>
			<table>
				<tr><th><code>icons</code></th><td>Comma-separated icon names. An empty entry (<code>a,,b</code>) leaves a gap.</td></tr>
				<tr><th><code>max_per_row</code></th><td>Icons per row. Default <code>10</code>.</td></tr>
				<tr><th><code>background_color</code></th><td>Tile color as hex, without <code>#</code>. Default <code>252525</code>.</td></tr>
			</table>
			</div>
		</dialog>

		<footer class="site_footer">
			<?= APP_NAME ?> · Développé avec 🧡 par <a href="https://github.com/SkyWors" target="_blank">SkyWors</a>
		</footer>
	</body>
</html>

<?php ob_end_flush(); ?>
