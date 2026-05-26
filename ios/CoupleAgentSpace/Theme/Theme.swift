import SwiftUI

enum AppTheme: String, CaseIterable {
    case blue = "blue"
    case pink = "pink"

    var displayName: String {
        switch self {
        case .blue: return "默认蓝"
        case .pink: return "樱花粉"
        }
    }

    var icon: String {
        switch self {
        case .blue: return "heart.fill"
        case .pink: return "heart.circle.fill"
        }
    }
}

// MARK: - Theme Colors

struct ThemeColors {
    let primary: Color
    let primaryLight: Color
    let primaryDark: Color
    let secondary: Color
    let secondaryLight: Color
    let accent: Color

    let bgStart: Color
    let bgMid: Color
    let bgEnd: Color

    let surface: Color
    let surfaceStrong: Color

    let glassBg: Color
    let glassBorder: Color

    let success: Color
    let warning: Color
    let danger: Color

    let textPrimary: Color
    let textSecondary: Color
    let textMuted: Color

    static let blue = ThemeColors(
        primary: Color(red: 0.91, green: 0.30, blue: 0.45),
        primaryLight: Color(red: 0.95, green: 0.50, blue: 0.60),
        primaryDark: Color(red: 0.78, green: 0.20, blue: 0.35),
        secondary: Color(red: 0.55, green: 0.35, blue: 0.75),
        secondaryLight: Color(red: 0.70, green: 0.50, blue: 0.85),
        accent: Color(red: 1.00, green: 0.75, blue: 0.40),
        bgStart: Color(red: 0.98, green: 0.94, blue: 0.96),
        bgMid: Color(red: 0.96, green: 0.92, blue: 0.97),
        bgEnd: Color(red: 0.94, green: 0.90, blue: 0.98),
        surface: Color.white.opacity(0.6),
        surfaceStrong: Color.white.opacity(0.85),
        glassBg: Color.white.opacity(0.25),
        glassBorder: Color.white.opacity(0.35),
        success: Color(red: 0.30, green: 0.75, blue: 0.45),
        warning: Color(red: 1.00, green: 0.75, blue: 0.20),
        danger: Color(red: 0.90, green: 0.30, blue: 0.30),
        textPrimary: Color(red: 0.15, green: 0.10, blue: 0.20),
        textSecondary: Color(red: 0.40, green: 0.35, blue: 0.50),
        textMuted: Color(red: 0.60, green: 0.55, blue: 0.65)
    )

    static let pink = ThemeColors(
        primary: Color(red: 0.95, green: 0.45, blue: 0.55),
        primaryLight: Color(red: 0.98, green: 0.60, blue: 0.68),
        primaryDark: Color(red: 0.85, green: 0.30, blue: 0.42),
        secondary: Color(red: 0.92, green: 0.55, blue: 0.70),
        secondaryLight: Color(red: 0.95, green: 0.68, blue: 0.80),
        accent: Color(red: 1.00, green: 0.80, blue: 0.50),
        bgStart: Color(red: 1.00, green: 0.95, blue: 0.97),
        bgMid: Color(red: 0.99, green: 0.93, blue: 0.96),
        bgEnd: Color(red: 0.97, green: 0.91, blue: 0.95),
        surface: Color.white.opacity(0.6),
        surfaceStrong: Color.white.opacity(0.85),
        glassBg: Color.white.opacity(0.25),
        glassBorder: Color.white.opacity(0.35),
        success: Color(red: 0.30, green: 0.75, blue: 0.45),
        warning: Color(red: 1.00, green: 0.75, blue: 0.20),
        danger: Color(red: 0.90, green: 0.30, blue: 0.30),
        textPrimary: Color(red: 0.18, green: 0.10, blue: 0.22),
        textSecondary: Color(red: 0.45, green: 0.35, blue: 0.50),
        textMuted: Color(red: 0.62, green: 0.55, blue: 0.68)
    )
}

// MARK: - Gradient

struct ThemeGradient {
    static func background(for theme: AppTheme) -> LinearGradient {
        let colors = ThemeColors.colors(for: theme)
        return LinearGradient(
            colors: [colors.bgStart, colors.bgMid, colors.bgEnd],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static func primary(for theme: AppTheme) -> LinearGradient {
        let colors = ThemeColors.colors(for: theme)
        return LinearGradient(
            colors: [colors.primary, colors.primaryLight],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

extension ThemeColors {
    static func colors(for theme: AppTheme) -> ThemeColors {
        switch theme {
        case .blue: return .blue
        case .pink: return .pink
        }
    }
}
