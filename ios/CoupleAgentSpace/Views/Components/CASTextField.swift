import SwiftUI

struct CASTextField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var error: String?
    var isSecure: Bool = false

    @Environment(\.themeManager) private var themeManager
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !label.isEmpty {
                Text(label)
                    .font(.sansSmall)
                    .fontWeight(.medium)
                    .foregroundColor(themeManager.colors.textSecondary)
            }

            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
            }
            .font(.sansBody)
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(.ultraThinMaterial)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        error != nil ? themeManager.colors.danger :
                            isFocused ? themeManager.colors.primary :
                            themeManager.colors.glassBorder,
                        lineWidth: isFocused ? 1.5 : 0.5
                    )
            )
            .focused($isFocused)

            if let error {
                Text(error)
                    .font(.sansCaption)
                    .foregroundColor(themeManager.colors.danger)
            }
        }
    }
}

// MARK: - Text Editor

struct CASTextEditor: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var minHeight: CGFloat = 100

    @Environment(\.themeManager) private var themeManager
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !label.isEmpty {
                Text(label)
                    .font(.sansSmall)
                    .fontWeight(.medium)
                    .foregroundColor(themeManager.colors.textSecondary)
            }

            ZStack(alignment: .topLeading) {
                if text.isEmpty {
                    Text(placeholder)
                        .font(.sansBody)
                        .foregroundColor(themeManager.colors.textMuted)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                }

                TextEditor(text: $text)
                    .font(.sansBody)
                    .scrollContentBackground(.hidden)
                    .padding(8)
                    .focused($isFocused)
            }
            .frame(minHeight: minHeight)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(.ultraThinMaterial)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isFocused ? themeManager.colors.primary : themeManager.colors.glassBorder,
                        lineWidth: isFocused ? 1.5 : 0.5
                    )
            )
        }
    }
}
