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
import { BindingContext, Disposable, KeyListener, KeyTool, MaybePromise, TYPES, bindOrRebind } from '@eclipse-glsp/sprotty';
import { decorate, injectable, unmanaged } from 'inversify';
import { IContributionInitializer, IContributionProvider } from '../contribution-provider';

@injectable()
export class GLSPKeyTool extends KeyTool implements IContributionInitializer {
    constructor() {
        super([]);
    }

    registerListener(keyListener: KeyListener): Disposable {
        super.register(keyListener);
        return Disposable.create(() => this.deregister(keyListener));
    }

    initializeContributions(provider: IContributionProvider): MaybePromise<void> {
        provider.getAll<KeyListener>(TYPES.KeyListener).forEach(listener => this.register(listener));
    }
}

let baseClassDecorated = false;
export function bindKeyTool(context: Omit<BindingContext, 'unbind'>): void {
    context.bind(GLSPKeyTool).toSelf().inSingletonScope();
    bindOrRebind(context, KeyTool).toService(GLSPKeyTool);
    context.bind(TYPES.IContributionInitializer).toService(GLSPKeyTool);
    if (!baseClassDecorated) {
        decorate(unmanaged(), KeyTool, 0);
        baseClassDecorated = true;
    }
}
