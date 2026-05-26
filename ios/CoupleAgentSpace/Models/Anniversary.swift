import Foundation

struct Anniversary: Codable, Identifiable {
    let id: String
    let coupleId: String
    let title: String
    let happenedAt: String
    let remindDays: [Int]
    let note: String?
    let createdAt: String?
    let updatedAt: String?

    enum CodingKeys: String, CodingKey {
        case id, title, note
        case coupleId = "coupleId"
        case happenedAt = "happenedAt"
        case remindDays = "remindDays"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
}
