import SwiftUI

struct CASDialog<Content: View>: View {
    let title: String
    let isPresented: Binding<Bool>
    let content: Content

    @Environment(\.themeManager) private var themeManager

    init(
        title: String,
        isPresented: Binding<Bool>,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.isPresented = isPresented
        self.content = content()
    }

    var body: some View {
        ZStack {
            if isPresented.wrappedValue {
                // Backdrop
                Color.black.opacity(0.4)
                    .ignoresSafeArea()
                    .onTapGesture {
                        isPresented.wrappedValue = false
                    }

                // Dialog
                VStack(spacing: 16) {
                    // Header
                    HStack {
                        Text(title)
                            .font(.sansLarge)
                            .fontWeight(.semibold)
                            .foregroundColor(themeManager.colors.textPrimary)

                        Spacer()

                        Button {
                            isPresented.wrappedValue = false
                        } label: {
                            Image(systemName: "xmark")
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(themeManager.colors.textMuted)
                                .frame(width: 32, height: 32)
                                .background(themeManager.colors.surface)
                                .clipShape(Circle())
                        }
                    }

                    // Content
                    content
                }
                .padding(20)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.ultraThinMaterial)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(themeManager.colors.glassBorder, lineWidth: 0.5)
                )
                .shadow(color: Color.black.opacity(0.15), radius: 20, x: 0, y: 10)
                .padding(.horizontal, 24)
                .transition(.scale.combined(with: .opacity))
                .animation(.spring(duration: 0.3), value: isPresented.wrappedValue)
            }
        }
    }
}

// MARK: - Confirmation Dialog

struct CASConfirmDialog: View {
    let title: String
    let message: String
    let confirmText: String
    let confirmVariant: CASButtonVariant
    let isPresented: Binding<Bool>
    let onConfirm: () -> Void

    init(
        title: String,
        message: String,
        confirmText: String = "确认",
        confirmVariant: CASButtonVariant = .danger,
        isPresented: Binding<Bool>,
        onConfirm: @escaping () -> Void
    ) {
        self.title = title
        self.message = message
        self.confirmText = confirmText
        self.confirmVariant = confirmVariant
        self.isPresented = isPresented
        self.onConfirm = onConfirm
    }

    @Environment(\.themeManager) private var themeManager

    var body: some View {
        CASDialog(title: title, isPresented: isPresented) {
            VStack(spacing: 16) {
                Text(message)
                    .font(.sansBody)
                    .foregroundColor(themeManager.colors.textSecondary)

                HStack(spacing: 12) {
                    CASButton("取消", variant: .outline) {
                        isPresented.wrappedValue = false
                    }

                    CASButton(confirmText, variant: confirmVariant) {
                        onConfirm()
                        isPresented.wrappedValue = false
                    }
                }
            }
        }
    }
}
