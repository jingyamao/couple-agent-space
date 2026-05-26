import Foundation

struct DiaryEntry: Codable, Identifiable {
    let id: String
    let coupleId: String
    let authorId: String
    let title: String
    let content: String
    let visibility: Visibility
    let happenedAt: String?
    let createdAt: String?
    let updatedAt: String?
    let author: User?

    enum CodingKeys: String, CodingKey {
        case id, title, content, visibility, author
        case coupleId = "coupleId"
        case authorId = "authorId"
        case happenedAt = "happenedAt"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
}

enum Visibility: String, Codable, CaseIterable {
    case `private` = "PRIVATE"
    case partner = "PARTNER"
    case shared = "SHARED"

    var displayName: String {
        switch self {
        case .private: return "仅自己"
        case .partner: return "仅伴侣"
        case .shared: return "共同可见"
        }
    }

    var icon: String {
        switch self {
        case .private: return "lock.fill"
        case .partner: return "person.fill"
        case .shared: return "person.2.fill"
        }
    }
}
