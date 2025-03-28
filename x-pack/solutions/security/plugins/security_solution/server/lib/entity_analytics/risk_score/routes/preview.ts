/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { IKibanaResponse, Logger } from '@kbn/core/server';
import { buildSiemResponse } from '@kbn/lists-plugin/server/routes/utils';
import { transformError } from '@kbn/securitysolution-es-utils';
import { buildRouteValidationWithZod } from '@kbn/zod-helpers';
import type { EntityType } from '../../../../../common/search_strategy';
import type { RiskScoresPreviewResponse } from '../../../../../common/api/entity_analytics';
import { RiskScoresPreviewRequest } from '../../../../../common/api/entity_analytics';
import {
  APP_ID,
  DEFAULT_RISK_SCORE_PAGE_SIZE,
  RISK_SCORE_PREVIEW_URL,
} from '../../../../../common/constants';
import { getRiskInputsIndex } from '../get_risk_inputs_index';
import type { EntityAnalyticsRoutesDeps } from '../../types';
import { RiskScoreAuditActions } from '../audit';
import { AUDIT_CATEGORY, AUDIT_OUTCOME, AUDIT_TYPE } from '../../audit';
import { buildRiskScoreServiceForRequest } from './helpers';

export const riskScorePreviewRoute = (
  router: EntityAnalyticsRoutesDeps['router'],
  logger: Logger
) => {
  router.versioned
    .post({
      access: 'internal',
      path: RISK_SCORE_PREVIEW_URL,
      security: {
        authz: {
          requiredPrivileges: ['securitySolution', `${APP_ID}-entity-analytics`],
        },
      },
    })
    .addVersion(
      {
        version: '1',
        validate: {
          request: { body: buildRouteValidationWithZod(RiskScoresPreviewRequest) },
        },
      },
      async (context, request, response): Promise<IKibanaResponse<RiskScoresPreviewResponse>> => {
        const siemResponse = buildSiemResponse(response);
        const securityContext = await context.securitySolution;
        const coreContext = await context.core;
        const soClient = coreContext.savedObjects.client;
        const securityConfig = await securityContext.getConfig();

        const riskScoreService = buildRiskScoreServiceForRequest(
          securityContext,
          coreContext,
          logger
        );

        const {
          after_keys: userAfterKeys,
          data_view_id: dataViewId,
          debug,
          page_size: userPageSize,
          identifier_type: identifierType,
          filter,
          range: userRange,
          weights,
          exclude_alert_statuses: excludedStatuses,
          exclude_alert_tags: excludedTags,
        } = request.body;

        const entityAnalyticsConfig = await riskScoreService.getConfigurationWithDefaults(
          securityConfig.entityAnalytics
        );

        const alertSampleSizePerShard = entityAnalyticsConfig?.alertSampleSizePerShard;

        try {
          const { index, runtimeMappings } = await getRiskInputsIndex({
            dataViewId,
            logger,
            soClient,
          });

          const afterKeys = userAfterKeys ?? {};
          const range = userRange ?? { start: 'now-15d', end: 'now' };
          const pageSize = userPageSize ?? DEFAULT_RISK_SCORE_PAGE_SIZE;
          const excludeAlertStatuses = excludedStatuses || ['closed'];
          const excludeAlertTags = excludedTags || [];

          const result = await riskScoreService.calculateScores({
            afterKeys,
            debug,
            filter,
            identifierType: identifierType as EntityType,
            index,
            pageSize,
            range,
            runtimeMappings,
            weights,
            alertSampleSizePerShard,
            excludeAlertStatuses,
            excludeAlertTags,
          });

          securityContext.getAuditLogger()?.log({
            message: 'User triggered custom manual scoring',
            event: {
              action: RiskScoreAuditActions.RISK_ENGINE_PREVIEW,
              category: AUDIT_CATEGORY.DATABASE,
              type: AUDIT_TYPE.CHANGE,
              outcome: AUDIT_OUTCOME.SUCCESS,
            },
          });

          return response.ok({ body: result });
        } catch (e) {
          const error = transformError(e);

          return siemResponse.error({
            statusCode: error.statusCode,
            body: { message: error.message, full_error: JSON.stringify(e) },
            bypassErrorFormat: true,
          });
        }
      }
    );
};
