import SwiftUI

struct DashboardView: View {
    @Environment(AppState.self) private var appState
    @State private var dashboardData: DashboardData?
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    if isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, minHeight: 200)
                    } else if let data = dashboardData {
                        // Couple Hero
                        coupleHero(data.couple)

                        // Stats Grid
                        statsGrid(data)

                        // Quick Actions
                        quickActions

                        // Anniversary Countdown
                        if !data.anniversaries.isEmpty {
                            anniversarySection(data.anniversaries)
                        }

                        // Recent Moods
                        if !data.moods.isEmpty {
                            moodSection(Array(data.moods.prefix(5)))
                        }

                        // Recent Diaries
                        if !data.diaries.isEmpty {
                            diarySection(Array(data.diaries.prefix(5)))
                        }
                    } else if let error {
                        VStack(spacing: 12) {
                            Image(systemName: "wifi.exclamationmark")
                                .font(.largeTitle)
                                .foregroundColor(appState.themeManager.colors.textMuted)
                            Text(error)
                                .font(.sansBody)
                                .foregroundColor(appState.themeManager.colors.textSecondary)
                            CASButton("重试", variant: .outline) {
                                Task { await loadDashboard() }
                            }
                        }
                        .frame(maxWidth: .infinity, minHeight: 300)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }
            .themedBackground(appState.themeManager)
            .navigationTitle("首页")
            .task { await loadDashboard() }
            .refreshable { await loadDashboard() }
        }
    }

    // MARK: - Couple Hero

    @ViewBuilder
    private func coupleHero(_ couple: Couple) -> some View {
        let members = couple.members ?? []
        let member1 = members.first
        let member2 = members.count > 1 ? members[1] : nil

        CASCard {
            VStack(spacing: 16) {
                HStack(spacing: 16) {
                    CASAvatar(
                        name: member1?.user?.name ?? "?",
                        imageUrl: member1?.user?.avatarUrl,
                        size: .xl
                    )

                    Image(systemName: "heart.fill")
                        .font(.title2)
                        .foregroundColor(appState.themeManager.colors.primary)
                        .symbolEffect(.pulse)

                    CASAvatar(
                        name: member2?.user?.name ?? "?",
                        imageUrl: member2?.user?.avatarUrl,
                        size: .xl
                    )
                }

                if let startedAt = couple.startedAt, let days = DateUtils.daysSince(startedAt) {
                    CASBadge("在一起 \(days) 天", tone: .rose)
                }

                Text(couple.title)
                    .font(.serifBody)
                    .foregroundColor(appState.themeManager.colors.textSecondary)
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Stats Grid

    @ViewBuilder
    private func statsGrid(_ data: DashboardData) -> some View {
        let daysTogether = data.couple.startedAt.flatMap { DateUtils.daysSince($0) } ?? 0
        let doneWishes = data.wishes.filter { $0.status == .done }.count
        let wishProgress = data.wishes.isEmpty ? 0 : (doneWishes * 100 / data.wishes.count)

        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            statCard(icon: "heart.fill", value: "\(daysTogether)", label: "在一起天数", color: appState.themeManager.colors.primary)
            statCard(icon: "star.fill", value: "\(wishProgress)%", label: "愿望完成", color: .badgeGold)
            statCard(icon: "book.fill", value: "\(data.diaries.count)", label: "日记数量", color: .badgeTeal)
            statCard(icon: "face.smiling.fill", value: "\(data.moods.count)", label: "心情打卡", color: .badgePrimary)
        }
    }

    private func statCard(icon: String, value: String, label: String, color: Color) -> some View {
        CASCard {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)
                Text(value)
                    .font(.sansLarge)
                    .fontWeight(.bold)
                    .foregroundColor(appState.themeManager.colors.textPrimary)
                Text(label)
                    .font(.sansCaption)
                    .foregroundColor(appState.themeManager.colors.textSecondary)
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Quick Actions

    @ViewBuilder
    private var quickActions: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            quickActionCard(icon: "book.fill", title: "写日记", color: .quickDiary)
            quickActionCard(icon: "face.smiling.fill", title: "心情打卡", color: .quickMood)
            quickActionCard(icon: "calendar", title: "纪念日", color: .quickAnniversary)
            quickActionCard(icon: "star.fill", title: "愿望清单", color: .quickWish)
        }
    }

    private func quickActionCard(icon: String, title: String, color: Color) -> some View {
        Button { } label: {
            HStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.body)
                    .foregroundColor(.white)
                Text(title)
                    .font(.sansSmall)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                Spacer()
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(color)
            )
        }
    }

    // MARK: - Anniversary Section

    @ViewBuilder
    private func anniversarySection(_ anniversaries: [Anniversary]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("纪念日倒计时")
                .font(.sansLarge)
                .fontWeight(.semibold)
                .foregroundColor(appState.themeManager.colors.textPrimary)

            ForEach(anniversaries.prefix(5)) { anniversary in
                CASCard {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(anniversary.title)
                                .font(.sansBody)
                                .fontWeight(.medium)
                                .foregroundColor(appState.themeManager.colors.textPrimary)
                            Text(DateUtils.display(from: anniversary.happenedAt))
                                .font(.sansCaption)
                                .foregroundColor(appState.themeManager.colors.textSecondary)
                        }

                        Spacer()

                        if let days = DateUtils.daysUntilNextAnniversary(anniversary.happenedAt) {
                            VStack(spacing: 2) {
                                Text("\(days)")
                                    .font(.sansLarge)
                                    .fontWeight(.bold)
                                    .foregroundColor(
                                        days <= 7 ? appState.themeManager.colors.danger :
                                            days <= 30 ? .badgeGold :
                                            appState.themeManager.colors.primary
                                    )
                                Text("天后")
                                    .font(.sansCaption)
                                    .foregroundColor(appState.themeManager.colors.textMuted)
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - Mood Section

    @ViewBuilder
    private func moodSection(_ moods: [MoodCheckIn]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("最近心情")
                .font(.sansLarge)
                .fontWeight(.semibold)
                .foregroundColor(appState.themeManager.colors.textPrimary)

            ForEach(moods) { mood in
                CASCard {
                    HStack {
                        CASAvatar(
                            name: mood.user?.name ?? "?",
                            imageUrl: mood.user?.avatarUrl,
                            size: .sm
                        )
                        VStack(alignment: .leading, spacing: 2) {
                            Text(mood.mood)
                                .font(.sansBody)
                                .foregroundColor(appState.themeManager.colors.textPrimary)
                            if let date = mood.checkedAt {
                                Text(DateUtils.relative(DateUtils.parse(date)))
                                    .font(.sansCaption)
                                    .foregroundColor(appState.themeManager.colors.textMuted)
                            }
                        }
                        Spacer()
                        CASBadge(mood.energy.displayName, tone: mood.energy == .high ? .teal : mood.energy == .medium ? .gold : .neutral)
                    }
                }
            }
        }
    }

    // MARK: - Diary Section

    @ViewBuilder
    private func diarySection(_ diaries: [DiaryEntry]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("最近日记")
                .font(.sansLarge)
                .fontWeight(.semibold)
                .foregroundColor(appState.themeManager.colors.textPrimary)

            ForEach(diaries) { diary in
                CASCard {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(diary.title)
                                .font(.sansBody)
                                .fontWeight(.medium)
                                .foregroundColor(appState.themeManager.colors.textPrimary)
                            Spacer()
                            CASBadge(diary.visibility.displayName, tone: diary.visibility == .shared ? .teal : diary.visibility == .partner ? .primary : .neutral)
                        }
                        Text(diary.content)
                            .font(.sansSmall)
                            .foregroundColor(appState.themeManager.colors.textSecondary)
                            .lineLimit(3)
                        if let author = diary.author {
                            HStack {
                                CASAvatar(name: author.name, imageUrl: author.avatarUrl, size: .sm)
                                Text(author.name)
                                    .font(.sansCaption)
                                    .foregroundColor(appState.themeManager.colors.textMuted)
                                Spacer()
                                if let date = diary.happenedAt {
                                    Text(DateUtils.display(from: date))
                                        .font(.sansCaption)
                                        .foregroundColor(appState.themeManager.colors.textMuted)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - Load Data

    private func loadDashboard() async {
        guard let coupleId = appState.currentCouple?.id else { return }

        isLoading = true
        error = nil

        do {
            let data: DashboardData = try await appState.apiClient.request(.dashboard(coupleId: coupleId))
            await MainActor.run {
                self.dashboardData = data
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error.localizedDescription
                self.isLoading = false
            }
        }
    }
}
