# 🛠️ UrSkill

UrSkill is a dynamic SVG icon badge generator that allows you to create customizable skill icons for your GitHub profile, portfolio, or any web project.

## 🚀 Features

- **Dynamic SVG Generation**: Create custom icon badges on-the-fly
- **Drag & Drop Interface**: Reorder icons with intuitive drag and drop
- **Customizable Layout**: Configure icons per row and background colors
- **Search Functionality**: Quickly find icons from the extensive library
- **Live Preview**: See your changes in real-time
- **Direct URL Generation**: Get an `<img>` tag ready to embed anywhere

## 🎨 Usage

### Web Interface

1. Open the application in your browser
2. Browse or search for icons in the icon library
3. Click on icons to add them to your selection
4. Drag and drop icons to reorder them
5. Adjust settings:
   - **Max per row**: Control how many icons appear per row
   - **Background color**: Customize the icon background
6. Copy the generated `<img>` tag from the textarea
7. Paste it into your README, website, or documentation

### Direct URL Usage

You can also generate badges directly via URL parameters:

```
?icons=python,javascript,react&max_per_row=10&background_color=252525
```

**Parameters:**
- `icons`: Comma-separated list of icon names
- `max_per_row`: Number of icons per row (default: 10)
- `background_color`: Hex color without `#` (default: 252525)

**Example:**
```html
<img src="https://yoursite.com?icons=python,javascript,react&max_per_row=3&background_color=1a1a1a" />
```

## 🛠️ Icon Creator Tool

The project includes a Python utility (`icons_creator/icon_creator.py`) to normalize SVG icons:

```bash
python icons_creator/icon_creator.py
```

*It may not work for some SVG icons.*

## 🤝 Contributing

Contributions are welcome! To add new icons:

1. Run the icon creator script
2. Move the output to the `icons` directory with an appropriate name
3. Submit a pull request

## 📄 License

[UrSkill](https://github.com/SkyWors/UrSkill) © 2025 by [Erick Paoletti](https://github.com/SkyWors/) is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/?ref=chooser-v1)

## 🌟 Acknowledgments

This project includes icons for various technologies, frameworks, and tools. All icons are used in accordance with their respective licenses.

---

Made with ❤️ by [SkyWors](https://github.com/SkyWors/)
