/**
  @module @ember-data/store
*/
import { assert } from '@ember/debug';

import { importSync } from '@embroider/macros';

import { DEBUG } from '@ember-data/env';
import type { CollectionEdge } from '@ember-data/graph/-private/edges/collection';
import { ResourceEdge } from '@ember-data/graph/-private/edges/resource';
import { HAS_JSON_API_PACKAGE } from '@ember-data/packages';
import type Store from '@ember-data/store';
import { CollectionRelationship } from '@ember-data/types/cache/relationship';
import type { ChangedAttributesHash } from '@ember-data/types/q/cache';
import type { StableRecordIdentifier } from '@ember-data/types/q/identifier';
import type { OptionsHash } from '@ember-data/types/q/minimum-serializer-interface';
import type { AttributeSchema, RelationshipSchema } from '@ember-data/types/q/record-data-schemas';
import type { RecordInstance } from '@ember-data/types/q/record-instance';
import type { FindOptions } from '@ember-data/types/q/store';

type RecordId = string | null;

/**
  Snapshot is not directly instantiable.
  Instances are provided to a consuming application's
  adapters and serializers for certain requests.

  Snapshots are only available when using `@ember-data/legacy-compat`
  for legacy compatibility with adapters and serializers.

  @class Snapshot
  @public
*/
export default class Snapshot implements Snapshot {
  declare __attributes: Record<string, unknown> | null;
  declare _belongsToRelationships: Record<string, Snapshot>;
  declare _belongsToIds: Record<string, RecordId>;
  declare _hasManyRelationships: Record<string, Snapshot[]>;
  declare _hasManyIds: Record<string, RecordId[]>;
  declare _changedAttributes: ChangedAttributesHash;

  declare identifier: StableRecordIdentifier;
  declare modelName: string;
  declare id: string | null;
  declare include?: unknown;
  declare adapterOptions?: Record<string, unknown>;
  declare _store: Store;

  /**
   * @method constructor
   * @constructor
   * @private
   * @param options
   * @param identifier
   * @param _store
   */
  constructor(options: FindOptions, identifier: StableRecordIdentifier, store: Store) {
    this._store = store;

    this.__attributes = null;
    this._belongsToRelationships = Object.create(null) as Record<string, Snapshot>;
    this._belongsToIds = Object.create(null) as Record<string, RecordId>;
    this._hasManyRelationships = Object.create(null) as Record<string, Snapshot[]>;
    this._hasManyIds = Object.create(null) as Record<string, RecordId[]>;

    const hasRecord = !!store._instanceCache.peek(identifier);
    this.modelName = identifier.type;

    /**
      The unique RecordIdentifier associated with this Snapshot.

      @property identifier
      @public
      @type {StableRecordIdentifier}
    */
    this.identifier = identifier;

    /*
      If the we do not yet have a record, then we are
      likely a snapshot being provided to a find request, so we
      populate __attributes lazily. Else, to preserve the "moment
      in time" in which a snapshot is created, we greedily grab
      the values.
     */
    if (hasRecord) {
      this._attributes;
    }

    /**
     The id of the snapshot's underlying record

     Example

     ```javascript
     // store.push('post', { id: 1, author: 'Tomster', title: 'Ember.js rocks' });
     postSnapshot.id; // => '1'
     ```

     @property id
     @type {String}
     @public
     */
    this.id = identifier.id;

    /**
     A hash of adapter options
     @property adapterOptions
     @type {Object}
     @public
     */
    this.adapterOptions = options.adapterOptions;

    /**
     If `include` was passed to the options hash for the request, the value
     would be available here.

     @property include
     @type {String|Array}
     @public
     */
    this.include = options.include;

    /**
     The name of the type of the underlying record for this snapshot, as a string.

     @property modelName
     @type {String}
     @public
     */
    this.modelName = identifier.type;
    if (hasRecord) {
      const cache = this._store.cache;
      this._changedAttributes = cache.changedAttrs(identifier);
    }
  }

  /**
   The underlying record for this snapshot. Can be used to access methods and
   properties defined on the record.

   Example

   ```javascript
   let json = snapshot.record.toJSON();
   ```

   @property record
   @type {Model}
   @public
   */
  get record(): RecordInstance | null {
    const record = this._store.peekRecord(this.identifier);
    assert(
      `Record ${this.identifier.type} ${this.identifier.id} (${this.identifier.lid}) is not yet loaded and thus cannot be accessed from the Snapshot during serialization`,
      record !== null
    );
    return record;
  }

