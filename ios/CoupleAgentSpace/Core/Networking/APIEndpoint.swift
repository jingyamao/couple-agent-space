import Foundation

// MARK: - HTTP Method

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case patch = "PATCH"
    case delete = "DELETE"
}

// MARK: - API Endpoint

enum APIEndpoint {
    // Auth
    case login(email: String, password: String)
    case register(name: String, email: String, password: String)
    case logout
    case me

    // Couples
    case listCouples
    case createCouple(title: String)
    case joinCouple(inviteCode: String)
    case getCouple(coupleId: String)
    case updateCouple(coupleId: String, body: [String: Any])
    case deleteCouple(coupleId: String)
    case dashboard(coupleId: String)
    case refreshInviteCode(coupleId: String)

    // Diaries
    case listDiaries(coupleId: String)
    case createDiary(coupleId: String, body: [String: Any])
    case getDiary(coupleId: String, diaryId: String)
    case updateDiary(coupleId: String, diaryId: String, body: [String: Any])
    case deleteDiary(coupleId: String, diaryId: String)

    // Moods
    case listMoods(coupleId: String)
    case createMood(coupleId: String, body: [String: Any])
    case updateMood(coupleId: String, moodId: String, body: [String: Any])
    case deleteMood(coupleId: String, moodId: String)

    // Anniversaries
    case listAnniversaries(coupleId: String)
    case createAnniversary(coupleId: String, body: [String: Any])
    case updateAnniversary(coupleId: String, anniversaryId: String, body: [String: Any])
    case deleteAnniversary(coupleId: String, anniversaryId: String)

    // Wishes
    case listWishes(coupleId: String, status: String?)
    case createWish(coupleId: String, body: [String: Any])
    case updateWish(coupleId: String, wishId: String, body: [String: Any])
    case deleteWish(coupleId: String, wishId: String)

    // Photos
    case listPhotos(coupleId: String)
    case createPhoto(coupleId: String, body: [String: Any])
    case deletePhoto(coupleId: String, photoId: String)

    // Check-ins
    case listCheckins(coupleId: String)
    case createCheckin(coupleId: String, body: [String: Any])
    case deleteCheckin(coupleId: String, checkinId: String)

    // Time Capsules
    case listTimeCapsules(coupleId: String)
    case createTimeCapsule(coupleId: String, body: [String: Any])
    case openTimeCapsule(coupleId: String, capsuleId: String)

    // Notifications
    case listNotifications(coupleId: String)
    case markNotificationsRead(coupleId: String)

    // Agent
    case agentRelationship(body: [String: Any])
    case agentConfirm(body: [String: Any])

    // Upload
    case upload

    // Weather
    case weather(params: [String: String])

    // MARK: - Computed Properties

