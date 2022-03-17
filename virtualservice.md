---
title: VirtualService
layout: 2017/sheet
prism_languages: [bash,yaml]
weight: -3
tags: [Featured]
updated: 2022-03-17
category: Resources
intro: 
  VirtualService configuration affecting traffic routing. 
---

## Intro

## Basic

### Sample

#### sample/resources/virtualservice.yaml

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews-route
spec:
  hosts:
  - reviews.prod.svc.cluster.local
  http:
  - name: "reviews-v2-routes"
    match:
    - uri:
        prefix: "/wpcatalog"
    - uri:
        prefix: "/consumercatalog"
    rewrite:
      uri: "/newcatalog"
    route:
    - destination:
        host: reviews.prod.svc.cluster.local
        subset: v2
  - name: "reviews-v1-route"
    route:
    - destination:
        host: reviews.prod.svc.cluster.local
        subset: v1
```
{:data-line="6,8,17,19"}

VirtualService and [DestinationRule](destinationrule) are the basic configuration that affect the traffic routing. 

### Fileds

The interpretation of the fields in the sample.

- `hosts`: The destination hosts to which traffic is being sent. You should notice that this is an array where you can configure multiple hosts at the same time, i.e. control all traffic destined for these hosts. `reviews` is a service in `prod` namespace in a Kubernetes cluster. Keep use the fully qualified domain names over short names. 
- `http`: An ordered list of route rules for HTTP traffic. Note that rules are executed sequentially, so if the previous rule matches, the later rule will not be executed.
- `route`:  A HTTP rule can either redirect or forward (default) traffic. It describes match conditions and actions for routing HTTP/1.1, HTTP2, and gRPC traffic.
- `subset`: One or more named sets that represent individual versions of a service. It can be used for scenarios like A/B testing, or routing to a specific version of a service. You need to config subsets on a [DestinationRule](destinationrule).

Visit [istio.io](https://istio.io/latest/docs/reference/config/networking/virtual-service/) for more details.