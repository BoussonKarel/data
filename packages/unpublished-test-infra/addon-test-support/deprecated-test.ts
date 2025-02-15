import { type TestContext } from '@ember/test-helpers';

import { skip, test } from 'qunit';

import { DEBUG } from '@ember-data/env';
import VERSION, { COMPAT_VERSION } from '@ember-data/unpublished-test-infra/test-support/version';

// small comparison function for major and minor semver values
function gte(EDVersion: string, DeprecationVersion: string): boolean {
  let _edv = EDVersion.split('.');
  let _depv = DeprecationVersion.split('.');
  // compare major
  let major = +_edv[0] >= +_depv[0];
  // compare minor
  let minor = +_edv[1] >= +_depv[1];
  return major || minor;
}

export function deprecatedTest(
  testName: string,
  deprecation: {
    until: `${number}.${number}`;
    id: string;
    count: number;
    // this test should only run in debug mode
    debugOnly?: boolean;
    // this test should remain in the codebase but
    // should be refactored to no longer use the deprecated feature
    refactor?: boolean;
  },
  testCallback: <T extends TestContext>(this: T, assert: Assert) => void | Promise<void>
) {
  // '4.0'
  if (typeof deprecation.until !== 'string' || deprecation.until.length < 3) {
    throw new Error(`deprecatedTest expects { until } to be a version.`);
  }
  // 'ds.<some-name>'
  if (typeof deprecation.id !== 'string' || deprecation.id.length < 8) {
    throw new Error(`deprecatedTest expects { id } to be a meaningful string`);
  }

  async function interceptor<T extends TestContext>(this: T, assert: Assert) {
    await testCallback.call(this, assert);
    if (DEBUG) {
      // @ts-expect-error test is not typed correctly
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (typeof assert.test.expected === 'number') {
        // @ts-expect-error test is not typed correctly
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        assert.test.expected += 1;
      }
      assert.expectDeprecation(deprecation);
    }
  }

  let testFn = test;
  if (COMPAT_VERSION && gte(COMPAT_VERSION, VERSION)) {
    testFn = skip;
  }
  if (!DEBUG) {
    if (deprecation.debugOnly) {
      testFn = skip;
    }
  }

  if (gte(VERSION, deprecation.until)) {
    testFn(`DEPRECATION ${deprecation.id} until ${deprecation.until} | ${testName}`, interceptor);
  } else {
    testFn(`DEPRECATION ${deprecation.id} until ${deprecation.until} | ${testName}`, function (assert) {
      if (deprecation.refactor === true) {
        assert.ok(false, 'This test includes use of a deprecated feature that should now be refactored.');
      } else {
        assert.ok(false, 'This test is for a deprecated feature whose time has come and should be removed');
      }
    });
  }
}
