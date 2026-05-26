import Foundation

struct AppNotification: Codable, Identifiable {
    let id: String
    let coupleId: String
    let userId: String?
    let type: String
    let title: String
    let body: String?
    let data: [String: AnyCodable]?
    let readAt: String?
    let createdAt: String?

    var isRead: Bool { readAt != nil }

    enum CodingKeys: String, CodingKey {
        case id, type, title, body, data
        case coupleId = "coupleId"
        case userId = "userId"
        case readAt = "readAt"
        case createdAt = "createdAt"
    }
}

// MARK: - AnyCodable helper for JSON dictionaries

struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) { self.value = value }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict
        } else if let arr = try? container.decode([AnyCodable].self) {
            value = arr
        } else {
            value = ""
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let string = value as? String {
            try container.encode(string)
        } else if let int = value as? Int {
            try container.encode(int)
        } else if let double = value as? Double {
            try container.encode(double)
        } else if let bool = value as? Bool {
            try container.encode(bool)
        }
    }
}
