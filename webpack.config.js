var path = require('path');
const webpack = require('webpack');

// 경로 변수 정의
const salesPath = './components/sales/';
const pricePath = './components/price/';
const productPath = './components/product/';
const customerPath = './components/customer/';
const hrPath = './components/hr/';

module.exports = {
    context: path.resolve(__dirname, 'src/main/react'),
    entry: {
        login: './components/auth/Login.js',
        main: './components/main/Main.js',

        order: `${salesPath}Order.js`,
        orderList: `${salesPath}OrderList.js`,
        orderReport: `${salesPath}OrderReport.js`,

        productList: `${productPath}ProductList.js`,
        productPrice: `${pricePath}Price.js`,
        productCategory: `${productPath}ProductCategory.js`,

        customerList: `${customerPath}CustomerList.js`,

        employeeList: `${hrPath}EmployeeList.js`,
        employeeRegister: `${hrPath}EmployeeRegister.js`,
    },

    devtool: "eval-cheap-module-source-map", // ✔ FIXED (comma, not semicolon)
    cache: true,

    output: {
        path: path.resolve(__dirname, 'src/main/resources/static/bundle'),
        filename: '[name].bundle.js'
    },

    mode: 'none',

    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: { fullySpecified: false }
            },
            {
                test: /\.js?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            context: 'src/main/react',
                        },
                    },
                ],
            }
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),

        function () {
            this.hooks.done.tap('DonePlugin', (stats) => {
                const now = new Date().toLocaleString();
                console.log("\x1b[31m%s\x1b[0m", "\n\n\n=============================================");
                console.log("\x1b[31m%s\x1b[0m", `${now} 빌드 완료`);
                console.log("\x1b[31m%s\x1b[0m", "=============================================");
            });
        },
    ],

    resolve: {
        fallback: {
            process: require.resolve('process/browser'),
            url: require.resolve('url/')
        },
        alias: {
            process: 'process/browser',
        }
    }
};