  get _attributes(): Record<string, unknown> {
    if (this.__attributes !== null) {
      return this.__attributes;
    }
    const attributes = (this.__attributes = Object.create(null) as Record<string, unknown>);
    const { identifier } = this;
    const attrs = Object.keys(this._store.getSchemaDefinitionService().attributesDefinitionFor(identifier));
    const cache = this._store.cache;

    attrs.forEach((keyName) => {
      attributes[keyName] = cache.getAttr(identifier, keyName);
    });

    return attributes;
  }

  get isNew(): boolean {
    const cache = this._store.cache;
    return cache?.isNew(this.identifier) || false;
  }

  /**
   Returns the value of an attribute.

   Example

   ```javascript
   // store.push('post', { id: 1, author: 'Tomster', title: 'Ember.js rocks' });
   postSnapshot.attr('author'); // => 'Tomster'
   postSnapshot.attr('title'); // => 'Ember.js rocks'
   ```

   Note: Values are loaded eagerly and cached when the snapshot is created.

   @method attr
   @param {String} keyName
   @return {Object} The attribute value or undefined
   @public
   */
  attr(keyName: string): unknown {
    if (keyName in this._attributes) {
      return this._attributes[keyName];
    }
    assert(`Model '${this.identifier.lid}' has no attribute named '${keyName}' defined.`, false);
  }

  /**
   Returns all attributes and their corresponding values.

   Example

   ```javascript
   // store.push('post', { id: 1, author: 'Tomster', title: 'Ember.js rocks' });
   postSnapshot.attributes(); // => { author: 'Tomster', title: 'Ember.js rocks' }
   ```

   @method attributes
   @return {Object} All attributes of the current snapshot
   @public
   */
  attributes(): Record<string, unknown> {
    return { ...this._attributes };
  }

  /**
   Returns all changed attributes and their old and new values.

   Example

   ```javascript
   // store.push('post', { id: 1, author: 'Tomster', title: 'Ember.js rocks' });
   postModel.set('title', 'Ember.js rocks!');
   postSnapshot.changedAttributes(); // => { title: ['Ember.js rocks', 'Ember.js rocks!'] }
   ```

   @method changedAttributes
   @return {Object} All changed attributes of the current snapshot
   @public
   */
  changedAttributes(): ChangedAttributesHash {
    let changedAttributes = Object.create(null) as ChangedAttributesHash;
    if (!this._changedAttributes) {
      return changedAttributes;
    }

    let changedAttributeKeys = Object.keys(this._changedAttributes);

    for (let i = 0, length = changedAttributeKeys.length; i < length; i++) {
      let key = changedAttributeKeys[i];
      changedAttributes[key] = this._changedAttributes[key].slice() as [unknown, unknown];
    }

    return changedAttributes;
  }

