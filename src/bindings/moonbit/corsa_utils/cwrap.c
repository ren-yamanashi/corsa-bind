#include <moonbit.h>

#include "../../../c/corsa_ffi/include/corsa_utils.h"

#include <string.h>

static CorsaStrRef corsa_moonbit_ref(moonbit_bytes_t bytes) {
  return (CorsaStrRef){
      .ptr = bytes,
      .len = bytes == NULL ? 0 : (size_t)Moonbit_array_length(bytes),
  };
}

static moonbit_bytes_t corsa_bytes_from_string(CorsaString value) {
  moonbit_bytes_t out = moonbit_make_bytes_raw((int32_t)value.len);
  if (value.ptr != NULL && value.len != 0) {
    memcpy(out, value.ptr, value.len);
  }
  corsa_utils_string_free(value);
  return out;
}

MOONBIT_FFI_EXPORT moonbit_bytes_t corsa_utils_classify_type_text_mbt(moonbit_bytes_t text) {
  return corsa_bytes_from_string(corsa_utils_classify_type_text(corsa_moonbit_ref(text)));
}

static int32_t corsa_single_text_predicate(
    moonbit_bytes_t text,
    bool (*predicate)(const CorsaStrRef *, size_t)) {
  CorsaStrRef type_texts[1] = {corsa_moonbit_ref(text)};
  return predicate(type_texts, 1);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_string_like_type_texts_mbt(moonbit_bytes_t text) {
  return corsa_single_text_predicate(text, corsa_utils_is_string_like_type_texts);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_number_like_type_texts_mbt(moonbit_bytes_t text) {
  return corsa_single_text_predicate(text, corsa_utils_is_number_like_type_texts);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_bigint_like_type_texts_mbt(moonbit_bytes_t text) {
  return corsa_single_text_predicate(text, corsa_utils_is_bigint_like_type_texts);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_any_like_type_texts_mbt(moonbit_bytes_t text) {
  return corsa_single_text_predicate(text, corsa_utils_is_any_like_type_texts);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_unknown_like_type_texts_mbt(moonbit_bytes_t text) {
  return corsa_single_text_predicate(text, corsa_utils_is_unknown_like_type_texts);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_array_like_type_texts_mbt(moonbit_bytes_t text) {
  return corsa_single_text_predicate(text, corsa_utils_is_array_like_type_texts);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_promise_like_type_texts_mbt(
    moonbit_bytes_t type_text,
    moonbit_bytes_t property_name) {
  CorsaStrRef type_texts[1] = {corsa_moonbit_ref(type_text)};
  CorsaStrRef property_names[1] = {corsa_moonbit_ref(property_name)};
  return corsa_utils_is_promise_like_type_texts(type_texts, 1, property_names, 1);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_error_like_type_texts_mbt(
    moonbit_bytes_t type_text,
    moonbit_bytes_t property_name_a,
    moonbit_bytes_t property_name_b) {
  CorsaStrRef type_texts[1] = {corsa_moonbit_ref(type_text)};
  CorsaStrRef property_names[2] = {
      corsa_moonbit_ref(property_name_a),
      corsa_moonbit_ref(property_name_b),
  };
  return corsa_utils_is_error_like_type_texts(type_texts, 1, property_names, 2);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_has_unsafe_any_flow_mbt(
    moonbit_bytes_t source_text,
    moonbit_bytes_t target_text) {
  CorsaStrRef source_texts[1] = {corsa_moonbit_ref(source_text)};
  CorsaStrRef target_texts[1] = {corsa_moonbit_ref(target_text)};
  return corsa_utils_has_unsafe_any_flow(source_texts, 1, target_texts, 1);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_unsafe_assignment_mbt(
    moonbit_bytes_t source_text,
    moonbit_bytes_t target_text) {
  CorsaStrRef source_texts[1] = {corsa_moonbit_ref(source_text)};
  CorsaStrRef target_texts[1] = {corsa_moonbit_ref(target_text)};
  return corsa_utils_is_unsafe_assignment(source_texts, 1, target_texts, 1);
}

MOONBIT_FFI_EXPORT int32_t corsa_utils_is_unsafe_return_mbt(
    moonbit_bytes_t source_text,
    moonbit_bytes_t target_text) {
  CorsaStrRef source_texts[1] = {corsa_moonbit_ref(source_text)};
  CorsaStrRef target_texts[1] = {corsa_moonbit_ref(target_text)};
  return corsa_utils_is_unsafe_return(source_texts, 1, target_texts, 1);
}
