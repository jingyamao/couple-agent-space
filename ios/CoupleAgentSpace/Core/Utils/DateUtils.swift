import Foundation

struct DateUtils {
    private static let iso8601Full: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private static let iso8601: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    private static let displayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "yyyy年MM月dd日"
        return formatter
    }()

    private static let shortFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "MM月dd日"
        return formatter
    }()

    private static let timeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "HH:mm"
        return formatter
    }()

    private static let relativeFormatter: RelativeDateTimeFormatter = {
        let formatter = RelativeDateTimeFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.unitsStyle = .full
        return formatter
    }()

    // MARK: - Parsing

    static func parse(_ dateString: String?) -> Date? {
        guard let dateString else { return nil }
        return iso8601Full.date(from: dateString) ?? iso8601.date(from: dateString)
    }

    // MARK: - Formatting

    static func display(_ date: Date?) -> String {
        guard let date else { return "" }
        return displayFormatter.string(from: date)
    }

    static func short(_ date: Date?) -> String {
        guard let date else { return "" }
        return shortFormatter.string(from: date)
    }

    static func time(_ date: Date?) -> String {
        guard let date else { return "" }
        return timeFormatter.string(from: date)
    }

    static func relative(_ date: Date?) -> String {
        guard let date else { return "" }
        return relativeFormatter.localizedString(for: date, relativeTo: Date())
    }

    static func display(from string: String?) -> String {
        guard let date = parse(string) else { return "" }
        return display(date)
    }

    // MARK: - Calculations

    static func daysBetween(_ from: Date, and to: Date) -> Int {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: from, to: to)
        return components.day ?? 0
    }

    static func daysUntil(_ dateString: String?) -> Int? {
        guard let date = parse(dateString) else { return nil }
        let days = daysBetween(Date(), and: date)
        return days >= 0 ? days : nil
    }

    static func daysSince(_ dateString: String?) -> Int? {
        guard let date = parse(dateString) else { return nil }
        return daysBetween(date, and: Date())
    }

    // MARK: - Next Occurrence (for anniversaries)

    static func nextOccurrence(_ dateString: String?) -> Date? {
        guard let happenedAt = parse(dateString) else { return nil }
        let calendar = Calendar.current
        let now = Date()

        var components = calendar.dateComponents([.month, .day], from: happenedAt)
        components.year = calendar.component(.year, from: now)

        guard let thisYear = calendar.date(from: components) else { return nil }

        if thisYear >= now {
            return thisYear
        }

        components.year = calendar.component(.year, from: now) + 1
        return calendar.date(from: components)
    }

    static func daysUntilNextAnniversary(_ dateString: String?) -> Int? {
        guard let next = nextOccurrence(dateString) else { return nil }
        let days = daysBetween(Date(), and: next)
        return days >= 0 ? days : nil
    }
}
