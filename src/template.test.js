const fs = require('fs-extra');

const { getSrcFilePath, buildCode } = require('./helpers');

async function test(type, data) {
  const code = buildCode(await fs.readFile(getSrcFilePath('template.js')));

  const result = `
  const data = ${JSON.stringify(data, null, 2)};
  data.gtmOnSuccess = () => { console.log('gtmOnSuccess'); };
  data.gtmOnFailure = () => { console.error('gtmOnFailure'); };

  require = (type) => {
    switch (type) {
      case 'createQueue': {
        return (queue) => (...args) => console.log('createQueue', queue, JSON.stringify(...args, null, 2));
      }
      case 'logToConsole': {
        return (...args) => console.log('logToConsole', JSON.stringify(...args, null, 2));
      }
      default:
        return () => {};
    }
  }
  ${code}
`;

  const testFile = getSrcFilePath(`template.test.${type}.tmp.js`);
  await fs.writeFile(testFile, result);
  require(getSrcFilePath(`template.test.${type}.tmp.js`));
  await fs.unlink(testFile);
}

test('user', {
  userDetails: {
    userId: 123321,
    first_name: 'Iñaki',
    last_name: 'Abete',
    userAddress: {
      address1: '123 Rivas st.',
    },
  },
  userCustom: [
    {
      key: 'address',
      type: 'prop',
      prop: 'userAddress',
    },
    {
      key: 'attributes',
      type: 'var',
      prop: {
        attr1: '123',
        attr2: 'ABC',
      },
    },
  ],
  userCmidType: 'auto',
  userMapEnabled: true,
  type: 'userLogin',
  userIdType: 'prop',
  userIdProp: 'userId',
  userRpidType: 'auto',
  userEidType: 'auto',
  userFbidType: 'auto',
  userLastNameType: 'auto',
  userEmailType: 'var',
  userEmailVar: 'inaki.abete@reflektion.com',
  userFirstNameType: 'auto',
  gtmEventId: 0,
});

test('user', {
  type: 'orderConfirm',
  productMapEnabled: false,
  userMapEnabled: true,
  checkoutMapEnabled: false,
  userIdType: 'auto',
  userDetails: {
    a: 11,
    b: '12',
    c: false
  },
  checkoutDetails: {
    d: 21,
    e: '22',
    f: false
  },
  productDetails: {
    g: 31,
    h: '32',
    i: false
  }
});

test('productContext', {
  type: 'productContext',
  skuList: ['sku1', 'sku2', 'sku3'],
  rfkids: 'rfkid_1, rfkid_30,rfkid_31',
});

test('orderConfirm', {
  type: 'orderConfirm',
  productMapEnabled: false,
  userMapEnabled: false,
  checkoutMapEnabled: false,
});

test('a2c', {
  skuId: '123123123',
  productDetails: [{
    price: 32.21,
    fitments: {},
  }, ],
  productFitmentsType: 'var',
  productPriceType: 'auto',
  productFitmentsModelProp: 'myModel',
  productFitmentsFitTypeType: 'prop',
  productFitmentsFitTypeProp: 'type',
  type: 'a2c',
  productQuantityType: 'auto',
  productFitmentsMapEnabled: true,
  pageName: 'pdp',
  productFitmentsProp: {
    year: 2021,
    make: 'custom',
    myModel: 2020,
    type: 'myType'
  },
  productFitmentsModelType: 'prop',
  productFitmentsYearType: 'auto',
  productMapEnabled: true,
  productFitmentsMakeType: 'auto',
  productSkuType: 'var',
  productSkuProp: '123123123',
  gtmEventId: 0,
});
test('a2c', {
  type: 'a2c',
  pageName: 'pdp',
  productMapEnabled: true,
  productSkuType: 'prop',
  productSkuProp: 'skuId',
  productQuantityType: 'prop',
  productQuantityProp: 'extra',
  productDetails: {
    skuId: '123123',
    title: 'abc',
    extra: 1
  }
});
