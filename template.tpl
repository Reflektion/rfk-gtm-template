___INFO___

{
  "displayName": "Reflektion",
  "description": "Template for setting up beacon, context and events",
  "securityGroups": [],
  "id": "cvt_temp_public_id",
  "type": "TAG",
  "version": 1,
  "brand": {
    "displayName": "",
    "id": "brand_dummy"
  },
  "containerContexts": [
    "WEB"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "macrosInSelect": false,
    "selectItems": [
      {
        "displayValue": "Beacon",
        "value": "beacon"
      },
      {
        "displayValue": "Context - Product",
        "value": "productContext"
      },
      {
        "displayValue": "Event - Add To Cart",
        "value": "a2c"
      },
      {
        "displayValue": "Event - Order Confirm",
        "value": "orderConfirm"
      },
      {
        "displayValue": "Event - User Login",
        "value": "userLogin"
      }
    ],
    "displayName": "Tag Type",
    "defaultValue": "beacon",
    "simpleValueType": true,
    "name": "type",
    "type": "SELECT"
  },
  {
    "displayName": "Beacon",
    "name": "beacon",
    "groupStyle": "ZIPPY_CLOSED",
    "type": "GROUP",
    "subParams": [
      {
        "help": "Customer Key can be found under Developer Resources tab in CEC",
        "displayName": "Customer Key",
        "simpleValueType": true,
        "name": "ckey",
        "type": "TEXT"
      },
      {
        "macrosInSelect": false,
        "selectItems": [
          {
            "displayValue": "Development",
            "value": "uat"
          },
          {
            "displayValue": "Production",
            "value": "prod"
          }
        ],
        "displayName": "Environment",
        "defaultValue": "prod",
        "simpleValueType": true,
        "name": "env",
        "type": "SELECT"
      }
    ]
  },
  {
    "displayName": "Context",
    "name": "context",
    "groupStyle": "ZIPPY_CLOSED",
    "type": "GROUP",
    "subParams": [
      {
        "help": "List of rfkids. Products Context will be applied to all Reflektion widgets in the page, if nothing is specified. See Reflektion Widget Context Technical Guide for details",
        "displayName": "rfkids",
        "simpleValueType": true,
        "name": "rfkids",
        "type": "TEXT"
      },
      {
        "help": "List of product SKUs. See Reflektion Widget Context Technical Guide for details",
        "displayName": "SKU List",
        "simpleValueType": true,
        "name": "skuList",
        "type": "TEXT"
      }
    ]
  },
  {
    "displayName": "Event",
    "name": "event",
    "groupStyle": "ZIPPY_CLOSED",
    "type": "GROUP",
    "subParams": [
      {
        "help": "Used in Add To Cart events. Examples: pdp, home, category, cart, qview",
        "displayName": "Page Name",
        "simpleValueType": true,
        "name": "pageName",
        "type": "TEXT"
      },
      {
        "help": "List of Product Objects. See Reflektion Events API documentation for details",
        "displayName": "Product Details",
        "simpleValueType": true,
        "name": "productDetails",
        "type": "TEXT"
      },
      {
        "help": "Checkout Object. See Reflektion Events API documentation for details",
        "displayName": "Checkout Details",
        "simpleValueType": true,
        "name": "checkoutDetails",
        "type": "TEXT"
      },
      {
        "help": "User Object. See Reflektion Events API documentation for details",
        "displayName": "User Details",
        "simpleValueType": true,
        "name": "userDetails",
        "type": "TEXT"
      }
    ]
  }
]


___WEB_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "logging",
        "versionId": "1"
      },
      "param": [
        {
          "key": "environments",
          "value": {
            "type": 1,
            "string": "debug"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "inject_script",
        "versionId": "1"
      },
      "param": [
        {
          "key": "urls",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "https://*.rfksrv.com/*"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "access_globals",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keys",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "key"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  },
                  {
                    "type": 1,
                    "string": "execute"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "rfk"
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": false
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

// Enter your template code here.
var log = require('logToConsole');
log('data =', data);

function insertBeacon(data) {
  var query = require('queryPermission'),
    injectScript = require('injectScript'),
    beaconUrlMap = {
      uat: 'https://initjs.uat.rfksrv.com/rfk/js/{ckey}/init.js',
      prod: 'https://{dh}-prod.rfksrv.com/rfk/js/{ckey}/init.js'
    },
    ckey = (data.ckey || '').split(' ').join(''),
    dh = ckey.split('-')[1],
    beaconUrl, errMsg;

  if (ckey && dh) {
    beaconUrl = beaconUrlMap[data.env].replace('{dh}', dh).replace('{ckey}', ckey);

    if (query('inject_script', beaconUrl)) {
      injectScript(beaconUrl, data.gtmOnSuccess, data.gtmOnFailure);
      log(beaconUrl);
    }
    else {
      errMsg = 'Failed to load init.js due to URL permissions';
    }
  }
  else {
    errMsg = 'Invalid Customer Key';
  }
  if (errMsg) {
    log(errMsg);
    data.gtmOnFailure();
  }
}

function updateProductContext(data) {
  var createQueue = require('createQueue'),
    skuList = data.skuList,
    rfkids = data.rfkids,
    context, rfkPush;

  if (skuList && skuList.length) {
    context = { context: { page: { sku: skuList } } };
    if (rfkids && rfkids.length) {
      context.widget = { rfkids: rfkids };
    }
    rfkPush = createQueue('rfk');
    rfkPush(['updateContext', context]);
    data.gtmOnSuccess();
  }
  else {
    log('Invalid SKU List');
    data.gtmOnFailure();
  }
}

function pushEvent(data) {
  var createQueue = require('createQueue'),
    pageName = data.pageName,
    productsList = data.productDetails,
    checkoutDetails = data.checkoutDetails,
    userDetails = data.userDetails,
    value = {},
    errMsg = '',
    eventObject, rfkPush;

  if (productsList && productsList.length) {
    value.products = productsList;
  }
  if (checkoutDetails) {
    value.checkout = checkoutDetails;
  }
  if (userDetails) {
    value.user = userDetails;
  }

  switch (data.type) {
    case 'a2c':
      if (pageName) {
        if (value.products) {
          eventObject = {
            type: 'a2c',
            name: pageName,
            value: value
          };
        }
        else {
          errMsg = 'Invalid Products';
        }
      }
      else {
        errMsg = 'No Page Name specified';
      }
      break;

    case 'orderConfirm':
      if (value.products) {
        if (value.checkout) {
          eventObject = {
            type: 'order',
            name: 'confirm',
            value: value
          };
        }
        else {
          errMsg = 'Invalid Checkout Details';
        }
      }
      else {
        errMsg = 'Invalid Products';
      }
      break;

    case 'userLogin':
      if (value.user) {
        eventObject = {
          type: 'user',
          name: 'login',
          value: value
        };
      }
      else {
        errMsg = 'Invalid User Details';
      }
      break;
  }

  if (eventObject) {
    rfkPush = createQueue('rfk');
    rfkPush(['trackEvent', eventObject]);
    data.gtmOnSuccess();
  }
  else {
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

  case 'a2c':
  case 'orderConfirm':
  case 'userLogin':
    pushEvent(data);
    break;
}


___NOTES___

Created on 8/20/2019, 1:31:29 PM