  /**
   Returns the current value of a belongsTo relationship.

   `belongsTo` takes an optional hash of options as a second parameter,
   currently supported options are:

   - `id`: set to `true` if you only want the ID of the related record to be
   returned.

   Example

   ```javascript
   // store.push('post', { id: 1, title: 'Hello World' });
   // store.createRecord('comment', { body: 'Lorem ipsum', post: post });
   commentSnapshot.belongsTo('post'); // => Snapshot
   commentSnapshot.belongsTo('post', { id: true }); // => '1'

   // store.push('comment', { id: 1, body: 'Lorem ipsum' });
   commentSnapshot.belongsTo('post'); // => undefined
   ```

   Calling `belongsTo` will return a new Snapshot as long as there's any known
   data for the relationship available, such as an ID. If the relationship is
   known but unset, `belongsTo` will return `null`. If the contents of the
   relationship is unknown `belongsTo` will return `undefined`.

   Note: Relationships are loaded lazily and cached upon first access.

   @method belongsTo
   @param {String} keyName
   @param {Object} [options]
   @public
   @return {(Snapshot|String|null|undefined)} A snapshot or ID of a known
   relationship or null if the relationship is known but unset. undefined
   will be returned if the contents of the relationship is unknown.
   */
  belongsTo(keyName: string, options?: { id?: boolean }): Snapshot | RecordId | undefined {
    let returnModeIsId = !!(options && options.id);
    let result: Snapshot | RecordId | undefined;
    let store = this._store;

    if (returnModeIsId === true && keyName in this._belongsToIds) {
      return this._belongsToIds[keyName];
    }

    if (returnModeIsId === false && keyName in this._belongsToRelationships) {
      return this._belongsToRelationships[keyName];
    }

    let relationshipMeta = store.getSchemaDefinitionService().relationshipsDefinitionFor({ type: this.modelName })[
      keyName
    ];
    assert(
      `Model '${this.identifier.lid}' has no belongsTo relationship named '${keyName}' defined.`,
      relationshipMeta && relationshipMeta.kind === 'belongsTo'
    );

    // TODO @runspired it seems this code branch would not work with CUSTOM_MODEL_CLASSes
    // this check is not a regression in behavior because relationships don't currently
    // function without access to intimate API contracts between RecordData and Model.
    // This is a requirement we should fix as soon as the relationship layer does not require
    // this intimate API usage.
    if (!HAS_JSON_API_PACKAGE) {
      assert(`snapshot.belongsTo only supported when using the package @ember-data/json-api`);
    }

    const graphFor = (importSync('@ember-data/graph/-private') as typeof import('@ember-data/graph/-private')).graphFor;
    const { identifier } = this;

    if (DEBUG) {
      const relationship = graphFor(this._store).get(identifier, keyName) as ResourceEdge;
      assert(
        `You looked up the ${keyName} belongsTo relationship for { type: ${identifier.type}, id: ${
          identifier.id || ''
        }, lid: ${identifier.lid} but no such relationship was found.`,
        relationship
      );
      assert(
        `You looked up the ${keyName} belongsTo relationship for { type: ${identifier.type}, id: ${
          identifier.id || ''
        }, lid: ${identifier.lid} but that relationship is a hasMany.`,
        relationship.definition.kind === 'belongsTo'
      );
    }

    let value = graphFor(this._store).getData(identifier, keyName);
    let data = value && value.data;

    let inverseIdentifier = data ? store.identifierCache.getOrCreateRecordIdentifier(data) : null;

    if (value && value.data !== undefined) {
      const cache = store.cache;

      if (inverseIdentifier && !cache.isDeleted(inverseIdentifier)) {
        if (returnModeIsId) {
          result = inverseIdentifier.id;
        } else {
          result = store._fetchManager.createSnapshot(inverseIdentifier);
        }
      } else {
        result = null;
      }
    }

    if (returnModeIsId) {
      this._belongsToIds[keyName] = result as RecordId;
    } else {
      this._belongsToRelationships[keyName] = result as Snapshot;
    }

    return result;
  }

