const log = require('logToConsole');

/**
 * Gets a param from data layer
 * @param {string} key - Key param
 * @returns {*}
 */
function getParam(key) {
  return data[key];
}

/**
 * Builds a mapping value
 * @param {object} obj - Object to build the value from
 * @param {string} key - Map key
 * @param {string} type - Value map type
 * @param {string} prop - Value map prop
 * @returns {*}
 */
function buildValue(obj, key, type, prop) {
  let value;
  if (type === 'var') {
    // in case it was mapped to a data layer variable
    value = prop;
  } else if (type === 'prop' && obj.hasOwnProperty(prop)) {
    // in case it was mapped to a object prop
    value = obj[prop];
  } else {
    // in case it was mapped automatically
    value = obj[key];
  }

  if (typeof value !== 'undefined') {
    return value;
  }
  return undefined;
}

/**
 * Maps an object based on template configuration
 * @param {object} obj - Object to map
 * @param {object[]} mappedProps - Map of mapped key and props
 * @param {object[]} properties - List of properties to auto map
 * @param {boolean} mappingEnabled - Mapping enabled flag to determine if obj needs to be mapped
 * @returns {object}
 */
function mapObject(obj, mappedProps, properties, mappingEnabled) {
  if (!mappingEnabled) {
    return obj;
  }

  obj = obj || {};

  const result = {};
  let hasKeys = false;

  mappedProps.forEach(function (mapped) {
    let value;
    if (mapped.type === 'key-value') {
      value = mapObject(obj, mapped.value, properties, true);
    } else {
      value = buildValue(obj, mapped.key, mapped.type, mapped.prop);
    }

    if (typeof value !== 'undefined') {
      hasKeys = true;
      if (mapped.mappingEnabled) {
        value = mapVar(value, mapped.config);
      }
      if (mapped.merge) {
        for (let key in value) {
          result[key] = value[key];
        }
      } else {
        result[mapped.key] = value;
      }
    }
  });

  if (hasKeys) {
    return result;
  }

  return undefined;
}

/**
 * Builds a products list mapping its values based on template configuration
 * @param {object[]} objects - objects list to map
 * @param {object[]} mappedProps - map containing the props that will be mapped
 * @param {object[]} properties - all the available props to be mapped
 * @param {boolean} mappingEnabled - Mapping enabled flag to determine if obj needs to be mapped
 * @returns {Array}
 */
function buildList(objects, mappedProps, properties, mappingEnabled) {
  return objects
    .map(function (obj) {
      return mapObject(obj, mappedProps, properties, mappingEnabled);
    })
    .filter(function (item) {
      return !!item;
    });
}

/**
 * Generates the configuration of a specified property to be mapped
 * @param {object} property - property to generate the configuration to be mapped
 * @returns {{type: *, config: ({children}|*), value: (*|*[]), key: *}|{mappingEnabled: boolean, prop: *, type: *, config: ({children}|*), key: *}}
 */
function getMappedProp(property) {
  const key = property.id;
  const varName = property.varName;
  const children = property.children || [];

  if (property.type === 'key-value') {
    const value = getParam(varName);
    if (value) {
      return {
        key: key,
        type: property.type,
        config: property,
        value: getParam(varName),
        merge: true,
      };
    }
  }

  return {
    key: key,
    type: getParam(varName + 'Type'),
    prop: getParam(varName + 'Prop'),
    mappingEnabled: children.length > 0,
    config: property,
  };
}

/**
 * Generates a list of properties to be mapped
 * @param {Array} properties - Object to get the mapped props from
 * @returns {Array}
 */
function getMappedProps(properties) {
  return properties.map(getMappedProp);
}

/**
 * Maps a products list
 * @param {object} obj - Object to map its properties
 * @param {object} config - Configuration to use for mapping obj properties
 * @param {boolean} mappingEnabled - Mapping enabled flag to determine if obj needs to be mapped
 * @returns {object}
 */
function mapItem(obj, config, mappingEnabled) {
  return mapObject(
    obj,
    getMappedProps(config.children),
    config.children,
    mappingEnabled
  );
}

/**
 * Maps a products list
 * @param {object[]|{}} obj - List of products to map
 * @param {object} config - Configuration to use for mapping obj properties
 * @param {boolean} mappingEnabled - Mapping enabled flag to determine if obj needs to be mapped
 * @returns {Array}
 */
function mapItems(obj, config, mappingEnabled) {
  if (typeof obj === 'object' && obj.length >= 0) {
    return buildList(
      obj,
      getMappedProps(config.children),
      config.children,
      mappingEnabled
    );
  }

  const result = mapItem(obj, config, mappingEnabled);
  if (result) {
    return [result];
  }
  if (config.options && !config.options.allowEmpty) {
    return undefined;
  }
  return [];
}

/**
 * Maps an object properties based on a configuration
 * @param {object|object[]} obj - Object to map its properties
 * @param {object} config - Configuration used to map the obj properties
 * @returns {null|Array|object}
 */
