import Foundation

struct MoodCheckIn: Codable, Identifiable {
    let id: String
    let coupleId: String
    let userId: String
    let mood: String
    let energy: MoodEnergy
    let stressLevel: Int
    let carePreference: String?
    let note: String?
    let checkedAt: String?
    let user: User?

    enum CodingKeys: String, CodingKey {
        case id, mood, energy, note, user
        case coupleId = "coupleId"
        case userId = "userId"
        case stressLevel = "stressLevel"
        case carePreference = "carePreference"
        case checkedAt = "checkedAt"
    }
}

enum MoodEnergy: String, Codable, CaseIterable {
    case low = "LOW"
    case medium = "MEDIUM"
    case high = "HIGH"

    var displayName: String {
        switch self {
        case .low: return "低能量"
        case .medium: return "中等"
        case .high: return "高能量"
        }
    }

    var icon: String {
        switch self {
        case .low: return "battery.25percent"
        case .medium: return "battery.50percent"
        case .high: return "battery.100percent"
        }
    }

    var color: String {
        switch self {
        case .low: return "badgeNeutral"
        case .medium: return "badgeGold"
        case .high: return "badgeTeal"
        }
    }
}
