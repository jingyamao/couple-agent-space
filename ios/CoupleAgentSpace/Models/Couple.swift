import Foundation

// MARK: - Couple

struct Couple: Codable, Identifiable {
    let id: String
    let inviteCode: String
    let title: String
    let startedAt: String?
    let inviteCodeExpiresAt: String?
    let inviteCodeCreatedAt: String?
    let createdAt: String?
    let updatedAt: String?
    let members: [CoupleMember]?

    enum CodingKeys: String, CodingKey {
        case id, title, members
        case inviteCode = "inviteCode"
        case startedAt = "startedAt"
        case inviteCodeExpiresAt = "inviteCodeExpiresAt"
        case inviteCodeCreatedAt = "inviteCodeCreatedAt"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
}

// MARK: - Couple Member

struct CoupleMember: Codable, Identifiable {
    let id: String
    let userId: String
    let coupleId: String
    let role: CoupleRole
    let joinedAt: String?
    let user: User?

    enum CodingKeys: String, CodingKey {
        case id, role, user
        case userId = "userId"
        case coupleId = "coupleId"
        case joinedAt = "joinedAt"
    }
}

// MARK: - Couple Role

enum CoupleRole: String, Codable {
    case owner = "OWNER"
    case partner = "PARTNER"

    var displayName: String {
        switch self {
        case .owner: return "创建者"
        case .partner: return "伴侣"
        }
    }
}

// MARK: - Couple With Members

struct CoupleWithMembers: Codable, Identifiable {
    let id: String
    let inviteCode: String
    let title: String
    let startedAt: String?
    let members: [CoupleMember]?

    enum CodingKeys: String, CodingKey {
        case id, title, members
        case inviteCode = "inviteCode"
        case startedAt = "startedAt"
    }
}
