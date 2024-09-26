# KLIP extension for Visual Studio Code

Copy/paste anything over the network.

Make a local selection, paste it instantaneously into VS Code running on another computer.

## Requirements

[KLIP](https://git.5ht2.me/lmaotrigine/klip) has to be installed and configured on the system.
The `klip` executable must be in your `$PATH`.

## Extension Settings

This extension contributes the following settings:

- `klip.klipBinPath`: Path to the `klip` executable. Default is `klip`.
- `klip.klipConfigPath`: Path to the `klip` configuration file. Default is `~/klip.toml` on Windows and
  `~/.klip.toml` on Unix.

## Usage

- `Ctrl+Alt+Shift+C`/`KLIP: Copy`: Copy the current selection to the clipboard.
- `Ctrl+Alt+Shift+V`/`KLIP: Paste`: Paste the clipboard contents into the current selection.
