/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('bicep', new Macros(), {
			providedCodeActionKinds: Macros.providedCodeActionKinds
		}));
}

export class Macros implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		let actions: Array<vscode.CodeAction> = []
		if (this.hasDecorator('// @rc:', document, range)) {
			actions.push(this.addRc(document, range, this.getDecoratorSuffix('// @rc:', document, range)))
		}
		if (this.hasDecorator('// @rcg:', document, range)) {
			actions.push(this.addRcg(document, range, this.getDecoratorSuffix('// @rcg:', document, range)))
		}

		if (actions.length > 0) {
			return actions
		}

		return;
	}

	private hasDecorator(decorator: string, document: vscode.TextDocument, range: vscode.Range): boolean {
		const start = range.start;
		const line = document.lineAt(start.line);
		const suffix = this.getDecoratorSuffix(decorator, document, range)

		if (suffix.length === 0) {
			return false
		}
		if (suffix.includes('/')) {
			return false
		}
		if (suffix.includes('\\')) {
			return false
		}
		if (!(suffix.includes(':'))) {
			return false
		}
		if (suffix.endsWith(':')) {
			return false
		}
		if (suffix.includes(':')) {
			if (suffix.split(':')[1].startsWith(' ')) {
				return false
			}
			if (suffix.split(':')[1].startsWith('.')) {
				return false
			}
			if (suffix.split(':')[1].startsWith('_')) {
				return false
			}
			if (suffix.split(':')[1].startsWith('-')) {
				return false
			}
		}

		try {
			const nextLine = document.lineAt(start.line + 1)
			if (decorator === '// @rc:') {
				const rc = this.generateRc(suffix)
				if (nextLine.text === rc.lines[0]) {
					return false
				}
			}
			if (decorator === '// @rcg:') {
				const rcg = this.generateRcg(suffix)
				if (nextLine.text === rcg.lines[0]) {
					return false
				}
			}
		}
		catch {}

		let mark = true
		for (let i = 0; i < decorator.length; i++) {
			if (!(line.text[i] === decorator[i])) {
				mark = false
			}
		}
		return mark
	}

	private getDecoratorSuffix(decorator: string, document: vscode.TextDocument, range: vscode.Range): string {
		const start = range.start;
		const line = document.lineAt(start.line);
		return line.text.replace(decorator,'')
	}

	private getDecoratorSuffixParts(suffix: string) {
		let priority = suffix
		let name = ''
		let deploymentNameSeparator = ''
		let symbolicNameSeparator = ''
		let fileNameSeparator = ''

		if (suffix.includes(':')) {
			if (suffix.split(':')[1].length > 0) {
				name = suffix.split(':')[1]
				deploymentNameSeparator = '-'
				symbolicNameSeparator = '_'
				fileNameSeparator = '-'
			}
			priority = suffix.split(':')[0]
		}

		return {
			priority: priority,
			name: name,
			deploymentNameSeparator: deploymentNameSeparator,
			symbolicNameSeparator: symbolicNameSeparator,
			fileNameSeparator: fileNameSeparator
		}
	}

	private generateRc(suffix: string) {
		const parts = this.getDecoratorSuffixParts(suffix)
		const p = parts.priority
		const dn = parts.name
			.replace('.','-')
			.replace(' ','-');
		const sn = parts.name
			.replace('-','_')
			.replace('.','_')
			.replace(' ','_');
		const n = parts.name
		const ds = parts.deploymentNameSeparator
		const ss = parts.symbolicNameSeparator
		const fs = parts.fileNameSeparator
		const lines = [
			`module rc${p}${ss}${sn} '${p}${fs}${n}.bicep' = {`,
			`  name: '\${deployment().name}_${p}${ds}${dn}'`,
			`  params: {`,
			`    name: '${dn}'`,
			`    priority: ${p}`,
			`  }`,
			`}`
		]
		const text = `\n${lines.join(`\n`)}`

		return {
			lines: lines,
			text: text
		}
	}

	private generateRcg(suffix: string) {
		const parts = this.getDecoratorSuffixParts(suffix)
		const p = parts.priority
		const dn = parts.name
			.replace('.','-')
			.replace(' ','-');
		const sn = parts.name
			.replace('-','_')
			.replace('.','_')
			.replace(' ','_');
		const n = parts.name
		const ds = parts.deploymentNameSeparator
		const ss = parts.symbolicNameSeparator
		const fs = parts.fileNameSeparator
		const lines = [
			`module rcg${p}${ss}${sn} '${p}${fs}${n}/rcg.bicep' = {`,
			`  name: '\${deployment().name}_${p}${ds}${dn}'`,
			`  params: {`,
			`    parentPolicyName: policy.name`,
			`    name: '${dn}'`,
			`    priority: ${p}`,
			`  }`,
			`  dependsOn: [`,
			`  ]`,
			`}`
		]
		const text = `\n${lines.join(`\n`)}`

		return {
			lines: lines,
			text: text
		}
	}

	private addRc(document: vscode.TextDocument, range: vscode.Range, suffix: string): vscode.CodeAction {
		const action = new vscode.CodeAction(`Add rc${suffix.split(':')[0]}`, vscode.CodeActionKind.QuickFix);
		const line = document.lineAt(range.end.line)
		const insertPosition: vscode.Position = new vscode.Position(range.end.line, line.text.length)
		const rc = this.generateRc(suffix)
		action.edit = new vscode.WorkspaceEdit();
		action.edit.insert(document.uri, insertPosition, rc.text)
		return action;
	}

	private addRcg(document: vscode.TextDocument, range: vscode.Range, suffix: string): vscode.CodeAction {
		const action = new vscode.CodeAction(`Add rcg${suffix.split(':')[0]}`, vscode.CodeActionKind.QuickFix);
		const line = document.lineAt(range.end.line)
		const insertPosition: vscode.Position = new vscode.Position(range.end.line, line.text.length)
		const rc = this.generateRcg(suffix)
		action.edit = new vscode.WorkspaceEdit();
		action.edit.insert(document.uri, insertPosition, rc.text)
		return action;
	}
}