import SwiftUI

enum CASButtonVariant {
    case primary
    case secondary
    case ghost
    case outline
    case danger
}

enum CASButtonSize {
    case sm, md, lg

    var fontSize: Font {
        switch self {
        case .sm: return .sansSmall
        case .md: return .sansBody
        case .lg: return .sansLarge
        }
    }

    var padding: EdgeInsets {
        switch self {
        case .sm: return EdgeInsets(top: 6, leading: 12, bottom: 6, trailing: 12)
        case .md: return EdgeInsets(top: 10, leading: 20, bottom: 10, trailing: 20)
        case .lg: return EdgeInsets(top: 14, leading: 28, bottom: 14, trailing: 28)
        }
    }
}

struct CASButton: View {
    let title: String
    let variant: CASButtonVariant
    let size: CASButtonSize
    let isLoading: Bool
    let isDisabled: Bool
    let action: () -> Void

    @Environment(\.themeManager) private var themeManager

    init(
        _ title: String,
        variant: CASButtonVariant = .primary,
        size: CASButtonSize = .md,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.variant = variant
        self.size = size
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                        .tint(foregroundColor)
                }
                Text(title)
                    .font(size.fontSize)
                    .fontWeight(.medium)
            }
            .padding(size.padding)
            .frame(maxWidth: variant == .primary || variant == .danger ? .infinity : nil)
            .background(backgroundView)
            .foregroundColor(foregroundColor)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: variant == .outline ? 1.5 : 0)
            )
        }
        .disabled(isDisabled || isLoading)
        .opacity(isDisabled ? 0.6 : 1.0)
        .scaleEffect(isDisabled ? 1.0 : 1.0)
        .animation(.easeInOut(duration: 0.15), value: isLoading)
    }

    @ViewBuilder
    private var backgroundView: some View {
        let colors = themeManager.colors
        switch variant {
        case .primary:
            colors.primary
        case .secondary:
            colors.surface
        case .ghost:
            Color.clear
        case .outline:
            Color.clear
        case .danger:
            colors.danger
        }
    }

    private var foregroundColor: Color {
        let colors = themeManager.colors
        switch variant {
        case .primary, .danger:
            return .white
        case .secondary:
            return colors.textPrimary
        case .ghost, .outline:
            return colors.primary
        }
    }

    private var borderColor: Color {
        let colors = themeManager.colors
        switch variant {
        case .outline:
            return colors.primary.opacity(0.4)
        default:
            return .clear
        }
    }
}
