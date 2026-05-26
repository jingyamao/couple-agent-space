import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let avatarUrl: String?
    let createdAt: String?
    let updatedAt: String?
    let memberships: [CoupleMember]?

    enum CodingKeys: String, CodingKey {
        case id, email, name, memberships
        case avatarUrl = "avatarUrl"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
}
