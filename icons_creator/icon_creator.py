import sys
import xml.etree.ElementTree as ET
import os

def normalize_svg(input_path, output_path):
	# Parse SVG
	tree = ET.parse(input_path)
	root = tree.getroot()

	# SVG namespace handling
	ns = {'svg': 'http://www.w3.org/2000/svg'}
	if root.tag.startswith("{"):
		ns_uri = root.tag.split("}")[0].strip("{")
		ET.register_namespace('', ns_uri)
	else:
		ns_uri = None

	# Get or calculate viewBox
	viewBox = root.get("viewBox")
	if viewBox:
		x, y, w, h = map(float, viewBox.split())
	else:
		w = float(root.get("width", "256").replace("px", ""))
		h = float(root.get("height", "256").replace("px", ""))
		x, y = 0, 0
		root.set("viewBox", f"{x} {y} {w} {h}")

	# Compute scale to fit inside 192x192 (256 - 32*2)
	margin = 32
	scale = min((256 - margin * 2) / w, (256 - margin * 2) / h)
	translate_x = margin + ((256 - margin * 2) - w * scale) / 2
	translate_y = margin + ((256 - margin * 2) - h * scale) / 2

	# Update main SVG attributes
	root.set("width", "256")
	root.set("height", "256")
	root.set("fill", "none")
	root.set("viewBox", "0 0 256 256")

	# Check if rect already exists
	has_rect = any(child.tag.endswith("rect") for child in root)
	if not has_rect:
		rect = ET.Element("rect", {
			"width": "256",
			"height": "256",
			"fill": "{color}",
			"rx": "60"
		})
		root.insert(0, rect)

	# Wrap all children except the rect in a <g> with transform
	children = [child for child in list(root) if not child.tag.endswith("rect")]
	g = ET.Element("g", {
		"transform": f"translate({translate_x:.2f},{translate_y:.2f}) scale({scale:.5f})"
	})
	for c in children:
		root.remove(c)
		g.append(c)
	root.append(g)

	# Write output
	tree.write(output_path, encoding="utf-8", xml_declaration=False)
	print(f"✅ Normalized SVG saved to: {output_path}")

if __name__ == "__main__":
	input_svg_file = "temp.svg"
	output_svg_file = "temp_icon.svg"

	if not os.path.isfile(input_svg_file):
		print(f"Error: Input file '{input_svg_file}' does not exist.")
		sys.exit(1)

	normalize_svg(input_svg_file, output_svg_file)
	print(f"Converted SVG saved to '{output_svg_file}'")
