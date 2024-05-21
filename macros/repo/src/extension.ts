/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { posix } from 'path';
import { fileURLToPath } from 'url';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('bicep', new Macros(), {
			providedCodeActionKinds: Macros.providedCodeActionKinds
		})
	);
	Macros.registerRcActionCommand()
	Macros.registerRcgActionCommand()
}

type DecoratorSuffixParts = {
	priority: string
	deploymentName: string
	symbolicName: string
	fileName: string
	deploymentNameSeparator: string
	symbolicNameSeparator: string
	fileNameSeparator: string
}

export class Macros implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		let actions: Array<vscode.CodeAction> = []
		if (this.hasDecorator('// @rc:', document, range)) {
			actions.push(this.addRcAction(document, range, 'NAT', this.getDecoratorSuffix('// @rc:', document, range)))
		}
		if (this.hasDecorator('// @rc:', document, range)) {
			actions.push(this.addRcAction(document, range, 'NET', this.getDecoratorSuffix('// @rc:', document, range)))
		}
		if (this.hasDecorator('// @rc:', document, range)) {
			actions.push(this.addRcAction(document, range, 'APP', this.getDecoratorSuffix('// @rc:', document, range)))
		}

		if (this.hasDecorator('// @rcg:', document, range)) {
			actions.push(this.addRcgAction(document, range, this.getDecoratorSuffix('// @rcg:', document, range)))
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
			const suffixParts = this.getDecoratorSuffixParts(suffix)
			if (decorator === '// @rc:') {
				const rc = this.generateRc(suffixParts)
				if (nextLine.text === rc.lines[0]) {
					return false
				}
			}
			if (decorator === '// @rcg:') {
				const rcg = this.generateRcg(suffixParts, '')
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

	private getDecoratorSuffixParts(suffix: string): DecoratorSuffixParts {
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

		const deploymentName = name
			.replace('.','-')
			.replace(' ','-');
		const symbolicName = name
			.replace('-','_')
			.replace('.','_')
			.replace(' ','_');
		const fileName = name

		return {
			priority: priority,
			deploymentName: deploymentName,
			symbolicName: symbolicName,
			fileName: fileName,
			deploymentNameSeparator: deploymentNameSeparator,
			symbolicNameSeparator: symbolicNameSeparator,
			fileNameSeparator: fileNameSeparator
		}
	}

	private generateRc(suffixParts: DecoratorSuffixParts) {
		const p = suffixParts.priority
		const dn = suffixParts.deploymentName
		const sn = suffixParts.symbolicName
		const fn = suffixParts.fileName
		const ds = suffixParts.deploymentNameSeparator
		const ss = suffixParts.symbolicNameSeparator
		const fs = suffixParts.fileNameSeparator
		const lines = [
			`module rc${p}${ss}${sn} '${p}${fs}${fn}.bicep' = {`,
			`  name: '\${deployment().name}_${p}${ds}${dn}'`,
			`  params: {`,
			`    name: '${dn}'`,
			`    priority: ${p}`,
			`  }`,
			`}`,
			``,
			`// @rc:`
		]
		const text = `\n${lines.join(`\n`)}`

		return {
			lines: lines,
			text: text
		}
	}

	private generateRcg(suffixParts: DecoratorSuffixParts, previousRcgSymbolicName: string) {
		const p = suffixParts.priority
		const dn = suffixParts.deploymentName
		const sn = suffixParts.symbolicName
		const fn = suffixParts.fileName
		const ds = suffixParts.deploymentNameSeparator
		const ss = suffixParts.symbolicNameSeparator
		const fs = suffixParts.fileNameSeparator
		const lines = [
			`module rcg${p}${ss}${sn} '${p}${fs}${fn}/rcg.bicep' = {`,
			`  name: '\${deployment().name}_${p}${ds}${dn}'`,
			`  params: {`,
			`    parentPolicyName: policy.name`,
			`    name: '${dn}'`,
			`    priority: ${p}`,
			`  }`,
			`}`,
			``,
			`// @rcg:`
		]

		if (previousRcgSymbolicName.length > 0) {
			lines.splice(7, 0, `  dependsOn: [`)
			lines.splice(8, 0, `    ${previousRcgSymbolicName}`)
			lines.splice(9, 0, `  ]`)
		}

		const text = `\n${lines.join(`\n`)}`

		return {
			lines: lines,
			text: text
		}
	}

	private getPreviousRcgSymbolicName(document: vscode.TextDocument): string {
		let exists = false
		let markerLineText = ''

		for (let i = document.lineCount - 1; i > - 1; i--) {
			let line = document.lineAt(i)
			if (line.text.includes(`module rcg`) && line.text.includes(`/rcg.bicep' = {`)) {
				exists = true
				markerLineText = line.text
				break
			}
		}
		if (!exists) {
			return ''
		}

		return markerLineText.split(' ')[1]
	}

	private static updateRcgCollection(document: vscode.TextDocument, suffixParts: DecoratorSuffixParts) {
		const lines = [`  rc${suffixParts.priority}${suffixParts.symbolicNameSeparator}${suffixParts.symbolicName}.outputs.rc`]
		this.appendBicepArray(document, 'ruleCollections: [', lines)
	}

	private static appendBicepArray(document: vscode.TextDocument, marker: string, lines: Array<string>, reverseSearchDirection?: boolean) {
		let exists = false
		let markerLineText = ''
		let markerLineNumber = 0
		let bracketLineNumber = 0

		// find marker eg: "ruleCollections: ["
		if (reverseSearchDirection) {
			for (let i = document.lineCount - 1; i > -1 ; i--) {
				let line = document.lineAt(i)
				if (line.text.includes(marker)) {
					exists = true
					markerLineNumber = line.lineNumber
					markerLineText = line.text
					break
				}
			}
			if (!exists) {
				return
			}
		}

		for (let i = 0; i < document.lineCount; i++) {
			let line = document.lineAt(i)
			if (line.text.includes(marker)) {
				exists = true
				markerLineNumber = line.lineNumber
				markerLineText = line.text
				break
			}
		}
		if (!exists) {
			return
		}

		// locate closing bracket "]"
		for (let i = markerLineNumber; i < document.lineCount; i++) {
			let line = document.lineAt(i)
			if (line.text.includes(']')) {
				bracketLineNumber = line.lineNumber
				break
			}
		}

		let indentation = markerLineText.substring(0,markerLineText.lastIndexOf(marker)).replace(marker,'')
		lines[0] = `${indentation}${lines[0]}`
		if (markerLineNumber == bracketLineNumber) {
			lines.push(`${indentation}`)
		}
		if (markerLineNumber > bracketLineNumber) {
			lines.push(`${indentation}]`)
		}

		let lineNumber = 0
		let lineLength = 0
		if (markerLineNumber >= bracketLineNumber) {
			lineNumber = markerLineNumber
			lineLength = document.lineAt(lineNumber).text.lastIndexOf('[') + 1
		}
		if (markerLineNumber < bracketLineNumber) {
			lineNumber = bracketLineNumber - 1
			lineLength = document.lineAt(lineNumber).range.end.character
		}

		const textWrite = `\n${lines.join('\n')}`
		const insertPosition: vscode.Position = new vscode.Position(lineNumber, lineLength)

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            editor.edit(editBuilder => {
				editBuilder.insert(insertPosition, textWrite)
			})
		}
	}

	private static createRcFile = async (document: vscode.TextDocument, rcType: string, suffixParts: DecoratorSuffixParts) => {
		const parentDir = document.uri.path.substring(0, document.uri.path.lastIndexOf('/'))
		const moduleName = `${suffixParts.priority}${suffixParts.fileNameSeparator}${suffixParts.fileName}`
		const fileUri = vscode.Uri.file(posix.join(parentDir, `${moduleName}.bicep`))

		this.updateRcgCollection(document, suffixParts)

		try {
			await vscode.workspace.fs.stat(fileUri)
			return
		}
		catch {}

		let rule_action = 'DNAT'
		let rule_type = 'natRuleCollection'
		let rule_ruleCollectionType = 'FirewallPolicyNatRuleCollection'

		switch (rcType) {
			case 'NET': {
				rule_action = 'Allow'
				rule_type = 'networkRuleCollection'
				rule_ruleCollectionType = 'FirewallPolicyFilterRuleCollection'
				break
			}
			case 'APP': {
				rule_action = 'Allow'
				rule_type = 'applicationRuleCollection'
				rule_ruleCollectionType = 'FirewallPolicyFilterRuleCollection'
				break
			}
		}

		const writeLines = [
			`import {natRuleCollection, networkRuleCollection, applicationRuleCollection} from '../../types/ruleCollections.bicep'`,
			``,
			`targetScope = 'resourceGroup'`,
			``,
			`param name string`,
			`param priority int`,
			``,
			`output rc ${rule_type} = {`,
			`  name: name`,
			`  priority: priority`,
			`  ruleCollectionType: '${rule_ruleCollectionType}'`,
			`  action: {`,
			`    type: '${rule_action}'`,
			`  }`,
			`  rules:[`,
			`    {`,
			`      `,
			`    }`,
			`  ]`,
			`}`,
		]
		const writeStr = writeLines.join(`\n`);
		const writeData = Buffer.from(writeStr, 'utf8');

		await vscode.workspace.fs.writeFile(fileUri, writeData)
	}

	private static createRcgFile = async (document: vscode.TextDocument, suffixParts: DecoratorSuffixParts) => {
		const parentDir = document.uri.path.substring(0, document.uri.path.lastIndexOf('/'))
		const moduleName = `${suffixParts.priority}${suffixParts.fileNameSeparator}${suffixParts.fileName}`
		const fileUri = vscode.Uri.file(posix.join(parentDir, moduleName, 'rcg.bicep'))

		try {
			await vscode.workspace.fs.stat(fileUri)
			return
		}
		catch {}

		const writeLines = [
			`targetScope = 'resourceGroup'`,
			``,
			`param name string`,
			`param parentPolicyName string`,
			`param priority int`,
			``,
			`resource policy 'Microsoft.Network/firewallPolicies@2023-11-01' existing = {`,
			`  name: parentPolicyName`,
			`}`,
			``,
			`resource rcg 'Microsoft.Network/firewallPolicies/ruleCollectionGroups@2023-11-01' = {`,
			`  name: name`,
			`  parent: policy`,
			`  properties: {`,
			`    priority: priority`,
			`    ruleCollections: [`,
			`    ]`,
			`  }`,
			`}`,
			``,
			`// @rc:`
		]
		const writeStr = writeLines.join(`\n`);
		const writeData = Buffer.from(writeStr, 'utf8');

		await vscode.workspace.fs.writeFile(fileUri, writeData)
	}

	public static registerRcActionCommand(): void {
		vscode.commands.registerCommand('az-fw-bicep-macro.create-rc-file', Macros.createRcFile)
	}

	public static registerRcgActionCommand(): void {
		vscode.commands.registerCommand('az-fw-bicep-macro.create-rcg-file', Macros.createRcgFile)
	}

	private addRcAction(document: vscode.TextDocument, range: vscode.Range, rcType: string, suffix: string): vscode.CodeAction {
		const action = new vscode.CodeAction(`Add ${rcType} rc${suffix.split(':')[0]}`, vscode.CodeActionKind.QuickFix);
		const line = document.lineAt(range.end.line)
		const insertPosition: vscode.Position = new vscode.Position(range.end.line, line.text.length)
		const suffixParts = this.getDecoratorSuffixParts(suffix)
		const rc = this.generateRc(suffixParts)
		action.edit = new vscode.WorkspaceEdit();
		action.edit.insert(document.uri, insertPosition, rc.text)
		action.command = {
			command: 'az-fw-bicep-macro.create-rc-file',
			title: 'Create Rc File',
			arguments: [document, rcType, suffixParts]
		}
		return action;
	}

	private addRcgAction(document: vscode.TextDocument, range: vscode.Range, suffix: string): vscode.CodeAction {
		const action = new vscode.CodeAction(`Add new rcg${suffix.split(':')[0]}`, vscode.CodeActionKind.QuickFix);
		const line = document.lineAt(range.end.line)
		const insertPosition: vscode.Position = new vscode.Position(range.end.line, line.text.length)
		const suffixParts = this.getDecoratorSuffixParts(suffix)
		const previousRcgSymbolicName = this.getPreviousRcgSymbolicName(document)
		const rcg = this.generateRcg(suffixParts, previousRcgSymbolicName)
		action.edit = new vscode.WorkspaceEdit();
		action.edit.insert(document.uri, insertPosition, rcg.text)
		action.command = {
			command: 'az-fw-bicep-macro.create-rcg-file',
			title: 'Create Rcg File',
			arguments: [document, suffixParts]
		}
		return action;
	}
}