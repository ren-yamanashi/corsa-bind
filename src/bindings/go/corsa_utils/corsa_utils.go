package corsautils

/*
#cgo CFLAGS: -I${SRCDIR}/../../c/corsa_ffi/include
#cgo LDFLAGS: -L${SRCDIR}/../../../../target/debug -lcorsa_ffi
#include "corsa_utils.h"
#include <stdlib.h>
*/
import "C"

import (
	"unsafe"
)

type borrowedString struct {
	ref C.CorsaStrRef
	ptr unsafe.Pointer
}

func newBorrowedString(value string) borrowedString {
	if value == "" {
		return borrowedString{}
	}
	ptr := C.CBytes([]byte(value))
	return borrowedString{
		ptr: ptr,
		ref: C.CorsaStrRef{
			ptr: (*C.uint8_t)(ptr),
			len: C.size_t(len(value)),
		},
	}
}

func (value borrowedString) free() {
	if value.ptr != nil {
		C.free(value.ptr)
	}
}

type borrowedStrings struct {
	values []borrowedString
	refs   []C.CorsaStrRef
}

func newBorrowedStrings(values []string) borrowedStrings {
	items := make([]borrowedString, len(values))
	refs := make([]C.CorsaStrRef, len(values))
	for index, value := range values {
		item := newBorrowedString(value)
		items[index] = item
		refs[index] = item.ref
	}
	return borrowedStrings{values: items, refs: refs}
}

func (value borrowedStrings) ptr() *C.CorsaStrRef {
	if len(value.refs) == 0 {
		return nil
	}
	return &value.refs[0]
}

func (value borrowedStrings) len() C.size_t {
	return C.size_t(len(value.refs))
}

func (value borrowedStrings) free() {
	for _, item := range value.values {
		item.free()
	}
}

func takeString(value C.CorsaString) string {
	defer C.corsa_utils_string_free(value)
	if value.ptr == nil || value.len == 0 {
		return ""
	}
	return C.GoStringN(value.ptr, C.int(value.len))
}

func takeStringList(value C.CorsaStringList) []string {
	defer C.corsa_utils_string_list_free(value)
	if value.ptr == nil || value.len == 0 {
		return nil
	}
	items := unsafe.Slice(value.ptr, int(value.len))
	out := make([]string, 0, len(items))
	for _, item := range items {
		if item.ptr == nil || item.len == 0 {
			out = append(out, "")
			continue
		}
		out = append(out, C.GoStringN(item.ptr, C.int(item.len)))
	}
	return out
}

func ClassifyTypeText(text string) string {
	borrowed := newBorrowedString(text)
	defer borrowed.free()
	return takeString(C.corsa_utils_classify_type_text(borrowed.ref))
}

func SplitTopLevelTypeText(text string, delimiter rune) []string {
	borrowed := newBorrowedString(text)
	defer borrowed.free()
	return takeStringList(C.corsa_utils_split_top_level_type_text(borrowed.ref, C.uint32_t(delimiter)))
}

func SplitTypeText(text string) []string {
	borrowed := newBorrowedString(text)
	defer borrowed.free()
	return takeStringList(C.corsa_utils_split_type_text(borrowed.ref))
}

func IsStringLikeTypeTexts(values []string) bool {
	borrowed := newBorrowedStrings(values)
	defer borrowed.free()
	return bool(C.corsa_utils_is_string_like_type_texts(borrowed.ptr(), borrowed.len()))
}

func IsNumberLikeTypeTexts(values []string) bool {
	borrowed := newBorrowedStrings(values)
	defer borrowed.free()
	return bool(C.corsa_utils_is_number_like_type_texts(borrowed.ptr(), borrowed.len()))
}

func IsBigintLikeTypeTexts(values []string) bool {
	borrowed := newBorrowedStrings(values)
	defer borrowed.free()
	return bool(C.corsa_utils_is_bigint_like_type_texts(borrowed.ptr(), borrowed.len()))
}

func IsAnyLikeTypeTexts(values []string) bool {
	borrowed := newBorrowedStrings(values)
	defer borrowed.free()
	return bool(C.corsa_utils_is_any_like_type_texts(borrowed.ptr(), borrowed.len()))
}

func IsUnknownLikeTypeTexts(values []string) bool {
	borrowed := newBorrowedStrings(values)
	defer borrowed.free()
	return bool(C.corsa_utils_is_unknown_like_type_texts(borrowed.ptr(), borrowed.len()))
}

func IsArrayLikeTypeTexts(values []string) bool {
	borrowed := newBorrowedStrings(values)
	defer borrowed.free()
	return bool(C.corsa_utils_is_array_like_type_texts(borrowed.ptr(), borrowed.len()))
}

func IsPromiseLikeTypeTexts(typeTexts []string, propertyNames []string) bool {
	types := newBorrowedStrings(typeTexts)
	defer types.free()
	properties := newBorrowedStrings(propertyNames)
	defer properties.free()
	return bool(C.corsa_utils_is_promise_like_type_texts(
		types.ptr(),
		types.len(),
		properties.ptr(),
		properties.len(),
	))
}

func IsErrorLikeTypeTexts(typeTexts []string, propertyNames []string) bool {
	types := newBorrowedStrings(typeTexts)
	defer types.free()
	properties := newBorrowedStrings(propertyNames)
	defer properties.free()
	return bool(C.corsa_utils_is_error_like_type_texts(
		types.ptr(),
		types.len(),
		properties.ptr(),
		properties.len(),
	))
}

func HasUnsafeAnyFlow(sourceTexts []string, targetTexts []string) bool {
	sources := newBorrowedStrings(sourceTexts)
	defer sources.free()
	targets := newBorrowedStrings(targetTexts)
	defer targets.free()
	return bool(C.corsa_utils_has_unsafe_any_flow(
		sources.ptr(),
		sources.len(),
		targets.ptr(),
		targets.len(),
	))
}

func IsUnsafeAssignment(sourceTexts []string, targetTexts []string) bool {
	sources := newBorrowedStrings(sourceTexts)
	defer sources.free()
	targets := newBorrowedStrings(targetTexts)
	defer targets.free()
	return bool(C.corsa_utils_is_unsafe_assignment(
		sources.ptr(),
		sources.len(),
		targets.ptr(),
		targets.len(),
	))
}

func IsUnsafeReturn(sourceTexts []string, targetTexts []string) bool {
	sources := newBorrowedStrings(sourceTexts)
	defer sources.free()
	targets := newBorrowedStrings(targetTexts)
	defer targets.free()
	return bool(C.corsa_utils_is_unsafe_return(
		sources.ptr(),
		sources.len(),
		targets.ptr(),
		targets.len(),
	))
}
