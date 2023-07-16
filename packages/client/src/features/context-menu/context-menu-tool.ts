/********************************************************************************
 * Copyright (c) 2023 EclipseSource and others.
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
import { injectable } from 'inversify';
import { MouseListener } from '~glsp-sprotty';
import { BaseGLSPTool } from '../tools/base-glsp-tool';
import { GLSPContextMenuMouseListener } from './context-menu-mouse-listener';

@injectable()
export class ContextMenuTool extends BaseGLSPTool {
    static readonly ID = 'glsp.context-menu-tool';

    protected contextMenuMouseListener: MouseListener;

    constructor() {
        super();
        this.contextMenuMouseListener = this.createContextMenuMouseListener();
    }

    override get isEditTool(): boolean {
        return false;
    }

    get id(): string {
        return ContextMenuTool.ID;
    }

    override enable(): void {
        this.toDisposeOnDisable.push(this.mouseTool.registerListener(this.contextMenuMouseListener));
    }

    protected createContextMenuMouseListener(): MouseListener {
        return new GLSPContextMenuMouseListener();
    }
}
