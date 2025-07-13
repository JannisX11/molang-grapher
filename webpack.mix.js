let mix = require('laravel-mix');
let path = require('path');
let fs = require('fs');
const {DefinePlugin} = require('webpack')

process.argv.push('--https')


mix.webpackConfig({
    module: {
        rules: [
			{
				test: /\.png/,
				type: 'asset/inline',
				generator: {
					dataUrl: content => {
						let path = './dist' + content.toString().split('"')[1].replace(/\?.*/, '');
						let base64 = require('fs').readFileSync(path, {encoding: 'base64'});
						return 'data:image/png;base64,' + base64;
					}
				}
			}
		],
	},
	plugins: [
        new DefinePlugin({
            VERSION: `"${require('./package.json').version}"`
        })
	],
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		port: 3000,
		open: true
	}
});

mix.js('src/app.js', 'dist/')
	.vue()
	.setPublicPath('dist');