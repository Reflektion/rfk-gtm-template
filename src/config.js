const CONFIG = {
  productDetails: {
    position: 10,
    enabledFor: ['a2c', 'orderConfirm', 'statusCart'],
    varPrefix: 'product',
    mappable: true,
    type: 'list',
    template: {
      displayName: 'Product Details',
    },
    keys: {
      sku: {
        position: 1,
        template: {},
      },
      price: {
        position: 4,
        template: {},
      },
      quantity: {
        position: 3,
        template: {},
      },
      fitments: {
        position: 7,
        varPrefix: 'fitments',
        mappable: true,
        type: 'list',
        options: { allowEmpty: false },
        keys: {
          'year': {
            template: {}
          },
          'model': {
            template: {}
          },
          'make': {
            template: {}
          },
          fit_type: {
            varName: 'fitType',
            template: {},
          }
        },
        customMap: () => {

        },
      }
    }
  },
  checkoutDetails: {
    position: 1,
    enabledFor: ['orderConfirm'],
    varPrefix: 'checkout',
    mappable: true,
    type: 'object',
    keys: {
      total: {
        position: 3,
        template: {},
      },
      subtotal: {
        position: 2,
        template: {},
      },
      'order_id': {
        position: 1,
        varName: 'orderId',
        template: {}
      },
    }
  },
  userDetails: {
    position: 5,
    enabledFor: ['userLogin', 'orderConfirm'],
    varPrefix: 'user',
    mappable: true,
    extraProps: [
      'address',
      'attributes'
    ],
    type: 'object',
    keys: {
      id: {
        position: 1,
        template: {}
      },
      email: {
        position: 4,
        template: {}
      },
      eid: {
        template: {}
      },
      fbid: {
        template: {}
      },
      cmid: {
        template: {}
      },
      rpid: {
        template: {}
      },
      first_name: {
        position: 2,
        varName: 'firstName',
        template: {},
      },
      last_name: {
        position: 3,
        varName: 'lastName',
        template: {},
      }
    }
  }
};

const TEMPLATE_HEADER = [
  {
    macrosInSelect: false,
    selectItems: [
      {
        displayValue: 'Beacon',
        value: 'beacon',
      },
      {
        displayValue: 'Context - Product',
        value: 'productContext',
      },
      {
        displayValue: 'Event - Add to Cart',
        value: 'a2c',
      },
      {
        displayValue: 'Event - Order Confirm',
        value: 'orderConfirm',
      },
      {
        displayValue: 'Event - Status Cart',
        value: 'statusCart',
      },
      {
        displayValue: 'Event - User Login',
        value: 'userLogin',
      },
    ],
    displayName: 'Tag Type',
    defaultValue: 'beacon',
    simpleValueType: true,
    name: 'type',
    type: 'SELECT',
  },
  {
    help: 'Customer Key can be found under Developer Resources tab in CEC',
    displayName: 'Customer Key',
    simpleValueType: true,
    name: 'ckey',
    type: 'TEXT',
    valueValidators: [
      {
        type: 'NON_EMPTY',
      },
    ],
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'beacon',
        type: 'EQUALS',
      },
    ],
  },
  {
    macrosInSelect: false,
    selectItems: [
      {
        displayValue: 'Development',
        value: 'uat',
      },
      {
        displayValue: 'Production',
        value: 'prod',
      },
    ],
    displayName: 'Environment',
    defaultValue: 'prod',
    simpleValueType: true,
    name: 'env',
    type: 'SELECT',
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'beacon',
        type: 'EQUALS',
      },
    ],
  },
  {
    help: 'Be sure to allow this URL in the Inject Scripts Permissions. Go to the Template Editor, open the Permissions tab and add the URL as a new line in "Inject Scripts" section.',
    displayName: 'Custom URL',
    simpleValueType: true,
    name: 'customBeaconUrl',
    type: 'TEXT',
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'beacon',
        type: 'EQUALS',
      },
    ],
  },
  {
    help:
      'Comma separated rfkids. Products Context will be applied to all Reflektion widgets in the page if nothing is specified here. See Reflektion Widget Context Technical Guide for details. (Comma separated rfkids entered here will be converted into a list of rfkids)',
    displayName: 'rfkids',
    simpleValueType: true,
    name: 'rfkids',
    type: 'TEXT',
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'productContext',
        type: 'EQUALS',
      },
    ],
  },
  {
    help:
      'List of product SKUs. See Reflektion Widget Context Technical Guide for details',
    displayName: 'SKU List',
    simpleValueType: true,
    name: 'skuList',
    type: 'TEXT',
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'productContext',
        type: 'EQUALS',
      },
    ],
  },
  {
    help:
      'Used in Add To Cart events. Examples: pdp, home, category, cart, qview',
    displayName: 'Page Name',
    simpleValueType: true,
    name: 'pageName',
    type: 'SELECT',
    selectItems: [
      {
        displayValue: 'Product Details Page',
        value: 'pdp',
      },
      {
        displayValue: 'Home',
        value: 'home',
      },
      {
        displayValue: 'Cart',
        value: 'cart',
      },
      {
        displayValue: 'Category',
        value: 'category',
      },
      {
        displayValue: 'Quick View',
        value: 'qview',
      },
    ],
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'a2c',
        type: 'EQUALS',
      },
    ],
  },
  {
    position: 100,
    required: true,
    valueHint: 'Set a product or a list of products var',
    displayName: 'Product Details',
    simpleValueType: true,
    name: 'productDetails',
    type: 'TEXT',
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'a2c',
        type: 'EQUALS',
      },
      {
        paramName: 'type',
        paramValue: 'orderConfirm',
        type: 'EQUALS',
      },
    ],
  },
  {
    position: 50,
    help:
      'Checkout Object. See Reflektion Events API documentation for details. You can map the checkout details selecting a checkout object below checking the "Map checkout properties" checkbox.',
    valueHint: 'Select a checkout object',
    displayName: 'Checkout Details',
    simpleValueType: true,
    name: 'checkoutDetails',
    type: 'TEXT',
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'orderConfirm',
        type: 'EQUALS',
      },
    ],
  },
  {
    position: 50,
    help: 'User Object. See Reflektion Events API documentation for details. You can map the user details selecting a user object below checking the "Map user properties" checkbox.',
    valueHint: 'Select a user object',
    displayName: 'User Details',
    simpleValueType: true,
    name: 'userDetails',
    type: 'TEXT',
    enablingConditions: [
      {
        paramName: 'type',
        paramValue: 'userLogin',
        type: 'EQUALS',
      },
      {
        paramName: 'type',
        paramValue: 'orderConfirm',
        type: 'EQUALS',
      },
    ],
  },
];

module.exports = {
  CONFIG,
  TEMPLATE_HEADER,
};
