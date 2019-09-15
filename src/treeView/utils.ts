import * as vscode from 'vscode';
import * as path from 'path';

let _context: vscode.ExtensionContext;

export function messageTreeItem(msg: string, tooltip?: string, icon?: 'info' | 'alert'): any {
	const item = new vscode.TreeItem('', vscode.TreeItemCollapsibleState.None);
	item.tooltip = tooltip;
	item.description = msg;
	if (icon) {
		item.iconPath = {
			light: getFilePath('assets', 'light', `${icon}.svg`),
			dark: getFilePath('assets', 'dark', `${icon}.svg`)
		};
	} else {
		item.iconPath = undefined;
	}
	return item;
}

export function getFullPath(parentPath: string, name: string) {
	return [parentPath, name].filter(Boolean).join('/');
}
export function getFilePath(...filenameParts: string[]): string {
	// return getContext().asAbsolutePath(path.join(...filenameParts));
	return getContext().asAbsolutePath(path.join(...filenameParts));
}

export enum ContextValue {
	WorkspaceSelected = 'workspaces:selected',
	ProjectSelected = 'projects:selected'
}

export function setContext(key: ContextValue, value: any): void {
	vscode.commands.executeCommand('setContext', 'clockify:' + key, value);
}
export function setContextObject(context: vscode.ExtensionContext) {
	_context = context;
}
export function getContext(): vscode.ExtensionContext {
	return _context;
}

export type FieldValue = {
	name: string;
	value: any;
};
export enum IconType {
	Array = 'array',
	Boolean = 'boolean',
	Bytes = 'bytes',
	Geopoint = 'geopoint',
	Map = 'map',
	Null = 'null',
	Number = 'number',
	Reference = 'reference',
	String = 'string',
	StringA = 'string-A',
	StringAbc = 'string-abc',
	Timestamp = 'timestamp'
}
