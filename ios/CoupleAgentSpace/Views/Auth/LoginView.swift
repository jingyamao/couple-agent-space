import SwiftUI

struct LoginView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = LoginViewModel()
    @State private var showRegister = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 32) {
                Spacer()

                // Logo
                VStack(spacing: 16) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [appState.themeManager.colors.primary, appState.themeManager.colors.secondary],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )

                    Text("Couple Agent Space")
                        .font(.serifTitle)
                        .foregroundColor(appState.themeManager.colors.textPrimary)

                    Text("情侣专属的私密生活协作系统")
                        .font(.sansSmall)
                        .foregroundColor(appState.themeManager.colors.textSecondary)
                }

                // Form
                VStack(spacing: 16) {
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
                        placeholder: "请输入密码",
                        text: $viewModel.password,
                        isSecure: true
                    )
                    .textContentType(.password)

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

                    CASButton("登录", variant: .primary, isLoading: appState.authManager.isLoading) {
                        Task { await viewModel.login(appState: appState) }
                    }
                }
                .padding(.horizontal, 24)

                // Register link
                HStack {
                    Text("还没有账号？")
                        .font(.sansSmall)
                        .foregroundColor(appState.themeManager.colors.textSecondary)

                    Button("立即注册") {
                        showRegister = true
                    }
                    .font(.sansSmall)
                    .fontWeight(.semibold)
                    .foregroundColor(appState.themeManager.colors.primary)
                }

                Spacer()
            }
            .themedBackground(appState.themeManager)
            .navigationDestination(isPresented: $showRegister) {
                RegisterView()
            }
        }
    }
}
