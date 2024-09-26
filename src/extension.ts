/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as cp from 'child_process';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('klip.copy', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const cb = editor.document.getText(editor.selection);
    let command = vscode.workspace.getConfiguration('klip')['klipBinPath'];
    const configPath = vscode.workspace.getConfiguration('klip')['klipConfigPath'];
    const args = ['copy'];
    if (!cb.length) {
      return;
    }
    if (!command?.length) {
      command = 'klip';
    }
    if (configPath?.length) {
      args.push('--config');
      args.push(configPath);
    }
    const options = vscode.workspace.workspaceFolders
      ? { cwd: vscode.workspace.workspaceFolders[0].uri.path }
      : {};
    const child = cp.spawn(command, args, options);
    child.on('exit', () => {
      if (!(vscode.workspace.getConfiguration('klip')['showMessage'] ?? true)) {
        return;
      }
      vscode.window.showInformationMessage('Sent to klip', 'OK', "Don't show again").then((value) => {
        if (value === "Don't show again") {
          vscode.workspace.getConfiguration('klip').update('showMessage', false, vscode.ConfigurationTarget.Global);
        }
      });
    });
    child.stdin.write(cb);
    child.stdin.end();
  });
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand('klip.paste', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let command = vscode.workspace.getConfiguration('klip')['klipBinPath'];
    const configPath = vscode.workspace.getConfiguration('klip')['klipConfigPath'];
    const args = ['paste'];
    if (!command?.length) {
      command = 'klip';
    }
    if (configPath?.length) {
      args.push('--config');
      args.push(configPath);
    }
    const options = vscode.workspace.workspaceFolders
      ? { cwd: vscode.workspace.workspaceFolders[0].uri.fsPath }
      : {};
    const child = cp.spawn(command, args, options);
    child.stdout.on('data', (data: Buffer) => {
      editor.edit((editBuilder) => {
        editBuilder.delete(editor.selection);
      }).then(() => {
        editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.start, data.toString());
        });
      });
    });
    child.stdin.end();
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
