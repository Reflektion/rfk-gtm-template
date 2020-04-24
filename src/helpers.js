const path = require('path');
const _get = require('lodash.get');

const { CONFIG, TEMPLATE_HEADER } = require('./config.js');

const KEYS = {};
const upperFirst = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);
const buildPrefix = (...args) => {
  const [first = '', ...rest] = args.filter((arg) => !!arg);
  return `${first}${rest.map((suffix) => upperFirst(suffix)).join('')}`;
};
const buildParentsInputInfoKey = (parents = []) => parents.join('.');
const buildChildInputInfoKey = (parents = [], key) => {
  const parent = buildParentsInputInfoKey(parents);
  return parent ? `${parent}.${key}` : key;
};
const buildParentInputInfoKey = (parents = []) => {
  if (parents.length === 0) {
    return null;
  }
  const parent = parents.slice(-1)[0];
  return buildChildInputInfoKey(parents.slice(0, -1), parent);
};
const saveInputInfo = (parents = [], key, param) => {
  const { varName = key } = param;
  const paramKey = buildChildInputInfoKey(parents, key);
  KEYS[paramKey] = {
    key,
    param: buildInputName(...parents, varName),
    parents,
    varName,
    prefix: buildPrefix(...parents, varName),
  };
};
const getInputInfo = (parents = [], key) => {
  const paramKey = buildChildInputInfoKey(parents, key);
  return KEYS[paramKey];
};
const getParentInputInfo = (parents = []) =>
  KEYS[buildParentInputInfoKey(parents)];
const getParentPrefix = (parents = []) => {
  const { prefix } = getParentInputInfo(parents) || {};
  return prefix;
};
const getInputInfoParam = (parents = [], key) => {
  const { param } = getInputInfo(parents, key) || {};
  return param;
};

const TEMPLATE_CONFIG = {};
const getKey = (...args) =>
  args
    .reverse()
    .filter((arg) => !!arg)
    .join('.');
const getTemplateInput = (key, parent) => TEMPLATE_CONFIG[getKey(key, parent)];
const buildVarName = (key, ...args) => {
  const { prefix = key } = TEMPLATE_CONFIG[key] || {};
  return buildPrefix(prefix, ...args);
};
const buildInputName = (...args) => {
  return buildVarName(...args);
};
const buildTemplateConfig = (config, parent = '') => {
  const keys = Object.keys(config);
  keys.forEach((key, index) => {
    const {
      mappable = false,
      keys: children = {},
      varName = key,
      varPrefix = varName,
      position = 1,
    } = config[key];
    const currentKey = getKey(key, parent);
    const { prefix: parentPrefix, position: parentPosition = 0 } =
      TEMPLATE_CONFIG[parent] || {};
    TEMPLATE_CONFIG[currentKey] = {
      key,
      prefix: buildPrefix(parentPrefix, varPrefix),
      ...config[key],
      position: parentPosition * 50 + index + position,
      parent,
    };
    if (mappable) {
      Object.assign(TEMPLATE_CONFIG, buildTemplateConfig(children, currentKey));
    }
  });

  return TEMPLATE_CONFIG;
};

buildTemplateConfig(CONFIG);

const doBuildParamWithSubParams = (
  name,
  parent,
  subParams = [],
  groupDisplayName
) => {
  return {
    displayName: groupDisplayName,
    name: buildInputName(name, 'group'),
    groupStyle: 'ZIPPY_OPEN_ON_PARAM',
    type: 'GROUP',
    enablingConditions: [
      {
        paramName: buildInputName(getKey(parent), 'mapEnabled'),
        paramValue: true,
        type: 'EQUALS',
      },
    ],
    subParams,
  };
};

const buildParamWithSubParams = (key, parent, subParams = []) => {
  const paramKey = getKey(key, parent);
  const { position } = getTemplateInput(key, parent) || {};

  return {
    position,
    ...doBuildParamWithSubParams(paramKey, parent, subParams, key),
  };
};

