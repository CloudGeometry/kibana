/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { useState, useEffect, useContext } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { EuiButton } from '@elastic/eui';
import { MLCATEGORY } from '@kbn/ml-anomaly-utils';
import { isAdvancedJobCreator } from '../../../../../common/job_creator';
import { JobCreatorContext } from '../../../job_creator_context';

import { useEstimateBucketSpan, ESTIMATE_STATUS } from './estimate_bucket_span';

interface Props {
  setEstimating(estimating: boolean): void;
}

export const BucketSpanEstimator: FC<Props> = ({ setEstimating }) => {
  const { jobCreator, jobCreatorUpdated } = useContext(JobCreatorContext);
  const { status, estimateBucketSpan } = useEstimateBucketSpan();
  const [noDetectors, setNoDetectors] = useState(jobCreator.detectors.length === 0);
  const [isUsingMlCategory, setIsUsingMlCategory] = useState(checkIsUsingMlCategory());

  useEffect(() => {
    setEstimating(status === ESTIMATE_STATUS.RUNNING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    setNoDetectors(jobCreator.detectors.length === 0);
    setIsUsingMlCategory(checkIsUsingMlCategory());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobCreatorUpdated]);

  function checkIsUsingMlCategory() {
    return (
      isAdvancedJobCreator(jobCreator) &&
      jobCreator.detectors.some((d) => {
        if (
          d.partition_field_name === MLCATEGORY ||
          d.over_field_name === MLCATEGORY ||
          d.by_field_name === MLCATEGORY
        ) {
          return true;
        }
      })
    );
  }

  return (
    <EuiButton
      disabled={
        status === ESTIMATE_STATUS.RUNNING || noDetectors === true || isUsingMlCategory === true
      }
      onClick={estimateBucketSpan}
    >
      <FormattedMessage
        id="xpack.ml.newJob.wizard.pickFieldsStep.bucketSpanEstimatorButton"
        defaultMessage="Estimate bucket span"
      />
    </EuiButton>
  );
};
