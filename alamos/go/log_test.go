package alamos_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/synnaxlabs/alamos"
	"go.uber.org/zap"
)

var _ = Describe("Log", func() {
	Describe("NewLogger", func() {
		It("Should correctly attach a new logger to the Instrumentation", func() {
			cfg := alamos.LoggerConfig{Zap: zap.NewNop()}
			i := alamos.New("test", alamos.NewLogger(cfg))
			Expect(i.L).ToNot(BeNil())
		})
	})
	Describe("No-op", func() {
		It("Should not panic when calling a method on a nil logger", func() {
			var l *alamos.Logger
			Expect(func() { l.Debug("test") }).ToNot(Panic())
		})
	})
})
