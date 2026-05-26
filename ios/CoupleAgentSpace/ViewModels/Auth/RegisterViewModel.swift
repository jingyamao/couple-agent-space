import Foundation

@Observable
final class RegisterViewModel {
    var name = ""
    var email = ""
    var password = ""
    var confirmPassword = ""
    var error: String?

    func validate() -> Bool {
        error = nil

        if name.trimmingCharacters(in: .whitespaces).isEmpty {
            error = "请输入姓名"
            return false
        }

        if email.trimmingCharacters(in: .whitespaces).isEmpty {
            error = "请输入邮箱"
            return false
        }

        if password.count < 8 {
            error = "密码至少需要 8 个字符"
            return false
        }

        let hasLower = password.range(of: "[a-z]", options: .regularExpression) != nil
        let hasUpper = password.range(of: "[A-Z]", options: .regularExpression) != nil
        let hasDigit = password.range(of: "[0-9]", options: .regularExpression) != nil

        if !hasLower || !hasUpper || !hasDigit {
            error = "密码需要包含大写字母、小写字母和数字"
            return false
        }

        if password != confirmPassword {
            error = "两次输入的密码不一致"
            return false
        }

        return true
    }

    func register(appState: AppState) async {
        guard validate() else { return }
        await appState.authManager.register(
            name: name.trimmingCharacters(in: .whitespaces),
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
