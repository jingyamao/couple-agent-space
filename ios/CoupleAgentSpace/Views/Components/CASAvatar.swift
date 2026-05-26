import SwiftUI

enum AvatarSize {
    case sm, md, lg, xl

    var dimension: CGFloat {
        switch self {
        case .sm: return 32
        case .md: return 40
        case .lg: return 48
        case .xl: return 64
        }
    }

    var font: Font {
        switch self {
        case .sm: return .sansCaption
        case .md: return .sansSmall
        case .lg: return .sansBody
        case .xl: return .sansLarge
        }
    }
}

struct CASAvatar: View {
    let name: String
    let imageUrl: String?
    let size: AvatarSize

    @Environment(\.themeManager) private var themeManager
    @State private var loadedImage: UIImage?

    init(name: String, imageUrl: String? = nil, size: AvatarSize = .md) {
        self.name = name
        self.imageUrl = imageUrl
        self.size = size
    }

    var body: some View {
        Group {
            if let image = loadedImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [themeManager.colors.primary, themeManager.colors.secondary],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )

                    Text(initial)
                        .font(size.font)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                }
            }
        }
        .frame(width: size.dimension, height: size.dimension)
        .clipShape(Circle())
        .task {
            await loadImage()
        }
    }

    private var initial: String {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        if trimmed.isEmpty { return "?" }
        return String(trimmed.prefix(1)).uppercased()
    }

    private func loadImage() async {
        guard let urlString = imageUrl, let url = URL(string: urlString) else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let image = UIImage(data: data) {
                await MainActor.run { loadedImage = image }
            }
        } catch {
            // Silently fail, show initial instead
        }
    }
}
