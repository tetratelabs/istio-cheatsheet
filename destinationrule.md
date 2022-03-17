---
title: DestinationRule
layout: 2017/sheet
prism_languages: [bash,yaml]
weight: -3
tags: [Featured]
updated: 2022-03-17
category: Resources
intro: 
  DestinationRule defines policies that apply to traffic intended for a service after routing has occurred. 
---

## Intro

## Basic

### Sample

#### sample/resources/destinationrule.yaml

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: bookinfo-ratings
spec:
  host: ratings.prod.svc.cluster.local
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
  subsets:
  - name: testversion
    labels:
      version: v3
    trafficPolicy:
      loadBalancer:
        simple: ROUND_ROBIN
```
{:data-line="6,7,10"}

### Fileds

The interpretation of the fields in the sample.

- `host`:  The name of a service from the service registry. `ratings.prod.svc.cluster.local` stand for a service called `rating` in `prod` namespace in Kubernetes.
- `trafficPolicy`: Traffic policies to apply (load balancing policy, connection pool sizes, outlier detection). 
- `subsets`: One or more named sets that represent individual versions of a service. It can be used for scenarios like A/B testing, or routing to a specific version of a service. It will be referred from [VirtualService](virtualservice).

Visit [istio.io](https://istio.io/latest/docs/reference/config/networking/destination-rule) for more details.