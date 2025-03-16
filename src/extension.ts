/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as cp from 'child_process';
import * as vscode from 'vscode';

type OnExit = (code: number) => void;
function spawn(action: 'copy' | 'paste', onExit?: OnExit): cp.ChildProcess {
  let command = vscode.workspace.getConfiguration('klip')['klipBinPath'];
  const configPath = vscode.workspace.getConfiguration('klip')['klipConfigPath'];
  if (!command?.length) {
    command = 'klip';
  }
  const args = configPath ? ['--config', configPath, action] : [action];
  const options = vscode.workspace.workspaceFolders
    ? { cwd: vscode.workspace.workspaceFolders[0].uri.fsPath }
    : {};
  const child = cp.spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], ...options });
  let stderr = '';
  child.stderr.on('data', (data: Buffer) => {
    stderr += data.toString();
  });
  child.on('exit', (code) => {
    if (code !== 0) {
      const msg = `${command} exited with code ${code}`;
      const err = stderr || '<no output>';
      console.error(msg, err);
      vscode.window.showErrorMessage(`${msg}\n${err}`);
      return;
    }
    onExit?.(code);
  });
  return child;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('klip.copy', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const cb = editor.document.getText(editor.selection);
    if (!cb) {
      return;
    }
    const onExit = () => {
      if (!(vscode.workspace.getConfiguration('klip')['showMessage'] ?? true)) {
        return;
      }
      vscode.window.showInformationMessage('Sent to klip', 'OK', "Don't show again").then((value) => {
        if (value === "Don't show again") {
          vscode.workspace.getConfiguration('klip').update('showMessage', false, vscode.ConfigurationTarget.Global);
        }
      });
    };
    const child = spawn('copy', onExit);
    child.stdin?.write(cb);
    child.stdin?.end();
  });
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand('klip.paste', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const child = spawn('paste');
    child.stdout?.on('data', (data: Buffer) => {
      editor.edit((editBuilder) => {
        editBuilder.delete(editor.selection);
      }).then(() => {
        editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.start, data.toString());
        });
      });
    });
    child.stdin?.end();
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
