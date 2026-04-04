use crate::{
    corsa_utils_classify_type_text, corsa_utils_has_unsafe_any_flow,
    corsa_utils_is_error_like_type_texts, corsa_utils_split_type_text,
    types::{CorsaStrRef, corsa_utils_string_free, corsa_utils_string_list_free},
};

fn text_ref(text: &str) -> CorsaStrRef {
    CorsaStrRef {
        ptr: text.as_ptr(),
        len: text.len(),
    }
}

#[test]
fn classifies_type_texts_over_ffi() {
    let result = unsafe { corsa_utils_classify_type_text(text_ref("Promise<string> | null")) };
    let text = unsafe {
        std::str::from_utf8(std::slice::from_raw_parts(
            result.ptr.cast::<u8>(),
            result.len,
        ))
        .unwrap()
        .to_owned()
    };
    unsafe {
        corsa_utils_string_free(result);
    }
    assert_eq!(text, "nullish");
}

#[test]
fn splits_type_texts_over_ffi() {
    let result = unsafe { corsa_utils_split_type_text(text_ref("string | Array<any>")) };
    let values = unsafe { std::slice::from_raw_parts(result.ptr, result.len) }
        .iter()
        .map(|value| unsafe {
            std::str::from_utf8(std::slice::from_raw_parts(
                value.ptr.cast::<u8>(),
                value.len,
            ))
            .unwrap()
            .to_owned()
        })
        .collect::<Vec<_>>();
    unsafe {
        corsa_utils_string_list_free(result);
    }
    assert_eq!(values, vec!["string", "Array<any>"]);
}

#[test]
fn evaluates_predicates_over_ffi() {
    let type_texts = [text_ref("TypeError")];
    let property_names = [text_ref("message"), text_ref("name")];
    assert!(unsafe {
        corsa_utils_is_error_like_type_texts(
            type_texts.as_ptr(),
            type_texts.len(),
            property_names.as_ptr(),
            property_names.len(),
        )
    });
    let source_texts = [text_ref("Promise<any>")];
    let target_texts = [text_ref("Promise<string>")];
    assert!(unsafe {
        corsa_utils_has_unsafe_any_flow(
            source_texts.as_ptr(),
            source_texts.len(),
            target_texts.as_ptr(),
            target_texts.len(),
        )
    });
}
