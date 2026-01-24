// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "MalakaManager",
    platforms: [.macOS(.v12)],
    targets: [
        .executableTarget(
            name: "MalakaManager",
            path: "Sources"
        )
    ]
)
