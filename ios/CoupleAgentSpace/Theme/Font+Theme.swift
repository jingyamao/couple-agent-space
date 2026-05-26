import SwiftUI

extension Font {
    // MARK: - Serif (matching Noto Serif SC from web)

    static let serifLarge = Font.system(size: 28, weight: .bold, design: .serif)
    static let serifTitle = Font.system(size: 22, weight: .semibold, design: .serif)
    static let serifBody = Font.system(size: 16, weight: .regular, design: .serif)

    // MARK: - Sans (matching Geist from web)

    static let sansLarge = Font.system(size: 20, weight: .semibold, design: .default)
    static let sansBody = Font.system(size: 16, weight: .regular, design: .default)
    static let sansSmall = Font.system(size: 14, weight: .regular, design: .default)
    static let sansCaption = Font.system(size: 12, weight: .regular, design: .default)

    // MARK: - Mono (matching Geist Mono from web)

    static let monoSmall = Font.system(size: 13, weight: .medium, design: .monospaced)
}
