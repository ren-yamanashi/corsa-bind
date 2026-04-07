{
  description = "Nix development environment for corsa-bind";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs/nixos-unstable";
    };
    tnix = {
      url = "github:ubugeeei/tnix";
    };
  };
  outputs = inputs: import ./nix/flake-outputs.nix inputs;
}