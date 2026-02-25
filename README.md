# DEVPROM Link Fixer

A browser extension for Firefox and Chromium that intercepts clipboard copy actions on [devprom.e-kama.com](https://devprom.e-kama.com) and reformats requirement links into clean, tool-ready formats.

**Version:** 3.5 | **Author:** Alexander Golyshkin

---

## The Problem

When copying a DEVPROM requirement link, the raw clipboard content looks like this:

```
https://devprom.e-kama.com/pm/IT_XXX/IT_IVI.Group - 1221916
https://devprom.e-kama.com/pm/HMXconcept/XXXSpec-LVL3-1125932?baseline=35307
```

These raw links are not directly usable in documentation tools like Confluence (PUML), Jira, or Markdown.

## What It Does

The extension automatically reformats the copied link — including the requirement title — into a properly formatted link. For example:

**PUML format:**
```
[[https://devprom.e-kama.com/pm/IT_XXX/IT_IVI.Group%20-%201221916 Cabin Air Recirculation ON OFF]]
```

**Jira format:**
```
[Cabin Air Recirculation ON OFF - [1221916]|https://devprom.e-kama.com/pm/IT_XXX/...]
```

**Markdown format:**
```markdown
[https://...](Cabin Air Recirculation ON OFF - [1221916])
```

Both `text/plain` and `text/html` versions are written to the clipboard simultaneously, so pasting into rich-text editors also produces a proper hyperlink.

---

## Features

- Intercepts DEVPROM clipboard copy buttons without breaking the original workflow
- Automatically resolves the requirement title from the current page DOM
- Supports **four built-in output formats**: Default, PUML, Jira, Markdown
- Supports a **custom user-defined template** with three variables:
  - `${url}` — the requirement URL (URI-encoded)
  - `${id}` — the requirement numeric ID
  - `${desc}` — the requirement title/caption
- Template is **auto-saved** and persisted across browser sessions
- Works on both Firefox and Chromium (Manifest V3)

---

## Installation

### Firefox
1. Go to `about:debugging` → **This Firefox** → **Load Temporary Add-on**
2. Select the `manifest.json` file from this repository

### Chromium / Chrome / Edge
1. Go to `chrome://extensions` → enable **Developer mode**
2. Click **Load unpacked** and select the repository folder

---

## Usage

### Keyboard Shortcut

Open the format selector dialog with:

| Platform | Shortcut |
|---|---|
| Windows / Linux | `Alt+Shift+D` |
| macOS | `Alt+Shift+D` |

### Popup Dialog

Click the extension icon (or use the shortcut) to open the template editor:

- Select one of the four preset formats using radio buttons
- Or type a custom template using `${url}`, `${id}`, `${desc}` variables
- The template is auto-saved as you type — no save button needed
- Click **CLOSE** to dismiss

### Copying a Link

Just click any **clipboard** button inside DEVPROM as usual. The extension silently intercepts the action, resolves the requirement title, applies your saved template, and writes the result to the clipboard.

---

## Template Reference

| Variable | Description |
|---|---|
| `${url}` | Full URI-encoded DEVPROM requirement URL |
| `${id}` | Numeric requirement ID |
| `${desc}` | Requirement title as shown on the page |

### Built-in Templates

| Format | Template |
|---|---|
| Default | `${url} - ${desc} - [${id}]` |
| PUML | `[[${url} - ${desc} - [${id}]]]` |
| Jira | `[${desc} - [${id}]\|${url}]` |
| Markdown | `[${url}](${desc} - [${id}])` |

---

## Permissions

| Permission | Purpose |
|---|---|
| `storage` | Save the user's template preference |
| `clipboardWrite` | Write formatted links to clipboard |

No data is sent to any external server. All processing happens locally in the browser.

---

## References

- [Mozilla WebExtensions Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
- [Firefox Add-on Submission Guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
