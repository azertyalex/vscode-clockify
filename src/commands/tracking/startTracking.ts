import * as vscode from 'vscode';
import * as _ from 'lodash';
import { TimeEntryRequest } from '../../api/interfaces';
import { addTimeentry } from '../../api/actions/timeEntry';
import { selectWorkspace } from '../../helpers/selectWorkspace';
import { selectProject } from '../../helpers/selectProject';
import { selectTask } from '../../helpers/selectTask';
import { getDescription } from '../../helpers/getDescription';
import { selectBillable } from '../../helpers/selectBillable';
import { selectTags } from '../../helpers/selectTags';
import { updateStatusBarItem } from '../../statusbar/init';
import { providerStore } from '../../treeView/stores';
import { TimeentriesProvider } from '../../treeView/timeentries/timeentries.provider';

export async function startTracking(context: vscode.ExtensionContext) {
	// 1. Select Workspace
	// 2. Select Project
	// 3. Select Task
	// 4. Description
	// 5. Billable
	// 6. Select Tags
	try {
		let newTimeentry: TimeEntryRequest = {} as TimeEntryRequest;
		newTimeentry.start = new Date().toISOString();

		const workspaceId = await selectWorkspace();
		context.globalState.update("tracking:workspaceId", workspaceId);
		newTimeentry.workspaceId = workspaceId;

		const projectId = await selectProject(workspaceId, false);
		context.globalState.update("tracking:projectId", projectId);
		newTimeentry.projectId = projectId;

		const taskId = await selectTask(workspaceId, projectId, false);
		context.globalState.update("tracking:taskId", taskId);
		newTimeentry.taskId = taskId;

		const description = await getDescription(false);
		context.globalState.update("tracking:description", description);
		newTimeentry.description = description;

		const billable = await selectBillable(false);
		context.globalState.update("tracking:billable", billable);
		newTimeentry.billable = billable;

		//#region GET TAGS ITEMS
		const tagIds = await selectTags(workspaceId, false);
		context.globalState.update("tracking:tagIds", tagIds);
		newTimeentry.tagIds = tagIds;

		// Add Time Entry
		const timeEntry = await addTimeentry(workspaceId, newTimeentry);
		if (timeEntry) {
			context.globalState.update('workspaceId', workspaceId);
			vscode.window.showInformationMessage('Tracking started');
		}

		// Update status bar item
		context.globalState.update('tracking:isTracking', true);
		updateStatusBarItem(context, true);

		// Update tree view
		const timentriesProvider = providerStore.get<TimeentriesProvider>('timeentries');
		timentriesProvider.refresh();
	} catch (err) {
		console.log(err);
	}
}
