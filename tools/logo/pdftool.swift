import Foundation
import CoreGraphics
import CoreText

func pathToSVG(_ path: CGPath) -> String {
    var out = ""
    func f(_ v: CGFloat) -> String {
        let r = (v * 1000).rounded() / 1000
        return r == r.rounded() ? String(Int(r)) : String(Double(r))
    }
    path.applyWithBlock { el in
        let p = el.pointee.points
        switch el.pointee.type {
        case .moveToPoint:    out += "M\(f(p[0].x)) \(f(p[0].y))"
        case .addLineToPoint: out += "L\(f(p[0].x)) \(f(p[0].y))"
        case .addQuadCurveToPoint: out += "Q\(f(p[0].x)) \(f(p[0].y)) \(f(p[1].x)) \(f(p[1].y))"
        case .addCurveToPoint: out += "C\(f(p[0].x)) \(f(p[0].y)) \(f(p[1].x)) \(f(p[1].y)) \(f(p[2].x)) \(f(p[2].y))"
        case .closeSubpath:   out += "Z"
        @unknown default: break
        }
    }
    return out
}

let mode = CommandLine.arguments[1]

if mode == "glyphs" {
    // glyphs <fontfile> <name1,name2,...>
    let data = try! Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[2]))
    guard let prov = CGDataProvider(data: data as CFData), let cg = CGFont(prov) else {
        FileHandle.standardError.write("cannot load font\n".data(using: .utf8)!); exit(1)
    }
    let upem = cg.unitsPerEm
    let ct = CTFontCreateWithGraphicsFont(cg, CGFloat(upem), nil, nil)
    var obj: [String: Any] = ["unitsPerEm": upem, "numGlyphs": cg.numberOfGlyphs]
    var glyphs: [String: Any] = [:]
    for name in CommandLine.arguments[3].split(separator: ",") {
        let g = cg.getGlyphWithGlyphName(name: String(name) as CFString)
        var entry: [String: Any] = ["glyphId": Int(g)]
        if g != 0 || name == ".notdef" {
            if let p = CTFontCreatePathForGlyph(ct, g, nil) {
                entry["path"] = pathToSVG(p)
                let b = p.boundingBox
                entry["bbox"] = [b.minX, b.minY, b.maxX, b.maxY]
            }
            var adv = CGSize.zero
            var gg = g
            CTFontGetAdvancesForGlyphs(ct, .horizontal, &gg, &adv, 1)
            entry["advance"] = adv.width
        }
        glyphs[String(name)] = entry
    }
    obj["glyphs"] = glyphs
    print(String(data: try! JSONSerialization.data(withJSONObject: obj), encoding: .utf8)!)

} else if mode == "cmyk" {
    // cmyk c m y k [c m y k ...]  -> colour-managed conversion to sRGB
    let args = CommandLine.arguments.dropFirst(2).map { CGFloat(Double($0)!) }
    let cmyk = CGColorSpace(name: CGColorSpace.genericCMYK)!
    let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
    var i = 0
    while i + 3 < args.count {
        let comps: [CGFloat] = [args[i], args[i+1], args[i+2], args[i+3], 1.0]
        let c = CGColor(colorSpace: cmyk, components: comps)!
        let conv = c.converted(to: srgb, intent: .relativeColorimetric, options: nil)!
        let p = conv.components!
        let hex = String(format: "#%02X%02X%02X",
                         Int((p[0]*255).rounded()), Int((p[1]*255).rounded()), Int((p[2]*255).rounded()))
        print("cmyk(\(args[i]),\(args[i+1]),\(args[i+2]),\(args[i+3])) -> \(hex)")
        i += 4
    }
}