    var path: String {
        switch self {
        // Auth
        case .login: return "/api/auth/login"
        case .register: return "/api/auth/register"
        case .logout: return "/api/auth/logout"
        case .me: return "/api/auth/me"

        // Couples
        case .listCouples, .createCouple: return "/api/couples"
        case .joinCouple: return "/api/couples/join"
        case .getCouple(let id), .updateCouple(let id, _), .deleteCouple(let id):
            return "/api/couples/\(id)"
        case .dashboard(let id): return "/api/couples/\(id)/dashboard"
        case .refreshInviteCode(let id): return "/api/couples/\(id)/invite-code/refresh"

        // Diaries
        case .listDiaries(let id), .createDiary(let id, _):
            return "/api/couples/\(id)/diaries"
        case .getDiary(let cid, let did), .updateDiary(let cid, let did, _), .deleteDiary(let cid, let did):
            return "/api/couples/\(cid)/diaries/\(did)"

        // Moods
        case .listMoods(let id), .createMood(let id, _):
            return "/api/couples/\(id)/moods"
        case .updateMood(let cid, let mid, _), .deleteMood(let cid, let mid):
            return "/api/couples/\(cid)/moods/\(mid)"

        // Anniversaries
        case .listAnniversaries(let id), .createAnniversary(let id, _):
            return "/api/couples/\(id)/anniversaries"
        case .updateAnniversary(let cid, let aid, _), .deleteAnniversary(let cid, let aid):
            return "/api/couples/\(cid)/anniversaries/\(aid)"

        // Wishes
        case .listWishes(let id, _), .createWish(let id, _):
            return "/api/couples/\(id)/wishes"
        case .updateWish(let cid, let wid, _), .deleteWish(let cid, let wid):
            return "/api/couples/\(cid)/wishes/\(wid)"

        // Photos
        case .listPhotos(let id), .createPhoto(let id, _):
            return "/api/couples/\(id)/photos"
        case .deletePhoto(let cid, let pid):
            return "/api/couples/\(cid)/photos/\(pid)"

        // Check-ins
        case .listCheckins(let id), .createCheckin(let id, _):
            return "/api/couples/\(id)/checkins"
        case .deleteCheckin(let cid, let chid):
            return "/api/couples/\(cid)/checkins/\(chid)"

        // Time Capsules
        case .listTimeCapsules(let id), .createTimeCapsule(let id, _):
            return "/api/couples/\(id)/time-capsules"
        case .openTimeCapsule(let cid, let tid):
            return "/api/couples/\(cid)/time-capsules/\(tid)/open"

        // Notifications
        case .listNotifications(let id), .markNotificationsRead(let id):
            return "/api/couples/\(id)/notifications"

        // Agent
        case .agentRelationship: return "/api/agents/relationship"
        case .agentConfirm: return "/api/agents/confirm"

        // Upload
        case .upload: return "/api/upload"

        // Weather
        case .weather: return "/api/weather"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .login, .register, .logout, .createCouple, .joinCouple,
             .createDiary, .createMood, .createAnniversary, .createWish,
             .createPhoto, .createCheckin, .createTimeCapsule,
             .agentRelationship, .agentConfirm, .upload, .refreshInviteCode:
            return .post

        case .updateCouple, .updateDiary, .updateMood, .updateAnniversary,
             .updateWish, .markNotificationsRead:
            return .patch

        case .deleteCouple, .deleteDiary, .deleteMood, .deleteAnniversary,
             .deleteWish, .deletePhoto, .deleteCheckin:
            return .delete

        default:
            return .get
        }
    }

    var queryItems: [URLQueryItem]? {
        switch self {
        case .listWishes(_, let status):
            if let status { return [URLQueryItem(name: "status", value: status)] }
            return nil
        case .weather(let params):
            return params.map { URLQueryItem(name: $0.key, value: $0.value) }
        default:
            return nil
        }
    }

    var body: Data? {
        switch self {
        case .login(let email, let password):
            return try? JSONSerialization.data(withJSONObject: ["email": email, "password": password])
        case .register(let name, let email, let password):
            return try? JSONSerialization.data(withJSONObject: ["name": name, "email": email, "password": password])
        case .createCouple(let title):
            return try? JSONSerialization.data(withJSONObject: ["title": title])
        case .joinCouple(let code):
            return try? JSONSerialization.data(withJSONObject: ["inviteCode": code])
        case .updateCouple(_, let body), .updateDiary(_, _, let body),
             .updateMood(_, _, let body), .updateAnniversary(_, _, let body),
             .updateWish(_, _, let body):
            return try? JSONSerialization.data(withJSONObject: body)
        case .createDiary(_, let body), .createMood(_, let body),
             .createAnniversary(_, let body), .createWish(_, let body),
             .createPhoto(_, let body), .createCheckin(_, let body),
             .createTimeCapsule(_, let body):
            return try? JSONSerialization.data(withJSONObject: body)
        case .agentRelationship(let body), .agentConfirm(let body):
            return try? JSONSerialization.data(withJSONObject: body)
        default:
            return nil
        }
    }
}
