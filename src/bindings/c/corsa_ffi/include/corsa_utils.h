#ifndef CORSA_UTILS_H
#define CORSA_UTILS_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct CorsaStrRef {
  const uint8_t *ptr;
  size_t len;
} CorsaStrRef;

typedef struct CorsaString {
  char *ptr;
  size_t len;
} CorsaString;

typedef struct CorsaStringList {
  CorsaString *ptr;
  size_t len;
} CorsaStringList;

CorsaString corsa_utils_classify_type_text(CorsaStrRef text);
CorsaStringList corsa_utils_split_top_level_type_text(CorsaStrRef text, uint32_t delimiter);
CorsaStringList corsa_utils_split_type_text(CorsaStrRef text);

bool corsa_utils_is_string_like_type_texts(const CorsaStrRef *type_texts, size_t type_texts_len);
bool corsa_utils_is_number_like_type_texts(const CorsaStrRef *type_texts, size_t type_texts_len);
bool corsa_utils_is_bigint_like_type_texts(const CorsaStrRef *type_texts, size_t type_texts_len);
bool corsa_utils_is_any_like_type_texts(const CorsaStrRef *type_texts, size_t type_texts_len);
bool corsa_utils_is_unknown_like_type_texts(const CorsaStrRef *type_texts, size_t type_texts_len);
bool corsa_utils_is_array_like_type_texts(const CorsaStrRef *type_texts, size_t type_texts_len);
bool corsa_utils_is_promise_like_type_texts(
    const CorsaStrRef *type_texts,
    size_t type_texts_len,
    const CorsaStrRef *property_names,
    size_t property_names_len
);
bool corsa_utils_is_error_like_type_texts(
    const CorsaStrRef *type_texts,
    size_t type_texts_len,
    const CorsaStrRef *property_names,
    size_t property_names_len
);
bool corsa_utils_has_unsafe_any_flow(
    const CorsaStrRef *source_texts,
    size_t source_texts_len,
    const CorsaStrRef *target_texts,
    size_t target_texts_len
);
bool corsa_utils_is_unsafe_assignment(
    const CorsaStrRef *source_texts,
    size_t source_texts_len,
    const CorsaStrRef *target_texts,
    size_t target_texts_len
);
bool corsa_utils_is_unsafe_return(
    const CorsaStrRef *source_texts,
    size_t source_texts_len,
    const CorsaStrRef *target_texts,
    size_t target_texts_len
);

void corsa_utils_string_free(CorsaString value);
void corsa_utils_string_list_free(CorsaStringList value);

#ifdef __cplusplus
}
#endif

#endif
