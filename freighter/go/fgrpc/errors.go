package fgrpc

import (
	"github.com/synnaxlabs/freighter/ferrors"
	v1 "github.com/synnaxlabs/freighter/ferrors/v1"
)

// EncodeError encodes the given error into a protobuf error payload. If the type of
// the error cannot be determined, returns a payload with type Unknown and the error
// message. If the error is nil, returns a payload with type Nil.
func EncodeError(err error) *v1.ErrorPayload {
	pld := ferrors.Encode(err)
	return &v1.ErrorPayload{Type: string(pld.Type), Data: pld.Data}
}

// DecodeError decodes the given protobuf error payload into an error. If the payload's
// type is Unknown, returns an error with the payload's data as the message. If the
// payload's type is Nil, returns nil.
func DecodeError(pld *v1.ErrorPayload) error {
	return ferrors.Decode(ferrors.Payload{Type: ferrors.Type(pld.Type), Data: pld.Data})
}
