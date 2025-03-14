/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup } from '@elastic/eui';
import React from 'react';

import { DraggableBadge } from '../../../../../../common/components/draggables';

import * as i18n from './translations';
import { TokensFlexItem } from '../helpers';

export const nilOrUnSet = (value?: string | null) =>
  value == null || value.toLowerCase() === 'unset';

interface Props {
  contextId: string;
  eventId: string;
  primary: string | null | undefined;
  secondary: string | null | undefined;
  scopeId: string;
}

export const PrimarySecondary = React.memo<Props>(
  ({ contextId, eventId, primary, secondary, scopeId }) => {
    if (nilOrUnSet(primary) && nilOrUnSet(secondary)) {
      return null;
    } else if (!nilOrUnSet(primary) && nilOrUnSet(secondary)) {
      return (
        <DraggableBadge
          scopeId={scopeId}
          contextId={contextId}
          eventId={eventId}
          field="auditd.summary.actor.primary"
          value={primary}
          iconType="user"
          isAggregatable={true}
          fieldType="keyword"
        />
      );
    } else if (nilOrUnSet(primary) && !nilOrUnSet(secondary)) {
      return (
        <DraggableBadge
          scopeId={scopeId}
          contextId={contextId}
          eventId={eventId}
          field="auditd.summary.actor.secondary"
          value={secondary}
          iconType="user"
          isAggregatable={true}
          fieldType="keyword"
        />
      );
    } else if (primary === secondary) {
      return (
        <DraggableBadge
          scopeId={scopeId}
          contextId={contextId}
          eventId={eventId}
          field="auditd.summary.actor.secondary"
          value={secondary}
          iconType="user"
          isAggregatable={true}
          fieldType="keyword"
        />
      );
    } else {
      return (
        <EuiFlexGroup gutterSize="none">
          <TokensFlexItem grow={false} component="span">
            <DraggableBadge
              scopeId={scopeId}
              contextId={contextId}
              eventId={eventId}
              field="auditd.summary.actor.primary"
              value={primary}
              iconType="user"
              isAggregatable={true}
              fieldType="keyword"
            />
          </TokensFlexItem>
          <TokensFlexItem grow={false} component="span">
            {i18n.AS}
          </TokensFlexItem>
          <TokensFlexItem grow={false} component="span">
            <DraggableBadge
              scopeId={scopeId}
              contextId={contextId}
              eventId={eventId}
              field="auditd.summary.actor.secondary"
              value={secondary}
              iconType="user"
              isAggregatable={true}
              fieldType="keyword"
            />
          </TokensFlexItem>
        </EuiFlexGroup>
      );
    }
  }
);

PrimarySecondary.displayName = 'PrimarySecondary';

interface PrimarySecondaryUserInfoProps {
  contextId: string;
  eventId: string;
  userName: string | null | undefined;
  primary: string | null | undefined;
  secondary: string | null | undefined;
  scopeId: string;
}

export const PrimarySecondaryUserInfo = React.memo<PrimarySecondaryUserInfoProps>(
  ({ contextId, eventId, userName, primary, secondary, scopeId }) => {
    if (nilOrUnSet(userName) && nilOrUnSet(primary) && nilOrUnSet(secondary)) {
      return null;
    } else if (
      !nilOrUnSet(userName) &&
      !nilOrUnSet(primary) &&
      !nilOrUnSet(secondary) &&
      userName === primary &&
      userName === secondary
    ) {
      return (
        <DraggableBadge
          scopeId={scopeId}
          contextId={contextId}
          eventId={eventId}
          field="user.name"
          value={userName}
          iconType="user"
          isAggregatable={true}
          fieldType="keyword"
        />
      );
    } else if (!nilOrUnSet(userName) && nilOrUnSet(primary) && nilOrUnSet(secondary)) {
      return (
        <DraggableBadge
          scopeId={scopeId}
          contextId={contextId}
          eventId={eventId}
          field="user.name"
          value={userName}
          iconType="user"
          isAggregatable={true}
          fieldType="keyword"
        />
      );
    } else {
      return (
        <PrimarySecondary
          scopeId={scopeId}
          contextId={contextId}
          eventId={eventId}
          primary={primary}
          secondary={secondary}
        />
      );
    }
  }
);

PrimarySecondaryUserInfo.displayName = 'PrimarySecondaryUserInfo';
