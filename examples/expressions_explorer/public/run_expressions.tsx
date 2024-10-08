/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useState, useEffect } from 'react';
import { pluck } from 'rxjs';
import {
  EuiCodeBlock,
  EuiFlexItem,
  EuiFlexGroup,
  EuiPageBody,
  EuiPageTemplate,
  EuiPageSection,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPanel,
  EuiText,
  EuiTitle,
  EuiButton,
  EuiSpacer,
} from '@elastic/eui';
import { ExpressionsStart } from '@kbn/expressions-plugin/public';
import { Adapters, Start as InspectorStart } from '@kbn/inspector-plugin/public';
import { ExpressionEditor } from './editor/expression_editor';

interface Props {
  expressions: ExpressionsStart;
  inspector: InspectorStart;
}

export function RunExpressionsExample({ expressions, inspector }: Props) {
  const [expression, updateExpression] = useState('markdownVis "## expressions explorer"');
  const [result, updateResult] = useState<unknown>({});
  const [inspectorAdapters, updateInspectorAdapters] = useState<Adapters>({});

  const expressionChanged = (value: string) => {
    updateExpression(value);
  };

  useEffect(() => {
    const execution = expressions.execute(expression, null, {
      debug: true,
    });
    const subscription = execution
      .getData()
      .pipe(pluck('result'))
      .subscribe((data) => {
        updateResult(data);
        updateInspectorAdapters(execution.inspect());
      });
    execution.inspect();
    return () => subscription.unsubscribe();
  }, [expression, expressions, inspectorAdapters]);

  return (
    <EuiPageBody>
      <EuiPageHeader>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>Run expressions</h1>
          </EuiTitle>
        </EuiPageHeaderSection>
      </EuiPageHeader>
      <EuiPageTemplate.Section>
        <EuiPageSection>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiText>
                In the below editor you can enter your expression and execute it. Using
                expressions.execute allows you to easily run the expression.
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiButton
                onClick={() => {
                  inspector.open(inspectorAdapters);
                }}
              >
                Open Inspector
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup gutterSize="l">
            <EuiFlexItem>
              <EuiPanel data-test-subj="expressionEditor" paddingSize="none" role="figure">
                <ExpressionEditor value={expression} onChange={expressionChanged} />
              </EuiPanel>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiPanel paddingSize="none" role="figure">
                <EuiCodeBlock
                  language="json"
                  fontSize="m"
                  paddingSize="m"
                  isCopyable
                  data-test-subj="expressionResult"
                >
                  {JSON.stringify(result, null, '\t')}
                </EuiCodeBlock>
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageSection>
      </EuiPageTemplate.Section>
    </EuiPageBody>
  );
}