const buildParamSubParams = (key, parent) => {
  const { template } = getTemplateInput(key, parent);
  const { varPrefix: parentName = 'Object' } = getTemplateInput(parent);
  const paramKey = getKey(key, parent);

  return [
    {
      type: 'RADIO',
      name: buildInputName(paramKey, 'type'),
      radioItems: [
        {
          value: 'auto',
          displayValue: 'Automatically map property with same name',
        },
        {
          value: 'prop',
          displayValue: `${upperFirst(parentName)} property`,
        },
        {
          value: 'var',
          displayValue: 'Data Layer Variable',
        },
      ],
      simpleValueType: true,
      defaultValue: 'auto',
    },
    {
      simpleValueType: true,
      name: buildInputName(paramKey, 'prop'),
      type: 'TEXT',
      displayName: undefined,
      valueValidators: [{ type: 'NON_EMPTY' }],
      enablingConditions: [
        {
          paramName: buildInputName(paramKey, 'type'),
          paramValue: 'prop',
          type: 'EQUALS',
        },
        {
          paramName: buildInputName(paramKey, 'type'),
          paramValue: 'var',
          type: 'EQUALS',
        },
      ],
      ...template,
    },
  ];
};
const buildParam = (key, parent) => {
  return buildParamWithSubParams(key, parent, buildParamSubParams(key, parent));
};
const buildEnablingConditions = (name, parent) => {
  const { enabledFor = [] } = getTemplateInput(name, parent);
  return enabledFor.map((forKey) => ({
    paramName: 'type',
    paramValue: forKey,
    type: 'EQUALS',
  }));
};
const buildExtraFields = (name, key, extraProps) => {
  if (extraProps.length === 0) {
    return [];
  }

  const subParams = [
    {
      type: 'PARAM_TABLE',
      name: buildInputName(key, 'custom'),
      enablingConditions: [
        {
          paramName: buildInputName(key, 'mapEnabled'),
          paramValue: true,
          type: 'EQUALS',
        },
      ],
      paramTableColumns: [
        {
          param: {
            type: 'SELECT',
            name: 'key',
            displayName: 'Property',
            selectItems: extraProps.map((key) => ({
              value: key,
              displayValue: key,
            })),
            simpleValueType: true,
          },
          isUnique: true,
        },
        {
          param: {
            type: 'SELECT',
            name: 'type',
            displayName: 'Mapping Type',
            selectItems: [
              {
                value: 'auto',
                displayValue: 'Automatically map property with same name',
              },
              {
                value: 'prop',
                displayValue: `${upperFirst(name)} property`,
              },
              {
                value: 'var',
                displayValue: 'Data Layer Variable',
              },
            ],
            simpleValueType: true,
            macrosInSelect: false,
          },
          isUnique: false,
        },
        {
          param: {
            type: 'TEXT',
            name: 'prop',
            displayName: 'Mapping Value',
            simpleValueType: true,
          },
          isUnique: false,
        },
      ],
      editRowTitle: 'Edit Property',
      newRowButtonText: 'New Property',
      newRowTitle: 'New Property',
    },
  ];

  return [
    doBuildParamWithSubParams(
      buildVarName(key, 'custom'),
      key,
      subParams,
      'Other properties'
    ),
  ];
};
const buildMappableVar = (name, parent) => {
  console.log('Build mappable var', name);
  const {
    varPrefix = name,
    keys = {},
    extraProps = [],
    position,
  } = getTemplateInput(name, parent);
  const paramKey = getKey(name, parent);
  const vars = Object.keys(keys);
  return [
    {
      position,
      name: buildInputName(paramKey, 'mapEnabled'),
      type: 'CHECKBOX',
      checkboxText: `Map ${varPrefix} properties`,
      simpleValueType: true,
      enablingConditions: buildEnablingConditions(name, parent),
    },
    ...vars
      .sort((a, b) => {
        const { position: positionA } = getTemplateInput(a, paramKey);
        const { position: positionB } = getTemplateInput(b, paramKey);

        return positionA - positionB;
      })
      .reduce((mem, key) => {
        const { mappable = false } = keys[key];
        if (mappable) {
          return [
            ...mem,
            buildParamWithSubParams(key, paramKey, [
              ...buildParamSubParams(key, paramKey),
              ...buildMappableVar(key, paramKey).map(
                ({ position, ...template }) => template
              ),
            ]),
          ];
        }

        return [...mem, buildParam(key, paramKey)];
      }, []),
    ...buildExtraFields(varPrefix, paramKey, extraProps),
  ];
};

