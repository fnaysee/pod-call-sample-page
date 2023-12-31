'use strict';

const path = require('path');
const root = path.join(__dirname, '..');
const merge = require('webpack-merge');
const cfg = require("../src/scripts/config")
const fs = require("fs");

modifyIndexTemplate();

function modifyIndexTemplate() {
    var input = __dirname + '/../src/template.html'
        , output = __dirname + '/../src/index.html'
        , content = fs.readFileSync(input, 'utf8')
        , envRegex = new RegExp("{{env}}", 'g')
        , versionRegex = new RegExp("{{version}}", 'g')
        , dateRegex = new RegExp("{{date}}", 'g')
    content = content.replace(envRegex,  cfg.env);
    content = content.replace(versionRegex,  cfg.version);
    content = content.replace(dateRegex,  cfg.date);
    fs.writeFileSync(output, content);
}

module.exports = (env) => {
    let config = {
        entry: {
            main: path.join(root, 'src', 'main')
        },

        output: {
            publicPath: '/',
            filename: 'bundle.js',
            path: path.join(root, 'dist')
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                },
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                    },
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    loader: 'file-loader',
                    options: {
                        outputPath: 'stickers/',
                        name: '[name].[ext]',
                        url: true,
                        publicPath: './stickers/',
                    }
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    loader: 'css-loader',
                    options: {
                        name: '[name].[ext]',
                    },
                }
            ]
        },

        plugins: [],

        devServer: {
            https: true,
            overlay: true
        },
    };

    // Builds
    const build = env && env.production ? 'prod': 'dev';
    config = merge.smart(
        config,
        require(path.join(root, 'webpack', 'builds', `webpack.config.${build}`))
    );

    // Addons
    const addons = getAddons(env);
    addons.forEach((addon) => {
        config = merge.smart(
            config,
            require(path.join(root, 'webpack', 'addons', `webpack.${addon}`))
        )
    });

    console.log(`Build mode: \x1b[33m${config.mode}\x1b[0m`);

    return config;
};

function getAddons(env) {
    if (!env || !env.addons) return [];
    if (typeof env.addons === 'string') return [env.addons];
    return env.addons;
}
