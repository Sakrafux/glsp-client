/********************************************************************************
 * Copyright (c) 2019-2023 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import '@vscode/codicons/dist/codicon.css';
import { Container, ContainerModule } from 'inversify';
import {
    ActionHandlerRegistry,
    InitializeResult,
    KeyTool,
    LocationPostprocessor,
    ModelSource,
    MouseTool,
    MoveCommand,
    SetEditModeAction,
    TYPES,
    bindAsService,
    bindOrRebind,
    configureActionHandler,
    configureCommand
} from '~glsp-sprotty';
import '../../css/glsp-sprotty.css';
import { GLSPActionDispatcher } from './action-dispatcher';
import { GLSPCommandStack } from './command-stack';
import { EditorContextService } from './editor-context-service';
import { ModifyCssFeedbackCommand } from './feedback/css-feedback';
import { FeedbackActionDispatcher } from './feedback/feedback-action-dispatcher';
import { FeedbackAwareUpdateModelCommand } from './feedback/update-model-command';
import { FocusStateChangedAction } from './focus/focus-state-change-action';
import { FocusTracker } from './focus/focus-tracker';
import { DefaultModelInitializationConstraint, ModelInitializationConstraint } from './model-initialization-constraint';
import { GLSPModelRegistry } from './model/model-registry';
import { SelectionClearingMouseListener } from './selection-clearing-mouse-listener';
import { SelectionService } from './selection-service';
import { GLSPToolManager } from './tool-manager/glsp-tool-manager';
import { GLSPKeyTool } from './view/key-tool';
import { GLSPMouseTool } from './view/mouse-tool';
import { GLSPViewRegistry } from './view/view-registry';

export const baseModule = new ContainerModule((bind, _unbind, isBound, rebind) => {
    const context = { bind, _unbind, isBound, rebind };
    bind(EditorContextService).toSelf().inSingletonScope();
    bind(TYPES.IEditorContextServiceProvider).toProvider<EditorContextService>(
        ctx => () =>
            new Promise<EditorContextService>((resolve, reject) => {
                if (ctx.container.isBound(EditorContextService)) {
                    resolve(ctx.container.get<EditorContextService>(EditorContextService));
                } else {
                    reject();
                }
            })
    );

    configureActionHandler(context, SetEditModeAction.KIND, EditorContextService);

    bind(FocusTracker).toSelf().inSingletonScope();
    configureActionHandler(context, FocusStateChangedAction.KIND, FocusTracker);

    // Model update initialization ------------------------------------
    bind(TYPES.IFeedbackActionDispatcher).to(FeedbackActionDispatcher).inSingletonScope();
    configureCommand(context, FeedbackAwareUpdateModelCommand);

    bind(GLSPMouseTool).toSelf().inSingletonScope();
    bindOrRebind(context, MouseTool).toService(GLSPMouseTool);
    bind(GLSPKeyTool).toSelf().inSingletonScope();
    bindOrRebind(context, KeyTool).toService(GLSPKeyTool);

    bindAsService(context, TYPES.MouseListener, SelectionClearingMouseListener);

    bindOrRebind(context, TYPES.ICommandStack).to(GLSPCommandStack).inSingletonScope();
    bind(GLSPToolManager).toSelf().inSingletonScope();
    bindOrRebind(context, TYPES.IToolManager).toService(GLSPToolManager);
    bind(GLSPActionDispatcher).toSelf().inSingletonScope();
    bindOrRebind(context, TYPES.IActionDispatcher).toService(GLSPActionDispatcher);

    bind(ModelInitializationConstraint).to(DefaultModelInitializationConstraint).inSingletonScope();

    // support re-registration of model elements and views
    bindOrRebind(context, TYPES.SModelRegistry).to(GLSPModelRegistry).inSingletonScope();
    bindOrRebind(context, TYPES.ViewRegistry).to(GLSPViewRegistry).inSingletonScope();

    bind(SelectionService).toSelf().inSingletonScope();
    bind(TYPES.ISModelRootListener).toService(SelectionService);

    // Feedback Support ------------------------------------
    // Generic re-usable feedback modifying css classes
    configureCommand(context, ModifyCssFeedbackCommand);
    // We support using sprotty's MoveCommand as client-side visual feedback
    configureCommand(context, MoveCommand);

    bindAsService(context, TYPES.IVNodePostprocessor, LocationPostprocessor);
    bind(TYPES.HiddenVNodePostprocessor).toService(LocationPostprocessor);
});

/**
 * Utility function to configure the {@link ModelSource}, i.e. the `DiagramServer`, as action handler for all server actions for the given
 * diagramType.
 * @param result A promise that resolves after all server actions have been registered.
 * @param diagramType The diagram type.
 * @param container The di container.
 */
export async function configureServerActions(result: InitializeResult, diagramType: string, container: Container): Promise<void> {
    const modelSource = container.get<ModelSource>(TYPES.ModelSource);
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(ActionHandlerRegistry);
    const serverActions = result.serverActions[diagramType];
    if (serverActions.length === 0) {
        throw new Error(`No server-handled actions could be derived from the initialize result for diagramType: ${diagramType}!`);
    }
    serverActions.forEach(actionKind => actionHandlerRegistry.register(actionKind, modelSource));
}