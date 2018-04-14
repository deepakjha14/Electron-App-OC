const path = require('path');

module.exports = {
    "entry":{
        app:'./IPCFiles/src/codemirror.js'
    },
    output:{
        path: path.resolve(__dirname, 'build'),
        filename: 'codemirror.es5.js'
    },
    module:{
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader:'babel-loader',
            query:{
                presets:['env']
            }
        }]
    }
}