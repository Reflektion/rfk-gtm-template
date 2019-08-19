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
        "displayValue": "Product Context",
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
    "name": "Beacon",
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
    "displayName": "Product Context",
    "name": "productContext",
    "groupStyle": "ZIPPY_CLOSED",
    "type": "GROUP",
    "subParams": [
      {
        "help": "Comma separated rfkids. Products Context will be applied to all Reflektion widgets in the page, if nothing is specified. Example: rfkid_1,rfkid_2",
        "displayName": "rfkids",
        "simpleValueType": true,
        "name": "rfkids",
        "type": "TEXT"
      },
      {
        "help": "Create a Data Layer variable, populate it with list of SKUs and use the variable here",
        "displayName": "SKU List",
        "simpleValueType": true,
        "name": "skuList",
        "type": "TEXT"
      }
    ]
  },
  {
    "displayName": "Event - Add To Cart",
    "name": "a2c",
    "groupStyle": "ZIPPY_CLOSED",
    "type": "GROUP",
    "subParams": [
      {
        "help": "pdp OR home OR category OR cart OR qview",
        "displayName": "Page Name",
        "simpleValueType": true,
        "name": "name",
        "type": "TEXT"
      },
      {
        "help": "value can be \"S123\" OR [\"S123\", \"S746\"] OR [{ id: \"S123\" }]",
        "displayName": "Product(s)",
        "simpleValueType": true,
        "name": "products",
        "type": "TEXT"
      }
    ]
  },
  {
    "displayName": "Event - Order Confirm",
    "name": "orderConfirm",
    "groupStyle": "ZIPPY_CLOSED",
    "type": "GROUP",
    "subParams": [
      {
        "help": "List of Product Objects. See Reflektion Events API documentation for details",
        "displayName": "Products List",
        "simpleValueType": true,
        "name": "productList",
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
  },
  {
    "displayName": "Event - User Login",
    "name": "userLogin",
    "groupStyle": "ZIPPY_CLOSED",
    "type": "GROUP",
    "subParams": [
      {
        "help": "User Object. See Reflektion Events API documentation for details",
        "displayName": "User Details",
        "simpleValueType": true,
        "name": "userLoginDetails",
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

function getProductList(products, returnSkuList) {
  var additionalKeys = [
    { name: 'price', type: 'number' },
    { name: 'quantity', type: 'number' },
    { name: 'psku', type: 'string' },
    { name: 'price_original', type: 'number' },
    { name: 'price_min', type: 'number' },
    { name: 'price_max', type: 'number' },
    { name: 'price_original_min', type: 'number' },
    { name: 'price_original_max', type: 'number' },
    { name: 'in_stock', type: 'number' },
    { name: 'attributes' }],
    productList = [],
    sku, productItem, key, value;
  if (products && products.length) {
    if (typeof products === 'string') {	//Single SKU string
      productList = returnSkuList ? [products] : [{ sku: products }];
    }
    else if (typeof products === 'object') {
      products.forEach(function (product) {
        if (product) {
          if (typeof product === 'string') { // List of SKU strings
            productList.push(returnSkuList ? product : { sku: product });
          }
          else { // List of Product Objects
            sku = product.id || product.sku;
            if (sku) {
              sku = '' + sku;
              if (returnSkuList) {
                productList.push(sku);
              }
              else {
                productItem = { sku: sku };
                additionalKeys.forEach(function (keyObject) {
                  key = keyObject.name;
                  if (product.hasOwnProperty(key)) {
                    value = product[key];
                    switch (keyObject.type) {
                      case 'number':
                        value = value * 1.0;
                        break;
                      case 'string':
                        value = '' + value;
                        break;
                    }
                    productItem[key] = value;
                  }
                });
                productList.push(productItem);
              }
            }
          }
        }
      });
    }
  }
  return productList;
}

function getUserDetails(userDetails) {
  var userObject;
  if (userDetails) {
    if (typeof userDetails === 'string') {
      userObject = { id: userDetails };
    }
    else if (typeof userDetails === 'object' && userDetails.id) {
      userObject = userDetails;
    }
  }
  return userObject;
}

switch (data.type) {
  case 'beacon':
    var query = require('queryPermission'),
      injectScript = require('injectScript'),
      beaconUrlMap = {
        uat: 'https://initjs.uat.rfksrv.com/rfk/js/{ckey}/init.js',
        prod: 'https://{dh}-prod.rfksrv.com/rfk/js/{ckey}/init.js'
      },
      ckey = (data.ckey || '').split(' ').join(''),
      dh = ckey.split('-')[1],
      beaconUrl;

    if (ckey && dh) {
      beaconUrl = beaconUrlMap[data.env].replace('{dh}', dh).replace('{ckey}', ckey);

      if (query('inject_script', beaconUrl)) {
        injectScript(beaconUrl);
        log(beaconUrl);
      }
      else {
        log('Failed to load init.js due to URL permissions');
      }
    }
    else {
      log('Invalid Customer Key');
    }
    break;

  case 'productContext':
    var setInWindow = require('setInWindow'),
      copyFromWindow = require('copyFromWindow'),
      skuList = getProductList(data.skuList, 1),
      rfkidString = (data.rfkids || '').split(' ').join(''),
      context, rfk;

    if (skuList.length) {
      context = { context: { page: { sku: skuList } } };
      if (rfkidString.length) {
        context.widget = { rfkids: rfkidString.split(',') };
      }
      setInWindow('rfk', []);
      rfk = copyFromWindow('rfk');
      rfk.push(['updateContext', context]);
    }
    else {
      log('Invalid SKU List');
    }
    break;

  case 'a2c':
    var setInWindow = require('setInWindow'),
      copyFromWindow = require('copyFromWindow'),
      productsList = getProductList(data.products),
      pageName = data.name,
      rfk;

    if (pageName) {
      if (productsList && productsList.length) {
        setInWindow('rfk', []);
        rfk = copyFromWindow('rfk');
        rfk.push(['trackEvent', {
          type: 'a2c',
          name: data.name,
          value: { products: productsList }
        }]);
      }
      else {
        log('Invalid Products');
      }
    }
    else {
      log('Invalid Page Name');
    }
    break;

  case 'orderConfirm':
    var setInWindow = require('setInWindow'),
      copyFromWindow = require('copyFromWindow'),
      productsList = getProductList(data.productList),
      checkoutDetails = data.checkoutDetails,
      userDetails = getUserDetails(data.userDetails),
      rfk, value;

    if (productsList && productsList.length) {
      if (checkoutDetails && checkoutDetails.order_id && checkoutDetails.total) {
        value = { products: productsList, checkout: checkoutDetails };
        if (userDetails) {
          value.user = userDetails;
        }
        setInWindow('rfk', []);
        rfk = copyFromWindow('rfk');
        rfk.push(['trackEvent', {
          type: 'order',
          name: 'confirm',
          value: value
        }]);
      }
      else {
        log('Invalid Checkout Details');
      }
    }
    else {
      log('Invalid Products');
    }
    break;

  case 'userLogin':
    var setInWindow = require('setInWindow'),
      copyFromWindow = require('copyFromWindow'),
      userDetails = getUserDetails(data.userLoginDetails),
      rfk;

    if (userDetails) {
      setInWindow('rfk', []);
      rfk = copyFromWindow('rfk');
      rfk.push(['trackEvent', {
        type: 'user',
        name: 'login',
        value: { user: userDetails }
      }]);
    }
    else {
      log('Invalid User Details');
    }
    break;
}

// Call data.gtmOnSuccess when the tag is finished.
data.gtmOnSuccess();


___NOTES___

Created on 8/19/2019, 2:04:17 PM
