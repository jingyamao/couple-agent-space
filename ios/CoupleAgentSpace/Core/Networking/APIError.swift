import Foundation

// MARK: - API Error

struct APIErrorResponse: Codable {
    let error: APIErrorDetail
}

struct APIErrorDetail: Codable {
    let code: String
    let message: String
    let detail: String?
}

enum APIError: LocalizedError {
    case invalidURL
    case unauthorized
    case forbidden
    case notFound
    case validationError(String)
    case serverError(code: String, message: String)
    case networkError(Error)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "无效的请求地址"
        case .unauthorized: return "请先登录"
        case .forbidden: return "没有权限执行此操作"
        case .notFound: return "资源不存在"
        case .validationError(let msg): return msg
        case .serverError(_, let msg): return msg
        case .networkError(let err): return "网络错误: \(err.localizedDescription)"
        case .decodingError: return "数据解析失败"
        }
    }

    var errorCode: String {
        switch self {
        case .invalidURL: return "INVALID_URL"
        case .unauthorized: return "AUTH_REQUIRED"
        case .forbidden: return "FORBIDDEN"
        case .notFound: return "NOT_FOUND"
        case .validationError: return "VALIDATION_ERROR"
        case .serverError(let code, _): return code
        case .networkError: return "NETWORK_ERROR"
        case .decodingError: return "DECODING_ERROR"
        }
    }

    static func from(statusCode: Int, response: APIErrorResponse?) -> APIError {
        let code = response?.error.code ?? "UNKNOWN_ERROR"
        let message = response?.error.message ?? "请求失败"

        switch statusCode {
        case 401: return .unauthorized
        case 403: return .forbidden
        case 404: return .notFound
        case 400: return .validationError(message)
        default: return .serverError(code: code, message: message)
        }
    }
}
