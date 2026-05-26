import Foundation

struct DashboardData: Codable {
    let couple: Couple
    let anniversaries: [Anniversary]
    let moods: [MoodCheckIn]
    let diaries: [DiaryEntry]
    let wishes: [Wish]
    let photos: [Photo]
    let timeCapsules: [TimeCapsule]?
}
