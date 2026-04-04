package corsautils

import "testing"

func TestUtilsBindings(t *testing.T) {
	if got := ClassifyTypeText("Promise<string> | null"); got != "nullish" {
		t.Fatalf("classify = %q", got)
	}
	split := SplitTypeText("string | Promise<any>")
	if len(split) != 2 || split[1] != "Promise<any>" {
		t.Fatalf("split = %#v", split)
	}
	if !IsErrorLikeTypeTexts([]string{"TypeError"}, nil) {
		t.Fatal("expected error-like detection")
	}
	if !HasUnsafeAnyFlow([]string{"Promise<any>"}, []string{"Promise<string>"}) {
		t.Fatal("expected unsafe any flow detection")
	}
}
