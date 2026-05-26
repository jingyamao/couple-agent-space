import SwiftUI

@main
struct CoupleAgentSpaceApp: View {
    @State private var appState = AppState()

    var body: some View {
        Group {
            if appState.isLoading {
                // Loading screen
                VStack {
                    Spacer()
                    Image(systemName: "heart.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [appState.themeManager.colors.primary, appState.themeManager.colors.secondary],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .symbolEffect(.pulse)
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(
                    ThemeGradient.background(for: appState.themeManager.currentTheme)
                        .ignoresSafeArea()
                )
            } else if !appState.authManager.isAuthenticated {
                LoginView()
            } else if appState.currentCouple == nil {
                CoupleSetupView()
            } else {
                MainTabView()
            }
        }
        .environment(appState)
        .environment(\.themeManager, appState.themeManager)
        .task {
            await appState.bootstrap()
        }
    }
}
