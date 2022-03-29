---
title: Traffic Management
layout: 2017/sheet
prism_languages: [bash,yaml]
weight: -3
tags: [Featured]
updated: 2022-03-25
category: Resources
intro: 
  Traffic management API configurations.
---

## Intro

### Resources

- [`Gateway`](#gateway) describes a load balancer operating at the edge of the mesh receiving incoming or outgoing HTTP/TCP connections. 
- [`VirtualService`](#virtualservice)  defines a set of traffic routing rules to apply when a host is addressed.
- [`DestinationRule`](#destinationrule) defines policies that apply to traffic intended for a service after routing has occurred. 
- [`WorkloadEntry`](#workloadentry) enables operators to describe the properties of a single non-Kubernetes workload such as a VM or a bare metal server as it is onboarded into the mesh.
- [`WorkloadGroup`](#workloadgroup) describes a collection of workload instances. 

## Gateway

### Sample

#### sample/traffic-management/gateway.yaml

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: bookinfo-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "bookinfo/*"
```
{:data-line="6,13"}

After creating the Gateway, you also need to create a [VirtualService](#virtualservice) to bind to it.

### Fields

The interpretation of the fields in the sample.

- `selector`: all pods with `istio: ingressgateway` labels will act as edge proxy.
- `hosts`: it allows any VirtualService in the `bookinfo` namespace to bind to it. If the Gateway is deployed in the `bookinfo` namespace, `bookinfo` can be omitted here.


## VirtualService

### Sample

#### sample/resources/virtualservice.yaml


```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: bookinfo
spec:
  hosts:
  - "*"
  gateways:
  - bookinfo-gateway
  http:
  - match:
    - uri:
        exact: /productpage
    - uri:
        prefix: /static
    - uri:
        exact: /login
    - uri:
        exact: /logout
    - uri:
        prefix: /api/v1/products
    route:
    - destination:
        host: productpage
        port:
          number: 9080
        subset: v1
```
{:data-line="6,8,17,19,27"}

This VirtualService is bound to the [Gateway](#gateway) above. VirtualService and [DestinationRule](#destinationrule) are the basic configuration that affect the traffic routing.

### Fileds

The interpretation of the fields in the sample.

- `hosts`: The destination hosts to which traffic is being sent. You should notice that this is an array where you can configure multiple hosts at the same time, i.e. control all traffic destined for these hosts.
- `http`: An ordered list of route rules for HTTP traffic. Note that rules are executed sequentially, so if the previous rule matches, the later rule will not be executed.
- `route`:  A HTTP rule can either redirect or forward (default) traffic. It describes match conditions and actions for routing HTTP/1.1, HTTP2, and gRPC traffic.
- `subset`: One or more named sets that represent individual versions of a service. It can be used for scenarios like A/B testing, or routing to a specific version of a service. You need to config subsets on a [DestinationRule](#destinationrule).

Visit [istio.io](https://istio.io/latest/docs/reference/config/networking/virtual-service/) for more details.

## DestinationRule

### Sample

#### sample/resources/destinationrule.yaml

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: productpage
spec:
  host: productpage.bookinfo.svc.cluster.local
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
  subsets:
  - name: v1
    labels:
      version: v1
```

{:data-line="6,7,10"}

### Fileds

The interpretation of the fields in the sample.

- `host`:  The name of a service from the service registry. `ratings.prod.svc.cluster.local` stand for a service called `rating` in `prod` namespace in Kubernetes.
- `trafficPolicy`: Traffic policies to apply (load balancing policy, connection pool sizes, outlier detection). 
- `subsets`: One or more named sets that represent individual versions of a service. It can be used for scenarios like A/B testing, or routing to a specific version of a service. It will be referred from [VirtualService](virtualservice).

Visit [istio.io](https://istio.io/latest/docs/reference/config/networking/destination-rule) for more details.

## WorkloadEntry

### Sample

#### sample/resources/workloadentry.yaml

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: WorkloadEntry
metadata:
  name: details-we
spec:
  serviceAccount: details-legacy
  address: 2.2.2.2
  labels:
    app: details-legacy
    instance-id: vm1
```
{:data-line="6,7,8"}

### Fields

The interpretation of the fields in the sample.

- `serviceAccount`: the service account must be present in the same namespace as the configuration.
- `address`: IP address without port, FQDN or UNIX socket.
- `labels`: one or more labels associated with the endpoint. [WorkloadGroup](#workloadgroup) will refer to them.

## WorkloadGroup

### Samples

#### sample/resources/workloadgroup.yaml

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: WorkloadGroup
metadata:
  name: details-wg
spec:
  metadata:
    labels:
      app.kubernetes.io/name: details
  template:
    ports:
      http: 8080
    serviceAccount: default
  probe:
    initialDelaySeconds: 5
    timeoutSeconds: 3
    periodSeconds: 4
    successThreshold: 3
    failureThreshold: 3
```
{:data-line="9"}

### Fields

The interpretation of the fields in the sample.

- `template`：to be used for the generation of `WorkloadEntry` resources that belong to this `WorkloadGroup`. 

Visit [istio.io](https://istio.io/latest/docs/reference/config/networking/workload-group/) for more details.

