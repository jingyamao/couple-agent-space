import Foundation

struct CheckIn: Codable, Identifiable {
    let id: String
    let coupleId: String
    let userId: String
    let title: String
    let note: String?
    let imageUrl: String?
    let location: String?
    let longitude: Double?
    let latitude: Double?
    let address: String?
    let checkedAt: String?
    let createdAt: String?
    let user: User?

    enum CodingKeys: String, CodingKey {
        case id, title, note, location, longitude, latitude, address, user
        case coupleId = "coupleId"
        case userId = "userId"
        case imageUrl = "imageUrl"
        case checkedAt = "checkedAt"
        case createdAt = "createdAt"
    }
}
