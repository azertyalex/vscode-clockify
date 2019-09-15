import * as vscode from 'vscode';
import * as moment from 'moment';
import { FieldValue, IconType, getFilePath, messageTreeItem } from '../utils';
import { ProjectDtoImpl, WorkspaceDto } from '../../api/interfaces';
import { getProjects } from '../../api/actions/project';

export class ProjectsProvider implements vscode.TreeDataProvider<ProjectProviderItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<ProjectProviderItem | undefined>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	constructor(private context: vscode.ExtensionContext) {}

	refresh(element?: ProjectProviderItem): void {
		this._onDidChangeTreeData.fire(element);
	}

	getTreeItem(element: ProjectProviderItem): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: ProjectProviderItem): Promise<ProjectProviderItem[]> {
		const workspace = this.context.globalState.get<WorkspaceDto>('selectedWorkspace');
		if (!workspace) {
			return [messageTreeItem('Select workspace')];
		}

		if (!element) {
			try {
				const projects = await getProjects(workspace.id);
				if (projects.length === 0) {
					return [messageTreeItem('No projects')];
				}
				return projects.map((project) => {
					return new ProjectItem(project);
				});
			} catch (err) {
				return [messageTreeItem('Error', undefined, 'alert')];
			}
		} else if (element instanceof ProjectItem) {
			const project = element.project;
			let items: ProjectProviderItem[] = [];

			console.log(project);

			// items.push(new ProjectInfoItem({ name: 'ID', value: project.id }, IconType.Number));
			// items.push(new ProjectInfoItem({ name: 'Name', value: project.name }, IconType.String));
			items.push(
				new ProjectInfoItem({ name: 'Client', value: project.clientName }, IconType.String)
			);
			const estimate = moment.duration(project.estimate.estimate);
			items.push(
				new ProjectInfoItem(
					{
						name: 'Estimate',
						value: `${estimate.asHours()} hours`
					},
					IconType.Timestamp
				)
			);
			const duration = moment.duration(project.duration);
			items.push(
				new ProjectInfoItem(
					{
						name: 'Duration',
						value: `${Math.round(duration.asHours() * 100) / 100} hours`
					},
					IconType.Timestamp
				)
			);
			items.push(
				new ProjectInfoItem(
					{ name: 'Billable', value: project.billable ? 'true' : 'false' },
					IconType.Boolean
				)
			);
			if (project.billable && project.hourlyRate) {
				items.push(
					new ProjectInfoItem(
						{
							name: 'Hourly Rate',
							value: `${Math.round((project.hourlyRate.amount / 100) * 100) / 100} ${
								project.hourlyRate.currency
							}`
						},
						IconType.Number
					)
				);
			}

			return items;
		} else if (element instanceof ProjectInfoItem) {
			return [];
		} else {
			console.error('Should not happen!', element);
			return [];
		}
	}
}

export type ProjectProviderItem = ProjectItem | ProjectInfoItem;

export class ProjectItem extends vscode.TreeItem {
	contextValue = 'project';
	iconPath = getFilePath('assets', 'clockify', 'dark', 'projects.svg');

	constructor(public project: ProjectDtoImpl) {
		super(project.name, vscode.TreeItemCollapsibleState.Collapsed);

		this.description = project.clientName;
	}

	readonly command: vscode.Command = {
		command: 'clockify.projects.selection',
		title: '',
		arguments: [this.project]
	};

	get tooltip(): string {
		return this.project.id;
	}
}

export class ProjectInfoItem extends vscode.TreeItem {
	contextValue = 'projects.info';
	iconPath: string;

	constructor(public fieldValue: FieldValue, public iconType: IconType) {
		super(fieldValue.name, vscode.TreeItemCollapsibleState.None);

		this.iconPath = getFilePath('assets', 'valuetype', `${iconType}.svg`);
		this.description = fieldValue.value;
	}

	get tooltip(): string {
		return this.fieldValue.value;
	}
}
