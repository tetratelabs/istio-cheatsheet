---
title: Architecture
layout: 2017/sheet
prism_languages: [bash,yaml]
weight: -3
tags: [Featured]
updated: 2022-08-04
category: Concepts
intro:
  Istio concepts.
---

## Intro

## Architecture

### Istio Architecture

Istio control plane is a single process -  `istiod`, which contains three components Pilot, Citadel and Galley. You can bring containers in Kubernetes and virtual machines into the Istio mesh together.

![Istio architecture](img/istio-arch.svg){:data-img="img/istio-arch.svg"}

### Components

The following figure show the components in Istio mesh.

![Istio components](img/istio-components.svg){:data-img="img/istio-components.svg"}

### Transparent Traffic Hijacking

The following figure shows the transparent traffic hijacking and traffic routing in Istio. 

![Transparent traffic hijacking](img/transparent-traffic-hijacking.svg){:data-img="img/transparent-traffic-hijacking.svg"}

**Note**

- Only TCP traffic is shown in the figure. Traffic for UDP and other protocols will not be hijacked.
- It is based on Istio 1.14.
- It shows the traffic routing in `reviews` pod of the [Bookinfo](https://istio.io/latest/docs/examples/bookinfo/) sample.

### Data Plane

[Envoy](https://envoyproxy.io) is the default sidecar proxy in Istio.

![Envoy architecture](img/envoy-arch.svg){:data-img="img/envoy-arch.svg"}

See [Envoy section](#envoy).

## Envoy

### xDS

Istiod distributes the proxy configurations to Envoy via [xDS](https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol) protocol.

![xDS](img/xds.svg){:data-img="img/xds.svg"}

