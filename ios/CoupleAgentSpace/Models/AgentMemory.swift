import Foundation

struct AgentMemory: Codable, Identifiable {
    let id: String
    let coupleId: String
    let key: String
    let value: [String: AnyCodable]?
    let createdAt: String?
    let updatedAt: String?

    enum CodingKeys: String, CodingKey {
        case id, key, value
        case coupleId = "coupleId"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
}

struct AgentRun: Codable, Identifiable {
    let id: String
    let coupleId: String?
    let userId: String?
    let intent: String
    let input: [String: AnyCodable]?
    let output: [String: AnyCodable]?
    let status: AgentRunStatus
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, intent, input, output, status
        case coupleId = "coupleId"
        case userId = "userId"
        case createdAt = "createdAt"
    }
}

enum AgentRunStatus: String, Codable {
    case success = "SUCCESS"
    case fallback = "FALLBACK"
    case error = "ERROR"
}