  /**
   Returns the current value of a hasMany relationship.

   `hasMany` takes an optional hash of options as a second parameter,
   currently supported options are:

   - `ids`: set to `true` if you only want the IDs of the related records to be
   returned.

   Example

   ```javascript
   // store.push('post', { id: 1, title: 'Hello World', comments: [2, 3] });
   postSnapshot.hasMany('comments'); // => [Snapshot, Snapshot]
   postSnapshot.hasMany('comments', { ids: true }); // => ['2', '3']

   // store.push('post', { id: 1, title: 'Hello World' });
   postSnapshot.hasMany('comments'); // => undefined
   ```

   Note: Relationships are loaded lazily and cached upon first access.

   @method hasMany
   @param {String} keyName
   @param {Object} [options]
   @public
   @return {(Array|undefined)} An array of snapshots or IDs of a known
   relationship or an empty array if the relationship is known but unset.
   undefined will be returned if the contents of the relationship is unknown.
   */
  hasMany(keyName: string, options?: { ids?: boolean }): RecordId[] | Snapshot[] | undefined {
    let returnModeIsIds = !!(options && options.ids);
    let results: RecordId[] | Snapshot[] | undefined;
    let cachedIds: RecordId[] | undefined = this._hasManyIds[keyName];
    let cachedSnapshots: Snapshot[] | undefined = this._hasManyRelationships[keyName];

    if (returnModeIsIds === true && keyName in this._hasManyIds) {
      return cachedIds;
    }

    if (returnModeIsIds === false && keyName in this._hasManyRelationships) {
      return cachedSnapshots;
    }

    let store = this._store;
    let relationshipMeta = store.getSchemaDefinitionService().relationshipsDefinitionFor({ type: this.modelName })[
      keyName
    ];
    assert(
      `Model '${this.identifier.lid}' has no hasMany relationship named '${keyName}' defined.`,
      relationshipMeta && relationshipMeta.kind === 'hasMany'
    );

    // TODO @runspired it seems this code branch would not work with CUSTOM_MODEL_CLASSes
    // this check is not a regression in behavior because relationships don't currently
    // function without access to intimate API contracts between RecordData and Model.
    // This is a requirement we should fix as soon as the relationship layer does not require
    // this intimate API usage.
    if (!HAS_JSON_API_PACKAGE) {
      assert(`snapshot.hasMany only supported when using the package @ember-data/json-api`);
    }

    const graphFor = (importSync('@ember-data/graph/-private') as typeof import('@ember-data/graph/-private')).graphFor;
    const { identifier } = this;
    if (DEBUG) {
      const relationship = graphFor(this._store).get(identifier, keyName) as CollectionEdge;
      assert(
        `You looked up the ${keyName} hasMany relationship for { type: ${identifier.type}, id: ${
          identifier.id || ''
        }, lid: ${identifier.lid} but no such relationship was found.`,
        relationship
      );
      assert(
        `You looked up the ${keyName} hasMany relationship for { type: ${identifier.type}, id: ${
          identifier.id || ''
        }, lid: ${identifier.lid} but that relationship is a belongsTo.`,
        relationship.definition.kind === 'hasMany'
      );
    }

    let value = graphFor(this._store).getData(identifier, keyName) as CollectionRelationship;

    if (value.data) {
      results = [];
      value.data.forEach((member) => {
        let inverseIdentifier = store.identifierCache.getOrCreateRecordIdentifier(member);
        const cache = store.cache;

        if (!cache.isDeleted(inverseIdentifier)) {
          if (returnModeIsIds) {
            (results as RecordId[]).push(inverseIdentifier.id);
          } else {
            (results as Snapshot[]).push(store._fetchManager.createSnapshot(inverseIdentifier));
          }
        }
      });
    }

    // we assign even if `undefined` so that we don't reprocess the relationship
    // on next access. This works with the `keyName in` checks above.
    if (returnModeIsIds) {
      this._hasManyIds[keyName] = results as RecordId[];
    } else {
      this._hasManyRelationships[keyName] = results as Snapshot[];
    }

    return results;
  }

  /**
    Iterates through all the attributes of the model, calling the passed
    function on each attribute.

    Example

    ```javascript
    snapshot.eachAttribute(function(name, meta) {
      // ...
    });
    ```

    @method eachAttribute
    @param {Function} callback the callback to execute
    @param {Object} [binding] the value to which the callback's `this` should be bound
    @public
  */
  eachAttribute(callback: (key: string, meta: AttributeSchema) => void, binding?: unknown): void {
    let attrDefs = this._store.getSchemaDefinitionService().attributesDefinitionFor(this.identifier);
    Object.keys(attrDefs).forEach((key) => {
      callback.call(binding, key, attrDefs[key]);
    });
  }

  /**
    Iterates through all the relationships of the model, calling the passed
    function on each relationship.

    Example

    ```javascript
    snapshot.eachRelationship(function(name, relationship) {
      // ...
    });
    ```

    @method eachRelationship
    @param {Function} callback the callback to execute
    @param {Object} [binding] the value to which the callback's `this` should be bound
    @public
  */
  eachRelationship(callback: (key: string, meta: RelationshipSchema) => void, binding?: unknown): void {
    let relationshipDefs = this._store.getSchemaDefinitionService().relationshipsDefinitionFor(this.identifier);
    Object.keys(relationshipDefs).forEach((key) => {
      callback.call(binding, key, relationshipDefs[key]);
    });
  }

  /**
    Serializes the snapshot using the serializer for the model.

    Example

    ```app/adapters/application.js
    import Adapter from '@ember-data/adapter';

    export default Adapter.extend({
      createRecord(store, type, snapshot) {
        let data = snapshot.serialize({ includeId: true });
        let url = `/${type.modelName}`;

        return fetch(url, {
          method: 'POST',
          body: data,
        }).then((response) => response.json())
      }
    });
    ```

    @method serialize
    @param {Object} options
    @return {Object} an object whose values are primitive JSON values only
    @public
   */
  serialize(options?: OptionsHash): unknown {
    const serializer = this._store.serializerFor(this.modelName);
    assert(`Cannot serialize record, no serializer found`, serializer);
    return serializer.serialize(this, options);
  }
}
