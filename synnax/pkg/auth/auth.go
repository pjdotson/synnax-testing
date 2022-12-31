// Copyright 2022 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package auth

import (
	"github.com/synnaxlabs/synnax/pkg/auth/password"
	"github.com/synnaxlabs/x/gorp"
)

// Authenticator is an interface for validating the identity of a particular entity (
// i.e. they are who they say they are).
type Authenticator interface {
	// Authenticate validates the identity of the entity with the given credentials.
	// If the credentials are invalid, an InvalidCredentials error is returned.
	Authenticate(creds InsecureCredentials) error
	// NewWriter opens a new Writer.
	NewWriter() Writer
	// NewWriterUsingTxn opens a new Writer using the provided transaction. Some
	// implementations may not need the transaction.
	NewWriterUsingTxn(txn gorp.Txn) Writer
}

type Writer interface {
	// Register registers the given credentials in the authenticator.
	Register(creds InsecureCredentials) error
	// UpdateUsername updates the username of the given credentials.
	// If the Authenticator uses the Node's local storage, they can use the provided
	// txn to perform the update.
	UpdateUsername(creds InsecureCredentials, newUser string) error
	// UpdatePassword updates the password of the given credentials.
	// If the Authenticator uses the Node's local storage, they can use the provided
	// txn to perform the update.
	UpdatePassword(creds InsecureCredentials, newPass password.Raw) error
}
