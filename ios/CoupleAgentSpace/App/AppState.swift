import SwiftUI

@Observable
final class AppState {
    let apiClient: APIClient
    let authManager: AuthManager
    let themeManager: ThemeManager

    var isLoading = true
    var toast: ToastItem?

    // Current couple
    var currentCouple: Couple?
    var couples: [Couple] = []
    var isLoadingCouple = false

    init() {
        self.apiClient = APIClient()
        self.authManager = AuthManager()
        self.themeManager = ThemeManager()

        // Set base URL - change this to your server address
        // For local dev: "http://YOUR_MAC_IP:3000"
        // For deployed: "https://your-domain.com"
        self.apiClient.baseURL = UserDefaults.standard.string(forKey: "api_base_url") ?? "http://localhost:3000"
    }

    // MARK: - Bootstrap

    func bootstrap() async {
        await authManager.restoreSession(apiClient: apiClient)

        if authManager.isAuthenticated {
            await loadCouples()
        }

        await MainActor.run {
            isLoading = false
        }
    }

    // MARK: - Load Couples

    func loadCouples() async {
        isLoadingCouple = true

        do {
            let fetched: [Couple] = try await apiClient.request(.listCouples)
            await MainActor.run {
                self.couples = fetched
                self.currentCouple = fetched.first
                self.isLoadingCouple = false
            }
        } catch {
            await MainActor.run {
                self.isLoadingCouple = false
            }
        }
    }

    // MARK: - Create Couple

    func createCouple(title: String) async -> Bool {
        do {
            let couple: Couple = try await apiClient.request(.createCouple(title: title))
            await MainActor.run {
                self.currentCouple = couple
                self.couples.append(couple)
            }
            return true
        } catch {
            await MainActor.run {
                self.toast = ToastItem(type: .error, message: error.localizedDescription)
            }
            return false
        }
    }

    // MARK: - Join Couple

    func joinCouple(inviteCode: String) async -> Bool {
        do {
            let couple: Couple = try await apiClient.request(.joinCouple(inviteCode: inviteCode))
            await MainActor.run {
                self.currentCouple = couple
                self.couples.append(couple)
            }
            return true
        } catch {
            await MainActor.run {
                self.toast = ToastItem(type: .error, message: error.localizedDescription)
            }
            return false
        }
    }

    // MARK: - Logout

    func logout() async {
        await authManager.logout(apiClient: apiClient)
        await MainActor.run {
            self.currentCouple = nil
            self.couples = []
        }
    }
}
