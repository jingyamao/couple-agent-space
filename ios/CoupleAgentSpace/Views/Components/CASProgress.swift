import SwiftUI

struct CASProgress: View {
    let value: Double // 0-100

    @Environment(\.themeManager) private var themeManager

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(themeManager.colors.surface)
                    .frame(height: 8)

                RoundedRectangle(cornerRadius: 4)
                    .fill(
                        LinearGradient(
                            colors: [themeManager.colors.primary, themeManager.colors.secondary],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: geometry.size.width * clampedValue / 100, height: 8)
                    .animation(.easeInOut(duration: 0.3), value: value)
            }
        }
        .frame(height: 8)
    }

    private var clampedValue: Double {
        min(max(value, 0), 100)
    }
}
