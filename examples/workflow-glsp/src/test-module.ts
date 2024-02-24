/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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

import {
    AbstractUIExtension,
    Action,
    FeatureModule,
    IActionHandler,
    TYPES,
    UpdateModelAction,
    configureActionHandler
} from '@eclipse-glsp/client';
import { injectable } from 'inversify';

export const testModule = new FeatureModule((bind, unbind, isBound, rebind) => {
    bind(TestUiExtension).toSelf().inSingletonScope();
    bind(TYPES.IUIExtension).toService(TestUiExtension);

    configureActionHandler({ bind, isBound }, UpdateModelAction.KIND, TestUiExtension);
});

@injectable()
export class TestUiExtension extends AbstractUIExtension implements IActionHandler {
    static readonly ID = 'test-ui-extension';
    override id(): string {
        return TestUiExtension.ID;
    }
    override containerClass(): string {
        return 'test-ui-extension';
    }
    protected override initializeContents(containerElement: HTMLElement): void {
        containerElement.textContent = 'Test UI Extension';
    }

    handle(action: Action): void {
        console.log('TestUiExtension.handle', action);
    }
}
