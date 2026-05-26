import SwiftUI

struct CASCard<Content: View>: View {
    let content: Content

    @Environment(\.themeManager) private var themeManager

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(themeManager.colors.glassBorder, lineWidth: 0.5)
                    )
            )
            .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Card Header

struct CASCardHeader<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        HStack {
            content
        }
        .padding(.bottom, 12)
    }
}

// MARK: - Card Title

struct CASCardTitle: View {
    let text: String

    @Environment(\.themeManager) private var themeManager

    var body: some View {
        Text(text)
            .font(.sansLarge)
            .fontWeight(.semibold)
            .foregroundColor(themeManager.colors.textPrimary)
    }
}