function mapVar(obj, config) {
  if (!config) {
    return obj;
  }

  const mappingEnabled = getParam(config.varName + 'MapEnabled');

  if (config.type === 'list') {
    obj = obj || [];
    return mapItems(obj, config, mappingEnabled);
  }

  if (config.type === 'object') {
    return mapItem(obj, config, mappingEnabled);
  }

  return null;
}

/**
 * Injects Reflektion's beacon
 * @param {object} data - Tag data information
 */
function insertBeacon(data) {
  let query = require('queryPermission'),
    injectScript = require('injectScript'),
    customUrl = data.customBeaconUrl,
    beaconUrlMap = {
      uat: 'https://initjs.uat.rfksrv.com/rfk/js/{ckey}/init.js',
      prod: 'https://{dh}-prod.rfksrv.com/rfk/js/{ckey}/init.js',
    },
    ckey = (data.ckey || '').split(' ').join(''),
    dh = ckey.split('-')[1],
    beaconUrl,
    errMsg;

  if (customUrl) {
    beaconUrl = customUrl;
  } else if (ckey && dh && data.env) {
    beaconUrl = beaconUrlMap[data.env]
      .replace('{dh}', dh)
      .replace('{ckey}', ckey);
  } else {
    errMsg = 'Invalid Customer Key';
  }

  if (beaconUrl) {
    if (query('inject_script', beaconUrl)) {
      injectScript(beaconUrl, data.gtmOnSuccess, data.gtmOnFailure);
      log(beaconUrl);
    } else {
      errMsg = 'Failed to load init.js due to URL permissions';
    }
  }

  if (errMsg) {
    log(errMsg);
    data.gtmOnFailure();
  }
}

/**
 * Updates Reflektion's product context
 * @param {object} data - Tag data information
 */
function updateProductContext(data) {
  let createQueue = require('createQueue'),
    skuList = data.skuList,
    rfkids = (data.rfkids || '').split(' ').join(''),
    context,
    rfkPush;
  if (skuList && skuList.length) {
    context = { context: { page: { sku: skuList } } };
    if (rfkids && rfkids.length) {
      if (typeof rfkids == 'string') rfkids = rfkids.split(',');
      context.widget = { rfkids: rfkids };
    }
    rfkPush = createQueue('rfk');
    log('productContext', context);
    rfkPush(['updateContext', context]);
    data.gtmOnSuccess();
  } else {
    log('Invalid SKU List');
    data.gtmOnFailure();
  }
}

/**
 * Pushes a Reflektion event
 * @param {object} data - Tag data information
 */
function pushEvent(data) {
  let createQueue = require('createQueue'),
    errMsg = '',
    eventObject,
    rfkPush;

  switch (data.type) {
    case 'a2c': {
      const pageName = data.pageName;
      if (pageName) {
        const products = mapVar(data.productDetails, PROPERTIES.productDetails);
        if (products.length > 0) {
          eventObject = {
            type: 'a2c',
            name: pageName,
            value: {
              products: products,
            },
          };
        } else {
          errMsg = 'Invalid Products';
        }
      } else {
        errMsg = 'No Page Name specified';
      }
      break;
    }

    case 'statusCart': {
      const products = mapVar(data.productDetails, PROPERTIES.productDetails);
      if (products.length > 0) {
        eventObject = {
          type: 'status',
          name: 'cart',
          value: {
            products: products,
          },
        };
      } else {
        errMsg = 'Invalid Products';
      }
      break;
    }

    case 'orderConfirm': {
      const products = mapVar(data.productDetails, PROPERTIES.productDetails);
      if (products.length > 0) {
        const checkout = mapVar(data.checkoutDetails, PROPERTIES.checkoutDetails);
        if (checkout) {
          const user = mapVar(data.userDetails, PROPERTIES.userDetails);
          eventObject = {
            type: 'order',
            name: 'confirm',
            value: {
              user: user,
              products: products,
              checkout: checkout,
            },
          };
        } else {
          errMsg = 'Invalid Checkout Details';
        }
      } else {
        errMsg = 'Invalid Products';
      }
      break;
    }

    case 'userLogin': {
      const user = mapVar(data.userDetails, PROPERTIES.userDetails);
      if (user) {
        eventObject = {
          type: 'user',
          name: 'login',
          value: {
            user: user,
          },
        };
      } else {
        errMsg = 'Invalid User Details';
      }
      break;
    }
  }

  if (eventObject) {
    log('track', eventObject);
    rfkPush = createQueue('rfk');
    rfkPush(['trackEvent', eventObject]);
    data.gtmOnSuccess();
  } else {
    log(errMsg);
    data.gtmOnFailure();
  }
}

switch (data.type) {
  case 'beacon':
    insertBeacon(data);
    break;
  case 'productContext':
    updateProductContext(data);
    break;
  case 'statusCart':
  case 'a2c':
  case 'orderConfirm':
  case 'userLogin':
    pushEvent(data);
    break;
}
