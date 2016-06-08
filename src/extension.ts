import * as vscode from 'vscode';

import ErlcLintingProvider from './features/erlcLinter';

import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	let linter = new ErlcLintingProvider();
	linter.activate(context.subscriptions);
}