// Copyright 2022 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package transport

import (
	"github.com/synnaxlabs/aspen/internal/cluster/gossip"
	"github.com/synnaxlabs/aspen/internal/cluster/pledge"
	"github.com/synnaxlabs/aspen/internal/kv"
	"github.com/synnaxlabs/x/address"
	"github.com/synnaxlabs/x/signal"
)

type Transport interface {
	Configure(ctx signal.Context, addr address.Address, external bool) error
	PledgeServer() pledge.TransportServer
	PledgeClient() pledge.TransportClient
	GossipServer() gossip.TransportServer
	GossipClient() gossip.TransportClient
	BatchServer() kv.BatchTransportServer
	BatchClient() kv.BatchTransportClient
	LeaseServer() kv.LeaseTransportServer
	LeaseClient() kv.LeaseTransportClient
	FeedbackServer() kv.FeedbackTransportServer
	FeedbackClient() kv.FeedbackTransportClient
}
