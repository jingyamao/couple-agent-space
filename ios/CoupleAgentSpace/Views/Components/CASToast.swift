import SwiftUI

enum ToastType {
    case success, error, info

    var icon: String {
        switch self {
        case .success: return "checkmark.circle.fill"
        case .error: return "xmark.circle.fill"
        case .info: return "info.circle.fill"
        }
    }

    func color(_ colors: ThemeColors) -> Color {
        switch self {
        case .success: return colors.success
        case .error: return colors.danger
        case .info: return colors.primary
        }
    }
}

struct ToastItem: Identifiable {
    let id = UUID()
    let type: ToastType
    let message: String
}

// MARK: - Toast Modifier

struct ToastModifier: ViewModifier {
    @Binding var toast: ToastItem?

    func body(content: Content) -> some View {
        ZStack {
            content

            if let toast {
                VStack {
                    Spacer()
                    toastView(toast)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                        .padding(.bottom, 40)
                }
                .animation(.spring(duration: 0.3), value: toast.id)
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        if self.toast?.id == toast.id {
                            self.toast = nil
                        }
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func toastView(_ toast: ToastItem) -> some View {
        HStack(spacing: 10) {
            Image(systemName: toast.type.icon)
                .font(.body)
            Text(toast.message)
                .font(.sansSmall)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(.ultraThinMaterial)
        .cornerRadius(100)
        .shadow(color: Color.black.opacity(0.15), radius: 10, x: 0, y: 4)
    }
}

extension View {
    func toast(_ toast: Binding<ToastItem?>) -> some View {
        modifier(ToastModifier(toast: toast))
    }
}
