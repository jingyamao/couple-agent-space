import Foundation

// MARK: - Auth User

struct AuthUser: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let avatarUrl: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, email, name
        case avatarUrl = "avatarUrl"
        case createdAt = "createdAt"
    }
}

// MARK: - Login Response

struct LoginResponse: Codable {
    let user: AuthUser
    let token: String
    let session: SessionInfo?
}

struct SessionInfo: Codable {
    let expiresAt: String?
}

// MARK: - Auth Manager

@Observable
final class AuthManager {
    var user: AuthUser?
    var isAuthenticated: Bool { user != nil }
    var isLoading = false
    var error: String?

    private let keychain = KeychainService()
    private let tokenKey = "auth_token"
    private let userKey = "auth_user"

    var authToken: String? {
        try? keychain.get(key: tokenKey)
    }

    init() {
        // Restore user from UserDefaults
        if let userData = UserDefaults.standard.data(forKey: userKey),
           let savedUser = try? JSONDecoder().decode(AuthUser.self, from: userData) {
            self.user = savedUser
        }
    }

    // MARK: - Login

    func login(email: String, password: String, apiClient: APIClient) async {
        isLoading = true
        error = nil

        do {
            let response: LoginResponse = try await apiClient.request(
                .login(email: email, password: password)
            )
            await MainActor.run {
                self.user = response.user
                self.saveUser(response.user)
                apiClient.authToken = response.token
                try? self.keychain.save(key: self.tokenKey, value: response.token)
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = (error as? APIError)?.errorDescription ?? error.localizedDescription
                self.isLoading = false
            }
        }
    }

    // MARK: - Register

    func register(name: String, email: String, password: String, apiClient: APIClient) async {
        isLoading = true
        error = nil

        do {
            let response: LoginResponse = try await apiClient.request(
                .register(name: name, email: email, password: password)
            )
            await MainActor.run {
                self.user = response.user
                self.saveUser(response.user)
                apiClient.authToken = response.token
                try? self.keychain.save(key: self.tokenKey, value: response.token)
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = (error as? APIError)?.errorDescription ?? error.localizedDescription
                self.isLoading = false
            }
        }
    }

    // MARK: - Logout

    func logout(apiClient: APIClient) async {
        do {
            let _: EmptyResponse = try await apiClient.request(.logout)
        } catch {
            // Ignore logout errors
        }

        await MainActor.run {
            self.user = nil
            apiClient.authToken = nil
            try? self.keychain.delete(key: self.tokenKey)
            UserDefaults.standard.removeObject(forKey: self.userKey)
        }
    }

    // MARK: - Restore Session

    func restoreSession(apiClient: APIClient) async {
        guard let token = authToken else { return }

        apiClient.authToken = token
        isLoading = true

        do {
            let user: AuthUser = try await apiClient.request(.me)
            await MainActor.run {
                self.user = user
                self.saveUser(user)
                self.isLoading = false
            }
        } catch {
            // Token expired or invalid
            await MainActor.run {
                self.user = nil
                apiClient.authToken = nil
                try? self.keychain.delete(key: self.tokenKey)
                UserDefaults.standard.removeObject(forKey: self.userKey)
                self.isLoading = false
            }
        }
    }

    // MARK: - Private

    private func saveUser(_ user: AuthUser) {
        if let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: userKey)
        }
    }
}
