import Foundation

struct Wish: Codable, Identifiable {
    let id: String
    let coupleId: String
    let creatorId: String
    let title: String
    let category: String
    let status: WishStatus
    let targetAt: String?
    let budgetCents: Int?
    let note: String?
    let createdAt: String?
    let updatedAt: String?
    let creator: User?

    enum CodingKeys: String, CodingKey {
        case id, title, category, status, note, creator
        case coupleId = "coupleId"
        case creatorId = "creatorId"
        case targetAt = "targetAt"
        case budgetCents = "budgetCents"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }

    var budgetYuan: Double? {
        guard let cents = budgetCents else { return nil }
        return Double(cents) / 100.0
    }

    var budgetDisplay: String? {
        guard let yuan = budgetYuan else { return nil }
        if yuan == floor(yuan) {
            return "¥\(Int(yuan))"
        }
        return String(format: "¥%.2f", yuan)
    }
}

enum WishStatus: String, Codable, CaseIterable {
    case idea = "IDEA"
    case planned = "PLANNED"
    case done = "DONE"
    case paused = "PAUSED"

    var displayName: String {
        switch self {
        case .idea: return "灵感"
        case .planned: return "计划中"
        case .done: return "已完成"
        case .paused: return "暂停"
        }
    }

    var icon: String {
        switch self {
        case .idea: return "lightbulb"
        case .planned: return "calendar"
        case .done: return "checkmark.circle.fill"
        case .paused: return "pause.circle"
        }
    }
}

struct WishStatusHistory: Codable, Identifiable {
    let id: String
    let wishId: String
    let fromStatus: WishStatus?
    let toStatus: WishStatus
    let changedBy: String
    let changedAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case wishId = "wishId"
        case fromStatus = "fromStatus"
        case toStatus = "toStatus"
        case changedBy = "changedBy"
        case changedAt = "changedAt"
    }
}
