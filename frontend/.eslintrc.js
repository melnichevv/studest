module.exports = {
    "extends": [
        "prettier",
        "prettier/react",
        "eslint:recommended"
    ],
    "env": {
        "browser": true,
        "commonjs": true,
        "jasmine": true,
        "jest": true,
        "node": true,
        "es6": true,
        "jquery": true
    },
    "globals": {
        "jQuery": true,
        "YJ": true,
        "module": true,
        "require": true,
        "_": true,
        "_opbeat": true,
        "toastr": true
    },
    "parser": "babel-eslint",
    "rules": {
        "curly": [1, "multi-line"],
        "guard-for-in": 1,
        // "indent": ["error", 4],
        "jsx-quotes": [2, "prefer-double"],
        "max-len": [0, 150, 4],
        "no-bitwise": 1,
        "no-console": 0,
        "no-empty": 0,
        "no-undef": 1,
        "no-useless-escape": 0,
        "no-mixed-requires": [0, false],
        "no-redeclare": 1,
        "no-unused-vars": 0,
        "object-curly-spacing": [1, "always"],
        "prettier/prettier": ["error"],
        "react/display-name": 0,
        "react/jsx-no-undef": 2,
        "react/jsx-sort-props": 0,
        "react/jsx-uses-react": 1,
        "react/jsx-uses-vars": 1,
        "react/jsx-wrap-multilines": 2,
        "react/no-did-mount-set-state": 2,
        "react/no-did-update-set-state": 2,
        "react/no-multi-comp": 0,
        "react/no-unknown-property": 1,
        "react/prop-types": 0,
        "react/react-in-jsx-scope": 1,
        "react/self-closing-comp": 1,
        "semi": [1, "always"],
        "strict": [1, "safe"],
        "vars-on-top": 0,
        "graphql/template-strings": ["error", {
            // Import default settings for your GraphQL client. Supported values:
            // "apollo", "relay", "lokka", "literal"
            env: "apollo",

            // Import your schema JSON here
            // schemaJson: require("./schema.graphql"),
            projectName: "studest",

            // OR provide absolute path to your schema JSON
            // schemaJsonFilepath: path.resolve(__dirname, "./schema.json"),

            // OR provide the schema in the Schema Language format
            // schemaString: printSchema(schema),

            // tagName is gql by default
        }]
    },

    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true,
            "spread": true
        }
    },

    "settings": {
      "react": {
        "createClass": "createReactClass",
        // Regex for Component Factory to use,
        // default to "createReactClass"
        "pragma": "React",
        // Pragma to use, default to "React"
        "version": "15.0",
        // React version, default to the latest React stable release
        "flowVersion": "0.53"
        // Flow version
      },
      "propWrapperFunctions": [
        "forbidExtraProps"
      ]
      // The names of any functions used to wrap the
      // propTypes object, e.g. `forbidExtraProps`.
      // If this isn"t set, any propTypes wrapped in
      // a function will be skipped.
    },

    "plugins": [
        "jasmine",
        "react",
        "prettier",
        "graphql"
    ]
};