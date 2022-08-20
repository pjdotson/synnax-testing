package cluster_test

import (
	"context"
	"github.com/arya-analytics/aspen/internal/cluster"
	"github.com/arya-analytics/aspen/internal/cluster/clustermock"
	"github.com/arya-analytics/aspen/internal/cluster/gossip"
	"github.com/arya-analytics/aspen/internal/cluster/pledge"
	"github.com/arya-analytics/aspen/internal/node"
	"github.com/arya-analytics/x/address"
	"github.com/arya-analytics/x/signal"
	"github.com/cockroachdb/errors"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"go.uber.org/zap"
	"time"
)

var _ = Describe("Cluster", func() {
	var (
		builder    *clustermock.Builder
		clusterCtx signal.Context
		shutdown   context.CancelFunc
		log        *zap.Logger
	)
	BeforeEach(func() {
		log = zap.NewNop()
		clusterCtx, shutdown = signal.WithCancel(ctx)
		builder = clustermock.NewBuilder(cluster.Config{
			Gossip: gossip.Config{Interval: 5 * time.Millisecond},
			Logger: log.Sugar(),
			Pledge: pledge.Config{RetryInterval: 1 * time.Millisecond},
		})
	})

	AfterEach(func() {
		shutdown()
		Expect(errors.Is(clusterCtx.Err(), context.Canceled)).To(BeTrue())
	})

	Describe("Node", func() {

		It("Should return a node by its ID", func() {
			c1, err := builder.New(clusterCtx, cluster.Config{})
			Expect(err).ToNot(HaveOccurred())
			c2, err := builder.New(clusterCtx, cluster.Config{})
			Expect(err).ToNot(HaveOccurred())
			Eventually(func() node.ID {
				n, _ := c2.Node(c1.HostID())
				return n.ID
			}).Should(Equal(c1.HostID()))
			Eventually(func() node.ID {
				n, _ := c1.Node(c2.HostID())
				return n.ID
			}).Should(Equal(c2.HostID()))
		})

	})

	Describe("Resolve", func() {

		It("Should resolve the address of a node by its ID", func() {
			c1, err := builder.New(clusterCtx, cluster.Config{})
			Expect(err).ToNot(HaveOccurred())
			c2, err := builder.New(clusterCtx, cluster.Config{})
			Expect(err).ToNot(HaveOccurred())
			Eventually(func() address.Address {
				addr, _ := c1.Resolve(c2.HostID())
				return addr
			}).Should(Equal(address.Address("localhost:1")))
			Eventually(func() address.Address {
				addr, _ := c2.Resolve(c1.HostID())
				return addr
			}).Should(Equal(address.Address("localhost:0")))
		})

	})

})
