import SwiftUI

struct SelectorOption: Identifiable {
    let id: String
    let label: String

    init(value: String, label: String) {
        self.id = value
        self.label = label
    }
}

struct CASSelector: View {
    let label: String
    let options: [SelectorOption]
    @Binding var selectedId: String

    @Environment(\.themeManager) private var themeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !label.isEmpty {
                Text(label)
                    .font(.sansSmall)
                    .fontWeight(.medium)
                    .foregroundColor(themeManager.colors.textSecondary)
            }

            Menu {
                ForEach(options) { option in
                    Button(option.label) {
                        selectedId = option.id
                    }
                }
            } label: {
                HStack {
                    Text(options.first(where: { $0.id == selectedId })?.label ?? "请选择")
                        .font(.sansBody)
                        .foregroundColor(themeManager.colors.textPrimary)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .font(.caption)
                        .foregroundColor(themeManager.colors.textMuted)
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(.ultraThinMaterial)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(themeManager.colors.glassBorder, lineWidth: 0.5)
                )
            }
        }
    }
}
