import Foundation

struct Photo: Codable, Identifiable {
    let id: String
    let coupleId: String
    let uploaderId: String
    let url: String
    let title: String?
    let event: String?
    let takenAt: String?
    let createdAt: String?
    let uploader: User?

    enum CodingKeys: String, CodingKey {
        case id, url, title, event, uploader
        case coupleId = "coupleId"
        case uploaderId = "uploaderId"
        case takenAt = "takenAt"
        case createdAt = "createdAt"
    }
}
