/* global require */
import { module, test } from 'qunit';

import { setupTest } from 'ember-qunit';

import Store from '@ember-data/store';

function assertPackageNotPresent(packageName, assert) {
  const entries = Object.keys(require.entries);
  const entriesFromPackage = entries.filter((m) => m.indexOf(packageName) === 0);
  const importedDependencies = {};
  const entriesImportingPackage = entries.filter((m) => {
    const deps = require.entries[m].deps;
    const moduleDeps = deps.filter((d) => d.indexOf(packageName) === 0);

    if (moduleDeps.length) {
      importedDependencies[m] = moduleDeps;
    }
    return moduleDeps.length > 0;
  });

  assert.ok(entries.length > 0, 'We have modules');
  assert.ok(
    entriesFromPackage.length === 0,
    `We expect no modules from ${packageName} ${
      entriesFromPackage.length > 0 ? `found: [\n\t"${entriesFromPackage.join('",\n\t"')}"\n]` : ''
    }`
  );
  assert.ok(
    entriesImportingPackage.length === 0,
    `We expect no modules with dependencies on ${packageName} ${
      entriesImportingPackage.length > 0 ? `found:\n${JSON.stringify(importedDependencies, null, 2)}` : ''
    }`
  );
}

module('Record-data Encapsulation - Smoke Tests', function (hooks) {
  setupTest(hooks);
  hooks.beforeEach(function () {
    this.owner.register('service:store', Store);
  });

  test('No @ember-data/json-api modules are present', function (assert) {
    assertPackageNotPresent('@ember-data/json-api', assert);
  });

  test('No ember-data modules are present', function (assert) {
    assertPackageNotPresent('ember-data', assert);
  });
});
