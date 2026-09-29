# Grammar Tuner

Grammar Tuner is one of the subject's software projects.
Summary: A desktop application for grammar tuning.

## Links
- Github: https://github.com/diao1v/grammar-tuner

Grammar Tuner is a desktop application designed to help users correct and refine English grammar and tone in a convenient way, especially for daily communication tasks like sending messages on platforms such as Microsoft Teams. With just a simple keyboard shortcut, users can select text, and the app will process it using AI models to provide polished and tone-adjusted text.

## Features

- **Quick Text Selection**: Select text anywhere and press `control^ + Z` to send it to the app for tuning.
- **Predefined Tune Styles**: Choose from predefined styles (minimal, casual, polite) to adjust the tone and grammar of your text.
- **AI Model Selection**: Switch between OpenAI GPT-4o mini and DeepSeek Chat models in the settings.
- **Customizable Styles**: Add and save your own predefined styles to fit your specific needs.
- **Cross-Platform Desktop App**: Built with Tauri for a lightweight and fast desktop experience.

## Technologies Used

- **Frontend**: React + TailwindCSS
- **Backend**: Rust (with AI assistance for development)
- **Framework**: Tauri (for building cross-platform desktop apps)
- **Package Manager**: pnpm

## How to run

1. install dependencies

   `pnpm install`

2. Frontend Development Mode

   `pnpm dev`

3. Full Application Development Mode

   `pnpm tauri dev`

4. Build the Application

   `pnpm tauri build`

## Release download

Currently, the app is only available for Arm MacOS(Apple Silicon). You can download the latest release from the [releases page](https://github.com/diao1v/grammar-tuner/releases/tag/pre-release).

## Acknowledgments

- Special thanks to AI tools for assisting in the development of the Rust backend.
- Built with [Tauri](https://tauri.app/), [React](https://reactjs.org/), and [TailwindCSS](https://tailwindcss.com/).
