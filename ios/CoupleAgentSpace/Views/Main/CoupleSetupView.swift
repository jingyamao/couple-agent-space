import SwiftUI

struct CoupleSetupView: View {
    @Environment(AppState.self) private var appState
    @State private var mode: SetupMode = .choose
    @State private var spaceName = ""
    @State private var inviteCode = ""
    @State private var isLoading = false
    @State private var error: String?

    enum SetupMode {
        case choose, create, join
    }

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Header
            VStack(spacing: 16) {
                Image(systemName: "heart.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [appState.themeManager.colors.primary, appState.themeManager.colors.secondary],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )

                Text("欢迎来到 Couple Agent Space")
                    .font(.serifTitle)
                    .foregroundColor(appState.themeManager.colors.textPrimary)
                    .multilineTextAlignment(.center)

                Text("创建你们的情侣空间，开始记录美好时光")
                    .font(.sansSmall)
                    .foregroundColor(appState.themeManager.colors.textSecondary)
            }

            // Content based on mode
            switch mode {
            case .choose:
                chooseView
            case .create:
                createView
            case .join:
                joinView
            }

            Spacer()
        }
        .padding(.horizontal, 24)
        .themedBackground(appState.themeManager)
    }

    // MARK: - Choose Mode

    @ViewBuilder
    private var chooseView: some View {
        VStack(spacing: 16) {
            CASButton("创建新空间", variant: .primary, size: .lg) {
                withAnimation { mode = .create }
            }

            CASButton("邀请码加入", variant: .outline, size: .lg) {
                withAnimation { mode = .join }
            }
        }
    }

    // MARK: - Create Mode

    @ViewBuilder
    private var createView: some View {
        VStack(spacing: 16) {
            CASTextField(
                label: "空间名称",
                placeholder: "给我们的空间起个名字",
                text: $spaceName
            )

            if let error {
                Text(error)
                    .font(.sansSmall)
                    .foregroundColor(appState.themeManager.colors.danger)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            HStack(spacing: 12) {
                CASButton("返回", variant: .outline) {
                    withAnimation { mode = .choose }
                }

                CASButton("创建", variant: .primary, isLoading: isLoading) {
                    Task {
                        isLoading = true
                        let success = await appState.createCouple(title: spaceName.isEmpty ? "我们的空间" : spaceName)
                        if !success { error = "创建失败，请重试" }
                        isLoading = false
                    }
                }
            }
        }
    }

    // MARK: - Join Mode

    @ViewBuilder
    private var joinView: some View {
        VStack(spacing: 16) {
            CASTextField(
                label: "邀请码",
                placeholder: "输入对方分享的邀请码",
                text: $inviteCode
            )
            .autocapitalization(.allCharacters)

            if let error {
                Text(error)
                    .font(.sansSmall)
                    .foregroundColor(appState.themeManager.colors.danger)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            HStack(spacing: 12) {
                CASButton("返回", variant: .outline) {
                    withAnimation { mode = .choose }
                }

                CASButton("加入", variant: .primary, isLoading: isLoading) {
                    Task {
                        isLoading = true
                        error = nil
                        let success = await appState.joinCouple(inviteCode: inviteCode)
                        if !success { error = "加入失败，请检查邀请码是否正确" }
                        isLoading = false
                    }
                }
            }
        }
    }
}
