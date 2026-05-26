import Foundation

// MARK: - API Response Wrapper

struct APIResponse<T: Codable>: Codable {
    let data: T
}

// MARK: - API Client

@Observable
final class APIClient {
    var baseURL: String
    var authToken: String?

    init(baseURL: String = "http://localhost:3000") {
        self.baseURL = baseURL
    }

    // MARK: - Core Request

    func request<T: Codable>(_ endpoint: APIEndpoint) async throws -> T {
        guard var urlComponents = URLComponents(string: baseURL + endpoint.path) else {
            throw APIError.invalidURL
        }

        if let queryItems = endpoint.queryItems {
            urlComponents.queryItems = queryItems
        }

        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.httpBody = endpoint.body

        // Headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(URLError(.badServerResponse))
        }

        if httpResponse.statusCode == 204 {
            // No content response
            if T.self == EmptyResponse.self {
                return EmptyResponse() as! T
            }
            throw APIError.decodingError(URLError(.cannotParseResponse))
        }

        if !(200...299).contains(httpResponse.statusCode) {
            let errorResponse = try? JSONDecoder().decode(APIErrorResponse.self, from: data)
            throw APIError.from(statusCode: httpResponse.statusCode, response: errorResponse)
        }

        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()
                let dateString = try container.decode(String.self)
                let formatter = ISO8601DateFormatter()
                formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                if let date = formatter.date(from: dateString) {
                    return date
                }
                formatter.formatOptions = [.withInternetDateTime]
                if let date = formatter.date(from: dateString) {
                    return date
                }
                throw DecodingError.dataCorruptedError(
                    in: container, debugDescription: "Invalid date: \(dateString)"
                )
            }

            // Try wrapped response first { "data": ... }
            if let wrapped = try? decoder.decode(APIResponse<T>.self, from: data) {
                return wrapped.data
            }
            // Try direct decode
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    // MARK: - File Upload

    func uploadImage(data: Data, filename: String, prefix: String) async throws -> UploadResponse {
        guard let url = URL(string: baseURL + "/api/upload") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"prefix\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(prefix)\r\n".data(using: .utf8)!)

        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (responseData, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            let errorResponse = try? JSONDecoder().decode(APIErrorResponse.self, from: responseData)
            throw APIError.from(
                statusCode: (response as? HTTPURLResponse)?.statusCode ?? 500,
                response: errorResponse
            )
        }

        let decoder = JSONDecoder()
        if let wrapped = try? decoder.decode(APIResponse<UploadResponse>.self, from: responseData) {
            return wrapped.data
        }
        return try decoder.decode(UploadResponse.self, from: responseData)
    }
}

// MARK: - Supporting Types

struct EmptyResponse: Codable {
    init() {}
}

struct UploadResponse: Codable {
    let url: String
}
