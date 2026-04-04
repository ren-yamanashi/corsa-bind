using System.Runtime.InteropServices;
using System.Text;

namespace Corsa.Utils;

public static class CorsaUtils
{
    private const string LibraryName = "corsa_ffi";
    [StructLayout(LayoutKind.Sequential)]
    private readonly struct CorsaStrRef(nint ptr, nuint len)
    {
        public readonly nint Ptr = ptr;
        public readonly nuint Len = len;
    }
    [StructLayout(LayoutKind.Sequential)] private readonly struct CorsaString { public readonly nint Ptr; public readonly nuint Len; }
    [StructLayout(LayoutKind.Sequential)] private readonly struct CorsaStringList { public readonly nint Ptr; public readonly nuint Len; }
    [DllImport(LibraryName, EntryPoint = "corsa_utils_classify_type_text")]
    private static extern CorsaString ClassifyTypeTextNative(CorsaStrRef text);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_split_top_level_type_text")]
    private static extern CorsaStringList SplitTopLevelTypeTextNative(CorsaStrRef text, uint delimiter);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_split_type_text")]
    private static extern CorsaStringList SplitTypeTextNative(CorsaStrRef text);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_string_like_type_texts")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsStringLikeTypeTextsNative(nint typeTexts, nuint typeTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_number_like_type_texts")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsNumberLikeTypeTextsNative(nint typeTexts, nuint typeTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_bigint_like_type_texts")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsBigintLikeTypeTextsNative(nint typeTexts, nuint typeTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_any_like_type_texts")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsAnyLikeTypeTextsNative(nint typeTexts, nuint typeTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_unknown_like_type_texts")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsUnknownLikeTypeTextsNative(nint typeTexts, nuint typeTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_array_like_type_texts")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsArrayLikeTypeTextsNative(nint typeTexts, nuint typeTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_promise_like_type_texts")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsPromiseLikeTypeTextsNative(
        nint typeTexts,
        nuint typeTextsLen,
        nint propertyNames,
        nuint propertyNamesLen);

    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_error_like_type_texts")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsErrorLikeTypeTextsNative(
        nint typeTexts,
        nuint typeTextsLen,
        nint propertyNames,
        nuint propertyNamesLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_has_unsafe_any_flow")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool HasUnsafeAnyFlowNative(nint sourceTexts, nuint sourceTextsLen, nint targetTexts, nuint targetTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_unsafe_assignment")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsUnsafeAssignmentNative(nint sourceTexts, nuint sourceTextsLen, nint targetTexts, nuint targetTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_is_unsafe_return")]
    [return: MarshalAs(UnmanagedType.I1)]
    private static extern bool IsUnsafeReturnNative(nint sourceTexts, nuint sourceTextsLen, nint targetTexts, nuint targetTextsLen);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_string_free")]
    private static extern void FreeString(CorsaString value);
    [DllImport(LibraryName, EntryPoint = "corsa_utils_string_list_free")]
    private static extern void FreeStringList(CorsaStringList value);
    public static string ClassifyTypeText(string text) { using var value = Utf8Input.FromString(text); return TakeString(ClassifyTypeTextNative(value.Ref)); }
    public static IReadOnlyList<string> SplitTopLevelTypeText(string text, char delimiter) { using var value = Utf8Input.FromString(text); return TakeStringList(SplitTopLevelTypeTextNative(value.Ref, delimiter)); }
    public static IReadOnlyList<string> SplitTypeText(string text) { using var value = Utf8Input.FromString(text); return TakeStringList(SplitTypeTextNative(value.Ref)); }

    public static bool IsStringLikeTypeTexts(IReadOnlyList<string> typeTexts) => CallSingle(typeTexts, IsStringLikeTypeTextsNative);
    public static bool IsNumberLikeTypeTexts(IReadOnlyList<string> typeTexts) => CallSingle(typeTexts, IsNumberLikeTypeTextsNative);
    public static bool IsBigintLikeTypeTexts(IReadOnlyList<string> typeTexts) => CallSingle(typeTexts, IsBigintLikeTypeTextsNative);
    public static bool IsAnyLikeTypeTexts(IReadOnlyList<string> typeTexts) => CallSingle(typeTexts, IsAnyLikeTypeTextsNative);
    public static bool IsUnknownLikeTypeTexts(IReadOnlyList<string> typeTexts) => CallSingle(typeTexts, IsUnknownLikeTypeTextsNative);
    public static bool IsArrayLikeTypeTexts(IReadOnlyList<string> typeTexts) => CallSingle(typeTexts, IsArrayLikeTypeTextsNative);

    public static bool IsPromiseLikeTypeTexts(IReadOnlyList<string> typeTexts, IReadOnlyList<string>? propertyNames = null) =>
        CallDual(typeTexts, propertyNames, IsPromiseLikeTypeTextsNative);

    public static bool IsErrorLikeTypeTexts(IReadOnlyList<string> typeTexts, IReadOnlyList<string>? propertyNames = null) =>
        CallDual(typeTexts, propertyNames, IsErrorLikeTypeTextsNative);

    public static bool HasUnsafeAnyFlow(IReadOnlyList<string> sourceTexts, IReadOnlyList<string> targetTexts) =>
        CallFlow(sourceTexts, targetTexts, HasUnsafeAnyFlowNative);
    public static bool IsUnsafeAssignment(IReadOnlyList<string> sourceTexts, IReadOnlyList<string> targetTexts) =>
        CallFlow(sourceTexts, targetTexts, IsUnsafeAssignmentNative);
    public static bool IsUnsafeReturn(IReadOnlyList<string> sourceTexts, IReadOnlyList<string> targetTexts) =>
        CallFlow(sourceTexts, targetTexts, IsUnsafeReturnNative);

    private static bool CallSingle(IReadOnlyList<string> typeTexts, Func<nint, nuint, bool> callback)
    {
        using var types = Utf8Inputs.FromStrings(typeTexts);
        return callback(types.Pointer, types.Length);
    }

    private static bool CallDual(
        IReadOnlyList<string> typeTexts,
        IReadOnlyList<string>? propertyNames,
        Func<nint, nuint, nint, nuint, bool> callback)
    {
        using var types = Utf8Inputs.FromStrings(typeTexts);
        using var properties = Utf8Inputs.FromStrings(propertyNames ?? Array.Empty<string>());
        return callback(types.Pointer, types.Length, properties.Pointer, properties.Length);
    }

    private static bool CallFlow(
        IReadOnlyList<string> sourceTexts,
        IReadOnlyList<string> targetTexts,
        Func<nint, nuint, nint, nuint, bool> callback)
    {
        using var sources = Utf8Inputs.FromStrings(sourceTexts);
        using var targets = Utf8Inputs.FromStrings(targetTexts);
        return callback(sources.Pointer, sources.Length, targets.Pointer, targets.Length);
    }
    private static string TakeString(CorsaString value)
    {
        try
        {
            return value.Ptr == 0 || value.Len == 0
                ? string.Empty
                : unsafe { Encoding.UTF8.GetString((byte*)value.Ptr, checked((int)value.Len)) };
        }
        finally
        {
            FreeString(value);
        }
    }

    private static IReadOnlyList<string> TakeStringList(CorsaStringList value)
    {
        try
        {
            if (value.Ptr == 0 || value.Len == 0)
            {
                return Array.Empty<string>();
            }
            unsafe
            {
                var items = (CorsaString*)value.Ptr;
                var result = new string[checked((int)value.Len)];
                for (var index = 0; index < result.Length; index++)
                {
                    var item = items[index];
                    result[index] = item.Ptr == 0 || item.Len == 0
                        ? string.Empty
                        : Encoding.UTF8.GetString((byte*)item.Ptr, checked((int)item.Len));
                }
                return result;
            }
        }
        finally
        {
            FreeStringList(value);
        }
    }
    private sealed class Utf8Input(nint buffer, nuint length) : IDisposable
    {
        public CorsaStrRef Ref { get; } = new(buffer, length);
        public static Utf8Input FromString(string value)
        {
            if (value.Length == 0)
            {
                return new Utf8Input(0, 0);
            }
            var bytes = Encoding.UTF8.GetBytes(value);
            var buffer = Marshal.AllocHGlobal(bytes.Length);
            Marshal.Copy(bytes, 0, buffer, bytes.Length);
            return new Utf8Input(buffer, (nuint)bytes.Length);
        }
        public void Dispose()
        {
            if (buffer != 0)
            {
                Marshal.FreeHGlobal(buffer);
            }
        }
    }
    private sealed class Utf8Inputs(Utf8Input[] values, nint pointer) : IDisposable
    {
        public nint Pointer { get; } = pointer;
        public nuint Length { get; } = (nuint)values.Length;
        public static Utf8Inputs FromStrings(IReadOnlyList<string> values)
        {
            if (values.Count == 0)
            {
                return new Utf8Inputs([], 0);
            }
            var inputs = values.Select(Utf8Input.FromString).ToArray();
            var stride = Marshal.SizeOf<CorsaStrRef>();
            var buffer = Marshal.AllocHGlobal(stride * values.Count);
            for (var index = 0; index < inputs.Length; index++)
            {
                Marshal.StructureToPtr(inputs[index].Ref, buffer + index * stride, false);
            }
            return new Utf8Inputs(inputs, buffer);
        }
        public void Dispose()
        {
            foreach (var value in values)
            {
                value.Dispose();
            }
            if (Pointer != 0)
            {
                Marshal.FreeHGlobal(Pointer);
            }
        }
    }
}
