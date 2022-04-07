---
title: Setup
layout: 2017/sheet
prism_languages: [bash,yaml]
weight: -3
tags: [Featured]
updated: 2022-03-17
category: Setup
intro:
  Cheatsheet for installing the Istio control plane on Kubernetes.
---

## Intro

## Basic

### Supported Kubernetes version

| Version | Currently Supported | Supported Kubernetes Versions | Tested, but not supported |
| ------- | ------------------- | ----------------------------- | ------------------------- |
| 1.13    | Yes                 | 1.20, 1.21, 1.22, 1.23        | 1.16, 1.17, 1.18, 1.19    |
| 1.12    | Yes                 | 1.19, 1.20, 1.21, 1.22        | 1.16, 1.17, 1.18          |
| 1.11    | Yes                 | 1.18, 1.19, 1.20, 1.21, 1.22  | 1.16, 1.17                |
| 1.10    | No                  | 1.18, 1.19, 1.20, 1.21        | 1.16, 1.17, 1.22          |
| 1.9     | No                  | 1.17, 1.18, 1.19, 1.20        | 1.15, 1.16                |
| 1.8     | No                  | 1.16, 1.17, 1.18, 1.19        | 1.15                      |
| 1.7     | No                  | 1.16, 1.17, 1.18              | 1.15                      |
{: .-headers}

Visit [istio.io](https://istio.io/latest/docs/releases/supported-releases/#support-status-of-istio-releases) for more details.

### Original CLI

```bash
export VERSION=1.13.1
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=${VERSION} sh -
cd istio-$VERSION
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo
```

See [profile section](#profile).

### GetMesh

```bash
curl -sL https://istio.tetratelabs.io/getmesh/install.sh | bash
getmesh istioctl install --set profile=demo
```

## Istio Operator

### Operator

#### demo-profile.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: istio-system
---
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: demo-istio-install
spec:
  profile: demo
```

{:.-file}

Apply the operator:

```bash
$ kubectl apply -f demo-profile.yaml  
namespace/istio-system created
istiooperator.install.istio.io/demo-istio-install created
```

Visit [istio.io](https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/) for more details.

### Profile

The profiles provide customization of the Istio control plane and of the sidecars for the Istio data plane.

| component | default                | demo | minimal | preview |
| ---------------------- | ---- | ------- | -------- | ----- | ------- | ---- |
| egress gateway  |      | ✔       |             |      |
| ingress gateway | ✔    | ✔       |          | ✔    |
| istiod               | ✔    | ✔       | ✔             | ✔    |
{:.-headers}

Except the profiles above, there are `external` and `empty` profile that will not install any component list within the table.

## Resources Limiting

### Sidecar

Using the various resource [annotations](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/) that Istio supports to control sidecar behavior.

- `sidecar.istio.io/proxyCPU` : Specifies the requested CPU setting for the Envoy sidecar.
- `sidecar.istio.io/proxyCPULimit`: Specifies the CPU limit for the Envoy sidecar.
- `sidecar.istio.io/proxyMemory`: Specifies the requested memory setting for the Envoy sidecar.
- `sidecar.istio.io/proxyMemoryLimit`:  Specifies the memory limit for the Envoy sidecar.

[See the details](https://istio.io/latest/docs/reference/config/annotations/) of sidecar annotations.

## Checklist

### Install distroless images

```bash
istioctl install --set tag=1.xx.x-distroless
```

Replace `1.xx.x` with the right version number.

### Platforms

- For platform [set up](https://istio.io/latest/docs/setup/platform-setup/).
- Different cloud providers have different configuration requirements to enable Istio CNI. To have CNI enabled, AKS clusters would have to be created with the `--network-plugin azure` flag added. [Click here](https://istio.io/latest/docs/setup/additional-setup/cni/#hosted-kubernetes-settings) for further details.

### Automatic namespace level sidecar injection

```bash
kubectl label <namespace> default istio-injection=enabled
```

### Others

- Always do pre and post checks after Istio installation. This is enabled by default when installing Istio through [Tetrate Istio Distro](https://docs.tetrate.io/download/).
- Starting with Istio 1.8, Istio by default would merge application metrics into Istio metrics by scraping prometheus.io annotations. This may not be suitable where application metrics data are considered sensitive. This default merge can be disabled at the mesh level by passing `--set meshConfig.enablePrometheusMerge=false` during installation. Or this feature can be disabled per workload by adding a `prometheus.istio.io/merge-metrics: "false"` annotation on a pod. [Click here](https://istio.io/latest/docs/ops/integrations/prometheus/) for further details.
