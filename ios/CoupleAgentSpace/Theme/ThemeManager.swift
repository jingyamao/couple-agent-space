import SwiftUI

@Observable
final class ThemeManager {
    var currentTheme: AppTheme {
        didSet {
            UserDefaults.standard.set(currentTheme.rawValue, forKey: themeKey)
        }
    }

    var colors: ThemeColors {
        ThemeColors.colors(for: currentTheme)
    }

    private let themeKey = "couple-agent-space-theme"

    init() {
        let saved = UserDefaults.standard.string(forKey: themeKey) ?? ""
        self.currentTheme = AppTheme(rawValue: saved) ?? .blue
    }

    func toggle() {
        currentTheme = currentTheme == .blue ? .pink : .blue
    }
}

// MARK: - Environment Key

private struct ThemeManagerKey: EnvironmentKey {
    static let defaultValue = ThemeManager()
}

extension EnvironmentValues {
    var themeManager: ThemeManager {
        get { self[ThemeManagerKey.self] }
        set { self[ThemeManagerKey.self] = newValue }
    }
}

// MARK: - View Extension

extension View {
    func themedBackground(_ themeManager: ThemeManager) -> some View {
        self.background(ThemeGradient.background(for: themeManager.currentTheme).ignoresSafeArea())
    }
}
