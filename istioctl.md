---
title: istioctl
layout: 2017/sheet
prism_languages: [bash,yaml]
weight: -3
tags: [Featured]
updated: 2022-08-05
category: CLI
intro:
  Istio command line cheatsheet.
---

## Intro

## Istioctl Overview

### Usage

[`istioctl`](https://istio.io/latest/docs/reference/commands/istioctl) command line usage overview.

![istioctl cheatsheet](img/istioctl.svg){:data-img="img/istioctl.svg"}

### experimental/x

Experimental commands that may be modified or deprecated. 

![istioctl-x](img/istioctl-x.svg){:data-img="img/istioctl-x.svg"}

See [Istio docs](https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-experimental) for details.

## dashboard/dash/d

### controlz

Open the ControlZ web UI for a pod in the Istio control plane.

```bash
istioctl dashboard controlz [<type>/]<name>[.<namespace>] [flags]
```

Example

```bash
istioctl d controlz istiod-6bc78ccdb-sgdgh -n istio-system
```

You will see the ControlZ UI at <http://localhost:9876>.

### envoy

Open the Envoy admin dashboard for a sidecar.

```bash
istioctl dashboard envoy [<type>/]<name>[.<namespace>] [flags]
```

Example

```bash
istioctl d envoy details-v1-7d88846999-ptz54 -n default
```

You can see the UI at <http://localhost:15000/>.

### grafana

Open Istio's Grafana dashboard.

```bash
istioctl dashboard grafana [flags]
```

Example

```bash
istioctl d grafana
```

You can see the Grafana UI at <http://localhost:3000>.

### jaeger

Open Istio's Jaeger dashboard.

```bash
istioctl dashboard jaeger [flags]
```

Jaeger is not installed by default, run the following command to install Jaeger.

```bash
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.14/samples/addons/jaeger.yaml
```

See [Istio docs](https://istio.io/latest/docs/ops/integrations/jaeger/#installation) for details.

Example

```bash
istioctl d jaeger
```

you can see the Jaeger UI at <http://localhost:16686>.

### kiali

Open Istio's Kiali dashboard.

```bash
istioctl dashboard kiali [flags]
```

Kiali is not installed by default, run the following command to install Kiali.

```bash
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.14/samples/addons/kiali.yaml
```

See [Istio docs](https://istio.io/latest/docs/ops/integrations/kiali/#installation) for details.

Example

```bash
istioctl d kiali
```

You can see the Kiali UI at <http://localhost:20001/kiali>.

### prometheus

Open Istio's Prometheus dashboard.

```bash
istioctl dashboard prometheus [flags]
```

Example

```bash
istioctl d prometheus
```

See the Prometheus UI at <http://localhost:9090>.

### skywalking

Open the Istio dashboard in the SkyWalking UI.

```bash
istioctl dashboard skywalking [flags]
```

SkyWalking is not installed by default, refer to the [SkyWalking docs](https://skywalking.apache.org/docs/main/latest/en/setup/istio/readme/) to see how to install.

Example

```bash
istioctl d skywalking
```

### zipkin

Open Istio's Zipkin dashboard.

```bash
istioctl dashboard zipkin [flags]
```

Zipkin is not installed by default, run the following command to install Zipkin.

```bash
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.14/samples/addons/extras/zipkin.yaml
```

See [Istio docs](https://istio.io/latest/docs/ops/integrations/zipkin/#installation) for details.

Example

```bash
istioctl d zipkin
```

You can see the Zipkin UI at <http://localhost:9411>.

## Frequently Used Commands

### install

The `install` command generates an Istio install manifest and applies it to a cluster.

Example

```bash
# Apply a default Istio installation
istioctl install

# Enable Tracing
istioctl install --set meshConfig.enableTracing=true

# Generate the demo profile and don't wait for confirmation
istioctl install --set profile=demo --skip-confirmation

# To override a setting that includes dots, escape them with a backslash (\).  Your shell may require enclosing quotes.
istioctl install --set "values.sidecarInjectorWebhook.injectedAnnotations.container\.apparmor\.security\.beta\.kubernetes\.io/istio-proxy=runtime/default"

# For setting boolean-string option, it should be enclosed quotes and escaped with a backslash (\).
istioctl install --set meshConfig.defaultConfig.proxyMetadata.PROXY_XDS_VIA_AGENT=\"false\"
```

### manifest

The manifest command generates and diffs Istio manifests.

**istioctl manifest install**

```bash
# Apply a default Istio installation
istioctl install

# Enable Tracing
istioctl install --set meshConfig.enableTracing=true

# Generate the demo profile and don't wait for confirmation
istioctl install --set profile=demo --skip-confirmation

# To override a setting that includes dots, escape them with a backslash (\).  Your shell may require enclosing quotes.
istioctl install --set "values.sidecarInjectorWebhook.injectedAnnotations.container\.apparmor\.security\.beta\.kubernetes\.io/istio-proxy=runtime/default"

# For setting boolean-string option, it should be enclosed quotes and escaped with a backslash (\).
istioctl install --set meshConfig.defaultConfig.proxyMetadata.PROXY_XDS_VIA_AGENT=\"false\"
```

**istioctl manifest generate**

```bash
# Generate a default Istio installation
istioctl manifest generate

# Enable Tracing
istioctl manifest generate --set meshConfig.enableTracing=true

# Generate the demo profile
istioctl manifest generate --set profile=demo

# To override a setting that includes dots, escape them with a backslash (\).  Your shell may require enclosing quotes.
istioctl manifest generate --set "values.sidecarInjectorWebhook.injectedAnnotations.container\.apparmor\.security\.beta\.kubernetes\.io/istio-proxy=runtime/default"

# For setting boolean-string option, it should be enclosed quotes and escaped with a backslash (\).
istioctl manifest generate --set meshConfig.defaultConfig.proxyMetadata.PROXY_XDS_VIA_AGENT=\"false\"
```

### proxy-config/pc

A group of commands used to retrieve information about proxy configuration from the Envoy config dump.

```bash
# Retrieve information about proxy configuration from an Envoy instance.
istioctl proxy-config <clusters|listeners|routes|endpoints|bootstrap|log|secret> <pod-name[.namespace]>
```

**Example**

```bash
# Retrieve cluster summary.
istioctl pc all

# Show a human-readable Istio and Envoy version summary.
istioctl pc b reviews-v1-55b668fc65-9twc9 -o short

# Retrieve summary about cluster configuration for a given pod from Envoy.

istioctl pc c reviews-v1-55b668fc65-9twc9

# Retrieve full endpoint configuration for a given pod from Envoy.
istioctl pc ep reviews-v1-55b668fc65-9twc9

# Retrieve summary about listener configuration for a given pod from Envoy.
istioctl pc l reviews-v1-55b668fc65-9twc9

# Retrieve summary about route configuration for a given pod from Envoy.
istioctl pc r reviews-v1-55b668fc65-9twc9
```

### proxy-status/ps

Retrieves last sent and last acknowledged xDS sync from Istiod to each Envoy in the mesh.

**Examples**

```bash
# Retrieve sync status for all Envoys in a mesh
istioctl proxy-status

# Retrieve sync diff for a single Envoy and Istiod
istioctl proxy-status istio-egressgateway-59585c5b9c-ndc59.istio-system

# Retrieve sync diff between Istiod and one pod under a deployment
istioctl proxy-status deployment/productpage-v1

# Write proxy config-dump to file, and compare to Istio control plane
kubectl port-forward -n istio-system istio-egressgateway-59585c5b9c-ndc59 15000 &
curl localhost:15000/config_dump > cd.json
istioctl proxy-status istio-egressgateway-59585c5b9c-ndc59.istio-system --file cd.json
```
