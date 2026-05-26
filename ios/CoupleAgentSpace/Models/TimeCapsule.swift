import Foundation

struct TimeCapsule: Codable, Identifiable {
    let id: String
    let coupleId: String
    let title: String
    let content: String
    let unlockAt: String
    let status: TimeCapsuleStatus
    let openedAt: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, title, content, status
        case coupleId = "coupleId"
        case unlockAt = "unlockAt"
        case openedAt = "openedAt"
        case createdAt = "createdAt"
    }

    var isLocked: Bool { status == .locked }
    var isOpened: Bool { status == .opened }

    var canOpen: Bool {
        guard isLocked else { return false }
        guard let unlockDate = DateUtils.parse(unlockAt) else { return false }
        return Date() >= unlockDate
    }
}

enum TimeCapsuleStatus: String, Codable {
    case locked = "LOCKED"
    case opened = "OPENED"
}