const buildTemplateParametersArray = () => {
  return (
    [
      ...TEMPLATE_HEADER.reduce(
        (mem, { name, required = false, ...template }) => {
          const { [name]: { mappable = false } = {} } = CONFIG;
          if (mappable) {
            const { position } = getTemplateInput(name);
            return [
              ...mem,
              {
                name,
                ...(required
                  ? {
                      valueValidators: [
                        {
                          type: 'NON_EMPTY',
                        },
                      ],
                    }
                  : {}),
                valueHint: 'Set an object or a list of objects',
                simpleValueType: true,
                type: 'TEXT',
                ...template,
                position,
                enablingConditions: buildEnablingConditions(name),
              },
              ...buildMappableVar(name),
            ];
          }

          const { position: templatePosition } = template;
          const { position = templatePosition } = getTemplateInput(name) || {};
          return [
            ...mem,
            {
              name,
              ...template,
              position,
            },
          ];
        },
        []
      ),
    ]
      // .sort(({ position: a = 1 }, { position: b = 1 }) => a - b)
      .map(({ position, ...template }) => template)
  );
};

const countFields = (elements) =>
  elements.reduce(
    (mem, { selectItems = [], subParams = [], radioItems = [] }) => {
      return (
        mem +
        countFields(selectItems) +
        countFields(subParams) +
        countFields(radioItems)
      );
    },
    elements.length
  );

const buildTemplateParameters = () => {
  const fields = buildTemplateParametersArray();
  console.log('# Fields:', countFields(fields));
  return JSON.stringify(fields, null, 2);
};

const getExtraPropVars = (varName, props) => {
  if (props.length === 0) {
    return [];
  }

  return [
    {
      varName,
      type: 'key-value',
    },
  ];
};

const buildTemplateVar = (elements, parent) => {
  return [
    ...elements.reduce((mem, { name, id = name }) => {
      const element = _get(CONFIG, name);

      if (!element) {
        return mem;
      }

      const {
        type,
        mappable = false,
        keys = {},
        extraProps = [],
        options,
      } = element;
      const keysArr = Object.keys(keys).map((key) => ({
        ...keys[key],
        id: key,
        name: `${name}.keys.${key}`,
      }));
      const keyName = getKey(id, parent);
      const varName = buildVarName(keyName);

      if (keysArr.length > 0) {
        return [
          ...mem,
          {
            id,
            varName,
            type,
            options,
            children: mappable
              ? [
                  ...buildTemplateVar(keysArr, keyName),
                  ...getExtraPropVars(
                    buildVarName(keyName, 'custom'),
                    extraProps
                  ),
                ]
              : [],
          },
        ];
      }

      return [
        ...mem,
        {
          id,
          varName,
          options,
        },
      ];
    }, []),
  ];
};

const buildTemplateVars = () => {
  const result = buildTemplateVar(TEMPLATE_HEADER);

  return result.reduce((mem, item) => {
    const { id, ...rest } = item;
    return {
      ...mem,
      [id]: rest,
    };
  }, {});
};

const buildCode = (code) => `const PROPERTIES = ${JSON.stringify(
  buildTemplateVars(),
  null,
  2
)};
${code}`;

const ROOT_DIR = path.resolve(path.join(__dirname, '..'));

function getSrcFilePath(file) {
  return path.join(ROOT_DIR, 'src', file);
}

function getFilePath(file) {
  return path.join(ROOT_DIR, file);
}

module.exports = {
  buildCode,
  buildTemplateParameters,
  buildTemplateParametersArray,
  getSrcFilePath,
  getFilePath,
};
