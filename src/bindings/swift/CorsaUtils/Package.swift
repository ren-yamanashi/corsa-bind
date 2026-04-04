// swift-tools-version: 6.1

import PackageDescription

let package = Package(
    name: "CorsaUtils",
    products: [
        .library(name: "CorsaUtils", targets: ["CorsaUtils"]),
    ],
    targets: [
        .target(name: "CorsaUtils"),
        .testTarget(
            name: "CorsaUtilsTests",
            dependencies: ["CorsaUtils"]
        ),
    ]
)
