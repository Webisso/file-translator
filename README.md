# File Translator

<p align="center">
  <strong>Open-source file translation UI powered by AI</strong>
</p>

<p align="center">
  <a href="https://webisso.github.io/file-translator/">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#n8n-integration">n8n Integration</a> •
  <a href="#license">License</a>
</p>

---

## Overview

File Translator is a modern, open-source web application that allows you to translate text files line-by-line or as a whole using AI-powered translation. It features a beautiful, responsive UI with dark/light theme support and integrates seamlessly with n8n workflows.

**🌐 Live Demo:** [https://webisso.github.io/file-translator/](https://webisso.github.io/file-translator/)

## Features

- 📁 **File Upload** - Drag & drop or click to upload any text file
- 🌍 **Multi-language Support** - Translate between 30+ languages
- 🔄 **Two Translation Modes**
  - **Per-line**: Translates each line individually with real-time progress
  - **Whole-file**: Sends entire content at once for faster processing
- ⚡ **Real-time Translation** - Watch translations appear line by line
- 📊 **Diff View** - Git-style diff visualization (red/green) to compare original and translated content
- 🎨 **Dark/Light Theme** - System-aware theme with manual toggle
- 📋 **Copy & Download** - Export translated content easily
- 🛑 **Stop Translation** - Cancel ongoing translations anytime
- 🔌 **n8n Integration** - Connect to your own n8n workflow for AI translation

## Screenshots

| Dark Theme | Light Theme |
|------------|-------------|
| Upload and translate files with a modern dark interface | Full light theme support for any environment |

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- n8n instance (for translation backend)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/webisso/file-translator.git

# Navigate to project directory
cd file-translator

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Usage

1. **Configure n8n URL**: Click "Settings" and enter your n8n webhook URL
2. **Upload a File**: Drag & drop or click to select a text file
3. **Select Languages**: Choose base language (source) and target language
4. **Choose Mode**: Select "Per-line" for real-time progress or "Whole-file" for batch translation
5. **Translate**: Click "Translate file" and watch the magic happen
6. **Review**: Switch between Original, Translated, and Diff views
7. **Export**: Copy to clipboard or download the translated file

## n8n Integration

File Translator requires an n8n workflow to handle the actual translation. Here's how to set it up:

### Flow Structure

```
Webhook → AI Agent → Code → Respond to Webhook
```

### Step 1: Webhook Node

Create a Webhook node with the following settings:

| Setting | Value |
|---------|-------|
| HTTP Method | POST |
| Authentication | None |
| Respond | Using 'Respond to Webhook' Node |

### Step 2: AI Agent Node

Connect an AI Agent node (GPT-4, Claude, etc.) with:

**Prompt:**
```
The current language of the sentence to be translated: {{ $json.body['baseLanguage'] }}
The sentence to be translated: {{ $json.body.lineText }}
The target language: {{ $json.body['targetLanguage'] }}
```

**System Message:**
```
You are a translator. You will translate the given sentence into the specified language. In your response, write only the translation. Do not write anything else. Do not write any HTML tags, only the translation. Never use tags such as \n.
```

### Step 3: Code Node

Add a Code node to format the response:

```javascript
const translatedText = $input.first().json.output;

return [
  {
    json: {
      translatedText: translatedText,
      meta: {
        model: "gpt-4.1",
        latencyMs: 420
      }
    }
  }
];
```

> **Note:** The `meta` field is optional and can contain any metadata you want to track.

### Step 4: Respond to Webhook Node

Add a "Respond to Webhook" node with:

| Setting | Value |
|---------|-------|
| Respond With | First Incoming Item |

### API Reference

#### Per-line Request

```json
POST /webhook/file-translator
Content-Type: application/json

{
  "mode": "per-line",
  "fileName": "example.txt",
  "lineIndex": 0,
  "lineText": "Hello world",
  "baseLanguage": "en-US",
  "targetLanguage": "tr",
  "metadata": {
    "totalLines": 120,
    "path": "src/messages/en.json"
  }
}
```

#### Per-line Response

```json
{
  "translatedText": "Merhaba dünya",
  "meta": {
    "model": "gpt-4.1",
    "latencyMs": 420
  }
}
```

#### Whole-file Request

```json
POST /webhook/file-translator
Content-Type: application/json

{
  "mode": "whole-file",
  "fileName": "example.txt",
  "content": "Full file content as a single string",
  "baseLanguage": "en-US",
  "targetLanguage": "tr"
}
```

#### Whole-file Response

```json
{
  "translatedContent": "Tamamı çevrilmiş dosya içeriği",
  "meta": {
    "model": "gpt-4.1",
    "segments": 12
  }
}
```

## Tech Stack

- **React 19** - UI framework
- **React Router DOM 7** - Client-side routing
- **CSS Custom Properties** - Theming system
- **Fetch API** - HTTP requests with AbortController support

## Project Structure

```
file-translator/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # All styles
│   ├── index.js        # Entry point
│   └── ...
├── package.json
├── LICENSE
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Powered by [n8n](https://n8n.io/) for workflow automation
- Inspired by modern translation tools

---

<p align="center">
  <a href="https://github.com/webisso/file-translator">GitHub</a> •
  <a href="https://github.com/webisso/file-translator/blob/main/LICENSE">License</a> •
  <a href="https://webisso.com">Webisso Website</a> •
  <a href="https://webisso.com/contact-us">Contact Us</a>
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/webisso">Webisso</a>
</p>

