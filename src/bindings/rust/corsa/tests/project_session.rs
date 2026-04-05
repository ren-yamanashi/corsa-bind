mod support;

use corsa::{
    api::{ApiMode, ProjectSession, TypeProbeOptions},
    fast::CompactString,
    runtime::block_on,
};

#[test]
fn project_session_reuses_snapshot_and_project_handles() {
    block_on(async {
        let mut session = ProjectSession::spawn(
            support::api_config(ApiMode::AsyncJsonRpcStdio),
            "/workspace/tsconfig.json",
            Some("/workspace/src/index.ts".into()),
        )
        .await
        .unwrap();

        let project_id = session.project().id.clone();
        let symbol = session
            .get_symbol_at_position("/workspace/src/index.ts", 1)
            .await
            .unwrap()
            .unwrap();
        assert_eq!(symbol.name, "value");

        let type_response = session
            .get_type_of_symbol(symbol.id)
            .await
            .unwrap()
            .unwrap();
        let rendered = session
            .type_to_string(type_response.id, None, None)
            .await
            .unwrap();
        assert_eq!(rendered, "type:string");

        session.refresh(None).await.unwrap();
        assert_eq!(session.project().id, project_id);
        assert!(
            session
                .get_type_at_position("/workspace/src/index.ts", 1)
                .await
                .unwrap()
                .is_some()
        );

        session.close().await.unwrap();
    });
}

#[test]
fn project_session_builds_checker_probe_views() {
    block_on(async {
        let session = ProjectSession::spawn(
            support::api_config(ApiMode::AsyncJsonRpcStdio),
            "/workspace/tsconfig.json",
            Some("/workspace/src/index.ts".into()),
        )
        .await
        .unwrap();

        let probe = session
            .probe_type_at_position(
                "/workspace/src/index.ts",
                1,
                TypeProbeOptions {
                    load_property_types: true,
                    load_signatures: true,
                },
            )
            .await
            .unwrap()
            .unwrap();

        assert_eq!(probe.type_texts, vec![CompactString::from("type-text")]);
        assert_eq!(probe.property_names, vec![CompactString::from("value")]);
        assert_eq!(
            probe.property_types,
            vec![vec![CompactString::from("type-text")]]
        );
        assert_eq!(
            probe.call_signatures,
            vec![vec![vec![CompactString::from("type-text")]]]
        );
        assert_eq!(
            probe.return_types,
            vec![vec![CompactString::from("type-text")]]
        );

        session.close().await.unwrap();
    });
}
