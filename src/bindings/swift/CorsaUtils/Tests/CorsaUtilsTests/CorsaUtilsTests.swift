import Testing
@testable import CorsaUtils

@Test func smoke() async throws {
    #expect(CorsaUtils.classifyTypeText("Promise<string> | null") == "nullish")
    #expect(CorsaUtils.splitTypeText("string | Promise<any>") == ["string", "Promise<any>"])
    #expect(CorsaUtils.isErrorLikeTypeTexts(["TypeError"]))
    #expect(CorsaUtils.hasUnsafeAnyFlow(["Promise<any>"], targetTexts: ["Promise<string>"]))
}
