/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { UI_SETTINGS } from '../../../constants';
import { GetConfigFn } from '../../../types';
import { getSearchParams, getSearchParamsFromRequest } from './get_search_params';
import { createStubDataView } from '@kbn/data-views-plugin/common/data_views/data_view.stub';

function getConfigStub(config: any = {}): GetConfigFn {
  return (key) => config[key];
}

describe('getSearchParams', () => {
  test('includes custom preference', () => {
    const config = getConfigStub({
      [UI_SETTINGS.COURIER_SET_REQUEST_PREFERENCE]: 'custom',
      [UI_SETTINGS.COURIER_CUSTOM_REQUEST_PREFERENCE]: 'aaa',
    });
    const searchParams = getSearchParams(config);
    expect(searchParams.preference).toBe('aaa');
  });

  test('extracts track total hits', () => {
    const getConfig = getConfigStub({
      [UI_SETTINGS.COURIER_SET_REQUEST_PREFERENCE]: 'custom',
      [UI_SETTINGS.COURIER_CUSTOM_REQUEST_PREFERENCE]: 'aaa',
    });
    const searchParams = getSearchParamsFromRequest(
      {
        index: 'abc',
        body: {
          query: 123,
          track_total_hits: true,
        },
      },
      { getConfig }
    );
    expect(searchParams.index).toBe('abc');
    // @ts-expect-error `track_total_hits` not allowed at top level for `typesWithBodyKey`
    expect(searchParams.track_total_hits).toBe(true);
    expect(searchParams.body).toStrictEqual({
      query: 123,
    });
  });

  test('sets expand_wildcards=all if data view has allowHidden=true', () => {
    const getConfig = getConfigStub({
      [UI_SETTINGS.COURIER_SET_REQUEST_PREFERENCE]: 'custom',
      [UI_SETTINGS.COURIER_CUSTOM_REQUEST_PREFERENCE]: 'aaa',
    });
    const index = createStubDataView({
      spec: {
        allowHidden: true,
      },
    });
    const searchParams = getSearchParamsFromRequest(
      {
        index,
        body: {
          query: 123,
          track_total_hits: true,
        },
      },
      { getConfig }
    );
    expect(searchParams).toHaveProperty('expand_wildcards', 'all');
  });

  test('does not set expand_wildcards if data view has allowHidden=false', () => {
    const getConfig = getConfigStub({
      [UI_SETTINGS.COURIER_SET_REQUEST_PREFERENCE]: 'custom',
      [UI_SETTINGS.COURIER_CUSTOM_REQUEST_PREFERENCE]: 'aaa',
    });
    const index = createStubDataView({
      spec: {
        allowHidden: false,
      },
    });
    const searchParams = getSearchParamsFromRequest(
      {
        index,
        body: {
          query: 123,
          track_total_hits: true,
        },
      },
      { getConfig }
    );
    expect(searchParams).not.toHaveProperty('expand_wildcards', 'all');
  });
});
