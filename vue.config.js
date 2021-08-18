module.exports = {
    chainWebpack: config => {
        config.module.rules.delete('eslint');
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                productName: "eye-guardian",
                appId: "com.example.yourapp",
                extraResources: [
                    {
                        from: "data",
                        to: "data"
                    }
                ],
                dmg: {
                    "contents": [
                        {
                            "x": 410,
                            "y": 150,
                            "type": "link",
                            "path": "/Applications"
                        },
                        {
                            "x": 130,
                            "y": 150,
                            "type": "file"
                        }
                    ]
                },
                mac: {
                    icon: "dist_electron/icons/icon.icns"
                },
                win: {
                    icon: "dist_electron/icons/icon.ico",
                    target: ["nsis"]
                },
                linux: {
                    icon: "dist_electron/icons"
                }
            }
        }
    }
}