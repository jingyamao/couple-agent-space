import SwiftUI

enum BadgeTone {
    case rose, teal, gold, neutral, primary
}

struct CASBadge: View {
    let text: String
    let tone: BadgeTone

    @Environment(\.themeManager) private var themeManager

    init(_ text: String, tone: BadgeTone = .primary) {
        self.text = text
        self.tone = tone
    }

    var body: some View {
        Text(text)
            .font(.sansCaption)
            .fontWeight(.medium)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .foregroundColor(foreground)
            .background(background)
            .cornerRadius(100)
    }

    private var foreground: Color {
        switch tone {
        case .rose: return .badgeRose
        case .teal: return .badgeTeal
        case .gold: return .badgeGold
        case .neutral: return .badgeNeutral
        case .primary: return .badgePrimary
        }
    }

    private var background: Color {
        switch tone {
        case .rose: return .badgeRoseLight
        case .teal: return .badgeTealLight
        case .gold: return .badgeGoldLight
        case .neutral: return .badgeNeutralLight
        case .primary: return .badgePrimaryLight
        }
    }
}
