import SwiftUI

struct MainTabView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("首页", systemImage: "heart.fill")
                }

            Text("日记") // Placeholder for Phase 2
                .tabItem {
                    Label("日记", systemImage: "book.fill")
                }

            Text("心情") // Placeholder for Phase 2
                .tabItem {
                    Label("心情", systemImage: "face.smiling.fill")
                }

            Text("相册") // Placeholder for Phase 2
                .tabItem {
                    Label("相册", systemImage: "photo.on.rectangle.angled")
                }

            SettingsPlaceholderView()
                .tabItem {
                    Label("更多", systemImage: "ellipsis.circle.fill")
                }
        }
        .tint(appState.themeManager.colors.primary)
    }
}

// MARK: - Settings Placeholder

struct SettingsPlaceholderView: View {
    @Environment(AppState.self) private var appState
    @State private var showThemeToggle = false

    var body: some View {
        NavigationStack {
            List {
                Section("主题") {
                    HStack {
                        Image(systemName: "paintpalette.fill")
                            .foregroundColor(appState.themeManager.colors.primary)
                        Text("当前主题")
                        Spacer()
                        Text(appState.themeManager.currentTheme.displayName)
                            .foregroundColor(appState.themeManager.colors.textSecondary)
                        Button {
                            appState.themeManager.toggle()
                        } label: {
                            Text("切换")
                                .font(.sansSmall)
                                .fontWeight(.medium)
                        }
                    }
                }

                Section("账号") {
                    HStack {
                        CASAvatar(
                            name: appState.authManager.user?.name ?? "?",
                            imageUrl: appState.authManager.user?.avatarUrl,
                            size: .md
                        )
                        VStack(alignment: .leading) {
                            Text(appState.authManager.user?.name ?? "未知用户")
                                .font(.sansBody)
                                .fontWeight(.medium)
                            Text(appState.authManager.user?.email ?? "")
                                .font(.sansCaption)
                                .foregroundColor(appState.themeManager.colors.textSecondary)
                        }
                    }
                }

                Section {
                    Button("退出登录") {
                        Task { await appState.logout() }
                    }
                    .foregroundColor(appState.themeManager.colors.danger)
                }
            }
            .navigationTitle("设置")
        }
    }
}
