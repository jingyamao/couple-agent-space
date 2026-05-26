import Foundation

@Observable
final class LoginViewModel {
    var email = ""
    var password = ""
    var error: String?

    func validate() -> Bool {
        error = nil

        if email.trimmingCharacters(in: .whitespaces).isEmpty {
            error = "请输入邮箱"
            return false
        }

        if password.isEmpty {
            error = "请输入密码"
            return false
        }

        return true
    }

    func login(appState: AppState) async {
        guard validate() else { return }
        await appState.authManager.login(
            email: email.trimmingCharacters(in: .whitespaces).lowercased(),
            password: password,
            apiClient: appState.apiClient
        )

        if appState.authManager.isAuthenticated {
            await appState.loadCouples()
        } else if let authError = appState.authManager.error {
            error = authError
        }
    }
}
