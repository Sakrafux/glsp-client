/********************************************************************************
 * Copyright (c) 2019-2022 EclipseSource and others.
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
import { IView, IViewArgs, on, RenderingContext, SShapeElement, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import virtualizeString from 'sprotty/lib/lib/virtualize';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class CustomShape implements IView {
    render(node: Readonly<SShapeElement>, _context: RenderingContext, _args?: IViewArgs): VNode | undefined {
        const options = ['A', 'B', 'C'];

        const select = document.createElement('select');
        select.name = node.id;
        select.id = node.id;

        for (const option of options) {
            const opt = document.createElement('option');
            opt.value = option;
            opt.text = option;
            select.add(opt);
        }

        const selectVNode = virtualizeString(select.outerHTML);
        on(selectVNode!, 'change', (event: any) => {
            console.log(node.id);
            if (event.target instanceof HTMLSelectElement) {
                console.log(event.target.value);
            }
        });
        const vnode: VNode = (
            <g>
                <foreignObject requiredFeatures='http://www.w3.org/TR/SVG11/feature#Extensibility' height={50} width={70} x={0} y={0}>
                    {selectVNode}
                </foreignObject>
            </g>
        );
        return vnode;
    }
}
