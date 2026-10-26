// Rasterise the logo SVGs. Deliberately not a general SVG renderer: it reads
// exactly the subset build.py emits (a viewBox, an optional background rect,
// and absolute M/L/C/Z paths with a solid fill), so a file it cannot parse is
// a sign the build changed rather than something to paper over.
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

func attr(_ s: String, _ name: String, in range: Range<String.Index>? = nil) -> String? {
    let r = range ?? s.startIndex..<s.endIndex
    guard let re = try? NSRegularExpression(pattern: "\(name)=\"([^\"]*)\"") else { return nil }
    let ns = s as NSString
    let sub = NSRange(r, in: s)
    guard let m = re.firstMatch(in: s, range: sub) else { return nil }
    return ns.substring(with: m.range(at: 1))
}

func hexColor(_ h: String) -> CGColor {
    var s = h.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
    if s.count == 3 { s = s.map { "\($0)\($0)" }.joined() }
    let v = UInt32(s, radix: 16) ?? 0
    return CGColor(srgbRed: CGFloat((v >> 16) & 255) / 255,
                   green:   CGFloat((v >> 8) & 255) / 255,
                   blue:    CGFloat(v & 255) / 255, alpha: 1)
}

func buildPath(_ d: String) -> CGPath {
    let p = CGMutablePath()
    var nums: [CGFloat] = []
    var cmd: Character = " "
    var num = ""
    func flushNum() { if !num.isEmpty { nums.append(CGFloat(Double(num)!)); num = "" } }
    func run() {
        switch cmd {
        case "M": if nums.count >= 2 { p.move(to: CGPoint(x: nums[0], y: nums[1])) }
        case "L":
            var i = 0
            while i + 1 < nums.count { p.addLine(to: CGPoint(x: nums[i], y: nums[i+1])); i += 2 }
        case "C":
            var i = 0
            while i + 5 < nums.count {
                p.addCurve(to: CGPoint(x: nums[i+4], y: nums[i+5]),
                           control1: CGPoint(x: nums[i], y: nums[i+1]),
                           control2: CGPoint(x: nums[i+2], y: nums[i+3]))
                i += 6
            }
        case "Z": p.closeSubpath()
        default: break
        }
        nums = []
    }
    for ch in d {
        if "MLCZQ".contains(ch) { flushNum(); run(); cmd = ch; if ch == "Z" { run() } }
        else if ch == "-" && !num.isEmpty && num.last != "e" { flushNum(); num = "-" }
        else if ch == " " || ch == "," { flushNum() }
        else { num.append(ch) }
    }
    flushNum(); run()
    return p
}

let svgPath = CommandLine.arguments[1]
let outPath = CommandLine.arguments[2]
let size    = Int(CommandLine.arguments[3])!
let magnify = CommandLine.arguments.count > 4 ? Int(CommandLine.arguments[4])! : 1

let src = try! String(contentsOfFile: svgPath, encoding: .utf8)
let vb = attr(src, "viewBox")!.split(separator: " ").map { CGFloat(Double($0)!) }
let vbw = vb[2], vbh = vb[3]

// Render at the true pixel size first, then blow it up with no smoothing, so
// what we look at is the pixel grid a browser tab would actually show.
let w = size, h = Int((CGFloat(size) * vbh / vbw).rounded())
let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                    space: CGColorSpaceCreateDeviceRGB(),
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.translateBy(x: 0, y: CGFloat(h))
ctx.scaleBy(x: CGFloat(w) / vbw, y: -CGFloat(h) / vbh)
ctx.setShouldAntialias(true)

let ns = src as NSString
if let rectRe = try? NSRegularExpression(pattern: "<rect[^>]*fill=\"([^\"]*)\"[^>]*/>"),
   let m = rectRe.firstMatch(in: src, range: NSRange(location: 0, length: ns.length)) {
    ctx.setFillColor(hexColor(ns.substring(with: m.range(at: 1))))
    ctx.fill(CGRect(x: 0, y: 0, width: vbw, height: vbh))
}
let pathRe = try! NSRegularExpression(pattern: "<path[^>]*fill=\"([^\"]*)\"[^>]*d=\"([^\"]*)\"",
                                      options: .dotMatchesLineSeparators)
var n = 0
for m in pathRe.matches(in: src, range: NSRange(location: 0, length: ns.length)) {
    ctx.setFillColor(hexColor(ns.substring(with: m.range(at: 1))))
    ctx.addPath(buildPath(ns.substring(with: m.range(at: 2))))
    ctx.fillPath()                       // nonzero, matching the PDF's own `f`
    n += 1
}
guard var img = ctx.makeImage() else { exit(1) }

if magnify > 1 {
    let mw = w * magnify, mh = h * magnify
    let mc = CGContext(data: nil, width: mw, height: mh, bitsPerComponent: 8, bytesPerRow: 0,
                       space: CGColorSpaceCreateDeviceRGB(),
                       bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    mc.interpolationQuality = .none
    mc.setShouldAntialias(false)
    mc.draw(img, in: CGRect(x: 0, y: 0, width: CGFloat(mw), height: CGFloat(mh)))
    img = mc.makeImage()!
}
let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: outPath) as CFURL,
                                           UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, img, nil)
CGImageDestinationFinalize(dest)
print("\(outPath)  \(img.width)x\(img.height)  paths=\(n)")
