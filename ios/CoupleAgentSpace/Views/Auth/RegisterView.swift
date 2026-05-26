import SwiftUI

struct RegisterView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = RegisterViewModel()

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Header
            VStack(spacing: 8) {
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [appState.themeManager.colors.primary, appState.themeManager.colors.secondary],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )

                Text("创建账号")
                    .font(.serifTitle)
                    .foregroundColor(appState.themeManager.colors.textPrimary)
            }

            // Form
            VStack(spacing: 14) {
                CASTextField(
                    label: "姓名",
                    placeholder: "请输入你的姓名",
                    text: $viewModel.name
                )
                .textContentType(.name)

                CASTextField(
                    label: "邮箱",
                    placeholder: "请输入邮箱",
                    text: $viewModel.email
                )
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)

                CASTextField(
                    label: "密码",
                    placeholder: "至少 8 位，含大小写字母和数字",
                    text: $viewModel.password,
                    isSecure: true
                )
                .textContentType(.newPassword)

                CASTextField(
                    label: "确认密码",
                    placeholder: "再次输入密码",
                    text: $viewModel.confirmPassword,
                    isSecure: true
                )
                .textContentType(.newPassword)

                if let error = viewModel.error {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.caption)
                        Text(error)
                            .font(.sansSmall)
                    }
                    .foregroundColor(appState.themeManager.colors.danger)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                CASButton("注册", variant: .primary, isLoading: appState.authManager.isLoading) {
                    Task { await viewModel.register(appState: appState) }
                }
            }
            .padding(.horizontal, 24)

            // Back to login
            Button("已有账号？返回登录") {
                dismiss()
            }
            .font(.sansSmall)
            .foregroundColor(appState.themeManager.colors.primary)

            Spacer()
        }
        .themedBackground(appState.themeManager)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button { dismiss() } label: {
                    Image(systemName: "chevron.left")
                        .foregroundColor(appState.themeManager.colors.primary)
                }
            }
        }
    }
}
